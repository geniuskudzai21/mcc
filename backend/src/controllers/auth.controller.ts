import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { AuthRequest } from '../middlewares/auth.middleware';

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password, phone, account_number, stand_number, suburb } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const password_hash = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: { name, email, password_hash, phone },
        });

        // Handle Property Link if provided
        if (account_number && stand_number && suburb) {
            let property = await prisma.property.findFirst({
                where: { 
                    account_number: account_number.trim(),
                    stand_number: stand_number.trim(),
                    suburb: {
                        equals: suburb.trim(),
                        mode: 'insensitive'
                    }
                }
            });

            // If property doesn't exist, create it
            if (!property) {
                property = await prisma.property.create({
                    data: {
                        account_number: account_number.trim(),
                        stand_number: stand_number.trim(),
                        suburb: suburb.trim(),
                        address: `${stand_number.trim()}, ${suburb.trim()}`,
                        owner_name: 'City Management'
                    }
                });
            }

            // Create user-property link with PENDING status for admin approval
            await prisma.userProperty.create({
                data: {
                    user_id: user.id,
                    property_id: property.id,
                    status: 'PENDING'
                } as any
            });
        }

        const token = jwt.sign({ id: user.id, email: user.email, role: 'USER' }, env.JWT_SECRET, {
            expiresIn: env.JWT_EXPIRES_IN as any,
        });

        res.status(201).json({
            message: 'Account created successfully',
            token,
            user: { id: user.id, name: user.name, email: user.email, role: 'USER' },
        });

    } catch (err) {
        next(err);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        // Try User first
        let user: any = await prisma.user.findUnique({ where: { email } });
        let role = 'USER';

        if (!user) {
            // Try Admin
            user = await prisma.admin.findUnique({ where: { email } });
            if (user) role = user.role;
        }

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role },
            env.JWT_SECRET,
            { expiresIn: env.JWT_EXPIRES_IN as any }
        );

        res.json({
            message: 'Logged in successfully',
            token,
            user: { id: user.id, name: user.name, email: user.email, role },
        });
    } catch (err) {
        next(err);
    }
};


export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'User ID missing from session.' });
        }

        // Check regular user
        let user: any = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, phone: true, created_at: true },
        });

        if (user) {
            return res.json({ ...user, role: 'USER' });
        }

        // Check admin
        user = await prisma.admin.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, role: true },
        });

        if (user) {
            return res.json(user);
        }

        return res.status(404).json({ message: 'Identity not found' });
    } catch (err) {
        next(err);
    }
};



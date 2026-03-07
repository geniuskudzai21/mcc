import { Router } from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';
import { prisma } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
    try {
        console.log('Fetching user profile for ID:', req.user?.id);
        const user = await prisma.user.findUnique({
            where: { id: req.user?.id },
            include: {
                properties: {
                    include: {
                        property: true
                    }
                }
            }
        });
        console.log('Found user:', user);
        res.json(user);
    } catch (err) {
        console.error('Error fetching user profile:', err);
        next(err);
    }
});

router.put('/me', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const { name, phone } = req.body;
        const user = await prisma.user.update({
            where: { id: req.user?.id },
            data: { name, phone },
            select: { id: true, name: true, phone: true, email: true }
        });
        res.json(user);
    } catch (err) {
        next(err);
    }
});

router.post('/link-property', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const { account_number, stand_number, suburb } = req.body;

        if (!account_number || !stand_number || !suburb) {
            return res.status(400).json({ message: 'Account number, stand number, and suburb are required' });
        }

        // Find the property with matching account number, stand number, and suburb
        const property = await prisma.property.findFirst({
            where: { 
                account_number: account_number.trim(), 
                stand_number: stand_number.trim(),
                suburb: {
                    equals: suburb.trim(),
                    mode: 'insensitive'
                }
            }
        });

        if (!property) {
            return res.status(404).json({ message: 'Property not found with the provided details' });
        }

        // Check if already linked
        const existingLink = await prisma.userProperty.findUnique({
            where: {
                user_id_property_id: {
                    user_id: req.user?.id as string,
                    property_id: property.id
                }
            }
        });

        if (existingLink) {
            return res.status(400).json({ message: 'This property is already linked to your account' });
        }

        // Link property to user with VERIFIED state (auto-verify since user provided correct account info)
        await prisma.userProperty.create({
            data: {
                user_id: req.user?.id as string,
                property_id: property.id,
                status: 'VERIFIED'  // Auto-verify since user has correct account details
            } as any
        });

        res.json({ message: 'Property linked successfully! You can now view your bills.', property });
    } catch (err) {
        next(err);
    }
});

export default router;

import { Router } from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';
import { prisma } from '../config/database';

const router = Router();

router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user?.id },
            include: {
                properties: {
                    include: { property: true }
                }
            }
        });
        res.json(user);
    } catch (err) {
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
        const { stand_number, address, suburb } = req.body;

        if (!stand_number || !address || !suburb) {
            return res.status(400).json({ message: 'Stand number, address, and suburb are required' });
        }

        // Find or create the property
        let property = await prisma.property.findUnique({
            where: { stand_number }
        });

        if (!property) {
            // Create new property with a generated account number
            const count = await prisma.property.count();
            property = await prisma.property.create({
                data: {
                    stand_number,
                    address,
                    suburb,
                    owner_name: '',
                    account_number: `ACC-${String(count + 1).padStart(4, '0')}`
                }
            });
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

        // Link property to user with PENDING state
        await prisma.userProperty.create({
            data: {
                user_id: req.user?.id as string,
                property_id: property.id,
                status: 'PENDING'
            } as any
        });

        res.json({ message: 'Property linked successfully', property });
    } catch (err) {
        next(err);
    }
});

export default router;

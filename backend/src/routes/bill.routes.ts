import { Router } from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';
import { prisma } from '../config/database';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const userProperties = await prisma.userProperty.findMany({
            where: { user_id: req.user?.id },
            select: { property_id: true }
        });
        const propertyIds = userProperties.map(up => up.property_id);
        const bills = await prisma.bill.findMany({
            where: { property_id: { in: propertyIds } },
            include: {
                property: true,
                items: true
            },
            orderBy: { created_at: 'desc' }
        });
        res.json(bills);
    } catch (err) {
        next(err);
    }
});

router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const bill = await prisma.bill.findUnique({
            where: { id: req.params.id as string },
            include: {
                property: true,
                items: true
            }
        });

        if (!bill) return res.status(404).json({ message: 'Bill not found' });

        // Ensure user owns this bill
        const userProperty = await prisma.userProperty.findUnique({
            where: {
                user_id_property_id: {
                    user_id: req.user?.id as string,
                    property_id: bill.property_id
                }
            }
        });

        if (!userProperty) return res.status(403).json({ message: 'Unauthorized' });

        res.json(bill);
    } catch (err) {
        next(err);
    }
});

export default router;

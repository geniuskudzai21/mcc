import { Router } from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';
import { prisma } from '../config/database';

const router = Router();

router.post('/initiate', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const { bill_id, amount, payment_method } = req.body;

        const bill = await prisma.bill.findUnique({
            where: { id: bill_id },
            include: { property: true }
        });

        if (!bill) return res.status(404).json({ message: 'Bill not found' });

        if (bill.status === 'PAID') return res.status(400).json({ message: 'Bill already paid' });

        if (parseFloat(bill.total_amount.toString()) !== amount) {
            return res.status(400).json({ message: 'Amount does not match bill total' });
        }

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

        // Mock successful payment
        const payment = await prisma.payment.create({
            data: {
                bill_id,
                user_id: req.user?.id as string,
                amount,
                payment_method,
                transaction_reference: `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                status: 'COMPLETED'
            }
        });

        // Update bill as paid
        await prisma.bill.update({
            where: { id: bill_id },
            data: { status: 'PAID' }
        });

        res.json({
            message: 'Payment completed successfully',
            payment
        });
    } catch (err) {
        next(err);
    }
});

router.get('/history', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const payments = await prisma.payment.findMany({
            where: { user_id: req.user?.id },
            include: {
                bill: {
                    include: { property: true }
                }
            },
            orderBy: { paid_at: 'desc' }
        });
        res.json(payments);
    } catch (err) {
        next(err);
    }
});

export default router;

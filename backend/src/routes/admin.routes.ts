import { Router } from 'express';
import { authenticate, authorizeAdmin, AuthRequest } from '../middlewares/auth.middleware';
import { prisma } from '../config/database';
import { generateMonthlyBills } from '../jobs/monthlyBilling.job';

const router = Router();

// Dashboard Metrics
router.get('/dashboard', authenticate, authorizeAdmin, async (req: AuthRequest, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        monthStart.setHours(0, 0, 0, 0);

        const [
            revenueToday,
            revenueMonth,
            outstanding,
            totalUsers,
            pendingRequests,
            allMonthPayments
        ] = await Promise.all([
            prisma.payment.aggregate({
                where: { paid_at: { gte: today } },
                _sum: { amount: true }
            }),
            prisma.payment.aggregate({
                where: { paid_at: { gte: monthStart } },
                _sum: { amount: true }
            }),
            prisma.bill.aggregate({
                where: { status: { in: ['UNPAID', 'OVERDUE'] } },
                _sum: { total_amount: true }
            }),
            prisma.user.count(),
            prisma.serviceRequest.count({ where: { status: 'PENDING' } }),
            // All payments this month for weekly breakdown
            prisma.payment.findMany({
                where: { paid_at: { gte: monthStart } },
                select: { paid_at: true, amount: true }
            })
        ]);

        // Build weekly buckets for the current month
        const weeklyRevenue: { name: string; revenue: number }[] = [];
        for (let w = 0; w < 5; w++) {
            const weekStart = new Date(monthStart);
            weekStart.setDate(1 + w * 7);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 7);

            const weekTotal = allMonthPayments
                .filter(p => p.paid_at >= weekStart && p.paid_at < weekEnd)
                .reduce((sum, p) => sum + Number(p.amount), 0);

            // Only include weeks that have started
            if (weekStart <= today) {
                weeklyRevenue.push({ name: `Week ${w + 1}`, revenue: parseFloat(weekTotal.toFixed(2)) });
            }
        }

        res.json({
            revenueToday: revenueToday._sum.amount || 0,
            revenueMonth: revenueMonth._sum.amount || 0,
            outstanding: outstanding._sum.total_amount || 0,
            totalUsers,
            pendingRequests,
            weeklyRevenue
        });
    } catch (err) {
        next(err);
    }
});

// User Management
router.get('/users', authenticate, authorizeAdmin, async (req, res, next) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                properties: { include: { property: true } }
            }
        });
        res.json(users);
    } catch (err) {
        next(err);
    }
});

router.put('/users/:id', authenticate, authorizeAdmin, async (req, res, next) => {
    try {
        const id = req.params.id as string;
        const { name, email, phone } = req.body;

        const user = await prisma.user.update({
            where: { id },
            data: { name, email, phone },
            select: { id: true, name: true, email: true, phone: true }
        });
        res.json(user);
    } catch (err) {
        next(err);
    }
});

router.delete('/users/:id', authenticate, authorizeAdmin, async (req, res, next) => {
    try {
        const id = req.params.id as string;

        // First delete related records
        await prisma.payment.deleteMany({ where: { user_id: id } });
        await prisma.serviceRequest.deleteMany({ where: { user_id: id } });
        await prisma.userProperty.deleteMany({ where: { user_id: id } });

        // Then delete the user
        await prisma.user.delete({ where: { id } });

        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        next(err);
    }
});

// Property Management
router.get('/properties', authenticate, authorizeAdmin, async (req, res, next) => {
    try {
        const properties = await prisma.property.findMany({
            include: { users: { include: { user: true } } }
        });
        res.json(properties);
    } catch (err) {
        next(err);
    }
});

router.post('/properties', authenticate, authorizeAdmin, async (req, res, next) => {
    try {
        const { stand_number, address, suburb, owner_name, account_number } = req.body;
        const property = await prisma.property.create({
            data: { stand_number, address, suburb, owner_name, account_number }
        });
        res.json(property);
    } catch (err) {
        next(err);
    }
});

// Link User to Property
router.post('/users/:userId/properties/:propertyId', authenticate, authorizeAdmin, async (req, res, next) => {
    try {
        const userId = req.params.userId as string;
        const propertyId = req.params.propertyId as string;
        const link = await prisma.userProperty.create({
            data: {
                user_id: userId,
                property_id: propertyId
            }
        });
        res.json(link);
    } catch (err) {
        next(err);
    }
});

router.delete('/users/:userId/properties/:propertyId', authenticate, authorizeAdmin, async (req, res, next) => {
    try {
        const userId = req.params.userId as string;
        const propertyId = req.params.propertyId as string;
        await prisma.userProperty.delete({
            where: {
                user_id_property_id: {
                    user_id: userId,
                    property_id: propertyId
                }
            }
        });
        res.json({ message: 'Property unlinked from user' });
    } catch (err) {
        next(err);
    }
});

// Billing Management
router.get('/bills', authenticate, authorizeAdmin, async (req, res, next) => {
    try {
        const bills = await prisma.bill.findMany({
            include: { property: true, items: true },
            orderBy: { created_at: 'desc' }
        });
        res.json(bills);
    } catch (err) {
        next(err);
    }
});

router.put('/bills/:id', authenticate, authorizeAdmin, async (req, res, next) => {
    try {
        const { status, total_amount } = req.body;
        const bill = await prisma.bill.update({
            where: { id: req.params.id as string },
            data: { status, total_amount }
        });
        res.json(bill);
    } catch (err) {
        next(err);
    }
});

router.delete('/bills/:id', authenticate, authorizeAdmin, async (req, res, next) => {
    try {
        const id = req.params.id as string;

        // First delete related records
        await prisma.billItem.deleteMany({ where: { bill_id: id } });
        await prisma.payment.deleteMany({ where: { bill_id: id } });

        // Then delete the bill
        await prisma.bill.delete({ where: { id } });

        res.json({ message: 'Bill deleted successfully' });
    } catch (err) {
        next(err);
    }
});

// Service Request Management
router.get('/requests', authenticate, authorizeAdmin, async (req, res, next) => {
    try {
        const requests = await prisma.serviceRequest.findMany({
            include: { user: true, property: true },
            orderBy: { created_at: 'desc' }
        });
        res.json(requests);
    } catch (err) {
        next(err);
    }
});

router.put('/requests/:id', authenticate, authorizeAdmin, async (req, res, next) => {
    try {
        const { category, description, status } = req.body;
        const request = await prisma.serviceRequest.update({
            where: { id: req.params.id as string },
            data: { category, description, status }
        });
        res.json(request);
    } catch (err) {
        next(err);
    }
});

router.put('/requests/:id/status', authenticate, authorizeAdmin, async (req, res, next) => {
    try {
        const { status } = req.body;
        const request = await prisma.serviceRequest.update({
            where: { id: req.params.id as string },
            data: { status }
        });
        res.json(request);
    } catch (err) {
        next(err);
    }
});

router.delete('/requests/:id', authenticate, authorizeAdmin, async (req, res, next) => {
    try {
        const id = req.params.id as string;
        await prisma.serviceRequest.delete({ where: { id } });
        res.json({ message: 'Request deleted successfully' });
    } catch (err) {
        next(err);
    }
});

// Tariffs
router.get('/tariffs', authenticate, authorizeAdmin, async (req, res, next) => {
    try {
        const tariffs = await prisma.tariff.findMany();
        res.json(tariffs);
    } catch (err) {
        next(err);
    }
});

router.post('/tariffs', authenticate, authorizeAdmin, async (req, res, next) => {
    try {
        const { service_type, cost_per_unit } = req.body;
        const tariff = await prisma.tariff.upsert({
            where: { service_type },
            update: { cost_per_unit, effective_date: new Date() },
            create: { service_type, cost_per_unit }
        });
        res.json(tariff);
    } catch (err) {
        next(err);
    }
});

router.post('/generate-bills', authenticate, authorizeAdmin, async (req, res, next) => {
    try {
        await generateMonthlyBills();
        res.json({ message: 'Monthly bills generated successfully' });
    } catch (err) {
        next(err);
    }
});

router.post('/properties/:id/generate-bill', authenticate, authorizeAdmin, async (req, res, next) => {
    try {
        const id = req.params.id as string;
        const property = await prisma.property.findUnique({ where: { id } });
        if (!property) return res.status(404).json({ message: 'Property not found' });

        const tariffs = await prisma.tariff.findMany();
        const tariffMap: Record<string, number> = {};
        tariffs.forEach(t => {
            tariffMap[t.service_type] = Number(t.cost_per_unit);
        });

        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const dueDate = new Date(year, month, 15);

        // Check if bill already exists
        const existing = await prisma.bill.findFirst({
            where: {
                property_id: id,
                billing_month: month,
                billing_year: year
            }
        });

        if (existing) return res.status(400).json({ message: 'Bill already exists for this month' });

        const charges = [
            { description: 'Water Consumption (Base)', amount: tariffMap['Water'] || 15.00 },
            { description: 'Sewer Charges', amount: tariffMap['Sewer'] || 10.00 },
            { description: 'Refuse Collection', amount: tariffMap['Refuse'] || 8.00 },
            { description: 'Property Rates', amount: tariffMap['Rates'] || 25.00 }
        ];

        const totalAmount = charges.reduce((sum, item) => sum + Number(item.amount), 0);

        const bill = await prisma.bill.create({
            data: {
                property_id: id,
                billing_month: month,
                billing_year: year,
                total_amount: totalAmount,
                due_date: dueDate,
                status: 'UNPAID',
                items: {
                    create: charges.map(c => ({
                        description: c.description,
                        amount: c.amount
                    }))
                }
            },
            include: { property: true, items: true }
        });

        res.json(bill);
    } catch (err) {
        next(err);
    }
});

// Property Verification
router.get('/property-links/pending', authenticate, authorizeAdmin, async (req, res, next) => {
    try {
        const links = await prisma.userProperty.findMany({
            where: { status: 'PENDING' } as any,
            include: { user: true, property: true }
        });
        res.json(links);
    } catch (err) {
        next(err);
    }
});

router.put('/property-links/:id/status', authenticate, authorizeAdmin, async (req, res, next) => {
    try {
        const id = req.params.id as string;
        const { status } = req.body;

        const link = await prisma.userProperty.update({
            where: { id },
            data: { status } as any,
            include: { user: true }
        });

        // If verified, synchronize the property owner name with the resident's name
        if (status === 'VERIFIED') {
            await prisma.property.update({
                where: { id: link.property_id },
                data: { owner_name: link.user.name }
            });
        }

        res.json(link);
    } catch (err) {
        next(err);
    }
});

// Announcements
router.get('/announcements', authenticate, authorizeAdmin, async (req, res, next) => {
    try {
        const announcements = await prisma.announcement.findMany({
            orderBy: { created_at: 'desc' }
        });
        res.json(announcements);
    } catch (err) {
        next(err);
    }
});

router.post('/announcements', authenticate, authorizeAdmin, async (req, res, next) => {
    try {
        const { title, body } = req.body;

        const announcement = await prisma.announcement.create({
            data: { title, body }
        });

        res.json(announcement);
    } catch (err) {
        next(err);
    }
});

export default router;

import { Router } from 'express';
import { authenticate, authorizeAdmin, AuthRequest } from '../middlewares/auth.middleware';
import { prisma } from '../config/database';
import { generateMonthlyBills, generateSingleUserBill } from '../jobs/monthlyBilling.job';

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
router.get('/users', authenticate, async (req, res, next) => {
    try {
        console.log('Fetching users from database...');
        const users = await prisma.user.findMany();
        console.log('Found users:', users.length);
        
        // Log first user to check structure
        if (users.length > 0) {
            console.log('First user structure:', JSON.stringify(users[0], null, 2));
        }
        
        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        next(err);
    }
});

// Get user properties
router.get('/users/:userId/properties', authenticate, async (req, res, next) => {
    try {
        const userId = req.params.userId as string;
        console.log('Fetching properties for user:', userId);
        
        const userProperties = await prisma.userProperty.findMany({
            where: { user_id: userId },
            include: { property: true }
        });
        
        console.log('Found user properties:', userProperties.length);
        console.log('User properties data:', JSON.stringify(userProperties, null, 2));
        
        res.json(userProperties);
    } catch (err) {
        console.error('Error fetching user properties:', err);
        next(err);
    }
});

// Get all user properties
router.get('/all-user-properties', authenticate, authorizeAdmin, async (req, res, next) => {
    try {
        const userProperties = await prisma.userProperty.findMany({
            include: { property: true, user: true }
        });
        res.json(userProperties);
    } catch (err) {
        console.error('Error fetching all user properties:', err);
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
        console.error('Generate bills error:', err);
        res.status(500).json({ message: 'Failed to generate bills' });
    }
});

router.post('/generate-bill/:userId', authenticate, authorizeAdmin, async (req: AuthRequest, res, next) => {
    try {
        const { userId } = req.params;
        const { targetMonth, targetYear } = req.body || {};
        
        const result = await generateSingleUserBill(userId as string, targetMonth, targetYear);
        res.json({ 
            message: 'Bill generated successfully for user', 
            ...result 
        });
    } catch (err: any) {
        console.error('Generate single bill error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to generate bill';
        res.status(500).json({ message: errorMessage });
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

// Get pending user accounts for approval
router.get('/users/pending', authenticate, authorizeAdmin, async (req: AuthRequest, res, next) => {
    try {
        const users = await prisma.user.findMany({
            where: {
                properties: {
                    some: {
                        status: 'PENDING'
                    }
                }
            },
            include: {
                properties: {
                    include: {
                        property: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });
        res.json(users);
    } catch (err) {
        next(err);
    }
});

// Approve user account
router.put('/users/:id/approve', authenticate, authorizeAdmin, async (req: AuthRequest, res, next) => {
    try {
        const userId = req.params.id as string;
        
        // Update all user properties to VERIFIED
        await prisma.userProperty.updateMany({
            where: {
                user_id: userId,
                status: 'PENDING'
            },
            data: {
                status: 'VERIFIED'
            }
        });

        res.json({ message: 'User account approved successfully' });
    } catch (err) {
        next(err);
    }
});

// Reject user account
router.put('/users/:id/reject', authenticate, authorizeAdmin, async (req: AuthRequest, res, next) => {
    try {
        const userId = req.params.id as string;
        
        // Update all user properties to REJECTED
        await prisma.userProperty.updateMany({
            where: {
                user_id: userId,
                status: 'PENDING'
            },
            data: {
                status: 'REJECTED'
            }
        });
        res.json({ message: 'User account rejected successfully' });
    } catch (err) {
        next(err);
    }
});

export default router;

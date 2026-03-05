import cron from 'node-cron';
import { prisma } from '../config/database';

export const generateMonthlyBills = async (targetMonth?: number, targetYear?: number) => {
    console.log('📅 Running monthly billing job...');

    try {
        const tariffs = await prisma.tariff.findMany();

        const tariffMap = tariffs.reduce((acc, t) => ({
            ...acc,
            [t.service_type]: t.cost_per_unit
        }), {} as Record<string, any>);

        const now = new Date();
        // If run early in the month (before 10th), default to previous month. Otherwise current.
        const defaultMonth = now.getDate() < 10 ? now.getMonth() : (now.getMonth() + 1);
        const month = targetMonth || (defaultMonth === 0 ? 12 : defaultMonth);
        const year = targetYear || (defaultMonth === 0 ? now.getFullYear() - 1 : now.getFullYear());

        // Due date: 20th of the NEXT month from the billing period
        const dueDate = new Date(year, month - 1, 20);
        dueDate.setMonth(dueDate.getMonth() + 1);

        // Fetch properties with their verified users
        const propertiesWithUsers = await prisma.property.findMany({
            include: {
                users: {
                    where: { status: 'VERIFIED' },
                    include: { user: true }
            }
        }

        const billsCreated = propertiesWithUsers.filter(p => p.users.length > 0).length;
        console.log(`✅ Successfully generated bills for ${billsCreated} properties with verified users for ${month}/${year}.`);
    } catch (err) {
        console.error('❌ Error generating monthly bills:', err);
    }
};

// Schedule to run at 00:00 on the 1st day of every month
cron.schedule('0 0 1 * *', () => generateMonthlyBills());


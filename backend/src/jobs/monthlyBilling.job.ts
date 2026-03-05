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
        });

        let billsCreated = 0;

        for (const property of propertiesWithUsers) {
            // Skip properties that have no verified users
            if (property.users.length === 0) {
                continue;
            }

            // Check if bill already exists for this property and month
            const existing = await prisma.bill.findFirst({
                where: {
                    property_id: property.id,
                    billing_month: month,
                    billing_year: year
                }
            });

            if (existing) continue;

            // Update property owner name to match the verified user
            if (property.owner_name === 'City Management' || property.owner_name === '') {
                await prisma.property.update({
                    where: { id: property.id },
                    data: { owner_name: property.users[0].user.name }
                });
            }

            // Define charges
            const charges = [
                { description: `Water Consumption (${month}/${year})`, amount: tariffMap['Water'] || 15.00 },
                { description: 'Sewer & Sanitation', amount: tariffMap['Sewer'] || 10.00 },
                { description: 'Refuse Collection', amount: tariffMap['Refuse'] || 8.00 },
                { description: 'Fixed Property Rates', amount: tariffMap['Rates'] || 25.00 }
            ];

            const totalAmount = charges.reduce((sum, item) => sum + Number(item.amount), 0);

            await prisma.bill.create({
                data: {
                    property_id: property.id,
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
                }
            });

            billsCreated++;
        }

        console.log(`✅ Successfully generated bills for ${billsCreated} properties with verified users for ${month}/${year}.`);
    } catch (err) {
        console.error('❌ Error generating monthly bills:', err);
    }
};

// Schedule to run at 00:00 on the 1st day of every month
cron.schedule('0 0 1 * *', () => generateMonthlyBills());

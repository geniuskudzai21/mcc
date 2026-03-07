import cron from 'node-cron';
import { prisma } from '../config/database';

export const generateSingleUserBill = async (userId: string, targetMonth?: number, targetYear?: number) => {
    console.log('📄 Generating bill for single user...');

    try {
        const tariffs = await prisma.tariff.findMany();
        const tariffMap = tariffs.reduce((acc, t) => ({
            ...acc,
            [t.service_type]: t.cost_per_unit
        }), {} as Record<string, any>);

        const now = new Date();
        const defaultMonth = now.getDate() < 10 ? now.getMonth() : (now.getMonth() + 1);
        const month = targetMonth || (defaultMonth === 0 ? 12 : defaultMonth);
        const year = targetYear || (defaultMonth === 0 ? now.getFullYear() - 1 : now.getFullYear());

        // Due date: 20th of the NEXT month from the billing period
        const dueDate = new Date(year, month - 1, 20);
        dueDate.setMonth(dueDate.getMonth() + 1);

        // Get user's verified properties
        const userProperties = await prisma.userProperty.findMany({
            where: { 
                user_id: userId,
                status: 'VERIFIED'
            },
            include: {
                property: true
            }
        });

        if (userProperties.length === 0) {
            throw new Error('No verified properties found for this user');
        }

        let billsCreated = 0;

        for (const userProperty of userProperties) {
            const property = userProperty.property;

            // Check if bill already exists for this property and month
            const existing = await prisma.bill.findFirst({
                where: {
                    property_id: property.id,
                    billing_month: month,
                    billing_year: year
                }
            });

            if (existing) {
                console.log(`⏭️ Bill already exists for ${property.address} for ${month}/${year}`);
                continue;
            }

            // Calculate water charge based on property address/suburb (simplified approach)
            let waterCharge = 0;
            
            // Simplified billing based on suburb (as a proxy for property value/size)
            const suburb = property.suburb.toLowerCase();
            if (suburb.includes('industrial') || suburb.includes('business') || suburb.includes('commercial')) {
                waterCharge = 120.00; // Commercial/Industrial areas
            } else if (suburb.includes('estates') || suburb.includes('golf') || suburb.includes('country club')) {
                waterCharge = 100.00; // Premium residential areas
            } else if (suburb.includes('apartments') || suburb.includes('flats')) {
                waterCharge = 45.00; // Apartment complexes
            } else {
                waterCharge = 35.00; // Standard residential
            }

            // Define charges - water is now based on simplified property characteristics
            const charges = [
                { 
                    description: `Water Service (${property.suburb})`, 
                    amount: waterCharge 
                },
                { description: 'Sewer & Sanitation', amount: tariffMap['Sewer'] || 10.00 },
                { description: 'Refuse Collection', amount: tariffMap['Refuse'] || 8.00 },
                { description: 'Fixed Property Rates', amount: tariffMap['Rates'] || 25.00 }
            ];

            const totalAmount = charges.reduce((sum, item) => sum + Number(item.amount), 0);

            const bill = await prisma.bill.create({
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
            console.log(`✅ Generated bill for ${property.address}: $${totalAmount.toFixed(2)}`);
        }

        console.log(`✅ Successfully generated ${billsCreated} bills for user ${userId} for ${month}/${year}`);
        return { billsCreated, month, year };
    } catch (err) {
        console.error('❌ Error generating single user bill:', err);
        throw err;
    }
};

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
        let skippedNoUsers = 0;

        for (const property of propertiesWithUsers) {
            // Skip properties that have no verified users
            if (property.users.length === 0) {
                skippedNoUsers++;
                console.log(`⏭️ Skipping ${property.address} - no verified users`);
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

            // Calculate water charge based on property address/suburb (simplified approach)
            let waterCharge = 0;
            
            // Simplified billing based on suburb (as a proxy for property value/size)
            const suburb = property.suburb.toLowerCase();
            if (suburb.includes('industrial') || suburb.includes('business') || suburb.includes('commercial')) {
                waterCharge = 120.00; // Commercial/Industrial areas
            } else if (suburb.includes('estates') || suburb.includes('golf') || suburb.includes('country club')) {
                waterCharge = 100.00; // Premium residential areas
            } else if (suburb.includes('apartments') || suburb.includes('flats')) {
                waterCharge = 45.00; // Apartment complexes
            } else {
                waterCharge = 35.00; // Standard residential
            }

            // Define charges - water is now based on simplified property characteristics
            const charges = [
                { 
                    description: `Water Service (${property.suburb})`, 
                    amount: waterCharge 
                },
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

        console.log(`✅ Successfully generated ${billsCreated} bills for ${month}/${year}.`);
        if (skippedNoUsers > 0) {
            console.log(`⚠️ Skipped ${skippedNoUsers} properties due to no verified users.`);
        }
    } catch (err) {
        console.error('❌ Error generating monthly bills:', err);
    }
};

// Schedule to run at 00:00 on the 1st day of every month
cron.schedule('0 0 1 * *', () => generateMonthlyBills());

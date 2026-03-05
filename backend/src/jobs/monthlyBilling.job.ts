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
        let skippedNoReading = 0;

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

            // Get meter readings for this property
            const readings = await prisma.meterReading.findMany({
                where: { property_id: property.id },
                orderBy: { reading_date: 'desc' }
            });

            // Calculate water consumption from meter readings
            let waterConsumption = 0;
            let waterCharge = 0;
            
            if (readings.length > 0) {
                // Get the reading for this month (or the latest one if no reading for this month)
                const currentReading = readings[0];
                const previousReading = readings[1]; // Second most recent reading

                if (previousReading) {
                    waterConsumption = parseFloat(currentReading.reading.toString()) - parseFloat(previousReading.reading.toString());
                    // Only charge for positive consumption (prevent negative if meter replaced)
                    if (waterConsumption < 0) waterConsumption = 0;
                } else if (readings.length === 1) {
                    // First reading - use it as baseline but don't charge yet
                    waterConsumption = 0;
                }

                // Calculate water charge: consumption × tariff
                const waterRate = parseFloat(tariffMap['Water']?.toString() || '15.00');
                waterCharge = waterConsumption * waterRate;
            } else {
                // No meter readings - skip this property
                skippedNoReading++;
                console.log(`⏭️ Skipping ${property.address} - no meter readings`);
                continue;
            }

            // Define charges - water is now based on actual consumption
            const charges = [
                { 
                    description: `Water Consumption (${waterConsumption.toFixed(2)} kL @ $${tariffMap['Water'] || 15.00}/kL)`, 
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
        if (skippedNoReading > 0) {
            console.log(`⚠️ Skipped ${skippedNoReading} properties due to missing meter readings.`);
        }
    } catch (err) {
        console.error('❌ Error generating monthly bills:', err);
    }
};

// Schedule to run at 00:00 on the 1st day of every month
cron.schedule('0 0 1 * *', () => generateMonthlyBills());

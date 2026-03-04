import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUserAndBills() {
    try {
        // 1. Create a test user if not exists
        const testUser = await prisma.user.upsert({
            where: { email: 'test.citizen@example.com' },
            update: {},
            create: {
                name: 'Test Citizen',
                email: 'test.citizen@example.com',
                phone: '+263771234567',
                password_hash: await bcrypt.hash('password123', 12)
            }
        });

        console.log('✅ Test user created:', testUser.email);

        // 2. Link user to a property with VERIFIED status
        const property = await prisma.property.findFirst({
            where: { stand_number: 'ST-2002' } // Use existing property
        });

        if (property) {
            await prisma.userProperty.upsert({
                where: {
                    user_id_property_id: {
                        user_id: testUser.id,
                        property_id: property.id
                    }
                },
                update: { status: 'VERIFIED' },
                create: {
                    user_id: testUser.id,
                    property_id: property.id,
                    status: 'VERIFIED'
                }
            });

            console.log('✅ User linked to property with VERIFIED status');
        }

        // 3. Generate bills for current month
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const tariffs = await prisma.tariff.findMany();
        const tariffMap = tariffs.reduce((acc, t) => ({
            ...acc,
            [t.service_type]: t.cost_per_unit
        }), {} as Record<string, any>);

        const charges = [
            { description: `Water Consumption (${month}/${year})`, amount: tariffMap['Water'] || 15.00 },
            { description: 'Sewer & Sanitation', amount: tariffMap['Sewer'] || 10.00 },
            { description: 'Refuse Collection', amount: tariffMap['Refuse'] || 8.00 },
            { description: 'Fixed Property Rates', amount: tariffMap['Rates'] || 25.00 }
        ];

        const totalAmount = charges.reduce((sum, item) => sum + Number(item.amount), 0);

        const dueDate = new Date(year, month, 20); // 20th of next month

        // Check if bill already exists
        const existingBill = await prisma.bill.findFirst({
            where: {
                property_id: property!.id,
                billing_month: month,
                billing_year: year
            }
        });

        let bill;
        if (!existingBill) {
            bill = await prisma.bill.create({
                data: {
                    property_id: property!.id,
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
            console.log('✅ Test bill created:', bill.id);
        } else {
            bill = existingBill;
            console.log('✅ Bill already exists:', bill.id);
        }

        console.log('💰 Bill amount: $', totalAmount.toFixed(2));
        console.log('📧 Login with: test.citizen@example.com / password123');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestUserAndBills();

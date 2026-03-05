import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestData() {
    try {
        console.log('🌱 Creating comprehensive test data...');

        // 1. Create test residents
        const residents = [
            { name: 'John Resident', email: 'john@example.com', phone: '+263771111111' },
            { name: 'Jane Resident', email: 'jane@example.com', phone: '+263772222222' },
            { name: 'Bob Resident', email: 'bob@example.com', phone: '+263773333333' }
        ];

        for (const resident of residents) {
            const user = await prisma.user.upsert({
                where: { email: resident.email },
                update: {},
                create: {
                    name: resident.name,
                    email: resident.email,
                    phone: resident.phone,
                    password_hash: await bcrypt.hash('password123', 12)
                }
            });
            console.log(`✅ Created resident: ${user.email}`);
        }

        // 2. Link residents to properties with VERIFIED status
        const properties = await prisma.property.findMany();
        
        for (let i = 0; i < Math.min(residents.length, properties.length); i++) {
            const user = await prisma.user.findUnique({ where: { email: residents[i].email } });
            const property = properties[i];
            
            if (user && property) {
                await prisma.userProperty.upsert({
                    where: {
                        user_id_property_id: {
                            user_id: user.id,
                            property_id: property.id
                        }
                    },
                    update: { status: 'VERIFIED' },
                    create: {
                        user_id: user.id,
                        property_id: property.id,
                        status: 'VERIFIED'
                    }
                });
                console.log(`✅ Linked ${user.name} to property ${property.stand_number}`);
            }
        }

        // 3. Generate current month bills for verified properties
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        
        const tariffs = await prisma.tariff.findMany();
        const tariffMap = tariffs.reduce((acc, t) => ({
            ...acc,
            [t.service_type]: Number(t.cost_per_unit)
        }), {} as Record<string, number>);

        const verifiedProperties = await prisma.property.findMany({
            include: {
                users: {
                    where: { status: 'VERIFIED' }
                }
            }
        });

        for (const property of verifiedProperties) {
            if (property.users.length > 0) {
                // Check if bill already exists
                const existing = await prisma.bill.findFirst({
                    where: {
                        property_id: property.id,
                        billing_month: month,
                        billing_year: year
                    }
                });

                if (!existing) {
                    const charges = [
                        { description: `Water Consumption (${month}/${year})`, amount: tariffMap['Water'] || 15.00 },
                        { description: 'Sewer & Sanitation', amount: tariffMap['Sewer'] || 10.00 },
                        { description: 'Refuse Collection', amount: tariffMap['Refuse'] || 8.00 },
                        { description: 'Fixed Property Rates', amount: tariffMap['Rates'] || 25.00 }
                    ];

                    const totalAmount = charges.reduce((sum, item) => sum + item.amount, 0);
                    const dueDate = new Date(year, month, 20);

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
                    console.log(`✅ Created bill for property ${property.stand_number}: $${totalAmount.toFixed(2)}`);
                }
            }
        }

        // 4. Create some service requests
        const serviceRequests = [
            { category: 'Water Leak', description: 'Water leaking from main pipe' },
            { category: 'Missed Refuse', description: 'Garbage not collected this week' },
            { category: 'Streetlight Fault', description: 'Street light not working' }
        ];

        const johnUser = await prisma.user.findUnique({ where: { email: 'john@example.com' } });
        const johnProperty = await prisma.property.findFirst({ where: { stand_number: 'ST-2002' } });

        if (johnUser && johnProperty) {
            for (const req of serviceRequests) {
                await prisma.serviceRequest.create({
                    data: {
                        user_id: johnUser.id,
                        property_id: johnProperty.id,
                        category: req.category,
                        description: req.description,
                        status: 'PENDING'
                    }
                });
            }
            console.log('✅ Created service requests for testing');
        }

        // 5. Create some sample payments
        const janeUser = await prisma.user.findUnique({ where: { email: 'jane@example.com' } });
        const janeProperty = await prisma.property.findFirst({ where: { stand_number: 'ST-3003' } });

        if (janeUser && janeProperty) {
            const janeBill = await prisma.bill.findFirst({
                where: {
                    property_id: janeProperty.id,
                    status: 'UNPAID'
                }
            });

            if (janeBill) {
                await prisma.payment.create({
                    data: {
                        bill_id: janeBill.id,
                        user_id: janeUser.id,
                        amount: janeBill.total_amount,
                        payment_method: 'ECOCASH',
                        transaction_reference: `TRX-${Date.now()}-TEST`,
                        status: 'COMPLETED'
                    }
                });

                await prisma.bill.update({
                    where: { id: janeBill.id },
                    data: { status: 'PAID' }
                });
                console.log('✅ Created sample payment and marked bill as PAID');
            }
        }

        // Summary
        const totalUsers = await prisma.user.count();
        const totalAdmins = await prisma.admin.count();
        const totalProperties = await prisma.property.count();
        const totalBills = await prisma.bill.count();
        const totalRequests = await prisma.serviceRequest.count();
        const totalPayments = await prisma.payment.count();

        console.log('\n📊 SUMMARY:');
        console.log(`👥 Users: ${totalUsers}`);
        console.log(`👨‍💼 Admins: ${totalAdmins}`);
        console.log(`🏠 Properties: ${totalProperties}`);
        console.log(`🧾 Bills: ${totalBills}`);
        console.log(`🔧 Service Requests: ${totalRequests}`);
        console.log(`💳 Payments: ${totalPayments}`);

        console.log('\n🔑 LOGIN CREDENTIALS:');
        console.log('Admin: admin@mutare.gov.zw / admin123');
        console.log('Resident 1: john@example.com / password123');
        console.log('Resident 2: jane@example.com / password123');
        console.log('Resident 3: bob@example.com / password123');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestData();

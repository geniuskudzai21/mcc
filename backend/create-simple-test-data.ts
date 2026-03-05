import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createSimpleTestData() {
    try {
        console.log('🌱 Creating test users and data...');

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
                    id: `user-${resident.email.split('@')[0]}`,
                    name: resident.name,
                    email: resident.email,
                    phone: resident.phone,
                    password_hash: await bcrypt.hash('password123', 12),
                    created_at: new Date(),
                    updated_at: new Date()
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
                        id: `link-${user.id}-${property.id}`,
                        user_id: user.id,
                        property_id: property.id,
                        status: 'VERIFIED'
                    }
                });
                console.log(`✅ Linked ${user.name} to property ${property.stand_number}`);
            }
        }

        // 3. Create some service requests
        const serviceRequests = [
            { category: 'Water Leak', description: 'Water leaking from main pipe' },
            { category: 'Missed Refuse', description: 'Garbage not collected this week' },
            { category: 'Streetlight Fault', description: 'Street light not working' }
        ];

        const johnUser = await prisma.user.findUnique({ where: { email: 'john@example.com' } });
        const johnProperty = await prisma.property.findFirst({ where: { stand_number: 'ST-2002' } });

        if (johnUser && johnProperty) {
            for (let i = 0; i < serviceRequests.length; i++) {
                await prisma.serviceRequest.create({
                    data: {
                        id: `request-${i + 1}`,
                        user_id: johnUser.id,
                        property_id: johnProperty.id,
                        category: serviceRequests[i].category,
                        description: serviceRequests[i].description,
                        status: 'PENDING',
                        created_at: new Date()
                    }
                });
            }
            console.log('✅ Created service requests for testing');
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

createSimpleTestData();

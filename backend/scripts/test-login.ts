import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { getUserByEmail } from '../src/models/index.js';
import bcrypt from 'bcrypt';

async function testLogin() {
    console.log('\n=== Testing Login Flow ===\n');

    const email = 'test@campus.edu';
    const password = 'password123';

    console.log('1. Looking up user by email:', email);

    try {
        const user = await getUserByEmail(email);

        if (!user) {
            console.log('❌ User not found in database');
            console.log('\nTrying to list all users...');
            const { getAllUsers } = await import('../src/models/index.js');
            const allUsers = await getAllUsers();
            console.log(`Found ${allUsers.length} users in database:`);
            allUsers.slice(0, 5).forEach((u: any) => {
                console.log(`  - ${u.email} (${u.name})`);
            });
            return;
        }

        console.log('✅ User found:', {
            id: user.id,
            email: user.email,
            name: user.name,
            has_password_hash: !!user.password_hash,
            password_hash_length: user.password_hash?.length
        });

        console.log('\n2. Testing password comparison...');
        console.log('Password to test:', password);
        console.log('Stored hash:', user.password_hash?.substring(0, 20) + '...');

        const isValid = await bcrypt.compare(password, user.password_hash);

        if (isValid) {
            console.log('✅ Password is correct!');
        } else {
            console.log('❌ Password is incorrect');
            console.log('\nGenerating correct hash for password123:');
            const correctHash = await bcrypt.hash(password, 10);
            console.log('New hash:', correctHash);
            console.log('\nRun this SQL in Supabase:');
            console.log(`UPDATE users SET password_hash = '${correctHash}' WHERE email = '${email}';`);
        }

    } catch (error) {
        console.error('❌ Error during test:', error);
    }
}

testLogin();

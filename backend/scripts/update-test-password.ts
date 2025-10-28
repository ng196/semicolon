import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { supabase } from '../src/supabase.js';
import bcrypt from 'bcrypt';

async function updatePassword() {
    console.log('\n🔐 Updating test user password...\n');

    const email = 'test@campus.edu';
    const password = 'password123';

    // Generate hash
    const passwordHash = await bcrypt.hash(password, 10);

    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Hash:', passwordHash);

    // Update in Supabase
    const { data, error } = await supabase
        .from('users')
        .update({ password_hash: passwordHash })
        .eq('email', email)
        .select();

    if (error) {
        console.error('\n❌ Error updating password:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('\n✅ Password updated successfully!');
        console.log('Updated user:', data[0].name, `(${data[0].email})`);
        console.log('\nYou can now login with:');
        console.log('  Email:', email);
        console.log('  Password:', password);
    } else {
        console.log('\n⚠️  User not found with email:', email);
        console.log('\nChecking what users exist...');

        const { data: users } = await supabase
            .from('users')
            .select('id, email, name')
            .limit(10);

        console.log('\nFound users:');
        users?.forEach(u => {
            console.log(`  - ${u.email} (${u.name})`);
        });
    }
}

updatePassword();

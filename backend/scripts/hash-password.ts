import bcrypt from 'bcrypt';

const password = process.argv[2] || 'password123';

async function hashPassword() {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('\n=================================');
    console.log('Password:', password);
    console.log('Hash:', hash);
    console.log('=================================\n');
    console.log('Run this SQL in Supabase SQL Editor:');
    console.log(`UPDATE users SET password_hash = '${hash}' WHERE email = 'test@campus.edu';`);
    console.log('\n');
}

hashPassword();

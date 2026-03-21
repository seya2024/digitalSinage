const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function testLogin() {
    console.log('🔍 Testing Login System...\n');
    
    // Test database connection
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'dashen_bank'
        });
        
        console.log('✅ Database connected');
        
        // Check if admin user exists
        const [users] = await connection.execute(
            'SELECT id, username, password, is_active FROM users WHERE username = ?',
            ['admin']
        );
        
        if (users.length === 0) {
            console.log('❌ Admin user NOT found!');
            console.log('📝 Creating admin user...');
            
            const hash = await bcrypt.hash('admin123', 10);
            await connection.execute(
                'INSERT INTO users (username, password, email, role, is_active) VALUES (?, ?, ?, ?, ?)',
                ['admin', hash, 'admin@dashenbank.com', 'super_admin', 1]
            );
            console.log('✅ Admin user created with password: admin123');
        } else {
            const user = users[0];
            console.log(`✅ Admin user found: ${user.username}`);
            console.log(`   ID: ${user.id}`);
            console.log(`   Active: ${user.is_active}`);
            console.log(`   Password hash: ${user.password.substring(0, 30)}...`);
            
            // Test password validation
            const isValid = await bcrypt.compare('admin123', user.password);
            console.log(`   Password "admin123" valid: ${isValid ? '✅ YES' : '❌ NO'}`);
            
            if (!isValid) {
                console.log('\n⚠️  Password doesn\'t match. Updating...');
                const newHash = await bcrypt.hash('admin123', 10);
                await connection.execute(
                    'UPDATE users SET password = ? WHERE id = ?',
                    [newHash, user.id]
                );
                console.log('✅ Password reset to: admin123');
            }
            
            if (user.is_active !== 1) {
                console.log('\n⚠️  User is inactive. Activating...');
                await connection.execute(
                    'UPDATE users SET is_active = 1 WHERE id = ?',
                    [user.id]
                );
                console.log('✅ User activated');
            }
        }
        
        // Show all users
        const [allUsers] = await connection.execute(
            'SELECT id, username, email, role, is_active FROM users'
        );
        console.log('\n📊 All users in database:');
        allUsers.forEach(u => {
            console.log(`   - ${u.username} (${u.role}) - Active: ${u.is_active ? 'Yes' : 'No'}`);
        });
        
        await connection.end();
        console.log('\n✅ Database check complete!');
        console.log('\n🔐 Now try logging in with:');
        console.log('   Username: admin');
        console.log('   Password: admin123');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n💡 Make sure:');
        console.log('   1. MySQL is running (XAMPP Control Panel)');
        console.log('   2. Database "dashen_bank" exists');
        console.log('   3. Credentials in .env are correct');
    }
}

testLogin();
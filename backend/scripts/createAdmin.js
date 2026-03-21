const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function testLogin() {
    const pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'dashen_bank',
        waitForConnections: true
    });

    try {
        // Get admin user
        const [users] = await pool.execute(
            'SELECT id, username, email, password, first_name, last_name FROM users WHERE email = ? OR username = ?',
            ['admin@signage.com', 'admin']
        );
        
        if (users.length === 0) {
            console.log('❌ No admin user found!');
            return;
        }
        
        const user = users[0];
        console.log('👤 User found:', {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name
        });
        
        // Test password
        const testPassword = 'admin123';
        const isValid = await bcrypt.compare(testPassword, user.password);
        
        console.log('\n🔐 Password test:');
        console.log(`   Password: ${testPassword}`);
        console.log(`   Valid: ${isValid ? '✅ YES' : '❌ NO'}`);
        
        if (!isValid) {
            // Hash a new password
            const newHash = await bcrypt.hash(testPassword, 10);
            console.log(`\n💡 New hash for 'admin123': ${newHash}`);
            console.log('\nRun this SQL to update password:');
            console.log(`UPDATE users SET password = '${newHash}' WHERE id = ${user.id};`);
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

testLogin();
// backend/scripts/createUsers.js
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

async function createUsers() {
    const users = [
        {
            username: 'superadmin',
            email: 'superadmin@bank.com',
            password: 'SuperAdmin123!',
            role: 'super_admin'
        },
        {
            username: 'admin',
            email: 'admin@bank.com',
            password: 'Admin123!',
            role: 'admin'
        },
        {
            username: 'ibd_user',
            email: 'ibd@bank.com',
            password: 'Ibd123!',
            role: 'ibd'
        },
        {
            username: 'user1',
            email: 'user1@example.com',
            password: 'User123!',
            role: 'user'
        }
    ];
    
    for (const user of users) {
        try {
            // Check if user exists
            const [existing] = await pool.execute(
                'SELECT id FROM users WHERE username = ?',
                [user.username]
            );
            
            if (existing.length > 0) {
                console.log(`User ${user.username} already exists, skipping...`);
                continue;
            }
            
            // Create user
            const hashedPassword = await bcrypt.hash(user.password, 10);
            await pool.execute(
                'INSERT INTO users (username, email, password, role, is_active, created_at) VALUES (?, ?, ?, ?, true, NOW())',
                [user.username, user.email, hashedPassword, user.role]
            );
            
            console.log(`✅ Created ${user.role}: ${user.username} / ${user.password}`);
        } catch (error) {
            console.error(`❌ Failed to create ${user.username}:`, error.message);
        }
    }
    
    console.log('\n🎉 User creation completed!');
    process.exit();
}

createUsers();
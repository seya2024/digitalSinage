// backend/scripts/createUsers.js
require('dotenv').config({ path: '../.env' });  // Load .env from parent folder
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

async function createUsers() {
    try {
        console.log('🔐 Creating users...\n');
        console.log('DB Host:', process.env.DB_HOST);
        console.log('DB User:', process.env.DB_USER);
        console.log('DB Name:', process.env.DB_NAME);
        
        const users = [
            {
                username: 'admin',
                email: 'admin@dashenbank.com',
                password: 'admin123',
                full_name: 'System Administrator',
                role: 'super_admin'
            },
            {
                username: 'manager',
                email: 'manager@dashenbank.com',
                password: 'admin123',
                full_name: 'Rate Manager',
                role: 'admin'
            },
            {
                username: 'viewer',
                email: 'viewer@dashenbank.com',
                password: 'admin123',
                full_name: 'Dashboard Viewer',
                role: 'viewer'
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
                    console.log(`⚠️  User ${user.username} already exists, skipping...`);
                    continue;
                }
                
                // Hash password
                const hashedPassword = await bcrypt.hash(user.password, 10);
                
                // Insert user
                await pool.execute(
                    `INSERT INTO users 
                    (username, email, password, full_name, role, is_active, created_at) 
                    VALUES (?, ?, ?, ?, ?, 1, NOW())`,
                    [user.username, user.email, hashedPassword, user.full_name, user.role]
                );
                
                console.log(`✅ Created: ${user.username} (${user.role}) / Password: ${user.password}`);
                
            } catch (error) {
                console.error(`❌ Failed to create ${user.username}:`, error.message);
            }
        }
        
        // Verify users were created
        const [allUsers] = await pool.execute(
            'SELECT id, username, email, role FROM users ORDER BY id'
        );
        
        console.log('\n📊 Current users in database:');
        console.table(allUsers);
        
        console.log('\n🎉 User creation completed!');
        
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
    } finally {
        await pool.end();
        process.exit();
    }
}

createUsers();
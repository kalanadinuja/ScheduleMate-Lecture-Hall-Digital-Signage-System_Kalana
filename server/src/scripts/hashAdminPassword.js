const bcrypt = require('bcrypt');
const pool = require('../config/database');

async function hashAdminPassword() {
    try {
        const result = await pool.query('SELECT admin_id, password_hash FROM admins WHERE email = $1', ['admin@sparkline.lk']);
        if (result.rows.length === 0) {
            console.log('No admin found with email admin@sparkline.lk');
            return;
        }

        const admin = result.rows[0];
        // Check if already hashed
        if (admin.password_hash.startsWith('$2b$') || admin.password_hash.startsWith('$2a$')) {
            console.log('Admin password is already hashed.');
            return;
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(admin.password_hash, saltRounds);

        await pool.query('UPDATE admins SET password_hash = $1, updated_at = NOW() WHERE admin_id = $2', [hashedPassword, admin.admin_id]);
        console.log('✅ Admin password successfully hashed and updated in database!');
    } catch (err) {
        console.error('❌ Error hashing admin password:', err.message);
    } finally {
        await pool.end();
    }
}

hashAdminPassword();

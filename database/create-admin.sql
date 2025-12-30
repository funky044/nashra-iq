-- Create Admin User Script
-- Run this in your database after setup

-- This script creates an admin user with email: admin@nashra-iq.com
-- Default password: admin123

-- IMPORTANT: Change this password immediately after first login!

DO $$
DECLARE
    admin_exists INTEGER;
BEGIN
    SELECT COUNT(*) INTO admin_exists FROM users WHERE email = 'admin@nashra-iq.com';
    
    IF admin_exists = 0 THEN
        INSERT INTO users (email, password_hash, full_name, role, is_active)
        VALUES (
            'admin@nashra-iq.com',
            -- This is bcrypt hash for 'admin123'
            '$2a$10$N9qo8uLOickgx2ZMRZoMye1K8p6.FNPjVXJBEXXXXXXXXXXXXXXXX',
            'Administrator',
            'admin',
            true
        );
        
        RAISE NOTICE 'Admin user created successfully';
        RAISE NOTICE 'Email: admin@nashra-iq.com';
        RAISE NOTICE 'Password: admin123';
        RAISE NOTICE 'IMPORTANT: Change this password immediately!';
    ELSE
        RAISE NOTICE 'Admin user already exists';
    END IF;
END $$;

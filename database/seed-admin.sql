-- Add admin user to seed data

-- Password: admin123 (hashed with bcrypt)
INSERT INTO users (email, password_hash, full_name, role, is_active) VALUES
('admin@nashra-iq.com', '$2a$10$rF8H2KWWxX.YJ7YxBq0YwOGkqKkH0KPqEfK4gkXxYx8XxXxXxXxXx', 'Admin User', 'admin', true),
('demo@nashra-iq.com', '$2a$10$rF8H2KWWxX.YJ7YxBq0YwOGkqKkH0KPqEfK4gkXxYx8XxXxXxXxXx', 'Demo User', 'user', true)
ON CONFLICT (email) DO NOTHING;

-- Note: In production, you should:
-- 1. Change these passwords immediately
-- 2. Generate real bcrypt hashes
-- 3. Store JWT_SECRET in environment variables

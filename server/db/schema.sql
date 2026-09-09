-- Schema for Couples' Financial Uplifting & Budget Planner (PostgreSQL / Supabase)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Households (Shared account container for a couple)
CREATE TABLE IF NOT EXISTS households (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users (Partners in the household)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID REFERENCES households(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) DEFAULT 'hashed_pass',
    monthly_net_income DECIMAL(12, 2) DEFAULT 0.00,
    pay_frequency VARCHAR(20) DEFAULT 'monthly',
    pay_day VARCHAR(20) DEFAULT '25th',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Expense Categories (50/30/20 Rule: Needs, Wants, Savings)
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID REFERENCES households(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('Needs', 'Wants', 'Savings')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Expense / Transaction Logging
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID REFERENCES households(id) ON DELETE CASCADE,
    paid_by_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    split_type VARCHAR(20) DEFAULT 'Proportional',
    transaction_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Financial Milestone Goals
CREATE TABLE IF NOT EXISTS savings_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID REFERENCES households(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    category VARCHAR(50) DEFAULT 'General',
    target_amount DECIMAL(12, 2) NOT NULL,
    current_amount DECIMAL(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Household Settings & Preferences (Bill Splitter, Wealth Projections, Currency, Spend)
CREATE TABLE IF NOT EXISTS household_settings (
    household_id UUID PRIMARY KEY REFERENCES households(id) ON DELETE CASCADE,
    currency VARCHAR(10) DEFAULT 'Rs.',
    sample_bill_amount DECIMAL(12, 2) DEFAULT 100000.00,
    starting_savings DECIMAL(12, 2) DEFAULT 1000000.00,
    monthly_contribution DECIMAL(12, 2) DEFAULT 150000.00,
    annual_return DECIMAL(5, 2) DEFAULT 10.00,
    needs_actual DECIMAL(12, 2) DEFAULT 320000.00,
    wants_actual DECIMAL(12, 2) DEFAULT 180000.00,
    savings_actual DECIMAL(12, 2) DEFAULT 150000.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Default Household for Dulanja & Diyana
INSERT INTO households (id, name) 
VALUES ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Dulanja & Diyana Household')
ON CONFLICT (id) DO NOTHING;

-- Seed Settings
INSERT INTO household_settings (household_id, currency, sample_bill_amount, starting_savings, monthly_contribution, annual_return, needs_actual, wants_actual, savings_actual)
VALUES ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Rs.', 100000.00, 1000000.00, 150000.00, 10.00, 320000.00, 180000.00, 150000.00)
ON CONFLICT (household_id) DO NOTHING;

-- Seed Partner Profiles
INSERT INTO users (household_id, name, email, monthly_net_income, pay_day) VALUES 
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Dulanja', 'dulanja@couplesbudget.lk', 450000.00, '25th'),
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Diyana', 'diyana@couplesbudget.lk', 350000.00, '28th')
ON CONFLICT (email) DO NOTHING;

-- Seed Sample Daily Expenses
INSERT INTO transactions (household_id, paid_by_name, category, title, amount, split_type, transaction_date) VALUES
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Dulanja', 'Needs', 'Keells Supermarket Groceries', 45000.00, 'Proportional', '2026-08-16'),
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Diyana', 'Needs', 'Fiber Broadband & Electricity', 18000.00, 'Proportional', '2026-08-15'),
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Dulanja', 'Wants', 'Weekend Dinner & Drinks', 12500.00, '50/50', '2026-08-14');

-- Seed Savings Goals
INSERT INTO savings_goals (household_id, title, category, target_amount, current_amount) VALUES
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Emergency Fund (6 Months)', 'Emergency', 2000000.00, 1200000.00),
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Dream Vacation Trip', 'Vacation', 600000.00, 350000.00),
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'House Downpayment Fund', 'Milestone', 5000000.00, 2500000.00);

-- Income Methods & Project Inflows (Freelance, Client Projects, Side Hustles, Investments)
CREATE TABLE IF NOT EXISTS income_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID REFERENCES households(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    received_by_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) DEFAULT 'Project',
    recurrence VARCHAR(20) DEFAULT 'monthly',
    income_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Sample Project & Freelance Income Methods
INSERT INTO income_sources (household_id, title, amount, received_by_name, category, recurrence, income_date) VALUES
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Mobile App Development Client Project', 120000.00, 'Dulanja', 'Project', 'monthly', '2026-08-20'),
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Brand Identity & UI Kit Design', 75000.00, 'Diyana', 'Freelance', 'monthly', '2026-08-18');


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
    password_hash VARCHAR(255) NOT NULL,
    monthly_net_income DECIMAL(12, 2) DEFAULT 0.00,
    pay_frequency VARCHAR(20) DEFAULT 'monthly', -- 'monthly', 'biweekly', 'weekly'
    pay_day INT, -- e.g. 1st or 15th
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Expense Categories (50/30/20 Rule: Needs, Wants, Savings)
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID REFERENCES households(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('need', 'want', 'savings')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Expense / Transaction Logging
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID REFERENCES households(id) ON DELETE CASCADE,
    paid_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    title VARCHAR(150) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    split_type VARCHAR(20) DEFAULT 'proportional', -- 'proportional', 'fifty_fifty', 'individual'
    partner_a_share DECIMAL(12, 2),
    partner_b_share DECIMAL(12, 2),
    transaction_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Financial Milestone Goals
CREATE TABLE IF NOT EXISTS savings_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID REFERENCES households(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    category VARCHAR(50) DEFAULT 'general', -- 'vacation', 'emergency', 'house', 'debt', 'investment'
    target_amount DECIMAL(12, 2) NOT NULL,
    current_amount DECIMAL(12, 2) DEFAULT 0.00,
    monthly_contribution DECIMAL(12, 2) DEFAULT 0.00,
    target_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Default Household Categories for 50/30/20 setup helper
-- Needs (50%): Housing, Utilities, Groceries, Insurance, Debt Min Payments
-- Wants (30%): Dining Out, Entertainment, Travel, Subscriptions
-- Savings (20%): Emergency Fund, Investments, Goal Contributions

-- SQL Script to Remove Past Month Data for Couples Budget Planner
-- Run this in your Supabase SQL Editor or PostgreSQL client

-- ====================================================================
-- 1. PREVIEW PAST DATA (Dry Run - View records before deleting)
-- ====================================================================

-- View transactions dated before the current month (e.g. before 1st of this month)
SELECT id, title, amount, category, paid_by_name, transaction_date 
FROM transactions 
WHERE transaction_date < DATE_TRUNC('month', CURRENT_DATE)
ORDER BY transaction_date DESC;

-- View income sources dated before the current month
SELECT id, title, amount, category, recurrence, income_date 
FROM income_sources 
WHERE income_date < DATE_TRUNC('month', CURRENT_DATE)
ORDER BY income_date DESC;


-- ====================================================================
-- 2. DELETE PAST MONTH TRANSACTIONS & EXPENSES
-- ====================================================================

-- Delete all transactions logged before the 1st of the current month
DELETE FROM transactions 
WHERE transaction_date < DATE_TRUNC('month', CURRENT_DATE);

-- Alternatively, delete before a specific date (e.g., September 1, 2026):
-- DELETE FROM transactions WHERE transaction_date < '2026-09-01';


-- ====================================================================
-- 3. DELETE OR UPDATE PAST MONTH INCOME SOURCES
-- ====================================================================

-- Delete any project/extra income entries dated before this month:
DELETE FROM income_sources 
WHERE income_date < DATE_TRUNC('month', CURRENT_DATE);

-- (Optional) If you have monthly recurring project incomes that you want to keep
-- but only delete one-time project records from past months, run this instead:
-- DELETE FROM income_sources 
-- WHERE income_date < DATE_TRUNC('month', CURRENT_DATE) AND recurrence = 'one-time';


-- ====================================================================
-- 4. RESET MONTHLY ACTUAL SPEND BENCHMARKS (Optional)
-- ====================================================================

-- If you want the 50/30/20 actual logged spend to start fresh from 0 for this month:
UPDATE household_settings 
SET needs_actual = 0.00, 
    wants_actual = 0.00, 
    savings_actual = 0.00
WHERE household_id = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';


-- ====================================================================
-- 5. COMPLETE TRANSACTION RESET (If you want a 100% fresh start)
-- ====================================================================

-- If you want to wipe ALL historical transactions to start fresh from today:
-- DELETE FROM transactions;

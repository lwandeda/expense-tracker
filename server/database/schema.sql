-- =========================================
-- EXPENSE TRACKER DATABASE SCHEMA
-- =========================================

-- 1. Create the users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- 2. Create the categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(10) NOT NULL
        CHECK (type IN ('income', 'expense')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_category_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_user_category
        UNIQUE (user_id, name, type)
);


-- 3. Create the transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,

    amount NUMERIC(12, 2) NOT NULL
        CHECK (amount > 0),

    type VARCHAR(10) NOT NULL
        CHECK (type IN ('income', 'expense')),

    description TEXT,

    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_transaction_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_transaction_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE RESTRICT
);


-- 4. Create indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_transactions_user
ON transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_transactions_category
ON transactions(category_id);

CREATE INDEX IF NOT EXISTS idx_transactions_date
ON transactions(transaction_date);

CREATE INDEX IF NOT EXISTS idx_transactions_user_date
ON transactions(user_id, transaction_date);
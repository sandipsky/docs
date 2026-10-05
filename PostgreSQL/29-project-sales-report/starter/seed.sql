-- Level 3 shared dataset: a small stationery shop, July to September 2026.
-- Used by chapters 20 to 29. Run it in a database called "sales":
--
--   CREATE DATABASE sales;
--   \c sales
--   \i C:/.../PostgreSQL/29-project-sales-report/starter/seed.sql
--
-- It drops and recreates every table, so you can run it again for a clean start.
-- Prices, customers and orders are made up.

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS customers;

CREATE TABLE categories (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text NOT NULL UNIQUE
);

CREATE TABLE products (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  category_id integer NOT NULL REFERENCES categories (id),
  name text NOT NULL,
  sku text NOT NULL UNIQUE,
  price numeric(10, 2) NOT NULL CHECK (price >= 0),
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE customers (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  city text NOT NULL,
  joined_on date NOT NULL
);

CREATE TABLE orders (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  customer_id integer NOT NULL REFERENCES customers (id),
  ordered_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'shipped', 'cancelled')),
  shipped_at timestamptz
);

CREATE TABLE order_items (
  order_id integer NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  product_id integer NOT NULL REFERENCES products (id),
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(10, 2) NOT NULL CHECK (unit_price >= 0),
  PRIMARY KEY (order_id, product_id)
);

INSERT INTO categories (name) VALUES
  ('Stationery'),      -- 1
  ('Furniture'),       -- 2
  ('Bags'),            -- 3
  ('Electronics');     -- 4

INSERT INTO products (category_id, name, sku, price, stock, is_active) VALUES
  (1, 'Notebook',          'STA-001',   3.90, 120, true),    -- 1  (was 3.50 until September)
  (1, 'Pen',               'STA-002',   1.20, 500, true),    -- 2
  (1, 'Sticky notes',      'STA-003',   2.75, 200, true),    -- 3
  (1, 'Stapler',           'STA-004',   8.00,   0, false),   -- 4  (discontinued)
  (1, 'Whiteboard marker', 'STA-005',   1.80, 300, true),    -- 5  (never sold)
  (2, 'Desk lamp',         'FUR-001',  24.99,  15, true),    -- 6
  (2, 'Office chair',      'FUR-002', 149.00,   6, true),    -- 7
  (3, 'Backpack',          'BAG-001',  45.00,   8, true),    -- 8
  (3, 'Laptop sleeve',     'BAG-002',  19.50,  25, true),    -- 9
  (4, 'USB hub',           'ELE-001',  29.99,  30, true),    -- 10
  (4, 'Wireless mouse',    'ELE-002',  15.75,  45, true);    -- 11

INSERT INTO customers (name, email, city, joined_on) VALUES
  ('Asha Rai',        'asha@example.com',    'Kathmandu', '2026-01-15'),   -- 1
  ('Bikram Shrestha', 'bikram@example.com',  'Pokhara',   '2026-02-03'),   -- 2
  ('Chandra Gurung',  'chandra@example.com', 'Lalitpur',  '2026-02-20'),   -- 3
  ('Dipesh Thapa',    'dipesh@example.com',  'Kathmandu', '2026-04-11'),   -- 4
  ('Elina Maharjan',  'elina@example.com',   'Lalitpur',  '2026-06-30'),   -- 5  (never ordered)
  ('Farhan Ali',      'farhan@example.com',  'Pokhara',   '2026-07-08');   -- 6

INSERT INTO orders (customer_id, ordered_at, status, shipped_at) VALUES
  (1, '2026-07-03 10:15+05:45', 'paid',      '2026-07-05 09:00+05:45'),   -- 1
  (2, '2026-07-10 14:30+05:45', 'shipped',   '2026-07-12 11:30+05:45'),   -- 2
  (3, '2026-07-18 09:05+05:45', 'shipped',   '2026-07-20 10:00+05:45'),   -- 3
  (1, '2026-07-25 16:45+05:45', 'cancelled', NULL),                       -- 4
  (4, '2026-08-02 11:20+05:45', 'shipped',   '2026-08-04 14:00+05:45'),   -- 5
  (2, '2026-08-09 13:00+05:45', 'shipped',   '2026-08-11 09:30+05:45'),   -- 6
  (6, '2026-08-15 17:30+05:45', 'paid',      NULL),                       -- 7
  (1, '2026-08-21 10:00+05:45', 'shipped',   '2026-08-23 12:00+05:45'),   -- 8
  (3, '2026-09-04 12:10+05:45', 'shipped',   '2026-09-06 10:15+05:45'),   -- 9
  (4, '2026-09-11 15:40+05:45', 'paid',      NULL),                       -- 10
  (6, '2026-09-19 09:50+05:45', 'pending',   NULL),                       -- 11
  (1, '2026-09-26 18:05+05:45', 'pending',   NULL);                       -- 12

INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
  (1,  1,  2,   3.50),   -- Notebook at the old price
  (1,  2,  5,   1.20),
  (2,  6,  1,  24.99),
  (2,  4,  1,   8.00),   -- Stapler, before it was discontinued
  (3,  7,  1, 149.00),
  (4,  8,  1,  45.00),   -- cancelled order
  (5, 10,  1,  29.99),
  (5, 11,  1,  15.75),
  (5,  1,  3,   3.50),
  (6,  2, 10,   1.20),
  (6,  3,  4,   2.75),
  (7,  9,  1,  19.50),
  (7, 11,  1,  15.75),
  (8,  7,  1, 149.00),
  (8,  6,  1,  24.99),
  (9,  8,  2,  45.00),
  (10, 10, 1,  29.99),
  (11, 2, 20,   1.20),
  (11, 3,  2,   2.75),
  (12, 1,  3,   3.90),   -- Notebook at the new price
  (12, 9,  1,  19.50);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  model TEXT NOT NULL,
  image TEXT,
  price REAL NOT NULL,
  sizes TEXT NOT NULL,
  colors TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Selections (orders) table
CREATE TABLE IF NOT EXISTS selections (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  model TEXT NOT NULL,
  size TEXT NOT NULL,
  color_name TEXT NOT NULL,
  color_hex TEXT NOT NULL,
  price REAL NOT NULL,
  quantity INTEGER NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_selections_timestamp ON selections(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_selections_product_id ON selections(product_id);

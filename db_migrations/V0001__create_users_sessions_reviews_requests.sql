
CREATE TABLE IF NOT EXISTS t_p8332130_modern_auto_dispute.users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(255),
  phone VARCHAR(50),
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p8332130_modern_auto_dispute.sessions (
  id VARCHAR(64) PRIMARY KEY,
  user_id INTEGER REFERENCES t_p8332130_modern_auto_dispute.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '30 days'
);

CREATE TABLE IF NOT EXISTS t_p8332130_modern_auto_dispute.reviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES t_p8332130_modern_auto_dispute.users(id),
  author_name VARCHAR(255),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  photo_url TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p8332130_modern_auto_dispute.requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES t_p8332130_modern_auto_dispute.users(id),
  name VARCHAR(255),
  phone VARCHAR(50),
  make VARCHAR(100),
  model VARCHAR(100),
  generation VARCHAR(100),
  part TEXT,
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

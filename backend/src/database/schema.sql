CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  avatar TEXT,
  specialization TEXT,
  year TEXT,
  interests TEXT,
  online_status INTEGER DEFAULT 0,
  last_seen DATETIME,
  attendance_rate INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hubs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  specialization TEXT,
  year TEXT,
  creator_id INTEGER NOT NULL,
  rating REAL DEFAULT 0.0,
  color TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (creator_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS hub_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hub_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  role TEXT DEFAULT 'member',
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hub_id) REFERENCES hubs(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(hub_id, user_id)
);

CREATE TABLE IF NOT EXISTS hub_interests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hub_id INTEGER NOT NULL,
  interest TEXT NOT NULL,
  FOREIGN KEY (hub_id) REFERENCES hubs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  organizer TEXT NOT NULL,
  specialization TEXT,
  attending INTEGER DEFAULT 0,
  capacity INTEGER DEFAULT 100,
  color TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS marketplace_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price REAL NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  condition TEXT NOT NULL,
  image TEXT,
  seller_id INTEGER NOT NULL,
  seller_name TEXT NOT NULL,
  seller_avatar TEXT,
  seller_rating REAL DEFAULT 0,
  liked INTEGER DEFAULT 0,
  posted_at TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES users(id)
);

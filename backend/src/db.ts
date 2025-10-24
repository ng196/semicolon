import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use absolute path to ensure we always use the same database file
const dbPath = path.resolve(process.cwd(), 'database', 'campushub.db');
const dbDir = path.dirname(dbPath);

console.log('🗄️  Database Configuration:');
console.log('   Working Directory:', process.cwd());
console.log('   Database Path:', dbPath);
console.log('   Database Directory:', dbDir);

if (!fs.existsSync(dbDir)) {
  console.log('📁 Creating database directory...');
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbExists = fs.existsSync(dbPath);
console.log('   Database Exists:', dbExists);

if (dbExists) {
  const stats = fs.statSync(dbPath);
  console.log('   Database Size:', (stats.size / 1024).toFixed(2), 'KB');
  console.log('   Last Modified:', stats.mtime.toISOString());
}

export const db: Database.Database = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');
console.log('   Journal Mode:', db.pragma('journal_mode', { simple: true }));

if (!dbExists) {
  console.log('🔧 Initializing new database with schema...');
  const schemaPath = path.join(__dirname, 'database/schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema);
    console.log('✅ Database initialized with schema');
  } else {
    console.error('❌ Schema file not found at:', schemaPath);
  }
} else {
  console.log('✅ Using existing database');
}

// Log all database operations
const originalPrepare = db.prepare.bind(db);
db.prepare = function (sql: string) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 📝 SQL:`, sql.substring(0, 100) + (sql.length > 100 ? '...' : ''));
  return originalPrepare(sql);
};

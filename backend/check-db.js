#!/usr/bin/env node

/**
 * Database Health Check Script
 * 
 * This script:
 * 1. Lists all database files
 * 2. Shows which one is being used
 * 3. Displays record counts from each
 * 4. Helps identify the correct database
 */

import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

const dbDir = path.resolve(process.cwd(), 'database');

console.log('🔍 Database Health Check\n');
console.log('Working Directory:', process.cwd());
console.log('Database Directory:', dbDir);
console.log('─'.repeat(80));

if (!fs.existsSync(dbDir)) {
  console.error('❌ Database directory does not exist!');
  process.exit(1);
}

const files = fs.readdirSync(dbDir).filter(f => f.endsWith('.db'));

console.log(`\n📁 Found ${files.length} database file(s):\n`);

const dbStats = [];

files.forEach((file, index) => {
  const filePath = path.join(dbDir, file);
  const stats = fs.statSync(filePath);
  
  console.log(`${index + 1}. ${file}`);
  console.log(`   Path: ${filePath}`);
  console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);
  console.log(`   Modified: ${stats.mtime.toISOString()}`);
  
  try {
    const db = new Database(filePath, { readonly: true });
    
    const users = db.prepare('SELECT COUNT(*) as count FROM users').get();
    const hubs = db.prepare('SELECT COUNT(*) as count FROM hubs').get();
    const events = db.prepare('SELECT COUNT(*) as count FROM events').get();
    const marketplace = db.prepare('SELECT COUNT(*) as count FROM marketplace_items').get();
    const requests = db.prepare('SELECT COUNT(*) as count FROM requests').get();
    
    console.log(`   Records:`);
    console.log(`     - Users: ${users.count}`);
    console.log(`     - Hubs: ${hubs.count}`);
    console.log(`     - Events: ${events.count}`);
    console.log(`     - Marketplace: ${marketplace.count}`);
    console.log(`     - Requests: ${requests.count}`);
    
    const totalRecords = users.count + hubs.count + events.count + marketplace.count + requests.count;
    
    dbStats.push({
      file,
      path: filePath,
      size: stats.size,
      modified: stats.mtime,
      records: {
        users: users.count,
        hubs: hubs.count,
        events: events.count,
        marketplace: marketplace.count,
        requests: requests.count,
        total: totalRecords
      }
    });
    
    db.close();
  } catch (error) {
    console.log(`   ❌ Error reading database: ${error.message}`);
  }
  
  console.log('');
});

console.log('─'.repeat(80));

// Find the database with most records
const mainDb = dbStats.reduce((max, db) => 
  db.records.total > max.records.total ? db : max
, dbStats[0]);

console.log('\n📊 Analysis:\n');
console.log(`Primary database (most records): ${mainDb.file}`);
console.log(`Total records: ${mainDb.records.total}`);
console.log(`Last modified: ${mainDb.modified.toISOString()}`);

if (dbStats.length > 1) {
  console.log('\n⚠️  WARNING: Multiple database files detected!');
  console.log('This can cause data sync issues.');
  console.log('\nRecommendation:');
  console.log(`1. Keep: ${mainDb.file}`);
  console.log(`2. Backup others to a safe location`);
  console.log(`3. Delete duplicate files`);
  
  const duplicates = dbStats.filter(db => db.file !== mainDb.file);
  console.log('\nFiles to backup/remove:');
  duplicates.forEach(db => {
    console.log(`   - ${db.file} (${db.records.total} records)`);
  });
}

console.log('\n✅ Check complete\n');

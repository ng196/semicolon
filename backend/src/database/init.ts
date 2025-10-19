import fs from 'fs';
import path from 'path';
import { db } from '../db.js';

export const initDatabase = (): void => {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);
  console.log('Database initialized');
};

if (require.main === module) {
  initDatabase();
}

import { db } from './db.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function seedDatabase() {
  console.log('Starting database seeding...');

  try {
    const usersJsonPath = join(__dirname, '../../frontend/src/data/users.json');
    const hubsJsonPath = join(__dirname, '../../frontend/src/data/hubs.json');

    const usersData = JSON.parse(readFileSync(usersJsonPath, 'utf-8'));
    const hubsData = JSON.parse(readFileSync(hubsJsonPath, 'utf-8'));

    const eventsJsonPath = join(__dirname, '../../frontend/src/data/events.json');
    const marketplaceJsonPath = join(__dirname, '../../frontend/src/data/marketplace.json');
    const eventsData = JSON.parse(readFileSync(eventsJsonPath, 'utf-8'));
    const marketplaceData = JSON.parse(readFileSync(marketplaceJsonPath, 'utf-8'));

    console.log(`Found ${usersData.length} users, ${hubsData.length} hubs, ${eventsData.length} events, and ${marketplaceData.length} marketplace items`);

    db.exec('DELETE FROM hub_interests');
    db.exec('DELETE FROM hub_members');
    db.exec('DELETE FROM marketplace_items');
    db.exec('DELETE FROM hubs');
    db.exec('DELETE FROM events');
    db.exec('DELETE FROM users');
    console.log('Cleared existing data');

    const insertUser = db.prepare(`
      INSERT INTO users (id, email, username, name, avatar, specialization, year, online_status, password_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertUserTransaction = db.transaction((users) => {
      for (const user of users) {
        insertUser.run(
          user.id,
          user.email || `user${user.id}@campus.edu`,
          user.name.toLowerCase().replace(/\s+/g, '.'),
          user.name,
          user.avatar,
          user.specialization,
          user.year,
          user.online ? 1 : 0,
          'hashed_password_placeholder'
        );
      }
    });

    insertUserTransaction(usersData);
    console.log(`Inserted ${usersData.length} users`);

    const insertHub = db.prepare(`
      INSERT INTO hubs (id, name, type, description, icon, specialization, year, creator_id, rating, color)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertHubMember = db.prepare(`
      INSERT INTO hub_members (hub_id, user_id, role)
      VALUES (?, ?, ?)
    `);

    const insertHubInterest = db.prepare(`
      INSERT INTO hub_interests (hub_id, interest)
      VALUES (?, ?)
    `);

    const insertHubTransaction = db.transaction((hubs) => {
      for (const hub of hubs) {
        insertHub.run(
          hub.id,
          hub.name,
          hub.type,
          hub.description,
          hub.icon || null,
          hub.specialization || null,
          hub.year || null,
          1,
          hub.rating || 0.0,
          hub.color || null
        );

        insertHubMember.run(hub.id, 1, 'creator');

        if (hub.interests && Array.isArray(hub.interests)) {
          for (const interest of hub.interests) {
            insertHubInterest.run(hub.id, interest);
          }
        }
      }
    });

    insertHubTransaction(hubsData);
    console.log(`Inserted ${hubsData.length} hubs with interests`);

    const insertEvent = db.prepare(`
      INSERT INTO events (id, name, category, description, date, time, location, organizer, specialization, attending, capacity, color)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertEventTransaction = db.transaction((events) => {
      for (const event of events) {
        insertEvent.run(
          event.id,
          event.name,
          event.category,
          event.description,
          event.date,
          event.time,
          event.location,
          event.organizer,
          event.specialization || null,
          event.attending || 0,
          event.capacity || 100,
          event.color || null
        );
      }
    });

    insertEventTransaction(eventsData);
    console.log(`Inserted ${eventsData.length} events`);

    const insertItem = db.prepare(`
      INSERT INTO marketplace_items (id, title, description, price, type, category, condition, image, seller_id, seller_name, seller_avatar, seller_rating, liked, posted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertItemTransaction = db.transaction((items) => {
      for (const item of items) {
        insertItem.run(
          item.id,
          item.title,
          item.description,
          item.price,
          item.type,
          item.category,
          item.condition,
          item.image,
          item.seller?.id || 1,
          item.seller?.name || 'Unknown',
          item.seller?.avatar || null,
          item.seller?.rating || 0,
          item.liked ? 1 : 0,
          item.postedAt || null
        );
      }
    });

    insertItemTransaction(marketplaceData);
    console.log(`Inserted ${marketplaceData.length} marketplace items`);

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();

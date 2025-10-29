import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import Database from 'better-sqlite3';
import { supabase } from '../src/supabase.js';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../database/saksham.db');
const db = new Database(dbPath);

async function migrateData() {
    console.log('\n🚀 Starting SQLite to Supabase Migration\n');
    console.log('='.repeat(60));

    try {
        // 1. Migrate Users
        console.log('\n📊 Migrating Users...');
        const users = db.prepare('SELECT * FROM users').all();
        console.log(`Found ${users.length} users in SQLite`);

        const defaultPasswordHash = await bcrypt.hash('password123', 10);

        for (const user of users as any[]) {
            // Check if user already exists
            const { data: existing } = await supabase
                .from('users')
                .select('id')
                .eq('email', user.email)
                .single();

            if (existing) {
                console.log(`  ⏭️  Skipping user ${user.email} (already exists)`);
                continue;
            }

            const { error } = await supabase
                .from('users')
                .insert({
                    id: user.id,
                    email: user.email,
                    password_hash: user.password_hash || defaultPasswordHash,
                    username: user.username,
                    name: user.name,
                    avatar: user.avatar,
                    specialization: user.specialization,
                    year: user.year,
                    interests: user.interests,
                    online_status: user.online_status,
                    last_seen: user.last_seen,
                    attendance_rate: user.attendance_rate,
                    created_at: user.created_at
                });

            if (error) {
                console.log(`  ❌ Error inserting user ${user.email}:`, error.message);
            } else {
                console.log(`  ✅ Migrated user: ${user.email}`);
            }
        }

        // 2. Migrate Hubs
        console.log('\n📊 Migrating Hubs...');
        const hubs = db.prepare('SELECT * FROM hubs').all();
        console.log(`Found ${hubs.length} hubs in SQLite`);

        for (const hub of hubs as any[]) {
            const { data: existing } = await supabase
                .from('hubs')
                .select('id')
                .eq('id', hub.id)
                .single();

            if (existing) {
                console.log(`  ⏭️  Skipping hub ${hub.name} (already exists)`);
                continue;
            }

            const { error } = await supabase
                .from('hubs')
                .insert({
                    id: hub.id,
                    name: hub.name,
                    type: hub.type,
                    description: hub.description,
                    icon: hub.icon,
                    specialization: hub.specialization,
                    year: hub.year,
                    creator_id: hub.creator_id,
                    rating: hub.rating,
                    color: hub.color,
                    created_at: hub.created_at
                });

            if (error) {
                console.log(`  ❌ Error inserting hub ${hub.name}:`, error.message);
            } else {
                console.log(`  ✅ Migrated hub: ${hub.name}`);
            }
        }

        // 3. Migrate Hub Members
        console.log('\n📊 Migrating Hub Members...');
        const hubMembers = db.prepare('SELECT * FROM hub_members').all();
        console.log(`Found ${hubMembers.length} hub members in SQLite`);

        for (const member of hubMembers as any[]) {
            const { data: existing } = await supabase
                .from('hub_members')
                .select('id')
                .eq('hub_id', member.hub_id)
                .eq('user_id', member.user_id)
                .single();

            if (existing) {
                continue;
            }

            const { error } = await supabase
                .from('hub_members')
                .insert({
                    hub_id: member.hub_id,
                    user_id: member.user_id,
                    role: member.role,
                    joined_at: member.joined_at
                });

            if (error && error.code !== '23505') { // Ignore duplicate key errors
                console.log(`  ❌ Error inserting hub member:`, error.message);
            }
        }
        console.log(`  ✅ Migrated ${hubMembers.length} hub members`);

        // 4. Migrate Hub Interests
        console.log('\n📊 Migrating Hub Interests...');
        const hubInterests = db.prepare('SELECT * FROM hub_interests').all();
        console.log(`Found ${hubInterests.length} hub interests in SQLite`);

        for (const interest of hubInterests as any[]) {
            const { error } = await supabase
                .from('hub_interests')
                .insert({
                    hub_id: interest.hub_id,
                    interest: interest.interest
                });

            if (error && error.code !== '23505') {
                console.log(`  ❌ Error inserting hub interest:`, error.message);
            }
        }
        console.log(`  ✅ Migrated ${hubInterests.length} hub interests`);

        // 5. Migrate Events
        console.log('\n📊 Migrating Events...');
        const events = db.prepare('SELECT * FROM events').all();
        console.log(`Found ${events.length} events in SQLite`);

        for (const event of events as any[]) {
            const { data: existing } = await supabase
                .from('events')
                .select('id')
                .eq('id', event.id)
                .single();

            if (existing) {
                console.log(`  ⏭️  Skipping event ${event.name} (already exists)`);
                continue;
            }

            // Convert date and time to PostgreSQL timestamp
            let starts_at = new Date().toISOString();
            if (event.date && event.time) {
                starts_at = `${event.date}T${event.time}:00Z`;
            }

            const { error } = await supabase
                .from('events')
                .insert({
                    id: event.id,
                    name: event.name,
                    category: event.category,
                    description: event.description,
                    starts_at: starts_at,
                    location: event.location,
                    organizer: event.organizer,
                    specialization: event.specialization,
                    attending: event.attending,
                    capacity: event.capacity,
                    color: event.color,
                    created_at: event.created_at
                });

            if (error) {
                console.log(`  ❌ Error inserting event ${event.name}:`, error.message);
            } else {
                console.log(`  ✅ Migrated event: ${event.name}`);
            }
        }

        // 6. Migrate Marketplace Items
        console.log('\n📊 Migrating Marketplace Items...');
        const marketplaceItems = db.prepare('SELECT * FROM marketplace_items').all();
        console.log(`Found ${marketplaceItems.length} marketplace items in SQLite`);

        for (const item of marketplaceItems as any[]) {
            const { data: existing } = await supabase
                .from('marketplace_items')
                .select('id')
                .eq('id', item.id)
                .single();

            if (existing) {
                console.log(`  ⏭️  Skipping item ${item.title} (already exists)`);
                continue;
            }

            const { error } = await supabase
                .from('marketplace_items')
                .insert({
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    price: item.price,
                    type: item.type,
                    category: item.category,
                    condition: item.condition,
                    image: item.image,
                    seller_id: item.seller_id,
                    seller_name: item.seller_name,
                    seller_avatar: item.seller_avatar,
                    seller_rating: item.seller_rating,
                    liked: item.liked,
                    posted_at: item.posted_at,
                    created_at: item.created_at
                });

            if (error) {
                console.log(`  ❌ Error inserting item ${item.title}:`, error.message);
            } else {
                console.log(`  ✅ Migrated item: ${item.title}`);
            }
        }

        // 7. Migrate Requests
        console.log('\n📊 Migrating Requests...');
        const requests = db.prepare('SELECT * FROM requests').all();
        console.log(`Found ${requests.length} requests in SQLite`);

        for (const request of requests as any[]) {
            const { data: existing } = await supabase
                .from('requests')
                .select('id')
                .eq('id', request.id)
                .single();

            if (existing) {
                console.log(`  ⏭️  Skipping request ${request.title} (already exists)`);
                continue;
            }

            const { error } = await supabase
                .from('requests')
                .insert({
                    id: request.id,
                    title: request.title,
                    description: request.description,
                    type: request.type,
                    submitted_to: request.submitted_to,
                    category: request.category,
                    submitter_id: request.submitter_id,
                    submitter_name: request.submitter_name,
                    submitter_avatar: request.submitter_avatar,
                    supporters: request.supporters,
                    required: request.required,
                    progress: request.progress,
                    resolution: request.resolution,
                    response_time: request.response_time,
                    submitted_at: request.submitted_at,
                    status: request.status,
                    created_at: request.created_at
                });

            if (error) {
                console.log(`  ❌ Error inserting request ${request.title}:`, error.message);
            } else {
                console.log(`  ✅ Migrated request: ${request.title}`);
            }
        }

        // 8. Migrate Club Settings (if exists)
        console.log('\n📊 Migrating Club Settings...');
        try {
            const clubSettings = db.prepare('SELECT * FROM club_settings').all();
            console.log(`Found ${clubSettings.length} club settings in SQLite`);

            for (const setting of clubSettings as any[]) {
                const { error } = await supabase
                    .from('club_settings')
                    .insert({
                        hub_id: setting.hub_id,
                        is_private: setting.is_private,
                        auto_approve_members: setting.auto_approve_members
                    });

                if (error && error.code !== '23505') {
                    console.log(`  ❌ Error inserting club setting:`, error.message);
                }
            }
            console.log(`  ✅ Migrated ${clubSettings.length} club settings`);
        } catch (e) {
            console.log('  ⏭️  No club_settings table found, skipping');
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ Migration completed successfully!');
        console.log('='.repeat(60) + '\n');

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    } finally {
        db.close();
    }
}

migrateData();

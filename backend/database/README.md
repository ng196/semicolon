# Database Directory

This directory contains the SQLite database file(s) for CampusHub.

## Files

- `campushub.db` - Main database file (auto-created on first run)
- `campushub.db-shm` - Shared memory file (WAL mode)
- `campushub.db-wal` - Write-ahead log file (WAL mode)

## Important Notes

⚠️ **Database files are NOT tracked in git** (see `.gitignore`)

This is intentional because:
- Database files contain user data
- They can be large and change frequently
- Each environment should have its own database
- Prevents merge conflicts

## Setup

### Development

The database is automatically created when you first run the server:

```bash
npm run dev
```

If you need to reset the database:

```bash
rm campushub.db
npm run dev  # Will recreate with schema
npm run seed # Optional: Add sample data
```

### Production

For production, you should:

1. **Use persistent storage** (not ephemeral filesystem)
2. **Backup regularly**
3. **Consider PostgreSQL** for better scalability

See `../MIGRATION-GUIDE.md` for PostgreSQL migration steps.

## Seeding Data

To populate the database with sample data:

```bash
npm run seed
```

This will create:
- Sample users
- Sample hubs/clubs
- Sample events
- Sample marketplace items
- Sample requests

## Checking Database Health

Run the health check script:

```bash
node check-db.js
```

This will show:
- All database files
- Record counts
- File sizes
- Last modified times
- Identify duplicate databases

## Backup

### Manual Backup

```bash
# Create backup
cp campushub.db campushub.backup.db

# Or with timestamp
cp campushub.db "campushub.backup.$(date +%Y%m%d_%H%M%S).db"
```

### Export to SQL

```bash
sqlite3 campushub.db .dump > backup.sql
```

### Restore from SQL

```bash
sqlite3 campushub.db < backup.sql
```

## Troubleshooting

### Multiple Database Files

If you see multiple `.db` files (campushub(1).db, campushub(2).db, etc.):

1. Run `node check-db.js` to identify the main database
2. Backup the main one
3. Delete the duplicates
4. Restart the server

### Database Locked

If you get "database is locked" errors:

1. Close all connections to the database
2. Delete `.db-shm` and `.db-wal` files
3. Restart the server

### Data Not Persisting

Check:
1. File permissions: `ls -la campushub.db`
2. Disk space: `df -h`
3. Server logs for errors
4. If on cloud platform, ensure persistent storage is configured

## Schema

The database schema is defined in:
`../src/database/schema.sql`

To view current schema:

```bash
sqlite3 campushub.db .schema
```

## Migrations

Currently, migrations are manual. To update schema:

1. Backup database
2. Update `schema.sql`
3. Apply changes manually or recreate database

For production, consider using a migration tool like:
- `node-pg-migrate` (if using PostgreSQL)
- `knex.js`
- `prisma`

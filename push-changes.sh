#!/bin/bash

echo "🚀 Preparing to commit and push database refactoring changes..."
echo ""

# Show what will be committed
echo "📋 Files to be committed:"
git status --short
echo ""

# Ask for confirmation
read -p "Do you want to commit and push these changes? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "📦 Staging all changes..."
    git add -A
    
    echo "💾 Committing..."
    git commit -m "refactor: modularize database layer and fix duplicate DB files

- Split model.ts into modular models/ folder (users, hubs, events, etc.)
- Fixed database path to prevent duplicate file creation
- Added comprehensive logging for debugging
- Enabled WAL mode for better concurrency
- Removed all database files from git tracking
- Added documentation (architecture, migration guide, debugging)
- Updated .gitignore to exclude database files

This makes the codebase easier to maintain and ready for PostgreSQL migration."
    
    echo "🚀 Pushing to main..."
    git push origin main
    
    echo ""
    echo "✅ Done! Changes pushed to GitHub."
    echo ""
    echo "Next steps:"
    echo "1. Run: node backend/check-db.js"
    echo "2. Restart backend server"
    echo "3. Test creating data"
else
    echo "❌ Cancelled. No changes committed."
fi

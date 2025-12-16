#!/bin/bash

# Quick Supabase Setup Script
# This script adds the password column to the users table if it doesn't exist

echo "🔧 Fixing Supabase Schema..."
echo ""
echo "📋 Run this SQL in Supabase Dashboard > SQL Editor:"
echo ""
echo "=========================================="
cat << 'EOF'
-- Add password column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Update existing rows with a temporary password if NULL
UPDATE public.users 
SET password = '' 
WHERE password IS NULL;

-- Make password column NOT NULL
ALTER TABLE public.users 
ALTER COLUMN password SET NOT NULL;

-- Verify schema
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users';
EOF
echo "=========================================="
echo ""
echo "✅ Steps:"
echo "1. Go to https://app.supabase.com"
echo "2. Click your project"
echo "3. Click 'SQL Editor'"
echo "4. Click 'New Query'"
echo "5. Copy & paste the SQL above"
echo "6. Click 'Run'"
echo "7. Refresh your app and try registering again"

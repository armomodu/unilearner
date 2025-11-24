# Database Setup Instructions

## Issue
The Prisma database connection is failing with "Tenant or user not found" error, preventing schema updates.

## Root Cause
The Supabase database connection in `.env.local` is either:
1. Pointing to a non-existent project
2. Using incorrect credentials
3. The Supabase project has been deleted or paused

## Solution Steps

### 1. Verify Supabase Project
- Login to [supabase.com](https://supabase.com)
- Check if the project referenced in `DATABASE_URL` still exists
- If the project is paused, resume it
- If the project doesn't exist, create a new one

### 2. Update Environment Variables
Update `.env.local` with correct values:

```bash
# Database URLs (from Supabase Settings > Database)
DATABASE_URL="postgresql://[user]:[password]@[host]:5432/[database]?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://[user]:[password]@[host]:5432/[database]"

# Supabase Configuration (from Supabase Settings > API)
NEXT_PUBLIC_SUPABASE_URL="https://[project-id].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[anon-key]"
```

### 3. Test Database Connection
```bash
npx prisma db push
```

### 4. Re-enable Header Image Upload
Once the database is working:

1. **Update schema** in `prisma/schema.prisma`:
   ```typescript
   model Blog {
     // ... existing fields ...
     headerImageUrl  String?   // Full URL to the uploaded image
     headerImagePath String?   // Path in Supabase storage bucket
     // ... rest of model ...
   }
   ```

2. **Push schema changes**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Re-enable components** in:
   - `/src/app/(admin)/dashboard/blogs/[id]/page.tsx` - Uncomment HeaderImageUpload
   - `/src/app/(admin)/dashboard/blogs/page.tsx` - Re-add image thumbnails in table

4. **Set up Supabase Storage Bucket**:
   - Go to Supabase Dashboard > Storage
   - Create bucket named "blog-images"
   - Set appropriate permissions

### 5. Current Working State
All core functionality works except:
- Header image upload (disabled temporarily)
- Any features requiring the new database fields

The following features are fully functional:
- ✅ Save functionality with toast notifications
- ✅ Enhanced editor styling and UX
- ✅ Delete and mass delete operations
- ✅ Publish/unpublish pipeline
- ✅ User authentication and blog management

## Next Steps
Once database is fixed, continue with Phase 1 remaining tasks:
- Blog inline image upload
- Content templates
- Search functionality
- Public website foundation components
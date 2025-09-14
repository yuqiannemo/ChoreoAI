# Setting Up Public Access for Samples Folder

## The Problem
Your `audio-files` bucket is private, but you want the `samples` folder to be publicly accessible.

## Solution: Create a Public Policy

### Method 1: Through Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Click **"Storage"** in the left sidebar

2. **Access Storage Policies**
   - Click on **"audio-files"** bucket
   - Click on the **"Policies"** tab (next to "Files")

3. **Create New Policy**
   - Click **"New Policy"**
   - Choose **"For full customization"**

4. **Configure the Policy**
   - **Policy name**: `Public access to samples`
   - **Allowed operation**: `SELECT` (for reading files)
   - **Target roles**: `public` (for anonymous users)
   - **USING expression**: 
     ```sql
     bucket_id = 'audio-files' AND (storage.foldername(name))[1] = 'samples'
     ```
   - **WITH CHECK expression**: Leave empty

5. **Save the Policy**
   - Click **"Review"** then **"Save policy"**

### Method 2: Using SQL Editor

1. **Go to SQL Editor**
   - In Supabase dashboard, click **"SQL Editor"**

2. **Run this SQL command**:
   ```sql
   CREATE POLICY "Public access to samples" ON storage.objects
   FOR SELECT USING (
     bucket_id = 'audio-files' AND 
     (storage.foldername(name))[1] = 'samples'
   );
   ```

3. **Click "Run"**

### Method 3: Alternative Policy (More Permissive)

If the above doesn't work, try this more permissive policy:

```sql
CREATE POLICY "Public samples access" ON storage.objects
FOR SELECT USING (
  bucket_id = 'audio-files' AND 
  name LIKE 'samples/%'
);
```

## Verify the Policy Works

1. **Upload your sample file** to the `samples` folder
2. **Test the URL** in a new browser tab:
   ```
   https://likdbicjuoqqwwrfjial.supabase.co/storage/v1/object/public/audio-files/samples/rick-astley-sample.mp3
   ```
3. **The file should be accessible** without authentication

## What This Policy Does

- **Allows public read access** to any file in the `samples` folder
- **Keeps other folders private** (user uploads remain secure)
- **Only affects the `samples` subfolder** within `audio-files`

## Security Note

This is safe because:
- ✅ Only the `samples` folder is public
- ✅ User uploads in other folders remain private
- ✅ Only read access is granted (no upload/delete permissions)
- ✅ Perfect for demo/sample files

## Troubleshooting

If it still doesn't work:

1. **Check the exact folder name** - make sure it's exactly `samples`
2. **Verify the file path** - should be `samples/rick-astley-sample.mp3`
3. **Try the alternative policy** (Method 3)
4. **Check bucket permissions** - make sure the bucket itself allows policies

The policy should work immediately after creation!

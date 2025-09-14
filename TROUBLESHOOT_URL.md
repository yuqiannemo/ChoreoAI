# Troubleshooting Sample File URL Issues

## Common Problems and Solutions

### 1. Check File Path and Name

**Problem**: File not found (404 error)

**Solutions**:
- Verify the exact file name in Supabase Storage
- Make sure it's named exactly: `rick-astley-sample.mp3`
- Check the folder is named exactly: `samples`
- The full path should be: `samples/rick-astley-sample.mp3`

### 2. Check File Permissions

**Problem**: Access denied (403 error)

**Solutions**:
- Go to Storage → audio-files → Policies
- Make sure you have a policy like this:
  ```sql
  CREATE POLICY "Public access to samples" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'audio-files' AND 
    (storage.foldername(name))[1] = 'samples'
  );
  ```

### 3. Alternative Policy (If Above Doesn't Work)

Try this more permissive policy:
```sql
CREATE POLICY "Public samples access" ON storage.objects
FOR SELECT USING (
  bucket_id = 'audio-files' AND 
  name LIKE 'samples/%'
);
```

### 4. Check Bucket Configuration

**Problem**: Bucket itself might be private

**Solutions**:
- Go to Storage → audio-files bucket
- Click "Settings" (gear icon)
- Make sure "Public bucket" is enabled
- Or ensure you have proper policies set up

### 5. Verify File Upload

**Problem**: File wasn't uploaded correctly

**Solutions**:
- Go to Storage → audio-files → samples folder
- Verify the file is there and shows file size
- Try downloading it directly from the Supabase dashboard
- Check file size matches your original file

### 6. Test Different URL Formats

Try these URL variations:

**Format 1** (Standard):
```
https://likdbicjuoqqwwrfjial.supabase.co/storage/v1/object/public/audio-files/samples/rick-astley-sample.mp3
```

**Format 2** (With encoding):
```
https://likdbicjuoqqwwrfjial.supabase.co/storage/v1/object/public/audio-files/samples/rick-astley-sample.mp3
```

**Format 3** (Direct from dashboard):
- Right-click the file in Supabase dashboard
- Select "Copy URL" or "Get public URL"

### 7. Check Browser Console

**Steps**:
1. Open browser Developer Tools (F12)
2. Go to Network tab
3. Try accessing the URL
4. Look for error messages (404, 403, CORS, etc.)

### 8. Alternative: Use Different File Name

If the Rick Astley filename is causing issues:

1. **Rename the file** to something simpler: `sample.mp3`
2. **Update the URL** to:
   ```
   https://likdbicjuoqqwwrfjial.supabase.co/storage/v1/object/public/audio-files/samples/sample.mp3
   ```
3. **Update the code** in `script.js` to use the new filename

### 9. Quick Test Method

**Test if Supabase Storage is working**:
1. Upload any small file (like a text file) to the samples folder
2. Try to access it via URL
3. If that works, the issue is with the specific file
4. If that doesn't work, the issue is with the policy/bucket setup

### 10. Fallback Solution

If nothing works, you can:

1. **Use a different bucket** (create a new public bucket just for samples)
2. **Use a CDN** (like Cloudinary or AWS S3)
3. **Host the file elsewhere** and update the URL in the code
4. **Use the demo mode** (the fallback system will still work)

## Debugging Steps

1. **Check the exact error** in browser console
2. **Verify file exists** in Supabase dashboard
3. **Test with a simple file** first
4. **Check policy syntax** in SQL editor
5. **Try different URL formats**

## Quick Fix: Update Code to Use Different File

If you want to use a different file name, update this in `script.js`:

```javascript
// Change this line:
const sampleUrl = 'https://likdbicjuoqqwwrfjial.supabase.co/storage/v1/object/public/audio-files/samples/rick-astley-sample.mp3';

// To this (if you rename the file):
const sampleUrl = 'https://likdbicjuoqqwwrfjial.supabase.co/storage/v1/object/public/audio-files/samples/sample.mp3';
```

Let me know what error you're seeing and I can help you fix it specifically!

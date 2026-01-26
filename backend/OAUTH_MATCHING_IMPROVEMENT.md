# OAuth Matching Improvement - Prevent Image Change Breakage

## Problem
When users change their LinkedIn profile picture, the OAuth matching fails because:
1. Image matching is tried first (highest priority)
2. If the image changed, it fails
3. The `linkedin_num_id` field in the database is outdated (old numeric ID vs new OAuth `sub` format)
4. User gets "profile not found" error despite having an existing account

## Solution
Reorder the matching priority and auto-update fields to keep them current:

### New Matching Priority Order
1. **Email** (most reliable - never changes for existing users)
2. **linkedin_num_id** (OAuth `sub` field - permanent LinkedIn ID)
3. **Profile URL/ID** (vanity URL from profile)
4. **Image** (can break when user changes picture)
5. **Name** (last resort - least reliable)

### Auto-Update Strategy
When a match is found via ANY method, automatically update:
- `linkedin_num_id` with the current OAuth `sub` value
- `image_id` with the current profile picture ID

This ensures future logins will match via `linkedin_num_id` even if the image changes.

## Implementation

Replace the OAuth matching section in `backend/server.js` (lines ~294-390) with:

```javascript
// Try to match by: email > linkedin_num_id > profile URL > image > name
// Email and linkedin_num_id are most reliable and don't change
let linkedinProfileId = null;
let matchMethod = 'not_found';
let matchConfidence = 0;

// Extract image ID from LinkedIn OAuth picture URL
let linkedinImageId = null;
if (profile.picture) {
  const imageMatch = profile.picture.match(/\/([A-Za-z0-9_-]+)\/profile-displayphoto/);
  if (imageMatch) {
    linkedinImageId = imageMatch[1];
  }
}

const linkedinNumId = profile.sub;

// PRIORITY 1: Try email matching first (users with existing accounts)
if (profile.email) {
  const [emailMatches] = await connection.query(
    'SELECT lp.id FROM linkedin_profiles lp JOIN users u ON u.linkedin_profile_id = lp.id WHERE u.email = ? LIMIT 1',
    [profile.email]
  );
  if (emailMatches.length > 0) {
    linkedinProfileId = emailMatches[0].id;
    matchMethod = 'email';
    matchConfidence = 1.0;
    console.log(`✅ Email match found: ${linkedinProfileId}`);
  }
}

// PRIORITY 2: Try linkedin_num_id match (OAuth sub field - permanent ID)
if (!linkedinProfileId && linkedinNumId) {
  const [numIdMatches] = await connection.query(
    'SELECT id FROM linkedin_profiles WHERE linkedin_num_id = ? LIMIT 1',
    [linkedinNumId]
  );
  if (numIdMatches.length > 0) {
    linkedinProfileId = numIdMatches[0].id;
    matchMethod = 'linkedin_num_id';
    matchConfidence = 1.0;
    console.log(`✅ LinkedIn num_id match found: ${linkedinProfileId}`);
  }
}

// Extract profile ID from LinkedIn profile URL if available
const profileUrl = profile.profile_url || profile.vanity_name || profile.public_profile_url;
let extractedProfileId = null;

if (profileUrl) {
  const match = profileUrl.match(/linkedin\.com\/in\/([^\/\?]+)/);
  if (match) {
    extractedProfileId = match[1];
  }
}

// PRIORITY 3: Try profile ID match (from URL)
if (!linkedinProfileId && extractedProfileId) {
  const [profileMatches] = await connection.query(
    'SELECT id FROM linkedin_profiles WHERE id = ? OR linkedin_id = ? LIMIT 1',
    [extractedProfileId, extractedProfileId]
  );
  if (profileMatches.length > 0) {
    linkedinProfileId = profileMatches[0].id;
    matchMethod = 'linkedin_id';
    matchConfidence = 1.0;
    console.log(`✅ Profile ID match found: ${linkedinProfileId}`);
  }
}

// PRIORITY 4: Try image matching (can break if user changes picture)
if (!linkedinProfileId && linkedinImageId) {
  const [imageMatches] = await connection.query(
    'SELECT id, name, avatar FROM linkedin_profiles WHERE image_id = ? LIMIT 10',
    [linkedinImageId]
  );
  
  if (imageMatches.length === 0) {
    const [fallbackMatches] = await connection.query(
      'SELECT id, name, avatar FROM linkedin_profiles WHERE avatar LIKE ? LIMIT 10',
      [`%${linkedinImageId}%`]
    );
    imageMatches.push(...fallbackMatches);
  }
  
  timings.imageMatching = Date.now() - startTime;
  if (imageMatches.length === 1) {
    linkedinProfileId = imageMatches[0].id;
    matchMethod = 'image';
    matchConfidence = 0.95;
    console.log(`✅ Image match found: ${linkedinProfileId} (${imageMatches[0].name})`);
  } else if (imageMatches.length > 1) {
    console.warn(`⚠️ Multiple image matches found for ${linkedinImageId}: ${imageMatches.length} profiles`);
    linkedinProfileId = imageMatches[0].id;
    matchMethod = 'image_multiple';
    matchConfidence = 0.7;
  }
}

// PRIORITY 5: Try name match as last resort (least reliable)
if (!linkedinProfileId && profile.name) {
  const [nameMatches] = await connection.query(
    'SELECT id, name FROM linkedin_profiles WHERE name = ? LIMIT 5',
    [profile.name]
  );
  if (nameMatches.length === 1) {
    linkedinProfileId = nameMatches[0].id;
    matchMethod = 'name';
    matchConfidence = 0.7;
    console.log(`⚠️ Name match found (low confidence): ${linkedinProfileId}`);
  }
}

// IMPORTANT: If we found a match, update the linkedin_num_id and image_id to keep them current
if (linkedinProfileId && linkedinNumId) {
  await connection.query(
    'UPDATE linkedin_profiles SET linkedin_num_id = ?, image_id = ? WHERE id = ?',
    [linkedinNumId, linkedinImageId, linkedinProfileId]
  );
  console.log(`🔄 Updated linkedin_num_id and image_id for profile: ${linkedinProfileId}`);
}

// Log for debugging
console.log('OAuth Profile Match:', {
  email: profile.email,
  linkedinNumId,
  profileUrl,
  extractedProfileId,
  name: profile.name,
  matchedId: linkedinProfileId,
  matchMethod,
  matchConfidence
});
```

## Immediate Fix for Liran

Run this SQL to fix your profile:

```sql
UPDATE linkedin_profiles
SET linkedin_num_id = '8niatoM14_',
    image_id = 'D4D03AQEjqNsPCy3RtA'
WHERE id = 'liran-naim';
```

## Benefits

1. **Email matching first** - Existing users will always match via email
2. **Auto-update linkedin_num_id** - Future logins work even if image changes
3. **Graceful degradation** - Multiple fallback methods
4. **Self-healing** - Database stays current with each login

This prevents the "profile not found" issue when users change their LinkedIn pictures.

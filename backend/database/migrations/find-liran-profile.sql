-- Find Liran's profile ID
SELECT id, name, email, position FROM linkedin_profiles 
WHERE name LIKE '%Liran%' OR name LIKE '%liran%' OR email LIKE '%liran%';

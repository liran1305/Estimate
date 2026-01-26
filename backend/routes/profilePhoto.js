const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getPool } = require('../config/database');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/profile-photos');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP) are allowed'));
    }
  }
});

// Upload profile photo
router.post('/upload', upload.single('photo'), async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }
    
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    
    // Generate public URL for the uploaded file
    const photoUrl = `/uploads/profile-photos/${req.file.filename}`;
    
    // Update user's profile photo in database
    const pool = getPool();
    await pool.query(
      'UPDATE users SET profile_photo_url = ?, profile_photo_uploaded_at = NOW() WHERE id = ?',
      [photoUrl, userId]
    );
    
    res.json({
      success: true,
      photoUrl: photoUrl,
      message: 'Profile photo uploaded successfully'
    });
    
  } catch (error) {
    console.error('Profile photo upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to upload profile photo',
      details: error.message 
    });
  }
});

// Get user's profile photo
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const pool = getPool();
    const [users] = await pool.query(
      'SELECT profile_photo_url, profile_photo_uploaded_at FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({
      success: true,
      photoUrl: users[0].profile_photo_url,
      uploadedAt: users[0].profile_photo_uploaded_at
    });
    
  } catch (error) {
    console.error('Get profile photo error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get profile photo' 
    });
  }
});

// Delete profile photo
router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const pool = getPool();
    
    // Get current photo URL
    const [users] = await pool.query(
      'SELECT profile_photo_url FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    const photoUrl = users[0].profile_photo_url;
    
    // Delete file from disk if it exists
    if (photoUrl) {
      const filePath = path.join(__dirname, '..', photoUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    // Remove from database
    await pool.query(
      'UPDATE users SET profile_photo_url = NULL, profile_photo_uploaded_at = NULL WHERE id = ?',
      [userId]
    );
    
    res.json({
      success: true,
      message: 'Profile photo deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete profile photo error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete profile photo' 
    });
  }
});

module.exports = router;

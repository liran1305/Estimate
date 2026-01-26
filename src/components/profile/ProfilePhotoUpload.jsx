import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, X, Loader2, CheckCircle2 } from "lucide-react";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001';

export default function ProfilePhotoUpload({ userId, currentPhotoUrl, onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/image\/(jpeg|jpg|png|webp)/)) {
      setError('Please upload a JPEG, PNG, or WebP image');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be smaller than 10MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setError(null);
    };
    reader.readAsDataURL(file);

    // Upload immediately
    handleUpload(file);
  };

  const handleUpload = async (file) => {
    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('userId', userId);

      const response = await fetch(`${BACKEND_API_URL}/api/profile-photo/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      setSuccess(true);
      setPreview(null);
      
      // Notify parent component
      if (onUploadSuccess) {
        onUploadSuccess(data.photoUrl);
      }

      // Track upload in GTM
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'profile_photo_uploaded',
          user_id: userId
        });
      }

      setTimeout(() => setSuccess(false), 3000);

    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove your custom profile photo?')) {
      return;
    }

    try {
      const response = await fetch(`${BACKEND_API_URL}/api/profile-photo/${userId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Delete failed');
      }

      setPreview(null);
      
      // Notify parent component
      if (onUploadSuccess) {
        onUploadSuccess(null);
      }

    } catch (err) {
      console.error('Delete error:', err);
      setError(err.message || 'Failed to delete photo');
    }
  };

  return (
    <Card className="p-4 sm:p-6 border border-gray-200">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">
            Upload High-Quality Photo
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Upload a high-resolution photo for the best quality Estimate Verified badge. 
            Recommended: 800x800px or larger.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex gap-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              variant="outline"
              size="sm"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Photo
                </>
              )}
            </Button>

            {currentPhotoUrl && (
              <Button
                onClick={handleDelete}
                variant="ghost"
                size="sm"
              >
                <X className="w-4 h-4 mr-2" />
                Remove
              </Button>
            )}
          </div>

          {error && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-600 flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Photo uploaded successfully!
            </div>
          )}
        </div>

        {preview && (
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
    </Card>
  );
}

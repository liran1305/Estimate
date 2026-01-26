import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Download, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function BadgeCreator() {
  const navigate = useNavigate();
  const [uploadedImage, setUploadedImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

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

    setError(null);
    setProcessing(true);

    // Read and process the image
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target.result);
      setProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = async () => {
    if (!uploadedImage) return;

    setProcessing(true);

    try {
      // Create canvas to merge profile image and badge
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const size = 800; // High resolution
      canvas.width = size;
      canvas.height = size;

      // Load uploaded image
      const profileImg = new Image();
      profileImg.src = uploadedImage;

      // Load badge overlay
      const badgeImg = new Image();
      badgeImg.src = '/images/Estimat_Verified.png';

      // Wait for both images to load
      await Promise.all([
        new Promise((resolve) => { profileImg.onload = resolve; }),
        new Promise((resolve) => { badgeImg.onload = resolve; })
      ]);

      // Draw circular profile image
      ctx.save();
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(profileImg, 0, 0, size, size);
      ctx.restore();

      // Draw badge overlay
      ctx.drawImage(badgeImg, 0, 0, size, size);

      // Download the merged image
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Estimate_Verified_Badge.png`;
        a.click();
        URL.revokeObjectURL(url);
        
        // Track download in GTM
        if (window.dataLayer) {
          window.dataLayer.push({
            event: 'badge_downloaded',
            source: 'badge_creator'
          });
        }
        
        setProcessing(false);
      });
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to create badge. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Profile
        </Button>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 sm:p-8 border-0 shadow-xl shadow-gray-200/50">
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Create Your Estimate Verified Badge
              </h1>
              <p className="text-gray-600">
                Upload a high-quality photo and download it with the Estimate Verified badge
              </p>
            </div>

            {/* Upload Section */}
            {!uploadedImage ? (
              <div className="space-y-6">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    Click to upload your photo
                  </p>
                  <p className="text-sm text-gray-500">
                    Recommended: 800x800px or larger for best quality
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    JPEG, PNG, or WebP • Max 10MB
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    {error}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Preview */}
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-700 mb-4">Preview</p>
                  <div className="relative inline-block">
                    <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full overflow-hidden mx-auto shadow-2xl">
                      <img 
                        src={uploadedImage} 
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <img 
                        src="/images/Estimat_Verified.png"
                        alt="Badge"
                        className="absolute inset-0 w-full h-full pointer-events-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={handleDownload}
                    disabled={processing}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5 mr-2" />
                        Download Badge
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => {
                      setUploadedImage(null);
                      setError(null);
                    }}
                    variant="outline"
                    size="lg"
                  >
                    Upload Different Photo
                  </Button>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 text-center">
                    {error}
                  </div>
                )}
              </div>
            )}

            {/* Instructions */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                How to use your badge:
              </h3>
              <ol className="text-sm text-blue-800 space-y-1 ml-7 list-decimal">
                <li>Upload a high-quality photo (800x800px+ recommended)</li>
                <li>Preview your photo with the Estimate Verified badge</li>
                <li>Download the badged image</li>
                <li>Upload it to LinkedIn as your profile picture</li>
              </ol>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

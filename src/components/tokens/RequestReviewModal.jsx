import React, { useState } from 'react';
import { X, Ticket, Copy, Check, MessageCircle, Mail, Linkedin, Link2, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * RequestReviewModal - Modal for creating and sharing review request links
 */
export default function RequestReviewModal({ 
  isOpen, 
  onClose, 
  userId,
  tokensAvailable,
  onRequestCreated 
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [requestData, setRequestData] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  // Auto-generate link when modal opens
  React.useEffect(() => {
    if (isOpen && !requestData && !isLoading) {
      handleCreateRequest();
    }
  }, [isOpen]);

  const handleCreateRequest = async () => {
    if (tokensAvailable < 1) {
      setError('No tokens available. Complete more reviews to earn tokens!');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/tokens/create-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          recipient_name: null,
          recipient_email: null
        })
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to create request');
        return;
      }

      setRequestData(data);
      
      if (onRequestCreated) {
        onRequestCreated(data);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareViaWhatsApp = (message) => {
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const shareViaEmail = () => {
    if (!requestData) return;
    const subject = encodeURIComponent(requestData.invite_messages.email_subject);
    const body = encodeURIComponent(requestData.invite_messages.email_body);
    window.open(`mailto:${recipientEmail || ''}?subject=${subject}&body=${body}`, '_blank');
  };

  const shareViaLinkedIn = () => {
    if (!requestData) return;
    const url = encodeURIComponent(requestData.request.full_url);
    window.open(`https://www.linkedin.com/messaging/compose/?body=${url}`, '_blank');
  };

  const handleClose = () => {
    setError('');
    setRequestData(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Ticket className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold">Share Your Review Link</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-amber-600 animate-spin mb-3" />
              <p className="text-gray-600">Generating your link...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm">
              {error}
            </div>
          ) : requestData ? (
            <>
              {/* Success message */}
              <div className="bg-green-50 rounded-lg p-3 mb-4 text-center">
                <p className="text-green-800 font-medium">✅ Link created!</p>
                <p className="text-sm text-green-600">
                  Expires in 14 days • {requestData?.tokens_remaining} tokens remaining
                </p>
              </div>

              {/* Link */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your unique link:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={requestData?.request?.full_url || ''}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(requestData?.request?.full_url, 'link')}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                  >
                    {copiedField === 'link' ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Done button */}
              <button
                onClick={handleClose}
                className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Done
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

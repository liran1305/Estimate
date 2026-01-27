import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Trash2, ExternalLink, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001';

/**
 * PendingRequestsList - Shows user's pending and completed review requests
 */
export default function PendingRequestsList({ userId, onRefresh }) {
  const [requests, setRequests] = useState([]);
  const [summary, setSummary] = useState({ pending: 0, completed: 0, expired: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchRequests = async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`${API_URL}/api/tokens/my-requests?user_id=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setRequests(data.requests || []);
        setSummary(data.summary || { pending: 0, completed: 0, expired: 0 });
      }
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [userId]);

  const handleCancel = async (requestId) => {
    if (!confirm('Cancel this request and get your token back?')) return;
    
    setCancellingId(requestId);
    
    try {
      const response = await fetch(`${API_URL}/api/tokens/cancel-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, request_id: requestId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchRequests();
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Failed to cancel request:', err);
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'expired':
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status, daysRemaining) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs">
            <Clock className="w-3 h-3" />
            {daysRemaining} days left
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
            Expired
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No review requests yet.</p>
        <p className="text-sm mt-1">Use a token to invite a colleague!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4 text-amber-500" />
          <span>{summary.pending} pending</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>{summary.completed} completed</span>
        </div>
        {summary.expired > 0 && (
          <div className="flex items-center gap-1 text-gray-400">
            <XCircle className="w-4 h-4" />
            <span>{summary.expired} expired</span>
          </div>
        )}
      </div>

      {/* Request list */}
      <div className="space-y-2">
        {requests.map((request) => (
          <div
            key={request.id}
            className={`p-3 rounded-lg border ${
              request.status === 'pending' 
                ? 'bg-white border-amber-200' 
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {getStatusIcon(request.status)}
                  <span className="font-medium text-gray-900">
                    {request.recipient_name || 'Anonymous colleague'}
                  </span>
                  {getStatusBadge(request.status, request.days_remaining)}
                </div>
                
                <div className="text-xs text-gray-500">
                  Sent {new Date(request.created_at).toLocaleDateString()}
                  {request.completed_by_name && (
                    <span> • Completed by {request.completed_by_name}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {request.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/review-request/${request.unique_link}`;
                        navigator.clipboard.writeText(url);
                      }}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                      title="Copy link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCancel(request.id)}
                      disabled={cancellingId === request.id}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                      title="Cancel & refund token"
                    >
                      {cancellingId === request.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

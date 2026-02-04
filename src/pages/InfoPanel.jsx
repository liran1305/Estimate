import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { linkedinAuth } from "@/lib/linkedinAuth";
import { Button } from "@/components/ui/button";
import { 
  User, Briefcase, MapPin, Building2, Calendar, 
  Edit3, Check, X, Clock, AlertCircle, ChevronDown, ChevronUp,
  GraduationCap, Mail, Shield
} from 'lucide-react';

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001';

export default function InfoPanel() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // Batch edit mode - track all field changes
  const [editedFields, setEditedFields] = useState({}); // { fieldName: { value, originalValue, fieldTable } }
  const [editReason, setEditReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    work: true,
    education: false,
    requests: false
  });

  useEffect(() => {
    const currentUser = linkedinAuth.getCurrentUser();
    if (!currentUser || !currentUser.canUsePlatform) {
      navigate(createPageUrl("Login"));
      return;
    }
    setUser(currentUser);
    fetchProfileData(currentUser.id);
  }, [navigate]);

  const fetchProfileData = async (userId) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BACKEND_API_URL}/api/profile/info?user_id=${userId}`);
      const data = await response.json();
      
      if (!data.success) {
        setError(data.error || 'Failed to load profile data');
        return;
      }
      
      setProfileData(data);
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Fetch profile error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle field value change in batch mode
  const handleFieldChange = (fieldName, newValue, originalValue, fieldTable = 'linkedin_profiles', relatedRecordId = null) => {
    setSubmitSuccess(null);
    if (newValue === originalValue || (newValue === '' && !originalValue)) {
      // Remove from edited fields if value is back to original
      setEditedFields(prev => {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      });
    } else {
      setEditedFields(prev => ({
        ...prev,
        [fieldName]: { value: newValue, originalValue, fieldTable, relatedRecordId }
      }));
    }
  };

  // Clear all edits
  const handleCancelAllEdits = () => {
    setEditedFields({});
    setEditReason('');
    setSubmitSuccess(null);
  };

  // Submit all edited fields at once using batch endpoint (single email)
  const handleSubmitAllEdits = async () => {
    const fieldsToSubmit = Object.entries(editedFields);
    if (fieldsToSubmit.length === 0) return;

    setIsSubmitting(true);

    try {
      // Build changes array for batch endpoint
      const changes = fieldsToSubmit.map(([fieldKey, { value, originalValue, fieldTable, relatedRecordId }]) => {
        // For work experience fields, extract the actual field name (e.g., "work_123_title" -> "title")
        let actualFieldName = fieldKey;
        let actualRelatedId = relatedRecordId;
        
        if (fieldTable === 'work_experience' && fieldKey.startsWith('work_')) {
          const parts = fieldKey.split('_');
          actualFieldName = parts[parts.length - 1]; // Get last part (title, company, start_date, end_date)
          if (parts.length >= 3 && actualFieldName === 'date') {
            // Handle start_date and end_date
            actualFieldName = parts.slice(-2).join('_');
          }
        }
        
        return {
          field_name: actualFieldName,
          field_table: fieldTable || 'linkedin_profiles',
          current_value: originalValue || null,
          requested_value: typeof value === 'string' ? value.trim() : value,
          related_record_id: actualRelatedId
        };
      });

      const response = await fetch(`${BACKEND_API_URL}/api/profile/edit-requests-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          changes,
          reason: editReason.trim() || null
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSubmitSuccess(data.message || `${changes.length} edit request(s) submitted for admin review.`);
        setEditedFields({});
        setEditReason('');
        fetchProfileData(user.id);
      } else {
        alert(data.error || 'Failed to submit edit requests');
      }
    } catch (err) {
      console.error('Submit batch edit error:', err);
      alert('Failed to submit edit requests');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Present';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    try {
      // If already in YYYY-MM-DD format, return as is
      if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr;
      }
      // If it's an ISO string with T, extract the date part
      if (typeof dateStr === 'string' && dateStr.includes('T')) {
        return dateStr.split('T')[0];
      }
      // Try parsing as Date
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      // Format as YYYY-MM-DD
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  };

  const isPendingEdit = (fieldName) => {
    return profileData?.pending_requests?.some(r => {
      const requestedChanges = typeof r.requested_changes === 'string' 
        ? JSON.parse(r.requested_changes || '{}') 
        : (r.requested_changes || {});
      return requestedChanges.field_name === fieldName && r.status === 'pending';
    });
  };

  const handleCancelRequest = async (requestId) => {
    if (!confirm('Are you sure you want to cancel this edit request?')) return;
    
    try {
      const response = await fetch(
        `${BACKEND_API_URL}/api/profile/edit-request/${requestId}?user_id=${user.id}`,
        { method: 'DELETE' }
      );
      const data = await response.json();
      
      if (data.success) {
        // Refresh profile data to update pending requests
        fetchProfileData(user.id);
      } else {
        alert(data.error || 'Failed to cancel request');
      }
    } catch (err) {
      console.error('Cancel request error:', err);
      alert('Failed to cancel request');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f3f2ef] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0a66c2]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f3f2ef] flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 shadow-sm text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700">{error}</p>
          <Button onClick={() => navigate(createPageUrl("Profile"))} className="mt-4">
            Back to Profile
          </Button>
        </div>
      </div>
    );
  }

  const profile = profileData?.profile || {};
  const workExperience = profileData?.work_experience || [];
  const education = profileData?.education || [];
  const pendingRequests = profileData?.pending_requests || [];
  const missingFields = profileData?.missing_fields || [];

  // Check if field has been edited
  const isFieldEdited = (fieldName) => fieldName in editedFields;
  const getFieldValue = (fieldName, originalValue) => {
    return editedFields[fieldName]?.value ?? originalValue ?? '';
  };

  // Render an editable field with inline input
  const renderEditableField = (label, fieldName, originalValue, Icon, fieldTable = 'linkedin_profiles') => {
    const isPending = isPendingEdit(fieldName);
    const isEdited = isFieldEdited(fieldName);
    const currentValue = getFieldValue(fieldName, originalValue);

    return (
      <div key={fieldName} className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0">
        <div className="flex items-start gap-3 flex-1">
          <Icon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 mb-0.5">{label}</p>
            {isPending ? (
              <p className="text-sm text-gray-900">{originalValue || 'Not provided'}</p>
            ) : (
              <input
                type="text"
                value={currentValue}
                onChange={(e) => handleFieldChange(fieldName, e.target.value, originalValue, fieldTable)}
                className={`w-full px-3 py-2 border rounded-lg text-sm transition-colors ${
                  isEdited 
                    ? 'border-blue-400 bg-blue-50 focus:ring-2 focus:ring-blue-500' 
                    : 'border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-gray-200'
                }`}
                placeholder={`Enter ${label.toLowerCase()}`}
              />
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 ml-2 mt-6">
          {isPending ? (
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Pending
            </span>
          ) : isEdited ? (
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded flex items-center gap-1">
              <Edit3 className="w-3 h-3" />
              Modified
            </span>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f3f2ef] p-4 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-4">
        
        {/* Header */}
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Profile Information</h1>
                <p className="text-sm text-gray-500">View and request changes to your profile data</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate(createPageUrl("Profile"))}>
              Back to Profile
            </Button>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-800">
            <p className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <strong>Secure Edit Process:</strong> All profile changes require admin verification to ensure data integrity.
            </p>
          </div>

          {/* Missing Fields Warning */}
          {missingFields.length > 0 && (
            <div className="mt-3 bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm text-amber-800">
              <p className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <strong>Incomplete Profile:</strong> Missing fields: {missingFields.join(', ')}
              </p>
            </div>
          )}

          {/* Success Message */}
          {submitSuccess && (
            <div className="mt-3 bg-green-50 border border-green-100 rounded-lg p-3 text-sm text-green-800">
              <p className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                {submitSuccess}
              </p>
            </div>
          )}
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <button 
            onClick={() => toggleSection('basic')}
            className="w-full px-4 sm:px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-600" />
              <h2 className="font-semibold text-gray-900">Basic Information</h2>
            </div>
            {expandedSections.basic ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          
          {expandedSections.basic && (
            <div className="px-4 sm:px-6 py-2">
              {renderEditableField("Full Name", "name", profile.name, User)}
              {renderEditableField("Job Title", "position", profile.position, Briefcase)}
              {renderEditableField("Current Company", "current_company_name", profile.current_company_name, Building2)}
              {renderEditableField("Location", "location", profile.location || profile.city, MapPin)}
              
              {/* Non-editable fields */}
              <div className="flex items-start gap-3 py-3 border-b border-gray-100">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Email (not editable)</p>
                  <p className="text-sm text-gray-900">{profile.email || profile.profile_email || 'Not provided'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Work Experience */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <button 
            onClick={() => toggleSection('work')}
            className="w-full px-4 sm:px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-gray-600" />
              <h2 className="font-semibold text-gray-900">Work Experience</h2>
              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">{workExperience.length}</span>
            </div>
            {expandedSections.work ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          
          {expandedSections.work && (
            <div className="px-4 sm:px-6 py-2">
              {workExperience.length === 0 ? (
                <p className="text-gray-500 text-sm py-4 text-center">No work experience data available</p>
              ) : (
                workExperience.map((job, idx) => {
                  const jobKey = `work_${job.id || idx}`;
                  const titleKey = `${jobKey}_title`;
                  const companyKey = `${jobKey}_company`;
                  const startKey = `${jobKey}_start_date`;
                  const endKey = `${jobKey}_end_date`;
                  
                  const isTitleEdited = titleKey in editedFields;
                  const isCompanyEdited = companyKey in editedFields;
                  const isStartEdited = startKey in editedFields;
                  const isEndEdited = endKey in editedFields;
                  
                  return (
                    <div key={job.id || idx} className="py-4 border-b border-gray-100 last:border-0">
                      <div className="space-y-3">
                        {/* Title */}
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Job Title</label>
                          <input
                            type="text"
                            value={editedFields[titleKey]?.value ?? job.title ?? ''}
                            onChange={(e) => handleFieldChange(titleKey, e.target.value, job.title, 'work_experience', job.id)}
                            className={`w-full px-3 py-2 border rounded-lg text-sm ${
                              isTitleEdited ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
                            }`}
                            placeholder="Job title"
                          />
                        </div>
                        {/* Company */}
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Company</label>
                          <input
                            type="text"
                            value={editedFields[companyKey]?.value ?? job.company ?? ''}
                            onChange={(e) => handleFieldChange(companyKey, e.target.value, job.company, 'work_experience', job.id)}
                            className={`w-full px-3 py-2 border rounded-lg text-sm ${
                              isCompanyEdited ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
                            }`}
                            placeholder="Company name"
                          />
                        </div>
                        {/* Dates */}
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <label className={`text-xs mb-1 block ${!job.start_date && !isStartEdited ? 'text-red-500' : 'text-gray-500'}`}>
                              Start Date {!job.start_date && !isStartEdited && <span className="text-red-500">*</span>}
                            </label>
                            <input
                              type="date"
                              value={editedFields[startKey]?.value ?? formatDateForInput(job.start_date)}
                              onChange={(e) => handleFieldChange(startKey, e.target.value, job.start_date, 'work_experience', job.id)}
                              className={`w-full px-3 py-2 border rounded-lg text-sm ${
                                isStartEdited ? 'border-blue-400 bg-blue-50' : 
                                !job.start_date ? 'border-red-300 bg-red-50' : 'border-gray-200'
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <label className={`text-xs mb-1 block ${!job.end_date && !job.is_current && !isEndEdited ? 'text-red-500' : 'text-gray-500'}`}>
                              End Date {!job.end_date && !job.is_current && !isEndEdited && <span className="text-red-500">*</span>}
                            </label>
                            <input
                              type="date"
                              value={editedFields[endKey]?.value ?? formatDateForInput(job.end_date)}
                              onChange={(e) => handleFieldChange(endKey, e.target.value, job.end_date, 'work_experience', job.id)}
                              disabled={job.is_current}
                              className={`w-full px-3 py-2 border rounded-lg text-sm ${
                                isEndEdited ? 'border-blue-400 bg-blue-50' : 
                                !job.end_date && !job.is_current ? 'border-red-300 bg-red-50' : 'border-gray-200'
                              } ${job.is_current ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            />
                          </div>
                        </div>
                        {/* Location & Current badge */}
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">
                            {job.location && <span>📍 {job.location}</span>}
                          </p>
                          {job.is_current && (
                            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">Current Position</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Education */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <button 
            onClick={() => toggleSection('education')}
            className="w-full px-4 sm:px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-gray-600" />
              <h2 className="font-semibold text-gray-900">Education</h2>
              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">{education.length}</span>
            </div>
            {expandedSections.education ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          
          {expandedSections.education && (
            <div className="px-4 sm:px-6 py-2">
              {education.length === 0 ? (
                <p className="text-gray-500 text-sm py-4 text-center">No education data available</p>
              ) : (
                education.map((edu, idx) => (
                  <div key={edu.id || idx} className="py-3 border-b border-gray-100 last:border-0">
                    <p className="font-medium text-gray-900">{edu.title || edu.degree || 'Unknown'}</p>
                    {edu.description && <p className="text-sm text-gray-600">{edu.description}</p>}
                    <p className="text-xs text-gray-500 mt-1">
                      {edu.start_year} - {edu.end_year || 'Present'}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Pending Edit Requests */}
        {pendingRequests.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <button 
              onClick={() => toggleSection('requests')}
              className="w-full px-4 sm:px-6 py-4 flex items-center justify-between bg-amber-50 hover:bg-amber-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <h2 className="font-semibold text-amber-900">Pending Edit Requests</h2>
                <span className="text-xs text-amber-700 bg-amber-200 px-2 py-0.5 rounded-full">{pendingRequests.length}</span>
              </div>
              {expandedSections.requests ? <ChevronUp className="w-5 h-5 text-amber-400" /> : <ChevronDown className="w-5 h-5 text-amber-400" />}
            </button>
            
            {expandedSections.requests && (
              <div className="px-4 sm:px-6 py-2">
                {pendingRequests.map((req, idx) => {
                  // Parse JSON fields from existing schema
                  const currentData = typeof req.current_data === 'string' ? JSON.parse(req.current_data || '{}') : (req.current_data || {});
                  const requestedChanges = typeof req.requested_changes === 'string' ? JSON.parse(req.requested_changes || '{}') : (req.requested_changes || {});
                  const fieldName = requestedChanges.field_name || req.request_type || 'Unknown';
                  const currentValue = currentData.value;
                  const requestedValue = requestedChanges.value;
                  
                  return (
                    <div key={req.id || idx} className="py-3 border-b border-gray-100 last:border-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 capitalize">{fieldName.replace(/_/g, ' ')}</p>
                          <p className="text-sm text-gray-600">
                            <span className="text-gray-400">From:</span> {currentValue || '(empty)'} 
                            <span className="mx-2">→</span>
                            <span className="text-blue-600">{requestedValue}</span>
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Submitted {new Date(req.requested_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                            Awaiting Review
                          </span>
                          <button
                            onClick={() => handleCancelRequest(req.id)}
                            className="text-xs text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                            title="Cancel this request"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Batch Submit Section - shown when there are edited fields */}
        {Object.keys(editedFields).length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 sticky bottom-4 border-2 border-blue-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {Object.keys(editedFields).length} field(s) modified
                </p>
                <p className="text-xs text-gray-500">
                  Changes: {Object.keys(editedFields).map(f => f.replace(/_/g, ' ')).join(', ')}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm w-full sm:w-64"
                  placeholder="Reason for changes (optional)"
                />
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleCancelAllEdits}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmitAllEdits}
                    disabled={isSubmitting}
                    className="bg-[#0a66c2] hover:bg-[#004182]"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit All for Review'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

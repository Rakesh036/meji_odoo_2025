import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchMySwapRequests } from '../apis/apiCalls';

const SwapRequests = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [requests, setRequests] = useState({
    pending: [],
    accepted: [],
    rejected: [],
    cancelled: []
  });
  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    cancelled: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchMySwapRequests();
      
      if (response.success) {
        console.log('Full response data:', response.data);
        
        // Get current user ID for debugging
        const userData = localStorage.getItem('user');
        const currentUser = userData ? JSON.parse(userData) : null;
        console.log('Current user:', currentUser);
        
        setRequests(response.data.requests);
        setSummary(response.data.summary);
      } else {
        setError('Failed to fetch requests');
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError(error.message || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  // Combine all requests into a single array for filtering
  const getAllRequests = () => {
    const allRequests = [];
    
    // Add requestType to each request for identification
    Object.keys(requests).forEach(status => {
      requests[status].forEach(request => {
        allRequests.push({
          ...request,
          status,
          requestType: request.requestType || 'unknown'
        });
      });
    });
    
    return allRequests;
  };

  // Filter requests based on search term and status
  const filteredRequests = getAllRequests().filter(request => {
    const requesterName = request.requester?.name || '';
    const recipientName = request.recipient?.name || '';
    const skillRequested = request.skillRequested || '';
    const skillOffered = request.skillOffered || '';
    
    const matchesSearch = 
      requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skillRequested.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skillOffered.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={`full-${i}`} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    // Half star
    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="halfStar">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="#e5e7eb" />
            </linearGradient>
          </defs>
          <path fill="url(#halfStar)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    // Empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex items-center justify-center h-48 sm:h-64">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-[#AB886D]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading requests</h3>
                <p className="mt-2 text-xs sm:text-sm text-red-700">{error}</p>
                <button
                  onClick={fetchRequests}
                  className="mt-3 text-xs sm:text-sm font-medium text-red-800 hover:text-red-900 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#493628] mb-2">Swap Requests</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage your skill share requests and track their status</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="ml-2 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Total</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">{summary.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-2 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Pending</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">{summary.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="ml-2 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Accepted</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">{summary.accepted}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <div className="ml-2 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Rejected</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">{summary.rejected}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Requests
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by name or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#AB886D] focus:border-[#AB886D] transition-colors text-sm sm:text-base"
              />
            </div>

            {/* Status Filter */}
            <div className="w-full lg:w-48">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#AB886D] focus:border-[#AB886D] transition-colors text-sm sm:text-base"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm sm:text-base text-gray-600">
            Showing {filteredRequests.length} of {summary.total} requests
          </p>
        </div>

        {/* Requests List */}
        <div className="space-y-3 sm:space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-8 w-8 sm:h-12 sm:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No requests found</h3>
              <p className="text-sm sm:text-base text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            filteredRequests.map((request) => {
              // Get current user ID to determine which user is "other"
              const userData = localStorage.getItem('user');
              const currentUserId = userData ? JSON.parse(userData)._id : null;
              
              // Determine if this is a received request based on user ID comparison
              const isReceived = request.requester._id !== currentUserId;
              
              // Determine which user is the "other" user (not the current user)
              let otherUser, currentUser;
              if (request.requester._id === currentUserId) {
                // You are the requester (you sent the request)
                otherUser = request.recipient;
                currentUser = request.requester;
              } else {
                // You are the recipient (you received the request)
                otherUser = request.requester;
                currentUser = request.recipient;
              }
              
              // Debug logging
              console.log('Request debug:', {
                requestId: request._id,
                requestType: request.requestType,
                isReceived,
                currentUserId: currentUserId,
                requesterId: request.requester._id,
                recipientId: request.recipient._id,
                requesterName: request.requester?.name,
                recipientName: request.recipient?.name,
                otherUserName: otherUser?.name,
                currentUserName: currentUser?.name,
                isCurrentUserRequester: request.requester._id === currentUserId
              });
              
              // Safety check - if otherUser is undefined, skip this request
              if (!otherUser) {
                console.error('otherUser is undefined for request:', request);
                return null;
              }
              
              return (
                <div key={request._id} className="bg-white rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* User Info */}
                    <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
                      {/* Profile Photo */}
                      <div className="flex-shrink-0">
                        {otherUser.profilePhoto ? (
                          <img
                            src={otherUser.profilePhoto}
                            alt={otherUser.name}
                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-gray-200"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#AB886D] flex items-center justify-center text-white font-medium text-sm sm:text-lg" style={{ display: otherUser.profilePhoto ? 'none' : 'flex' }}>
                          {otherUser.name.charAt(0).toUpperCase()}
                        </div>
                      </div>

                      {/* User Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                            {otherUser.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/profile/${otherUser._id}`}
                              className="text-[#AB886D] hover:text-[#493628] text-xs sm:text-sm font-medium transition-colors"
                            >
                              View Profile
                            </Link>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              isReceived ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {isReceived ? 'Received' : 'Sent'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Location */}
                        {otherUser.location && (
                          <p className="text-xs sm:text-sm text-gray-600 mb-2">
                            📍 {otherUser.location}
                          </p>
                        )}
                        
                        {/* Skills Exchange */}
                        <div className="mb-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                            <div>
                              <p className="text-xs sm:text-sm text-gray-600 mb-1">Skill Requested:</p>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                {request.skillRequested}
                              </span>
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm text-gray-600 mb-1">Skill Offered:</p>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                {request.skillOffered}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Message */}
                        {request.message && (
                          <div className="mb-2">
                            <p className="text-xs sm:text-sm text-gray-600 mb-1">Message:</p>
                            <p className="text-xs sm:text-sm text-gray-800 bg-gray-50 p-2 rounded border">
                              "{request.message}"
                            </p>
                          </div>
                        )}

                        {/* Request Date */}
                        <p className="text-xs text-gray-500">
                          {isReceived ? 'Received' : 'Sent'}: {formatDate(request.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex-shrink-0 lg:ml-4">
                      <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }).filter(Boolean) // Remove any null requests
          )}
        </div>
      </div>
    </div>
  );
};

export default SwapRequests; 
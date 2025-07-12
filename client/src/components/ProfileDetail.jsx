import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { createSwapRequest } from '../apis/apiCalls';

const ProfileDetail = () => {
  const { userId } = useParams();
  const location = useLocation();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedOfferedSkill, setSelectedOfferedSkill] = useState('');
  const [selectedWantedSkill, setSelectedWantedSkill] = useState('');
  const [message, setMessage] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Get user data from location state or fetch from backend
  useEffect(() => {
    // Fetch current user data first
    fetchCurrentUserData();
    
    if (location.state?.userData) {
      // Use data passed from UserCard
      setProfileData(location.state.userData);
      setLoading(false);
    } else {
      // Fetch user data from backend if not passed via state
      fetchUserData();
    }
  }, [userId, location.state]);

  const fetchCurrentUserData = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
      } else {
        // If no user data in localStorage, fetch from backend
        const token = localStorage.getItem('token');
        if (token) {
          const response = await fetch('http://localhost:5001/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setCurrentUser(data.user);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching current user data:', err);
    }
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
      } else {
        setError('Failed to fetch user data');
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedOfferedSkill || !selectedWantedSkill || !message.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      const swapRequestData = {
        recipientId: profileData._id || profileData.id,
        skillOffered: selectedOfferedSkill,
        skillRequested: selectedWantedSkill,
        message: message
      };

      const response = await createSwapRequest(swapRequestData);
      
      if (response.success) {
        alert('Swap request sent successfully!');
        // Reset form and close modal
        setSelectedOfferedSkill('');
        setSelectedWantedSkill('');
        setMessage('');
        setShowRequestModal(false);
      } else {
        alert(response.message || 'Failed to send request');
      }
    } catch (error) {
      console.error('Error sending swap request:', error);
      alert(error.message || 'Failed to send swap request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setShowRequestModal(false);
    setSelectedOfferedSkill('');
    setSelectedWantedSkill('');
    setMessage('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E4E0E1] to-[#D6C0B3] py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#AB886D] mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E4E0E1] to-[#D6C0B3] py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <p className="text-red-500">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E4E0E1] to-[#D6C0B3] py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <p className="text-gray-600">User not found</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E4E0E1] to-[#D6C0B3] py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start gap-8">
              {/* Profile Photo */}
              <div className="flex-shrink-0">
                <img
                  src={profileData.profilePhoto || 'https://via.placeholder.com/192x192?text=User'}
                  alt={profileData.name}
                  className="w-48 h-48 rounded-full object-cover border-4 border-[#AB886D]"
                />
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-[#493628] mb-2">{profileData.name}</h1>
                    <p className="text-gray-600 mb-2">{profileData.location}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-5 h-5 ${i < Math.floor(profileData.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-lg font-semibold text-[#493628]">{profileData.rating || 'No rating'}</span>
                      <span className="text-gray-600">({profileData.totalReviews || 0} reviews)</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setShowRequestModal(true)}
                    className="bg-[#AB886D] text-white px-6 py-3 rounded-lg hover:bg-[#493628] transition duration-200 font-semibold"
                  >
                    Request Skill Swap
                  </button>
                </div>

                {/* Availability */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-[#493628] mb-3">Availability</h3>
                  <div className="flex flex-wrap gap-2">
                    {profileData.availability?.weekdays && (
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Weekdays</span>
                    )}
                    {profileData.availability?.weekends && (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Weekends</span>
                    )}
                    {profileData.availability?.custom && (
                      <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                        {profileData.availability.customText || 'Custom availability'}
                      </span>
                    )}
                    {!profileData.availability?.weekdays && !profileData.availability?.weekends && !profileData.availability?.custom && (
                      <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">Not specified</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Skills Offered */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-[#493628] mb-4">Skills I Can Offer</h2>
              <div className="flex flex-wrap gap-2">
                {profileData.skillsOffered && profileData.skillsOffered.length > 0 ? (
                  profileData.skillsOffered.map((skill) => (
                    <span
                      key={skill}
                      className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">No skills offered</span>
                )}
              </div>
            </div>

            {/* Skills Wanted */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-[#493628] mb-4">Skills I Want to Learn</h2>
              <div className="flex flex-wrap gap-2">
                {profileData.skillsWanted && profileData.skillsWanted.length > 0 ? (
                  profileData.skillsWanted.map((skill) => (
                    <span
                      key={skill}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">No skills wanted</span>
                )}
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-[#493628] mb-6">Reviews & Feedback</h2>
            <div className="space-y-6">
              {profileData.feedback && profileData.feedback.length > 0 ? (
                profileData.feedback.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-[#493628]">{review.reviewer}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <span className="text-sm text-gray-600">{review.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No reviews yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-[#493628]">Request Skill Swap</h3>
              <button
                onClick={handleModalClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleRequestSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose one of your offered skills
                </label>
                <select
                  value={selectedOfferedSkill}
                  onChange={(e) => setSelectedOfferedSkill(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AB886D] focus:border-transparent"
                  required
                >
                  <option value="">Select a skill you can offer</option>
                  {currentUser?.skillsOffered && currentUser.skillsOffered.length > 0 ? (
                    currentUser.skillsOffered.map((skill) => (
                      <option key={skill} value={skill}>
                        {skill}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No skills offered yet</option>
                  )}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Note: You should select skills that you can actually offer to this user
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose one of their offered skills
                </label>
                <select
                  value={selectedWantedSkill}
                  onChange={(e) => setSelectedWantedSkill(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AB886D] focus:border-transparent"
                  required
                >
                  <option value="">Select a skill they can teach</option>
                  {profileData?.skillsOffered && profileData.skillsOffered.length > 0 ? (
                    profileData.skillsOffered.map((skill) => (
                      <option key={skill} value={skill}>
                        {skill}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No skills offered</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AB886D] focus:border-transparent"
                  placeholder="Introduce yourself and explain why you'd like to swap skills..."
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#AB886D] text-white py-2 px-4 rounded-md hover:bg-[#493628] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Sending...' : 'Send Request'}
                </button>
                <button
                  type="button"
                  onClick={handleModalClose}
                  disabled={submitting}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDetail; 
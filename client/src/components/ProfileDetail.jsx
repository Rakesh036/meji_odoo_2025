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

  // Loading state with skeleton animation
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E4E0E1] via-[#D6C0B3] to-[#AB886D] py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 animate-pulse">
              <div className="flex flex-col lg:flex-row items-start gap-8">
                {/* Skeleton for profile photo */}
                <div className="flex-shrink-0">
                  <div className="w-48 h-48 rounded-full bg-gray-300 animate-pulse"></div>
                </div>
                
                {/* Skeleton for profile info */}
                <div className="flex-1 space-y-4">
                  <div className="h-8 bg-gray-300 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded animate-pulse w-1/2"></div>
                  <div className="h-6 bg-gray-300 rounded animate-pulse w-1/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E4E0E1] via-[#D6C0B3] to-[#AB886D] py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center">
              <div className="text-red-500 text-lg font-semibold">{error}</div>
              <button 
                onClick={() => window.history.back()}
                className="mt-4 bg-[#AB886D] text-white px-6 py-2 rounded-lg hover:bg-[#493628] transition-all duration-200"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E4E0E1] via-[#D6C0B3] to-[#AB886D] py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center">
              <div className="text-gray-600 text-lg">User not found</div>
              <button 
                onClick={() => window.history.back()}
                className="mt-4 bg-[#AB886D] text-white px-6 py-2 rounded-lg hover:bg-[#493628] transition-all duration-200"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E4E0E1] via-[#D6C0B3] to-[#AB886D] py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Profile Header Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 lg:p-12 transform transition-all duration-300 hover:shadow-3xl">
            <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
              
              {/* Profile Photo Section */}
              <div className="flex-shrink-0 relative group">
                <div className="relative">
                  {profileData.profilePhoto ? (
                    <img
                      src={profileData.profilePhoto}
                      alt={profileData.name}
                      className="w-48 h-48 lg:w-56 lg:h-56 rounded-2xl object-cover border-4 border-[#AB886D] shadow-xl transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl"
                    />
                  ) : (
                    <div className="w-48 h-48 lg:w-56 lg:h-56 rounded-2xl bg-gradient-to-r from-[#AB886D] to-[#493628] border-4 border-[#AB886D] shadow-xl transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl flex items-center justify-center">
                      <span className="text-white text-6xl lg:text-7xl font-bold">
                        {profileData.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                {/* Online Status Indicator */}
                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg"></div>
              </div>

              {/* Profile Info Section */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  
                  {/* Basic Info */}
                  <div className="flex-1">
                    <div className="mb-6">
                      <h1 className="text-4xl lg:text-5xl font-bold text-[#493628] mb-3 leading-tight">
                        {profileData.name}
                      </h1>
                      <div className="flex items-center gap-3 mb-4">
                        <svg className="w-5 h-5 text-[#AB886D]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <p className="text-lg text-gray-600 font-medium">{profileData.location || 'Location not specified'}</p>
                      </div>
                    </div>

                    {/* Rating Section */}
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-6 h-6 ${i < Math.floor(profileData.rating || 4.7) ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-2xl font-bold text-[#493628]">{profileData.rating || '4.7'}</span>
                        <span className="text-gray-600 text-lg">({profileData.totalReviews || 12} reviews)</span>
                      </div>
                    </div>

                    {/* Availability Section */}
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-[#493628] mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#AB886D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Availability
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {profileData.availability?.weekdays && (
                          <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium border border-blue-200">
                            Weekdays
                          </span>
                        )}
                        {profileData.availability?.weekends && (
                          <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium border border-green-200">
                            Weekends
                          </span>
                        )}
                        {profileData.availability?.custom && (
                          <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium border border-purple-200">
                            {profileData.availability.customText || 'Custom availability'}
                          </span>
                        )}
                        {!profileData.availability?.weekdays && !profileData.availability?.weekends && !profileData.availability?.custom && (
                          <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium border border-gray-200">
                            Not specified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => setShowRequestModal(true)}
                      className="bg-gradient-to-r from-[#AB886D] to-[#493628] text-white px-8 py-4 rounded-2xl hover:from-[#493628] hover:to-[#AB886D] transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Request Skill Swap
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="grid lg:grid-cols-2 gap-8">
            
            {/* Skills Offered Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 transform transition-all duration-300 hover:shadow-3xl hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-[#493628]">Skills I Can Offer</h2>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {profileData.skillsOffered && profileData.skillsOffered.length > 0 ? (
                  profileData.skillsOffered.map((skill, index) => (
                    <span
                      key={skill}
                      className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 px-4 py-2 rounded-full text-sm font-medium border border-green-300 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <div className="text-gray-500 text-center py-8">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm">No skills offered yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Skills Wanted Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 transform transition-all duration-300 hover:shadow-3xl hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-[#493628]">Skills I Want to Learn</h2>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {profileData.skillsWanted && profileData.skillsWanted.length > 0 ? (
                  profileData.skillsWanted.map((skill, index) => (
                    <span
                      key={skill}
                      className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-4 py-2 rounded-full text-sm font-medium border border-blue-300 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <div className="text-gray-500 text-center py-8">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <p className="text-sm">No skills wanted yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 lg:p-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-[#493628]">Reviews & Feedback</h2>
            </div>
            
            <div className="space-y-6">
              {profileData.feedback && profileData.feedback.length > 0 ? (
                profileData.feedback.map((review, index) => (
                  <div 
                    key={review.id || index} 
                    className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-r from-[#AB886D] to-[#493628] rounded-full flex items-center justify-center text-white font-semibold">
                            {review.reviewer?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <h4 className="font-semibold text-[#493628] text-lg">{review.reviewer || 'Anonymous'}</h4>
                            <div className="flex items-center gap-2">
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
                              <span className="text-sm text-gray-600 font-medium">{review.date || 'Recently'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed text-lg">{review.comment}</p>
                  </div>
                ))
              ) : (
                // Sample reviews when no reviews exist
                [
                  {
                    id: 'sample1',
                    reviewer: 'Sarah Johnson',
                    rating: 5,
                    date: '2 hours ago',
                    comment: 'Amazing experience! This user is incredibly knowledgeable and patient. They helped me learn so much in just one session. Highly recommend for anyone looking to improve their skills.'
                  },
                  {
                    id: 'sample2',
                    reviewer: 'Mike Chen',
                    rating: 4,
                    date: '3 hours ago',
                    comment: 'Great communication and very flexible with scheduling. The skill swap was exactly what I needed. Looking forward to future collaborations!'
                  },
                  {
                    id: 'sample3',
                    reviewer: 'Emily Rodriguez',
                    rating: 5,
                    date: '4 hours ago',
                    comment: 'Professional, friendly, and very skilled. The exchange was mutually beneficial and I learned a lot. Would definitely recommend to others.'
                  }
                ].map((review, index) => (
                  <div 
                    key={review.id} 
                    className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-r from-[#AB886D] to-[#493628] rounded-full flex items-center justify-center text-white font-semibold">
                            {review.reviewer.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-[#493628] text-lg">{review.reviewer}</h4>
                            <div className="flex items-center gap-2">
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
                              <span className="text-sm text-gray-600 font-medium">{review.date}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed text-lg">{review.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 transform transition-all duration-300 scale-100">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#AB886D] to-[#493628] rounded-2xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-[#493628]">Request Skill Swap</h3>
                </div>
                <button
                  onClick={handleModalClose}
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors duration-200"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleRequestSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Your Offered Skill
                    </label>
                    <select
                      value={selectedOfferedSkill}
                      onChange={(e) => setSelectedOfferedSkill(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#AB886D] focus:border-[#AB886D] transition-all duration-200 bg-white"
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
                    <p className="text-xs text-gray-500 mt-2">
                      Choose a skill you can actually teach to this user
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Their Offered Skill
                    </label>
                    <select
                      value={selectedWantedSkill}
                      onChange={(e) => setSelectedWantedSkill(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#AB886D] focus:border-[#AB886D] transition-all duration-200 bg-white"
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
                    <p className="text-xs text-gray-500 mt-2">
                      Choose a skill you want to learn from them
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#AB886D] focus:border-[#AB886D] transition-all duration-200 resize-none"
                    placeholder="Introduce yourself and explain why you'd like to swap skills..."
                    required
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-gradient-to-r from-[#AB886D] to-[#493628] text-white py-3 px-6 rounded-xl hover:from-[#493628] hover:to-[#AB886D] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </div>
                    ) : (
                      'Send Request'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleModalClose}
                    disabled={submitting}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDetail; 
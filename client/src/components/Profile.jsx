import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    location: '',
    isPublic: true,
    availability: {
      weekdays: false,
      weekends: false,
      custom: false,
      customText: ''
    }
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [skillsOffered, setSkillsOffered] = useState([]);
  const [skillsWanted, setSkillsWanted] = useState([]);
  const [showSkillsOfferedDropdown, setShowSkillsOfferedDropdown] = useState(false);
  const [showSkillsWantedDropdown, setShowSkillsWantedDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();
  const skillsOfferedRef = useRef(null);
  const skillsWantedRef = useRef(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      navigate('/login');
      return;
    }

    const userObj = JSON.parse(userData);
    setUser(userObj);
    setFormData({
      location: userObj.location || '',
      isPublic: userObj.isPublic !== undefined ? userObj.isPublic : true,
      availability: userObj.availability || {
        weekdays: false,
        weekends: false,
        custom: false,
        customText: ''
      }
    });
    setSkillsOffered(userObj.skillsOffered || []);
    setSkillsWanted(userObj.skillsWanted || []);
    
    fetchSkills();
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (skillsOfferedRef.current && !skillsOfferedRef.current.contains(event.target)) {
        setShowSkillsOfferedDropdown(false);
      }
      if (skillsWantedRef.current && !skillsWantedRef.current.contains(event.target)) {
        setShowSkillsWantedDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/auth/skills');
      setAvailableSkills(response.data.skills);
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAvailabilityChange = (type) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [type]: !prev.availability[type]
      }
    }));
  };

  const handleCustomAvailabilityChange = (e) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        customText: e.target.value
      }
    }));
  };

  const toggleSkillOffered = (skill) => {
    setSkillsOffered(prev => {
      if (prev.includes(skill)) {
        return prev.filter(s => s !== skill);
      } else {
        return [...prev, skill];
      }
    });
  };

  const removeSkillOffered = (skillToRemove) => {
    setSkillsOffered(prev => prev.filter(skill => skill !== skillToRemove));
  };

  const toggleSkillWanted = (skill) => {
    setSkillsWanted(prev => {
      if (prev.includes(skill)) {
        return prev.filter(s => s !== skill);
      } else {
        return [...prev, skill];
      }
    });
  };

  const removeSkillWanted = (skillToRemove) => {
    setSkillsWanted(prev => prev.filter(skill => skill !== skillToRemove));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      setProfilePhoto(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('location', formData.location);
      formDataToSend.append('isPublic', formData.isPublic);
      formDataToSend.append('availability', JSON.stringify(formData.availability));
      
      skillsOffered.forEach(skill => {
        formDataToSend.append('skillsOffered', skill);
      });
      
      skillsWanted.forEach(skill => {
        formDataToSend.append('skillsWanted', skill);
      });
      
      if (profilePhoto) {
        formDataToSend.append('profilePhoto', profilePhoto);
      }

      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:5001/api/auth/profile/${user._id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      // Update local storage with new user data
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      setMessage('Profile updated successfully!');
      
      // Redirect to home page after successful update
      setTimeout(() => {
        navigate('/home');
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || 'Profile update failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E4E0E1] to-[#D6C0B3] py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-bold text-center mb-8 text-[#493628]">Edit Profile</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              {message && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  {message}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City, Country"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AB886D] focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AB886D] focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Max size: 5MB. Supported formats: JPG, PNG, GIF</p>
              </div>

              {/* Profile Visibility */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Profile Visibility
                </label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="isPublic"
                      value="true"
                      checked={formData.isPublic === true}
                      onChange={() => setFormData(prev => ({ ...prev, isPublic: true }))}
                      className="text-[#AB886D] focus:ring-[#AB886D]"
                    />
                    <span className="ml-2 text-sm text-gray-700">Public Profile</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="isPublic"
                      value="false"
                      checked={formData.isPublic === false}
                      onChange={() => setFormData(prev => ({ ...prev, isPublic: false }))}
                      className="text-[#AB886D] focus:ring-[#AB886D]"
                    />
                    <span className="ml-2 text-sm text-gray-700">Private Profile</span>
                  </label>
                </div>
              </div>

              {/* Availability Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Availability
                </label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.availability.weekdays}
                      onChange={() => handleAvailabilityChange('weekdays')}
                      className="rounded border-gray-300 text-[#AB886D] focus:ring-[#AB886D]"
                    />
                    <span className="ml-2 text-sm text-gray-700">Weekdays</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.availability.weekends}
                      onChange={() => handleAvailabilityChange('weekends')}
                      className="rounded border-gray-300 text-[#AB886D] focus:ring-[#AB886D]"
                    />
                    <span className="ml-2 text-sm text-gray-700">Weekends</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.availability.custom}
                      onChange={() => handleAvailabilityChange('custom')}
                      className="rounded border-gray-300 text-[#AB886D] focus:ring-[#AB886D]"
                    />
                    <span className="ml-2 text-sm text-gray-700">Custom</span>
                  </label>
                  
                  {formData.availability.custom && (
                    <input
                      type="text"
                      placeholder="Describe your custom availability..."
                      value={formData.availability.customText}
                      onChange={handleCustomAvailabilityChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AB886D] focus:border-transparent"
                    />
                  )}
                </div>
              </div>
              
              {/* Skills Offered Dropdown */}
              <div className="relative" ref={skillsOfferedRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills I Can Offer
                </label>
                
                {/* Selected Skills Display */}
                {skillsOffered.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-2">
                      {skillsOffered.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkillOffered(skill)}
                            className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-200 hover:bg-green-300 focus:outline-none"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Dropdown Trigger */}
                <button
                  type="button"
                  onClick={() => setShowSkillsOfferedDropdown(!showSkillsOfferedDropdown)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AB886D] focus:border-transparent bg-white text-left flex items-center justify-between"
                >
                  <span className={skillsOffered.length > 0 ? 'text-gray-900' : 'text-gray-500'}>
                    {skillsOffered.length > 0 ? `${skillsOffered.length} skill(s) selected` : 'Select skills you can offer...'}
                  </span>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${showSkillsOfferedDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                {showSkillsOfferedDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2">
                      {availableSkills.map((skill) => (
                        <label
                          key={skill}
                          className="flex items-center px-3 py-2 hover:bg-gray-100 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={skillsOffered.includes(skill)}
                            onChange={() => toggleSkillOffered(skill)}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{skill}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Skills Wanted Dropdown */}
              <div className="relative" ref={skillsWantedRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills I Want to Learn
                </label>
                
                {/* Selected Skills Display */}
                {skillsWanted.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-2">
                      {skillsWanted.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkillWanted(skill)}
                            className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-200 hover:bg-blue-300 focus:outline-none"
                          >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Dropdown Trigger */}
                <button
                  type="button"
                  onClick={() => setShowSkillsWantedDropdown(!showSkillsWantedDropdown)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#AB886D] focus:border-transparent bg-white text-left flex items-center justify-between"
                >
                  <span className={skillsWanted.length > 0 ? 'text-gray-900' : 'text-gray-500'}>
                    {skillsWanted.length > 0 ? `${skillsWanted.length} skill(s) selected` : 'Select skills you want to learn...'}
                  </span>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${showSkillsWantedDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                {showSkillsWantedDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2">
                      {availableSkills.map((skill) => (
                        <label
                          key={skill}
                          className="flex items-center px-3 py-2 hover:bg-gray-100 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={skillsWanted.includes(skill)}
                            onChange={() => toggleSkillWanted(skill)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{skill}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#AB886D] text-white py-2 px-4 rounded-md hover:bg-[#493628] transition duration-200 disabled:opacity-50"
              >
                {loading ? 'Updating Profile...' : 'Update Profile'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 
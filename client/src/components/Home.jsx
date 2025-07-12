import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(userData));
  }, [navigate]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E4E0E1] to-[#D6C0B3]">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-[#493628] mb-8">Let's Swap</h1>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold text-[#493628] mb-4">Profile Information</h2>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">Name:</span>
                      <span className="ml-2 text-gray-900">{user.name}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Email:</span>
                      <span className="ml-2 text-gray-900">{user.email}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Location:</span>
                      <span className="ml-2 text-gray-900">{user.location}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Profile Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${user.isPublic ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.isPublic ? 'Public' : 'Private'}
                      </span>
                    </div>
                  </div>
                </div>

                {user.profilePhoto && (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold text-[#493628] mb-4">Profile Photo</h2>
                    <img
                      src={`http://localhost:5001/uploads/${user.profilePhoto}`}
                      alt="Profile"
                      className="w-32 h-32 object-cover rounded-lg"
                      onError={(e) => {
                        console.error('Home - Image load error:', e.target.src);
                        e.target.style.display = 'none';
                      }}
                      onLoad={() => {
                        console.log('Home - Image loaded successfully:', user.profilePhoto);
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold text-[#493628] mb-4">Skills I Can Offer</h2>
                  {user.skillsOffered && user.skillsOffered.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {user.skillsOffered.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No skills offered yet.</p>
                  )}
                </div>

                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold text-[#493628] mb-4">Skills I Want to Learn</h2>
                  {user.skillsWanted && user.skillsWanted.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {user.skillsWanted.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No skills wanted yet.</p>
                  )}
                </div>

                {user.availability && (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold text-[#493628] mb-4">Availability</h2>
                    <div className="space-y-2">
                      {user.availability.weekdays && <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-1 mb-1">Weekdays</span>}
                      {user.availability.weekends && <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs mr-1 mb-1">Weekends</span>}
                      {user.availability.custom && user.availability.customText && (
                        <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs mr-1 mb-1">
                          Custom: {user.availability.customText}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 
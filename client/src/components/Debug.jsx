import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Debug = () => {
  const [userData, setUserData] = useState(null);
  const [uploadsTest, setUploadsTest] = useState(null);

  useEffect(() => {
    // Check localStorage
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    setUserData({
      user: user ? JSON.parse(user) : null,
      token: token ? 'Present' : 'Missing'
    });

    // Test uploads directory
    axios.get('http://localhost:5001/api/test-uploads')
      .then(response => {
        setUploadsTest(response.data);
        
        // If we have a user with a profile photo, test that specific file
        if (userData?.user?.profilePhoto) {
          axios.get(`http://localhost:5001/api/test-uploads?filename=${userData.user.profilePhoto}`)
            .then(fileResponse => {
              setUploadsTest(prev => ({ ...prev, specificFile: fileResponse.data }));
            })
            .catch(fileError => {
              setUploadsTest(prev => ({ ...prev, specificFileError: fileError.message }));
            });
        }
      })
      .catch(error => {
        setUploadsTest({ error: error.message });
      });
  }, []);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Debug Information</h1>
      
      <div className="space-y-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">LocalStorage Data</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
            {JSON.stringify(userData, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Uploads Directory Test</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
            {JSON.stringify(uploadsTest, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Image Test</h2>
          {userData?.user?.profilePhoto && (
            <div>
              <p>Profile photo filename: {userData.user.profilePhoto}</p>
              <img 
                src={`http://localhost:5001/uploads/${userData.user.profilePhoto}`}
                alt="Test"
                className="w-32 h-32 object-cover rounded"
                onError={(e) => {
                  console.error('Debug - Image error:', e.target.src);
                  e.target.style.border = '2px solid red';
                }}
                onLoad={() => {
                  console.log('Debug - Image loaded successfully');
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Debug; 
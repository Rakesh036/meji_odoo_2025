import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function UserCard({ user, loggedIn }) {
  const navigate = useNavigate();

  const handleUserClick = () => {
    // Pass user data via state to the profile detail page
    navigate(`/profile/${user._id}`, { 
      state: { userData: user } 
    });
  };

  return (
    <div className="flex flex-col md:flex-row items-center bg-white shadow rounded p-4 gap-4 w-full">
      <img
        src={user.profilePhoto || 'https://via.placeholder.com/96x96?text=User'}
        alt={user.name}
        className="w-24 h-24 rounded-full object-cover"
      />

      <div className="flex-1">
        <button 
          onClick={handleUserClick}
          className="hover:text-[#AB886D] transition-colors text-left"
        >
          <h2 className="text-xl font-semibold">{user.name}</h2>
        </button>
        <div className="mt-2">
          <p className="text-sm text-gray-600">Skills Offered:</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {user.skillsOffered.map((s) => (
              <span key={s} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-2">
          <p className="text-sm text-gray-600">Skills Wanted:</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {user.skillsWanted.map((s) => (
              <span key={s} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div className="mb-2">
          <span className="font-medium">Rating:</span> {user.rating}/5
        </div>
        <button
          disabled={!loggedIn}
          className={`px-4 py-2 rounded text-white transition
            ${loggedIn ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-gray-300 cursor-not-allowed'}`}
        >
          Request
        </button>
      </div>
    </div>
  );
}
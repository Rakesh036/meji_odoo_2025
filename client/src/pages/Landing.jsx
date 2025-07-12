import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Users, Clock, Wifi, WifiOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Mock components since we don't have the actual ones
const FilterBar = ({ availability, setAvailability, search, setSearch }) => (
  <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 py-4 sm:py-6">
        {/* Left Side - Empty for balance */}
        <div className="hidden sm:block flex-1 order-1"></div>

        {/* Search Bar - Center */}
        <div className="relative flex-1 max-w-md order-1 sm:order-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-500 text-sm sm:text-base"
          />
        </div>

        {/* Availability Filter - Right Side */}
        <div className="flex items-center gap-2 order-2 sm:order-3">
          <Filter className="text-gray-500 w-4 h-4 sm:w-5 sm:h-5" />
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 min-w-[120px] sm:min-w-[140px] text-sm sm:text-base"
          >
            <option value="all">All Members</option>
            <option value="online">Online Now</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>
    </div>
  </div>
);

const UserCard = ({ user, loggedIn }) => {
  const navigate = useNavigate();

  const handleUserClick = () => {
    // Pass user data via state to the profile detail page
    navigate(`/profile/${user._id}`, { 
      state: { userData: user } 
    });
  };

  return (
    <div className="group bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 overflow-hidden cursor-pointer" onClick={handleUserClick}>
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-base sm:text-lg">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              {/* Online Status Indicator */}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 bg-white rounded-full flex items-center justify-center">
                {user.isOnline ? (
                  <Wifi className="w-2 h-2 sm:w-3 sm:h-3 text-green-500" />
                ) : (
                  <WifiOff className="w-2 h-2 sm:w-3 sm:h-3 text-gray-400" />
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                {user.name || 'Unknown User'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                {user.isOnline ? 'Online now' : 'Offline'}
              </p>
            </div>
          </div>

          {/* Action Button */}
          {loggedIn && (
            <button 
              className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 group-hover:shadow-md text-sm sm:text-base"
              onClick={(e) => {
                e.stopPropagation();
                // Handle connect action
              }}
            >
              Connect
            </button>
          )}
        </div>

        {/* Skills Section */}
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-50 space-y-2 sm:space-y-3">
          {/* Skills Offered */}
          {user.skillsOffered && user.skillsOffered.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1 sm:mb-2">Skills Offered</p>
              <div className="flex flex-wrap gap-1">
                {user.skillsOffered.slice(0, 2).map((skill, index) => (
                  <span
                    key={index}
                    className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
                {user.skillsOffered.length > 2 && (
                  <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                    +{user.skillsOffered.length - 2} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Skills Wanted */}
          {user.skillsWanted && user.skillsWanted.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1 sm:mb-2">Skills Wanted</p>
              <div className="flex flex-wrap gap-1">
                {user.skillsWanted.slice(0, 2).map((skill, index) => (
                  <span
                    key={index}
                    className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
                {user.skillsWanted.length > 2 && (
                  <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                    +{user.skillsWanted.length - 2} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Availability Status */}
          <div className="space-y-1 sm:space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-gray-500">Status</span>
              <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                user.isOnline 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {user.isOnline ? 'Available' : 'Unavailable'}
              </span>
            </div>
            
            {/* Availability Details */}
            {user.availability && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1 sm:mb-2">Available On</p>
                <div className="flex flex-wrap gap-1">
                  {user.availability.weekdays && (
                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      Weekdays
                    </span>
                  )}
                  {user.availability.weekends && (
                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      Weekends
                    </span>
                  )}
                  {/* {user.availability.custom && user.availability.customText && (
                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                      Custom
                    </span>
                  )} */}
                  {!user.availability.weekdays && !user.availability.weekends && !user.availability.custom && (
                    <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                      Not specified
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Pagination = ({ page, totalPages, setPage }) => (
  <div className="flex items-center justify-center gap-1 sm:gap-2 mt-6 sm:mt-8">
    <button
      onClick={() => setPage(Math.max(1, page - 1))}
      disabled={page === 1}
      className="p-1.5 sm:p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
    >
      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
    </button>
    
    <div className="flex items-center gap-1">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
        <button
          key={pageNum}
          onClick={() => setPage(pageNum)}
          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base ${
            page === pageNum
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {pageNum}
        </button>
      ))}
    </div>
    
    <button
      onClick={() => setPage(Math.min(totalPages, page + 1))}
      disabled={page === totalPages}
      className="p-1.5 sm:p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
    >
      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
    </button>
  </div>
);

const isOnlineNow = (availability) => {
  const today = new Date().getDay();
  const isWeekend = today === 0 || today === 6;
  if (availability?.custom) return false;
  return isWeekend ? availability?.weekends : availability?.weekdays;
};

export default function LandingPage() {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [matches, setMatches] = useState([]);
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // On mount, read userId that was explicitly stored at login
  useEffect(() => {
    const storedId = localStorage.getItem('userId');
    console.log('Stored userId:', storedId);
    if (storedId) {
      setCurrentUserId(storedId);
    } else {
      console.error('No userId in localStorage');
      setError('User not authenticated');
    }
  }, []);

  // Fetch matches once we have currentUserId
  useEffect(() => {
    if (!currentUserId) return;

    setLoading(true);
    const token = localStorage.getItem('token');

    axios
      .get(`http://localhost:5001/api/home`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const response = res.data;
        console.log('Fetched matches:', response);
        
        if (response.success && response.data) {
          setMatches(response.data);
        } else {
          setError('Invalid response format from server');
        }
        setError('');
      })
      .catch((err) => {
        console.error('Fetch matches error:', err.response || err);
        setError('Failed to fetch matches');
      })
      .finally(() => setLoading(false));
  }, [currentUserId]);

  // Add isOnline property to matches
  const matchesWithOnlineStatus = useMemo(() => {
    return matches.map(user => ({
      ...user,
      isOnline: isOnlineNow(user.availability)
    }));
  }, [matches]);

  const perPage = 4;
  const filtered = useMemo(() => {
    return matchesWithOnlineStatus
      .filter((u) => u.name.toLowerCase().includes(search.toLowerCase()))
      .filter((u) => {
        if (availabilityFilter === 'all') return true;
        return availabilityFilter === 'online' ? u.isOnline : !u.isOnline;
      });
  }, [matchesWithOnlineStatus, search, availabilityFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const loggedIn = Boolean(currentUserId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-3 sm:mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Loading matches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="text-center bg-white rounded-xl p-6 sm:p-8 shadow-lg max-w-sm w-full">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <span className="text-red-600 text-xl sm:text-2xl">⚠</span>
          </div>
          <p className="text-red-600 font-medium text-sm sm:text-base">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Users className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Member Directory</h1>
                <p className="text-gray-500 text-xs sm:text-sm">Connect with {filtered.length} members</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
                <span>{filtered.filter(u => u.isOnline).length} online</span>
              </div>
              <span className="text-gray-300">•</span>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full"></div>
                <span>{filtered.filter(u => !u.isOnline).length} offline</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <FilterBar
        availability={availabilityFilter}
        setAvailability={setAvailabilityFilter}
        search={search}
        setSearch={setSearch}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6 sm:py-8">
        {paged.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Users className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No members found</h3>
            <p className="text-gray-500 max-w-md mx-auto text-sm sm:text-base px-4">
              Try adjusting your search terms or filters to find more members.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6">
            {paged.map((u) => (
              <UserCard key={u._id} user={u} loggedIn={loggedIn} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            setPage={setPage}
          />
        )}
      </main>
    </div>
  );
}


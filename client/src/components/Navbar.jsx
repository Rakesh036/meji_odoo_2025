import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    console.log('Navbar - User data from localStorage:', userData);
    if (userData) {
      try {
        const userObj = JSON.parse(userData);
        console.log('Navbar - Parsed user object:', userObj);
        setUser(userObj);
      } catch (error) {
        console.error('Navbar - Error parsing user data:', error);
      }
    } else {
      setUser(null);
    }
  }, [location]); // Re-run when location changes (login/logout)

  // Listen for custom auth events
  useEffect(() => {
    const handleAuthChange = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const userObj = JSON.parse(userData);
          setUser(userObj);
        } catch (error) {
          console.error('Navbar - Error parsing user data from auth event:', error);
        }
      } else {
        setUser(null);
      }
    };

    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Dispatch custom event to notify navbar
    window.dispatchEvent(new Event('authChange'));
    
    setShowMobileMenu(false);
    setShowDropdown(false);
    navigate('/login');
  };

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };

  if (!user) {
    console.log('Navbar - No user found, showing basic navbar');
    return (
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex justify-between h-14 sm:h-16">
            <div className="flex items-center">
              <h1 className="text-xl sm:text-2xl font-bold text-[#493628]">Meji Odoo</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-[#AB886D] px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-gray-700 hover:text-[#AB886D] px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex justify-between h-14 sm:h-16">
          <div className="flex items-center">
            <Link to="/home" className="flex-shrink-0 flex items-center">
              <h1 className="text-xl sm:text-2xl font-bold text-[#493628]">Meji Odoo</h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            <Link
              to="/home"
              className="text-gray-700 hover:text-[#AB886D] px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors"
            >
              Home
            </Link>
            
            <Link
              to="/profile"
              className="text-gray-700 hover:text-[#AB886D] px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors"
            >
              Profile
            </Link>

            <Link
              to="/swap-requests"
              className="text-gray-700 hover:text-[#AB886D] px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors"
            >
              Swap Requests
            </Link>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-1 sm:space-x-2 text-gray-700 hover:text-[#AB886D] px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors"
              >
                {user.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt="Profile"
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
                    onError={(e) => {
                      console.error('Navbar - Image load error:', e.target.src);
                      e.target.style.display = 'none';
                    }}
                    onLoad={() => {
                      console.log('Navbar - Image loaded successfully:', user.profilePhoto);
                    }}
                  />
                ) : (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#AB886D] rounded-full flex items-center justify-center">
                    <span className="text-white text-xs sm:text-sm font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="hidden sm:inline">{user.name}</span>
                <ChevronDown
                  className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <Link
                    to="/profile"
                    className="block px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowDropdown(false)}
                  >
                    Edit Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="text-gray-700 hover:text-[#AB886D] p-2 rounded-md transition-colors"
            >
              {showMobileMenu ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {showMobileMenu && (
          <div 
            ref={mobileMenuRef}
            className="md:hidden border-t border-gray-200 bg-white"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/home"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#AB886D] hover:bg-gray-50 rounded-md transition-colors"
                onClick={closeMobileMenu}
              >
                Home
              </Link>
              
              <Link
                to="/profile"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#AB886D] hover:bg-gray-50 rounded-md transition-colors"
                onClick={closeMobileMenu}
              >
                Profile
              </Link>

              <Link
                to="/swap-requests"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#AB886D] hover:bg-gray-50 rounded-md transition-colors"
                onClick={closeMobileMenu}
              >
                Swap Requests
              </Link>

              {/* Mobile User Profile Section */}
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex items-center px-3 py-2">
                  {user.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover mr-3"
                      onError={(e) => {
                        console.error('Navbar - Image load error:', e.target.src);
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 bg-[#AB886D] rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-base font-medium text-gray-900">{user.name}</span>
                </div>
                
                <Link
                  to="/profile"
                  className="block px-3 py-2 text-sm text-gray-700 hover:text-[#AB886D] hover:bg-gray-50 rounded-md transition-colors"
                  onClick={closeMobileMenu}
                >
                  Edit Profile
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:text-[#AB886D] hover:bg-gray-50 rounded-md transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 
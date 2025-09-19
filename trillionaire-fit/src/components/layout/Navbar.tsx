'use client';

import { publicConfig } from '@/lib/config';
import { Suspense, useState } from 'react';
import { CartIndicator } from './NavbarCartIndicator';
import { SearchBar } from './SearchBar';
import { useNavigationWithLoading } from '@/hooks/useNavigationWithLoading';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation'; // ✅ import router
import { HeartIcon } from '@/components/ui/SocialIcons';

export function Navbar() {
  const { navigate } = useNavigationWithLoading();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const router = useRouter(); // ✅ router instance


  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    closeMobileMenu();
  };

  // ✅ logout + redirect
  const handleLogout = async () => {
    await logout();
    router.push('/'); // redirect to home
    closeMobileMenu();
  };

  if (loading) {
    return (
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container-responsive h-16 flex items-center justify-between">
          <span>Loading...</span>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container-responsive h-16 flex items-center justify-between">
        {/* Logo */}
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center space-x-2 text-xl font-luxury font-semibold tracking-tight hover:opacity-80 transition-opacity"
        >
          <img 
            src="/image/TF_Logo_2.jpg" 
            alt="Trillionaire Fit Logo" 
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="text-2xl font-luxury-display italic tracking-wide text-gray-900">{publicConfig.siteName}</span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm ml-8">
          {/* Main Categories */}
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('/men')} className="hover:underline transition-colors font-medium">Men</button>
            <button onClick={() => navigate('/new-in')} className="hover:underline transition-colors font-medium">New In</button>
            <button onClick={() => navigate('/preowned')} className="hover:underline transition-colors font-medium">Preowned</button>
            <button onClick={() => navigate('/sale')} className="hover:underline transition-colors font-medium">Sale</button>
          </div>
          
          {/* Search Bar */}
          <div className="mx-4">
            <SearchBar />
          </div>
          
          {/* About Link */}
          <button onClick={() => navigate('/about')} className="hover:underline transition-colors text-black font-luxury-elegant mr-4">About</button>
        </nav>

        {/* User Actions */}
        <div className="hidden md:flex items-center gap-6">
          {user?.role === 'admin' && (
            <div className="relative group">
              <button className="hover:underline transition-colors font-medium text-black flex items-center">
                Admin
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Admin Dropdown */}
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <button 
                    onClick={() => navigate('/admin/dashboard')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Dashboard
                  </button>
                  <button 
                    onClick={() => navigate('/admin/products')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Products
                  </button>
                  <button 
                    onClick={() => navigate('/admin/orders')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Orders
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
          {user ? (
            <>
                <button 
                  onClick={() => navigate('/wishlist')}
                  className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:text-red-500 transition-colors font-luxury-elegant"
                  title="Wishlist"
                >
                  <HeartIcon className="h-5 w-5" />
                  <span className="hidden sm:inline">Wishlist</span>
                </button>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-luxury-elegant"
                >
                  Dashboard
                </button>
                <span className="text-sm text-gray-600 font-luxury-elegant ml-2">Welcome, {user.name}</span>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-luxury-elegant ml-4"
                >
                  Logout
                </button>
            </>
          ) : (
            <>
                <button 
                  onClick={() => navigate('/login')} 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-luxury-elegant"
                >
                  Login
                </button>
                <button 
                  onClick={() => navigate('/register')} 
                  className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-luxury-elegant"
                >
                  Register
                </button>
            </>
          )}
          </div>
        </div>

        {/* Cart for Desktop */}
        <div className="hidden md:block ml-6">
          <Suspense>
            <CartIndicator />
          </Suspense>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-4">
          <Suspense>
            <CartIndicator />
          </Suspense>
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-md hover:bg-zinc-100 transition-colors"
            aria-label="Toggle mobile menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 bg-white">
          <nav className="container-responsive py-4">
            {/* Mobile Search Bar */}
            <div className="mb-6">
              <SearchBar />
            </div>
            
            {/* Main Categories */}
            <div className="space-y-1 mb-6">
              <h3 className="text-xs font-luxury-elegant text-gray-500 uppercase tracking-wider mb-3">Shop</h3>
              <button 
                onClick={() => handleNavigation('/men')} 
                className="block w-full text-left py-2 text-sm font-luxury-elegant hover:underline"
              >
                Men
              </button>
              <button 
                onClick={() => handleNavigation('/new-in')} 
                className="block w-full text-left py-2 text-sm font-luxury-elegant hover:underline"
              >
                New In
              </button>
              <button 
                onClick={() => handleNavigation('/preowned')} 
                className="block w-full text-left py-2 text-sm font-luxury-elegant hover:underline"
              >
                Preowned
              </button>
              <button 
                onClick={() => handleNavigation('/sale')} 
                className="block w-full text-left py-2 text-sm font-luxury-elegant hover:underline"
              >
                Sale
              </button>
            </div>
            
            {/* Other Links */}
            <div className="space-y-1 mb-6">
              <h3 className="text-xs font-luxury-elegant text-gray-500 uppercase tracking-wider mb-3">Info</h3>
              <button 
                onClick={() => handleNavigation('/about')} 
                className="block w-full text-left py-2 text-sm font-luxury-elegant text-gray-600 hover:underline"
              >
                About
              </button>
            </div>

            {/* Admin Section */}
            {user?.role === 'admin' && (
              <div className="space-y-1 mb-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Admin</h3>
                <button 
                  onClick={() => handleNavigation('/admin/dashboard')} 
                  className="block w-full text-left py-2 text-sm hover:underline"
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => handleNavigation('/admin/products')} 
                  className="block w-full text-left py-2 text-sm hover:underline"
                >
                  Products
                </button>
                <button 
                  onClick={() => handleNavigation('/admin/orders')} 
                  className="block w-full text-left py-2 text-sm hover:underline"
                >
                  Orders
                </button>
              </div>
            )}

            {user ? (
              <>
                <button 
                  onClick={() => handleNavigation('/wishlist')}
                  className="flex items-center justify-center space-x-2 w-full py-2 px-4 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  <HeartIcon className="h-5 w-5" />
                  <span>Wishlist</span>
                </button>
                <button 
                  onClick={() => handleNavigation('/dashboard')}
                  className="block w-full text-center py-2 px-4 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Dashboard
                </button>
                <span className="block w-full py-2 text-sm text-gray-600 font-medium">Welcome, {user.name}</span>
                <button 
                  onClick={handleLogout}
                  className="block w-full text-center py-2 px-4 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="space-y-3">
                <button 
                  onClick={() => handleNavigation('/login')} 
                  className="block w-full text-center py-2 px-4 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Login
                </button>
                <button 
                  onClick={() => handleNavigation('/register')} 
                  className="block w-full text-center py-2 px-4 text-sm border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                >
                  Register
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

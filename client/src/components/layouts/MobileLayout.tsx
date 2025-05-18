import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { logout } from '@/store/slices/authSlice';
import { 
  FaHome, 
  FaShoppingCart, 
  FaBoxes, 
  FaUsers, 
  FaChartBar, 
  FaCog, 
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUser
} from 'react-icons/fa';

const MobileLayout: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    closeMenu();
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    closeMenu();
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="mobile-layout min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-primary text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <button 
              onClick={toggleMenu}
              className="mr-3 focus:outline-none"
              aria-label="Toggle menu"
            >
              {menuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
            <h1 className="text-xl font-bold">PharmaSync</h1>
          </div>
          <div className="flex items-center">
            <div className="mr-2 text-sm hidden sm:block">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <FaUser className="text-white" />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMenu}
        ></div>
      )}

      {/* Side Navigation */}
      <nav className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 bg-primary text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">PharmaSync</h2>
            <button 
              onClick={closeMenu}
              className="focus:outline-none"
              aria-label="Close menu"
            >
              <FaTimes size={24} />
            </button>
          </div>
          <div className="mt-2 text-sm">
            {user?.firstName} {user?.lastName}
          </div>
          <div className="mt-1 text-xs opacity-80">
            {user?.role}
          </div>
        </div>
        <div className="py-4">
          <ul>
            <li>
              <button 
                onClick={() => handleNavigation('/dashboard')}
                className={`w-full flex items-center px-4 py-3 text-left ${isActive('/dashboard') ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <FaHome className="mr-3" /> Dashboard
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleNavigation('/pos')}
                className={`w-full flex items-center px-4 py-3 text-left ${isActive('/pos') ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <FaShoppingCart className="mr-3" /> POS
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleNavigation('/inventory')}
                className={`w-full flex items-center px-4 py-3 text-left ${isActive('/inventory') ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <FaBoxes className="mr-3" /> Inventory
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleNavigation('/customers')}
                className={`w-full flex items-center px-4 py-3 text-left ${isActive('/customers') ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <FaUsers className="mr-3" /> Customers
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleNavigation('/reports')}
                className={`w-full flex items-center px-4 py-3 text-left ${isActive('/reports') ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <FaChartBar className="mr-3" /> Reports
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleNavigation('/settings')}
                className={`w-full flex items-center px-4 py-3 text-left ${isActive('/settings') ? 'bg-primary/10 text-primary font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <FaCog className="mr-3" /> Settings
              </button>
            </li>
            <li className="border-t mt-4 pt-4">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-left text-red-600 hover:bg-red-50"
              >
                <FaSignOutAlt className="mr-3" /> Logout
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t z-30">
        <div className="flex justify-around">
          <button 
            onClick={() => handleNavigation('/dashboard')}
            className={`flex flex-col items-center py-2 px-4 ${isActive('/dashboard') ? 'text-primary' : 'text-gray-600'}`}
          >
            <FaHome size={20} />
            <span className="text-xs mt-1">Home</span>
          </button>
          <button 
            onClick={() => handleNavigation('/pos')}
            className={`flex flex-col items-center py-2 px-4 ${isActive('/pos') ? 'text-primary' : 'text-gray-600'}`}
          >
            <FaShoppingCart size={20} />
            <span className="text-xs mt-1">POS</span>
          </button>
          <button 
            onClick={() => handleNavigation('/inventory')}
            className={`flex flex-col items-center py-2 px-4 ${isActive('/inventory') ? 'text-primary' : 'text-gray-600'}`}
          >
            <FaBoxes size={20} />
            <span className="text-xs mt-1">Inventory</span>
          </button>
          <button 
            onClick={() => handleNavigation('/customers')}
            className={`flex flex-col items-center py-2 px-4 ${isActive('/customers') ? 'text-primary' : 'text-gray-600'}`}
          >
            <FaUsers size={20} />
            <span className="text-xs mt-1">Customers</span>
          </button>
          <button 
            onClick={() => handleNavigation('/reports')}
            className={`flex flex-col items-center py-2 px-4 ${isActive('/reports') ? 'text-primary' : 'text-gray-600'}`}
          >
            <FaChartBar size={20} />
            <span className="text-xs mt-1">Reports</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default MobileLayout;

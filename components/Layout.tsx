import React, { useEffect } from 'react';
import { useStore } from '../store';
import { LogOut, User as UserIcon, Ticket, Heart, Home, Star } from 'lucide-react';
import { Button } from './UI';
import { Role } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useStore();

  const handleHomeClick = () => {
    if (user?.role === 'ADMIN') {
      window.location.hash = '#/admin';
    } else {
      window.location.hash = '#/events';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={handleHomeClick}>
              <div className="bg-gradient-to-tr from-purple-600 to-indigo-600 p-2 rounded-lg">
                <Star className="h-6 w-6 text-white fill-current" />
              </div>
              <span className="font-bold text-2xl tracking-tight text-slate-900">GalaPass</span>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <div className="hidden md:flex items-center gap-1">
                     {user.role === 'USER' && (
                       <>
                        <Button variant="ghost" size="sm" onClick={() => window.location.hash = '#/events'} icon={Home}>Home</Button>
                        <Button variant="ghost" size="sm" onClick={() => window.location.hash = '#/favorites'} icon={Heart}>Favorites</Button>
                        <Button variant="ghost" size="sm" onClick={() => window.location.hash = '#/my-tickets'} icon={Ticket}>My Tickets</Button>
                       </>
                     )}
                  </div>

                  <div className="flex items-center gap-3 border-l border-slate-200 pl-4 ml-2">
                    <div className="hidden md:flex flex-col items-end mr-2">
                       <span className="text-sm font-bold text-slate-800 leading-none">{user.name}</span>
                       <span className="text-xs text-slate-500">{user.role === 'ADMIN' ? 'Administrator' : 'Verified Member'}</span>
                    </div>
                    <div className="bg-indigo-100 p-2 rounded-full">
                       <UserIcon className="h-5 w-5 text-indigo-700" />
                    </div>
                    <Button variant="ghost" size="sm" onClick={logout} className="text-red-600 hover:bg-red-50 hover:text-red-700">
                      <LogOut className="h-5 w-5" />
                    </Button>
                  </div>
                </>
              ) : (
                 <div className="text-sm text-slate-500">Guest Access</div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
          <div className="mb-4 md:mb-0">
             <span className="font-bold text-slate-700">GalaPass</span> &copy; {new Date().getFullYear()}
          </div>
          <div className="flex gap-6">
            <span className="hover:text-slate-900 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-900 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-900 cursor-pointer">Help Center</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user } = useStore();

  useEffect(() => {
    if (!user) {
      window.location.hash = '#/';
    }
  }, [user]);

  if (!user) {
    return null;
  }

  if (!allowedRoles.includes(user.role)) {
     return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
           <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center max-w-md w-full">
             <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
               <LogOut className="h-6 w-6 text-red-600" />
             </div>
             <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
             <p className="text-slate-500 mb-6">You don't have the required permissions to view this page.</p>
             <Button className="w-full" onClick={() => window.location.hash = '#/'}>
               Go Back
             </Button>
           </div>
        </div>
     );
  }

  return <>{children}</>;
};
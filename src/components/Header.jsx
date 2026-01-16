import { Shield, Wrench, LogOut, User, LayoutDashboard, Package } from 'lucide-react';
import Button from './ui/Button';
import Badge from './ui/Badge';

const Header = ({ profile, onLogout, currentView, onViewChange }) => {
  return (
    <header className="bg-gray-950 shadow-sm border-b border-gray-800 sticky top-0 z-40 backdrop-blur-md bg-gray-950/80">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-black shadow-lg shadow-green-500/20">
              <Wrench className="w-6 h-6" />
            </div>
            <div className="hidden xs:block">
              <h1 className="text-lg font-bold text-white leading-tight">Maintenance</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold font-mono">SmartQuary EVR</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-6">
            {/* Desktop Navigation */}
            {profile && (
              <nav className="hidden md:flex items-center gap-1">
                <Button
                  variant={currentView === 'maintenance' ? 'secondary' : 'ghost'}
                  onClick={() => onViewChange('maintenance')}
                  size="sm"
                  className={currentView === 'maintenance' ? 'bg-gray-800 text-green-400' : ''}
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                {['admin', 'moderator'].includes(profile.role) && (
                  <Button
                    variant={currentView === 'equipment' ? 'secondary' : 'ghost'}
                    onClick={() => onViewChange('equipment')}
                    size="sm"
                    className={currentView === 'equipment' ? 'bg-gray-800 text-blue-400' : ''}
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Equipment
                  </Button>
                )}
                {['admin', 'moderator'].includes(profile.role) && (
                  <Button
                    variant={currentView === 'users' ? 'secondary' : 'ghost'}
                    onClick={() => onViewChange('users')}
                    size="sm"
                    className={currentView === 'users' ? 'bg-gray-800 text-purple-400' : ''}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Users
                  </Button>
                )}
              </nav>
            )}
          
            {profile && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-white leading-none">{profile.displayName}</p>
                    <div className="flex items-center justify-end gap-2 mt-1">
                      {['admin', 'moderator'].includes(profile.role) && (
                        <Badge variant="default" className="bg-purple-500/10 text-purple-400 border-purple-500/20 py-0 px-1.5 text-[10px]">
                          Admin
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="relative group">
                    <img
                      src={profile.pictureUrl}
                      alt={profile.displayName}
                      className="w-9 h-9 rounded-full border border-gray-700 ring-2 ring-transparent group-hover:ring-green-500/50 transition-all object-cover"
                      style={{ width: '36px', height: '36px', maxWidth: '36px', maxHeight: '36px' }}
                    />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-gray-950 rounded-full"></div>
                  </div>
                </div>
                
                <div className="h-6 w-px bg-gray-800 hidden sm:block"></div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onLogout}
                  className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 h-9 w-9"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {profile && (
          <nav className="md:hidden flex gap-2 mt-4 pt-3 border-t border-gray-900">
            <Button
              variant={currentView === 'maintenance' ? 'secondary' : 'ghost'}
              onClick={() => onViewChange('maintenance')}
              className={`flex-1 text-xs px-2 sm:text-sm ${currentView === 'maintenance' ? 'text-green-400' : ''}`}
              size="sm"
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Main
            </Button>
            {['admin', 'moderator'].includes(profile.role) && (
              <Button
                variant={currentView === 'equipment' ? 'secondary' : 'ghost'}
                onClick={() => onViewChange('equipment')}
                className={`flex-1 text-xs px-2 sm:text-sm ${currentView === 'equipment' ? 'text-blue-400' : ''}`}
                size="sm"
              >
                <Package className="w-4 h-4 mr-2" />
                Equipment
              </Button>
            )}
            {['admin', 'moderator'].includes(profile.role) && (
              <Button
                variant={currentView === 'users' ? 'secondary' : 'ghost'}
                onClick={() => onViewChange('users')}
                className={`flex-1 text-xs px-2 sm:text-sm ${currentView === 'users' ? 'text-purple-400' : ''}`}
                size="sm"
              >
                <Shield className="w-4 h-4 mr-2" />
                Users
              </Button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;

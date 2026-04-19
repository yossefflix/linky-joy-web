import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { Link2, BarChart3, LogOut, Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
            <Link2 className="w-4 h-4 text-primary-foreground" />
          </div>
          <span>SnipLink</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </Button>
              {isAdmin && (
                <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
                  <Shield className="w-4 h-4" />
                  Admin
                </Button>
              )}
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                Log in
              </Button>
              <Button variant="default" size="sm" onClick={() => navigate('/signup')}>
                Sign up free
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card p-4 space-y-2">
          {user ? (
            <>
              <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/dashboard'); setMobileOpen(false); }}>
                <BarChart3 className="w-4 h-4" /> Dashboard
              </Button>
              {isAdmin && (
                <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/admin'); setMobileOpen(false); }}>
                  <Shield className="w-4 h-4" /> Admin
                </Button>
              )}
              <Button variant="outline" className="w-full" onClick={handleLogout}>
                <LogOut className="w-4 h-4" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" className="w-full" onClick={() => { navigate('/login'); setMobileOpen(false); }}>Log in</Button>
              <Button variant="default" className="w-full" onClick={() => { navigate('/signup'); setMobileOpen(false); }}>Sign up free</Button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

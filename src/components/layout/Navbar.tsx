import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { 
  TrendingUp, 
  LogOut, 
  User, 
  LayoutDashboard, 
  Building2,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';

export function Navbar() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (role === 'admin') return '/admin';
    if (role === 'startup') return '/startup/dashboard';
    return '/investor/dashboard';
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="gradient-primary p-2 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">Investify</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/startups" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Browse Startups
            </Link>
            <Link 
              to="/sectors" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sectors
            </Link>
            <Link 
              to="/how-it-works" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </Link>
          </div>

          {/* Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="max-w-[100px] truncate">{user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate(getDashboardLink())}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  {role === 'startup' && (
                    <DropdownMenuItem onClick={() => navigate('/startup/profile')}>
                      <Building2 className="mr-2 h-4 w-4" />
                      My Startup
                    </DropdownMenuItem>
                  )}
                  {role === 'admin' && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/auth?mode=signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-3">
              <Link 
                to="/startups" 
                className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse Startups
              </Link>
              <Link 
                to="/sectors" 
                className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sectors
              </Link>
              <Link 
                to="/how-it-works" 
                className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              <div className="border-t border-border my-2" />
              {user ? (
                <>
                  <Link 
                    to={getDashboardLink()} 
                    className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button 
                    onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                    className="px-4 py-2 text-sm font-medium text-destructive hover:bg-muted rounded-md text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/auth" 
                    className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/auth?mode=signup" 
                    className="px-4 py-2 text-sm font-medium text-primary hover:bg-muted rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}


import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Database, BarChart2, Home, LogIn, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export interface NavbarProps {
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({ className }) => {
  // A small trick to not try to use useLocation at the top level which would cause an error
  // when we render this component in App.tsx outside of a Router context
  return <RouteAwareNavbar className={className} />;
};

// This component is only rendered when inside a Router context
const RouteAwareNavbar = ({ className }: NavbarProps) => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  return (
    <header className={cn("fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm border-b", className)}>
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="rounded-md bg-primary p-1.5">
              <Database className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">AI Reconcile</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-1">
            <Button asChild variant={location.pathname === "/" ? "secondary" : "ghost"} size="sm" className="gap-1.5">
              <Link to="/">
                <Home className="h-4 w-4" />
                Home
              </Link>
            </Button>
            <Button asChild variant={location.pathname === "/configure" ? "secondary" : "ghost"} size="sm" className="gap-1.5">
              <Link to="/configure">
                <Database className="h-4 w-4" />
                Configure
              </Link>
            </Button>
            <Button asChild variant={location.pathname === "/reconcile" ? "secondary" : "ghost"} size="sm" className="gap-1.5">
              <Link to="/reconcile">
                <BarChart2 className="h-4 w-4" />
                Reconcile
              </Link>
            </Button>
          </nav>
        </div>
        
        {/* Auth Actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <div className="hidden md:block text-sm mr-2">
                {user.email}
              </div>
              <Button variant="outline" size="sm" onClick={() => signOut()} className="gap-1.5">
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Sign Out</span>
              </Button>
            </>
          ) : (
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link to="/auth">
                <LogIn className="h-4 w-4" />
                <span className="hidden md:inline">Sign In</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

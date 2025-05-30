
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, User, LogIn, Building, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigation = [{
  name: "Home",
  path: "/"
}, {
  name: "Configure",
  path: "/configure"
}, {
  name: "History",
  path: "/history"
}, {
  name: "Configs",
  path: "/configs"
}];

const Navbar = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const {
    user,
    signOut,
    currentClient,
    availableClients,
    setCurrentClient
  } = useAuth();

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return <header className={cn("fixed top-0 left-0 right-0 z-40 transition-all duration-200", isScrolled ? "bg-background/80 backdrop-blur-md border-b py-3" : "bg-transparent py-5")}>
      <div className="container flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-semibold text-sm">TD</span>
          </div>
          <span className="font-bold text-lg">TD Reconcile</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navigation.map(item => <Button key={item.name} variant="ghost" size="sm" className={cn("px-3", location.pathname === item.path ? "bg-muted font-medium" : "text-muted-foreground hover:text-foreground")} asChild>
              <Link to={item.path}>{item.name}</Link>
            </Button>)}
          
          {/* Client selector - desktop */}
          {user && currentClient && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="ml-2">
                  <Building className="mr-2 h-4 w-4" />
                  {currentClient.name}
                  <ChevronDown className="ml-2 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Switch Client</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {availableClients.map(client => (
                  <DropdownMenuItem 
                    key={client.id}
                    onClick={() => setCurrentClient(client)}
                    className={cn(
                      client.id === currentClient?.id && "font-medium bg-muted"
                    )}
                  >
                    {client.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {/* Auth buttons */}
          {user ? <Button variant="outline" size="sm" className="ml-2" onClick={() => signOut()}>
              <User className="mr-2 h-4 w-4" />
              Sign Out
            </Button> : <Button variant="outline" size="sm" className="ml-2" asChild>
              <Link to="/auth">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Link>
            </Button>}
        </nav>

        {/* Mobile Navigation */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader className="text-left">
              <SheetTitle>AI Reconcile</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 mt-6">
              {navigation.map(item => <Button key={item.name} variant={location.pathname === item.path ? "secondary" : "ghost"} className="justify-start" asChild onClick={() => setIsSheetOpen(false)}>
                  <Link to={item.path}>{item.name}</Link>
                </Button>)}
              
              {/* Client selector - mobile */}
              {user && currentClient && (
                <div className="mt-4 border-t pt-4">
                  <div className="text-sm font-medium mb-2">Current Client</div>
                  {availableClients.map(client => (
                    <Button
                      key={client.id}
                      variant={client.id === currentClient?.id ? "secondary" : "ghost"}
                      size="sm"
                      className="justify-start w-full mb-1"
                      onClick={() => {
                        setCurrentClient(client);
                        setIsSheetOpen(false);
                      }}
                    >
                      <Building className="mr-2 h-4 w-4" />
                      {client.name}
                    </Button>
                  ))}
                </div>
              )}
              
              {/* Auth buttons for mobile */}
              {user ? <Button variant="outline" className="justify-start mt-2" onClick={() => {
              signOut();
              setIsSheetOpen(false);
            }}>
                  <User className="mr-2 h-4 w-4" />
                  Sign Out
                </Button> : <Button variant="outline" className="justify-start mt-2" asChild onClick={() => setIsSheetOpen(false)}>
                  <Link to="/auth">
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign In
                  </Link>
                </Button>}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>;
};
export default Navbar;

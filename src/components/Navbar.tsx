
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Home", path: "/" },
  { name: "Configure", path: "/configure" },
  { name: "Results", path: "/reconcile" },
  { name: "History", path: "/history" },
  { name: "Configs", path: "/configs" }
];

const Navbar = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={cn("fixed top-0 left-0 right-0 z-40 transition-all duration-200", isScrolled ? "bg-background/80 backdrop-blur-md border-b py-3" : "bg-transparent py-5")}>
      <div className="container flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-semibold text-sm">AI</span>
          </div>
          <span className="font-bold text-lg">TD Reconcile</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navigation.map(item => (
            <Button 
              key={item.name} 
              variant="ghost" 
              size="sm" 
              className={cn("px-3", location.pathname === item.path ? "bg-muted font-medium" : "text-muted-foreground hover:text-foreground")} 
              asChild
            >
              <Link to={item.path}>{item.name}</Link>
            </Button>
          ))}
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
              {navigation.map(item => (
                <Button 
                  key={item.name} 
                  variant={location.pathname === item.path ? "secondary" : "ghost"} 
                  className="justify-start" 
                  asChild 
                  onClick={() => setIsSheetOpen(false)}
                >
                  <Link to={item.path}>{item.name}</Link>
                </Button>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Navbar;

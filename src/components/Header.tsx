import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export const Header = () => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await signOut();
    
    if (!error) {
      toast({
        title: "Logged out successfully",
        description: "You have been signed out.",
      });
    } else {
      toast({
        title: "Logout failed", 
        description: "There was an error signing you out.",
        variant: "destructive",
      });
    }
    
    navigate("/");
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-glow rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">BB</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Best Bosses
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link
            to="/nominate"
            className="text-foreground hover:text-primary transition-colors font-medium"
          >
            Nominate
          </Link>
          <Link
            to="/directory"
            className="text-foreground hover:text-primary transition-colors font-medium"
          >
            Directory
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span className="text-sm text-muted-foreground">{user?.email}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <Button variant="default" size="sm" asChild>
              <Link to="/login">
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
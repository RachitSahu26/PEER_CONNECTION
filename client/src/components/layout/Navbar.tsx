import { Link } from "wouter";
import { Mic2, LogOut, User } from "lucide-react";
import { useUser, useLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { user } = useUser();
  const logout = useLogout();

  return (
    <nav className="border-b border-border/40 bg-background/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 group cursor-pointer">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Mic2 className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-glow-accent">VOX.CHAT</span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-mono text-muted-foreground">1,240 ONLINE</span>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-border overflow-hidden">
                      <span className="font-bold text-lg text-muted-foreground">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-card border-border/50">
                    <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                      <User className="w-4 h-4" />
                      <span>Reputation: {user.reputation}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
                      onClick={() => logout.mutate()}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login">
                  <Button variant="ghost" className="font-medium hover:text-primary">Log in</Button>
                </Link>
                <Link href="/register">
                  <Button className="font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Mic, Shield, Zap, Globe } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center relative overflow-hidden px-4">
        {/* Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 text-center max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Audio-Only • Anonymous • Secure</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tighter leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
            Speak Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Mind</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Connect instantly with strangers worldwide through high-quality audio calls. No video, no pressure. Just pure conversation.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <Link href="/register">
              <Button size="lg" className="h-14 px-8 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 transition-all">
                Start Talking Now
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg bg-transparent border-2 hover:bg-secondary/50">
                Login
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="py-24 px-4 border-t border-border/40 bg-secondary/20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Shield className="w-8 h-8 text-primary" />}
            title="Reputation System"
            description="Our community-driven rating system keeps the platform safe and enjoyable for everyone."
          />
          <FeatureCard 
            icon={<Zap className="w-8 h-8 text-accent" />}
            title="Instant Matching"
            description="Lightning-fast connection to users around the globe. No waiting rooms."
          />
          <FeatureCard 
            icon={<Mic className="w-8 h-8 text-blue-400" />}
            title="Crystal Clear Audio"
            description="High-fidelity WebRTC audio ensures you hear every nuance of the conversation."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border/40">
        <p>© 2024 Vox.Chat. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-colors group">
      <div className="mb-4 p-3 rounded-xl bg-background border border-border inline-block group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

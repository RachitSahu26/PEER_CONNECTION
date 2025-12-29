import { useEffect, useRef, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useUser } from "@/hooks/use-auth";
import { useWebRTC } from "@/hooks/use-webrtc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AudioVisualizer } from "@/components/AudioVisualizer";
import { FeedbackModal } from "@/components/FeedbackModal";
import { 
  Mic, 
  MicOff, 
  PhoneOff, 
  Search, 
  Loader2, 
  Wifi, 
  Volume2, 
  Clock, 
  User as UserIcon,
  Shield
} from "lucide-react";

export default function Dashboard() {
  const { user, isLoading: userLoading } = useUser();
  const { 
    connectionState, 
    startSearching, 
    stopSearching, 
    endCall, 
    toggleMute, 
    isMuted, 
    partnerStream,
    partnerId
  } = useWebRTC();

  const [callDuration, setCallDuration] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const durationInterval = useRef<NodeJS.Timeout>();
  
  // Handle remote stream
  useEffect(() => {
    if (audioRef.current && partnerStream) {
      audioRef.current.srcObject = partnerStream;
      audioRef.current.play().catch(console.error);
    }
  }, [partnerStream]);

  // Handle call timer
  useEffect(() => {
    if (connectionState === "connected") {
      const startTime = Date.now();
      durationInterval.current = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
      setCallDuration(0);
      
      // Show feedback if call just ended and we had a partner
      if (partnerId) {
        setShowFeedback(true);
      }
    }
    return () => clearInterval(durationInterval.current);
  }, [connectionState, partnerId]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    window.location.href = "/login";
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container max-w-5xl mx-auto p-4 flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
        
        {/* Hidden Audio Element */}
        <audio ref={audioRef} autoPlay />

        {/* Dashboard Content */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <StatCard 
            icon={<UserIcon className="w-5 h-5 text-primary" />}
            label="Your Reputation"
            value={user.reputation.toString()}
            subtext={user.reputation > 90 ? "Excellent Standing" : "Good Standing"}
          />
          <StatCard 
            icon={<Shield className="w-5 h-5 text-accent" />}
            label="Account Status"
            value={user.isPremium ? "Premium" : "Standard"}
            subtext={user.isPremium ? "Priority Matching Active" : "Upgrade for faster matching"}
            action={!user.isPremium && <Button variant="link" className="text-accent p-0 h-auto">Upgrade</Button>}
          />
          <StatCard 
            icon={<Clock className="w-5 h-5 text-blue-400" />}
            label="Last Session"
            value="2m 14s"
            subtext="Yesterday"
          />
        </div>

        {/* Call Interface */}
        <Card className="w-full max-w-2xl bg-card/50 backdrop-blur-xl border-border/50 shadow-2xl overflow-hidden relative min-h-[400px] flex flex-col">
          {/* Status Bar */}
          <div className="p-4 border-b border-border/40 flex justify-between items-center bg-secondary/20">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${
                connectionState === "connected" ? "bg-green-500 animate-pulse" :
                connectionState === "searching" ? "bg-yellow-500 animate-bounce" :
                "bg-muted-foreground"
              }`} />
              <span className="font-mono text-sm uppercase text-muted-foreground">
                {connectionState === "idle" && "Ready to connect"}
                {connectionState === "searching" && "Searching for partner..."}
                {connectionState === "connecting" && "Connecting..."}
                {connectionState === "connected" && "Connected"}
              </span>
            </div>
            {connectionState === "connected" && (
              <div className="font-mono font-bold text-primary">
                {formatDuration(callDuration)}
              </div>
            )}
          </div>

          {/* Main Visualization Area */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 relative">
            {/* Background Pulse Effect */}
            {connectionState === "searching" && (
              <>
                <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                <div className="w-32 h-32 rounded-full border-4 border-primary/20 animate-ping absolute" />
              </>
            )}

            {connectionState === "idle" && (
              <div className="text-center space-y-6">
                <div className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center mx-auto border-4 border-border shadow-inner">
                  <Mic className="w-12 h-12 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Ready to talk?</h2>
                  <p className="text-muted-foreground">Click the button below to find a random partner.</p>
                </div>
              </div>
            )}

            {connectionState === "searching" && (
              <div className="text-center space-y-6">
                <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto" />
                <h2 className="text-xl font-bold">Looking for someone...</h2>
              </div>
            )}

            {connectionState === "connected" && (
              <div className="w-full space-y-12">
                {/* Partner Visualization */}
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 rounded-full bg-accent/10 border-2 border-accent/50 flex items-center justify-center mx-auto shadow-lg shadow-accent/20">
                    <UserIcon className="w-10 h-10 text-accent" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg">Anonymous Partner</h3>
                    <div className="flex justify-center">
                      <AudioVisualizer isActive={true} />
                    </div>
                  </div>
                </div>

                {/* Local User Visualization (Smaller) */}
                <div className="flex items-center justify-center gap-4 opacity-50">
                  <span className="text-sm font-medium">You</span>
                  <div className="h-1 w-16 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full bg-primary transition-all duration-100 ${isMuted ? 'w-0' : 'w-2/3 animate-pulse'}`} />
                  </div>
                  {isMuted && <MicOff className="w-4 h-4 text-destructive" />}
                </div>
              </div>
            )}
          </div>

          {/* Controls Bar */}
          <div className="p-6 bg-secondary/30 backdrop-blur-md border-t border-border/40 flex justify-center gap-6">
            {connectionState === "idle" ? (
              <Button 
                size="lg" 
                className="w-full max-w-sm h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 rounded-xl"
                onClick={startSearching}
              >
                <Search className="w-5 h-5 mr-2" />
                Find Partner
              </Button>
            ) : connectionState === "searching" ? (
              <Button 
                size="lg" 
                variant="secondary"
                className="w-full max-w-sm h-14 text-lg font-bold rounded-xl"
                onClick={stopSearching}
              >
                Cancel Search
              </Button>
            ) : (
              <>
                <Button
                  size="icon"
                  variant={isMuted ? "destructive" : "secondary"}
                  className="w-14 h-14 rounded-full shadow-lg"
                  onClick={toggleMute}
                >
                  {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </Button>
                
                <Button
                  size="icon"
                  className="w-14 h-14 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg shadow-destructive/20"
                  onClick={endCall}
                >
                  <PhoneOff className="w-6 h-6" />
                </Button>
              </>
            )}
          </div>
        </Card>
      </main>
      
      {/* Feedback Modal */}
      {partnerId && (
        <FeedbackModal 
          isOpen={showFeedback} 
          onClose={() => setShowFeedback(false)} 
          partnerId={parseInt(partnerId)} // Assuming partnerId can be parsed or is handled
        />
      )}
    </div>
  );
}

function StatCard({ icon, label, value, subtext, action }: any) {
  return (
    <Card className="bg-card/50 border-border/50 p-4 flex flex-col gap-2 hover:border-primary/30 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-secondary">
            {icon}
          </div>
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
        </div>
        {action}
      </div>
      <div className="mt-2">
        <div className="text-2xl font-display font-bold">{value}</div>
        <div className="text-xs text-muted-foreground">{subtext}</div>
      </div>
    </Card>
  );
}

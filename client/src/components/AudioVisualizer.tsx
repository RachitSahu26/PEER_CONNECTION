import { useEffect, useRef } from "react";

export function AudioVisualizer({ isActive }: { isActive: boolean }) {
  if (!isActive) {
    return (
      <div className="flex items-center justify-center gap-1 h-12">
        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-1.5 h-12">
      <div className="w-2 bg-primary/80 rounded-full audio-bar" style={{ animationDuration: '0.8s' }} />
      <div className="w-2 bg-primary/90 rounded-full audio-bar" style={{ animationDuration: '1.2s' }} />
      <div className="w-2 bg-primary rounded-full audio-bar" style={{ animationDuration: '0.5s' }} />
      <div className="w-2 bg-primary/90 rounded-full audio-bar" style={{ animationDuration: '1.0s' }} />
      <div className="w-2 bg-primary/80 rounded-full audio-bar" style={{ animationDuration: '0.7s' }} />
    </div>
  );
}

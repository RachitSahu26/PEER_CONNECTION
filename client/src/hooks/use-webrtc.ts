import { useEffect, useRef, useState, useCallback } from "react";
import io, { Socket } from "socket.io-client";
import SimplePeer, { Instance as PeerInstance } from "simple-peer";
import { WS_EVENTS, type SignalPayload } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// Polyfill for simple-peer in Vite environment
import * as process from "process";
window.global = window;
window.process = process;
window.Buffer = window.Buffer || [];

type ConnectionState = "idle" | "searching" | "connecting" | "connected";

export function useWebRTC() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>("idle");
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [partnerStream, setPartnerStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  
  const peerRef = useRef<PeerInstance | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const userStreamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  // Initialize Socket
  useEffect(() => {
    const newSocket = io(window.location.origin, {
      path: "/socket.io",
    });

    newSocket.on(WS_EVENTS.CONNECT, () => {
      console.log("Connected to signaling server");
    });

    newSocket.on(WS_EVENTS.MATCH_FOUND, ({ partnerId, initiator }) => {
      console.log("Match found:", partnerId, "Am initiator:", initiator);
      setPartnerId(partnerId);
      setConnectionState("connecting");
      initializePeer(newSocket, partnerId, initiator, userStreamRef.current);
    });

    newSocket.on(WS_EVENTS.SIGNAL, ({ data }: SignalPayload) => {
      peerRef.current?.signal(data);
    });

    newSocket.on(WS_EVENTS.PARTNER_DISCONNECTED, () => {
      toast({
        title: "Partner Disconnected",
        description: "The other user left the chat.",
        variant: "destructive",
      });
      cleanupCall();
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      cleanupCall();
    };
  }, []);

  // Initialize Media Stream
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .then((currentStream) => {
        setStream(currentStream);
        userStreamRef.current = currentStream;
      })
      .catch((err) => {
        console.error("Failed to get user media", err);
        toast({
          title: "Microphone Access Denied",
          description: "Please allow microphone access to use the app.",
          variant: "destructive",
        });
      });

    return () => {
      userStreamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const initializePeer = (socket: Socket, partnerId: string, initiator: boolean, stream: MediaStream | null) => {
    const peer = new SimplePeer({
      initiator,
      trickle: false,
      stream: stream || undefined,
    });

    peer.on("signal", (data) => {
      socket.emit(WS_EVENTS.SIGNAL, {
        to: partnerId,
        type: "signal",
        data,
      });
    });

    peer.on("stream", (remoteStream) => {
      console.log("Received remote stream");
      setPartnerStream(remoteStream);
      setConnectionState("connected");
    });

    peer.on("error", (err) => {
      console.error("Peer connection error:", err);
      cleanupCall();
    });

    peer.on("close", () => {
      cleanupCall();
    });

    peerRef.current = peer;
  };

  const cleanupCall = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    setPartnerStream(null);
    setPartnerId(null);
    setConnectionState("idle");
    // Don't stop user media stream, keep it ready for next call
  }, []);

  const startSearching = () => {
    if (!socketRef.current) return;
    setConnectionState("searching");
    socketRef.current.emit(WS_EVENTS.JOIN_QUEUE);
  };

  const stopSearching = () => {
    if (!socketRef.current) return;
    socketRef.current.emit(WS_EVENTS.LEAVE_QUEUE);
    setConnectionState("idle");
  };

  const endCall = () => {
    if (partnerId && socketRef.current) {
      socketRef.current.emit(WS_EVENTS.PARTNER_DISCONNECTED, { to: partnerId });
    }
    cleanupCall();
  };

  const toggleMute = () => {
    if (userStreamRef.current) {
      userStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  return {
    connectionState,
    startSearching,
    stopSearching,
    endCall,
    toggleMute,
    isMuted,
    partnerStream,
    partnerId,
    socket
  };
}

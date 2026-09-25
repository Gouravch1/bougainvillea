"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Client, IMessage } from "@stomp/stompjs";

export type SyncActionType =
  | "PLAY"
  | "PAUSE"
  | "SEEK"
  | "SPEED_CHANGE"
  | "SYNC_REQUEST"
  | "SYNC_RESPONSE";

export interface SyncMessage {
  action: SyncActionType;
  currentTime: number;
  playbackRate?: number;
  sender: string;
  timestamp: number;
}

export interface ChatMessage {
  sender: string;
  content: string;
  type: "CHAT" | "JOIN" | "LEAVE";
  timestamp: number;
}

interface UseRoomSocketOptions {
  roomCode: string;
  username: string;
  onSyncMessage?: (message: SyncMessage) => void;
  onChatMessage?: (message: ChatMessage) => void;
}

function getWebSocketUrl(): string {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:8080");

  try {
    const url = new URL(apiUrl);
    const protocol = url.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${url.host}/ws`;
  } catch {
    return "ws://localhost:8080/ws";
  }
}

export function useRoomSocket({
  roomCode,
  username,
  onSyncMessage,
  onChatMessage,
}: UseRoomSocketOptions) {
  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Keep latest callbacks in refs to avoid reconnection loops when handlers change
  const onSyncMessageRef = useRef(onSyncMessage);
  const onChatMessageRef = useRef(onChatMessage);

  useEffect(() => {
    onSyncMessageRef.current = onSyncMessage;
  }, [onSyncMessage]);

  useEffect(() => {
    onChatMessageRef.current = onChatMessage;
  }, [onChatMessage]);

  useEffect(() => {
    if (!roomCode) return;

    const brokerURL = getWebSocketUrl();
    console.log(`[WebSocket] Connecting to ${brokerURL} for room ${roomCode}...`);

    const client = new Client({
      brokerURL,
      reconnectDelay: 4000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        console.log(`[WebSocket] Connected successfully to room: ${roomCode}`);
        setIsConnected(true);

        // 1. Subscribe to playback synchronization
        client.subscribe(`/topic/room/${roomCode}/sync`, (message: IMessage) => {
          try {
            const parsed: SyncMessage = JSON.parse(message.body);
            if (onSyncMessageRef.current) {
              onSyncMessageRef.current(parsed);
            }
          } catch (err) {
            console.error("[WebSocket] Failed to parse sync message:", err);
          }
        });

        // 2. Subscribe to room live chat
        client.subscribe(`/topic/room/${roomCode}/chat`, (message: IMessage) => {
          try {
            const parsed: ChatMessage = JSON.parse(message.body);
            if (onChatMessageRef.current) {
              onChatMessageRef.current(parsed);
            }
          } catch (err) {
            console.error("[WebSocket] Failed to parse chat message:", err);
          }
        });

        // 3. Send initial sync request so new participants catch up with the host
        client.publish({
          destination: `/app/room/${roomCode}/sync`,
          body: JSON.stringify({
            action: "SYNC_REQUEST",
            currentTime: 0,
            playbackRate: 1.0,
            sender: username,
            timestamp: Date.now(),
          }),
        });
      },
      onDisconnect: () => {
        console.log("[WebSocket] Disconnected");
        setIsConnected(false);
      },
      onStompError: (frame) => {
        console.error("[WebSocket] STOMP Error:", frame.headers["message"], frame.body);
      },
      onWebSocketError: (event) => {
        console.warn("[WebSocket] Socket Error (will auto-reconnect):", event);
        setIsConnected(false);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      console.log(`[WebSocket] Deactivating socket for room ${roomCode}`);
      client.deactivate();
      clientRef.current = null;
      setIsConnected(false);
    };
  }, [roomCode, username]);

  // Publish video sync event
  const sendSyncAction = useCallback(
    (action: SyncActionType, currentTime: number, playbackRate = 1.0) => {
      if (!clientRef.current || !clientRef.current.connected) {
        console.warn("[WebSocket] Cannot send sync action: socket not connected.");
        return;
      }

      const payload: SyncMessage = {
        action,
        currentTime,
        playbackRate,
        sender: username,
        timestamp: Date.now(),
      };

      clientRef.current.publish({
        destination: `/app/room/${roomCode}/sync`,
        body: JSON.stringify(payload),
      });
    },
    [roomCode, username]
  );

  // Publish live chat message
  const sendChatMessage = useCallback(
    (content: string) => {
      if (!clientRef.current || !clientRef.current.connected) {
        console.warn("[WebSocket] Cannot send chat message: socket not connected.");
        return;
      }

      const payload: ChatMessage = {
        sender: username,
        content,
        type: "CHAT",
        timestamp: Date.now(),
      };

      clientRef.current.publish({
        destination: `/app/room/${roomCode}/chat`,
        body: JSON.stringify(payload),
      });
    },
    [roomCode, username]
  );

  return {
    isConnected,
    sendSyncAction,
    sendChatMessage,
  };
}

"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  Trash2,
  Film,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  AlertCircle,
  RotateCcw,
  Crown,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { SyncActionType, SyncMessage } from "@/hooks/use-room-socket";

interface VideoPlayerProps {
  roomCode: string;
  videoUrl: string | null;
  videoKey: string | null;
  isOwner: boolean;
  onVideoUpdated: () => void;
  sendSyncAction?: (action: SyncActionType, currentTime: number, playbackRate?: number) => void;
  syncMessage?: SyncMessage | null;
  isConnected?: boolean;
  currentUsername?: string;
}

export const VideoPlayer = React.memo(function VideoPlayer({
  roomCode,
  videoUrl,
  videoKey,
  isOwner,
  onVideoUpdated,
  sendSyncAction,
  syncMessage,
  isConnected = false,
  currentUsername,
}: VideoPlayerProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Flag to suppress echoing events that were initiated remotely via WebSocket
  const isRemoteActionRef = useRef(false);

  // Listen to remote WebSocket sync messages
  useEffect(() => {
    if (!syncMessage || !videoRef.current) return;

    // Suppress local echo
    if (syncMessage.sender && syncMessage.sender === currentUsername) {
      return;
    }

    isRemoteActionRef.current = true;

    switch (syncMessage.action) {
      case "PLAY": {
        const latency = Math.max(0, (Date.now() - syncMessage.timestamp) / 1000);
        const expectedTime = syncMessage.currentTime + latency;
        if (Math.abs(videoRef.current.currentTime - expectedTime) > 0.4) {
          videoRef.current.currentTime = expectedTime;
        }
        videoRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            console.warn("[VideoPlayer] Autoplay prevented, requires user interaction.");
          });
        break;
      }
      case "PAUSE": {
        videoRef.current.pause();
        videoRef.current.currentTime = syncMessage.currentTime;
        setIsPlaying(false);
        break;
      }
      case "SEEK": {
        videoRef.current.currentTime = syncMessage.currentTime;
        setCurrentTime(syncMessage.currentTime);
        break;
      }
      case "SPEED_CHANGE": {
        if (syncMessage.playbackRate) {
          videoRef.current.playbackRate = syncMessage.playbackRate;
        }
        break;
      }
      case "SYNC_REQUEST": {
        // If we are the host and someone joins asking for state, broadcast our current state
        if (isOwner && sendSyncAction && videoRef.current) {
          sendSyncAction(
            videoRef.current.paused ? "PAUSE" : "PLAY",
            videoRef.current.currentTime,
            videoRef.current.playbackRate
          );
        }
        break;
      }
      case "SYNC_RESPONSE": {
        if (!isOwner && videoRef.current) {
          const latency = Math.max(0, (Date.now() - syncMessage.timestamp) / 1000);
          videoRef.current.currentTime = syncMessage.currentTime + latency;
        }
        break;
      }
    }

    const timer = setTimeout(() => {
      isRemoteActionRef.current = false;
    }, 250);

    return () => clearTimeout(timer);
  }, [syncMessage, isOwner, currentUsername, sendSyncAction]);

  // Handle keyboard shortcut (Space to toggle play) - Owner only
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === "Space" && videoUrl) {
        e.preventDefault();
        if (isOwner) {
          togglePlay();
        } else {
          toast.info("Only the host can control playback.");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, videoUrl, isOwner]);

  const togglePlay = () => {
    if (!isOwner) {
      toast.info("Only the host can play or pause the film.");
      return;
    }
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          sendSyncAction?.("PLAY", videoRef.current?.currentTime || 0);
        })
        .catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      sendSyncAction?.("PAUSE", videoRef.current.currentTime || 0);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isOwner) {
      toast.info("Only the host can seek the film.");
      return;
    }
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      sendSyncAction?.("SEEK", time);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Activity timer to hide controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 2800);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024 * 1024) {
      setError("File is too large. Please upload a video under 500MB.");
      return;
    }

    setError(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      // STEP 1: Get a presigned PUT URL from backend
      const { videoKey, videoUrl: presignedUploadUrl } = await api.video.getUploadUrl(
        roomCode,
        file.name,
        file.type || "video/mp4"
      );

      // STEP 2: Upload directly to R2 with real progress tracking via XHR
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", presignedUploadUrl);
        xhr.setRequestHeader("Content-Type", file.type || "video/mp4");

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const pct = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(pct);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload to R2 failed: ${xhr.status}`));
        };
        xhr.onerror = () => reject(new Error("Network error during upload."));
        xhr.send(file);
      });

      // STEP 3: Tell backend the upload is done — save fileKey to DB
      await api.video.confirmUpload(roomCode, videoKey);

      setUploadProgress(100);
      toast.success("Film uploaded successfully!");
      onVideoUpdated();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload video.";
      setError(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };


  const handleDeleteVideo = async () => {
    if (!confirm("Are you sure you want to remove the current film from the room?")) return;
    setDeleting(true);
    try {
      await api.video.delete(roomCode);
      toast.success("Video deleted from room.");
      onVideoUpdated();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete video";
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {/* Cinema Screen Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
        className="group relative aspect-video w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-[#163a5c]/25 bg-[#07131e] shadow-2xl select-none"
      >
        {videoUrl ? (
          <div className="relative h-full w-full">
            <video
              ref={videoRef}
              src={videoUrl}
              playsInline
              preload="auto"
              onClick={isOwner ? togglePlay : undefined}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => {
                setIsPlaying(true);
                if (!isRemoteActionRef.current && isOwner) {
                  sendSyncAction?.("PLAY", videoRef.current?.currentTime || 0);
                }
              }}
              onPause={() => {
                setIsPlaying(false);
                if (!isRemoteActionRef.current && isOwner) {
                  sendSyncAction?.("PAUSE", videoRef.current?.currentTime || 0);
                }
              }}
              onEnded={() => setIsPlaying(false)}
              className={`h-full w-full object-contain ${isOwner ? "cursor-pointer" : "cursor-default"}`}
            />

            {/* Big Center Play/Pause Overlay Animation (Host only) */}
            {(!isPlaying || showControls) && isOwner && (
              <div
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/25 cursor-pointer transition-opacity duration-300"
              >
                <div className="grid size-14 sm:size-18 place-items-center rounded-full bg-[#a83f68]/90 text-white shadow-2xl backdrop-blur-md transition-transform hover:scale-110">
                  {isPlaying ? (
                    <Pause size={24} className="sm:size-7" />
                  ) : (
                    <Play size={24} className="sm:size-7 ml-1" fill="currentColor" />
                  )}
                </div>
              </div>
            )}

            {/* Viewer Paused State Overlay */}
            {!isPlaying && !isOwner && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none transition-opacity duration-300">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/75 px-4 py-2 text-xs font-semibold text-white/90 backdrop-blur-md shadow-2xl">
                  <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
                  Paused by Host
                </div>
              </div>
            )}

            {/* Custom Cinema Control Bar */}
            <div
              className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 sm:p-4 text-white transition-opacity duration-300 ${
                showControls || !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              {/* Progress Slider */}
              <div className="relative flex items-center mb-2 group/progress">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={currentTime}
                  disabled={!isOwner}
                  onChange={handleSeek}
                  className={`w-full h-1 sm:h-1.5 rounded-lg appearance-none transition-all ${
                    isOwner
                      ? "bg-white/30 cursor-pointer accent-[#a83f68] hover:h-2"
                      : "bg-white/20 cursor-default accent-white/40 opacity-75"
                  }`}
                  title={isOwner ? "Seek film" : "Only host can seek"}
                />
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Play / Pause button or Host Controls indicator */}
                  {isOwner ? (
                    <button
                      onClick={togglePlay}
                      className="grid size-8 place-items-center rounded-lg hover:bg-white/10 text-white transition"
                      title={isPlaying ? "Pause (Space)" : "Play (Space)"}
                    >
                      {isPlaying ? <Pause size={17} /> : <Play size={17} fill="currentColor" />}
                    </button>
                  ) : (
                    <div
                      className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-medium text-white/80"
                      title="Only the host controls playback"
                    >
                      <Crown size={12} className="text-amber-400 shrink-0" />
                      <span>Host controls</span>
                    </div>
                  )}

                  {/* Volume / Mute */}
                  <div className="flex items-center gap-1.5 group/vol">
                    <button
                      onClick={toggleMute}
                      className="grid size-8 place-items-center rounded-lg hover:bg-white/10 text-white transition"
                      title={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="hidden sm:block w-14 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-[#a83f68]"
                    />
                  </div>

                  {/* Time display */}
                  <span className="text-[10px] sm:text-xs font-mono text-white/80">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  {/* Fullscreen */}
                  <button
                    onClick={toggleFullscreen}
                    className="grid size-8 place-items-center rounded-lg hover:bg-white/10 text-white transition"
                    title="Fullscreen"
                  >
                    <Maximize size={17} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Screen State */
          <div className="flex h-full w-full flex-col items-center justify-center p-4 sm:p-8 text-center text-[#f2efe7]">
            <div className="pointer-events-none absolute inset-0 bg-radial from-[#a83f68]/15 via-transparent to-transparent" />

            {isOwner ? (
              /* Owner Upload Prompt */
              <div className="relative z-10 flex max-w-sm sm:max-w-md flex-col items-center">
                <div className="grid size-12 sm:size-16 place-items-center rounded-2xl border border-[#a83f68]/40 bg-[#a83f68]/20 text-[#d77991] shadow-inner mb-3 sm:mb-4">
                  <Film size={22} className="sm:size-7" />
                </div>
                <h3 className="font-cormorant text-2xl sm:text-3xl font-bold">The Screen is Dark</h3>
                <p className="mt-1 text-xs text-[#f2efe7]/70 max-w-xs">
                  Upload a film to begin streaming to everyone in the room simultaneously.
                </p>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="video/mp4,video/webm,video/quicktime,video/mkv,video/*"
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="mt-4 sm:mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#a83f68] to-[#be557e] px-4 sm:px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg transition hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  <Upload size={14} />
                  {uploading ? `Uploading (${uploadProgress ?? 0}%)...` : "Upload Film (MP4 / WebM)"}
                </button>
                <span className="mt-2 text-[10px] text-[#f2efe7]/50">Max limit: 500 MB</span>
              </div>
            ) : (
              /* Guest Waiting State */
              <div className="relative z-10 flex max-w-sm flex-col items-center">
                <div className="grid size-12 sm:size-14 place-items-center rounded-2xl border border-white/10 bg-white/5 text-white/60 mb-3">
                  <Film size={24} />
                </div>
                <h3 className="font-cormorant text-xl sm:text-2xl font-bold">Awaiting Host Broadcast</h3>
                <p className="mt-1 text-xs text-[#f2efe7]/60">
                  The room host has not queued a film yet. Sit back with your snacks!
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Owner Film Controls bar under the screen */}
      {isOwner && videoUrl && (
        <div className="flex items-center justify-between rounded-2xl border border-[#163a5c]/10 bg-white/60 p-2.5 sm:p-3 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-2 min-w-0">
            <span className="grid size-7 place-items-center rounded-lg bg-[#a83f68]/15 text-[#a83f68] shrink-0">
              <Film size={14} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#163a5c] truncate">
                Film Loaded & Ready
              </p>
              <p className="text-[10px] text-[#163a5c]/60 truncate font-mono">
                {videoKey || "Stream active"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="video/mp4,video/webm,video/quicktime,video/mkv,video/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#163a5c]/20 bg-white px-3 py-1.5 text-xs font-semibold text-[#163a5c] shadow-sm hover:bg-[#163a5c]/5 transition disabled:opacity-50"
            >
              <RotateCcw size={12} />
              <span className="hidden sm:inline">Replace</span>
            </button>
            <button
              onClick={handleDeleteVideo}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition disabled:opacity-50"
            >
              <Trash2 size={12} />
              <span className="hidden sm:inline">Remove</span>
            </button>
          </div>
        </div>
      )}

      {/* Error alert if upload fails */}
      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          <AlertCircle size={15} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
});

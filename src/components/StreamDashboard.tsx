import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { Avatar } from "./Avatar";
import { ChatPanel } from "./ChatPanel";
import { OverlayControls } from "./OverlayControls";
import { AlertsPanel } from "./AlertsPanel";
import { Toast } from "./Toast";

export function StreamDashboard() {
  const { signOut } = useAuthActions();
  const stream = useQuery(api.streams.get);
  const createStream = useMutation(api.streams.create);
  const goLive = useMutation(api.streams.goLive);
  const endStream = useMutation(api.streams.endStream);
  const simulateViewers = useMutation(api.streams.simulateViewers);
  const simulateMessage = useMutation(api.chat.simulateViewerMessage);
  const simulateAlert = useMutation(api.alerts.simulateAlert);

  const [title, setTitle] = useState("My Awesome Stream");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [mobileTab, setMobileTab] = useState<"avatar" | "chat" | "controls">("avatar");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [avatarMood, setAvatarMood] = useState("neutral");

  // Initialize stream
  useEffect(() => {
    if (stream === null) {
      createStream({ title: "My Awesome Stream" });
    }
  }, [stream, createStream]);

  // Simulate activity when live
  useEffect(() => {
    if (!stream?.isLive) return;

    const viewerInterval = setInterval(() => {
      simulateViewers({ streamId: stream._id });
    }, 5000);

    const chatInterval = setInterval(() => {
      if (Math.random() > 0.5) {
        simulateMessage({ streamId: stream._id });
      }
    }, 3000);

    const alertInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        simulateAlert({ streamId: stream._id });
      }
    }, 10000);

    return () => {
      clearInterval(viewerInterval);
      clearInterval(chatInterval);
      clearInterval(alertInterval);
    };
  }, [stream?.isLive, stream?._id, simulateViewers, simulateMessage, simulateAlert]);

  const handleGoLive = async () => {
    if (!stream) return;
    try {
      await goLive({ streamId: stream._id });
      setToast({ message: "Stream started! You are now LIVE", type: "success" });
    } catch {
      setToast({ message: "Failed to start stream", type: "error" });
    }
  };

  const handleEndStream = async () => {
    if (!stream) return;
    try {
      await endStream({ streamId: stream._id });
      setToast({ message: "Stream ended", type: "success" });
    } catch {
      setToast({ message: "Failed to end stream", type: "error" });
    }
  };

  if (stream === undefined) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="glitch-loader">
          <div className="loader-bar"></div>
          <div className="loader-bar"></div>
          <div className="loader-bar"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg grid-overlay scanlines">
      {/* Header */}
      <header className="glass-panel border-b border-glass-border sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-display text-xl md:text-2xl font-bold text-cyan">
              VTUBE<span className="text-magenta">R</span>
            </h1>
            {stream?.isLive && (
              <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 rounded-full">
                <div className="live-indicator" />
                <span className="text-xs font-bold text-red-500 tracking-wider">LIVE</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {stream?.isLive && (
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <svg className="w-4 h-4 text-cyan" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                <span className="text-cyan font-bold">{stream.viewerCount.toLocaleString()}</span>
              </div>
            )}
            <button
              onClick={() => signOut()}
              className="cyber-btn text-text-muted hover:text-cyan text-xs rounded px-3 py-2"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Stream Title Bar */}
      <div className="glass-panel border-b border-glass-border">
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="cyber-input rounded flex-1 text-sm"
            placeholder="Stream Title..."
          />
          <div className="flex gap-2 w-full sm:w-auto">
            {!stream?.isLive ? (
              <button
                onClick={handleGoLive}
                className="cyber-btn cyber-btn-lime rounded flex-1 sm:flex-none flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                GO LIVE
              </button>
            ) : (
              <button
                onClick={handleEndStream}
                className="cyber-btn cyber-btn-magenta rounded flex-1 sm:flex-none flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
                END STREAM
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="lg:hidden flex border-b border-glass-border">
        {[
          { id: "avatar" as const, label: "Avatar", icon: "👤" },
          { id: "chat" as const, label: "Chat", icon: "💬" },
          { id: "controls" as const, label: "Controls", icon: "⚙️" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMobileTab(tab.id)}
            className={`flex-1 py-3 text-xs tracking-wider transition-colors ${
              mobileTab === tab.id
                ? "text-cyan border-b-2 border-cyan bg-cyan/5"
                : "text-text-muted hover:text-text"
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <main className="max-w-screen-2xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Avatar Section */}
          <div className={`lg:col-span-5 ${mobileTab !== "avatar" ? "hidden lg:block" : ""}`}>
            <div className="glass-panel corner-decor p-4 h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-sm tracking-wider text-cyan">AVATAR</h2>
                <span className={`text-xs uppercase tracking-wider mood-${avatarMood}`}>
                  {avatarMood}
                </span>
              </div>
              <Avatar
                mood={avatarMood}
                isSpeaking={isSpeaking}
                onMoodChange={setAvatarMood}
              />
            </div>
          </div>

          {/* Chat Section */}
          <div className={`lg:col-span-4 ${mobileTab !== "chat" ? "hidden lg:block" : ""}`}>
            {stream && (
              <ChatPanel
                streamId={stream._id}
                onSpeakingChange={setIsSpeaking}
                onMoodChange={setAvatarMood}
                setToast={setToast}
              />
            )}
          </div>

          {/* Controls Section */}
          <div className={`lg:col-span-3 space-y-4 ${mobileTab !== "controls" ? "hidden lg:block" : ""}`}>
            {stream && (
              <>
                <OverlayControls
                  streamId={stream._id}
                  settings={stream.overlaySettings}
                  setToast={setToast}
                />
                <AlertsPanel streamId={stream._id} />
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-4 text-center">
        <p className="text-text-muted/40 text-xs">
          Requested by @luhgoat223 · Built by @clonkbot
        </p>
      </footer>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

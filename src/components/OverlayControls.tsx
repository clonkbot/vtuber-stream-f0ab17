import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface OverlaySettings {
  showChat: boolean;
  showAlerts: boolean;
  chatPosition: string;
  theme: string;
}

interface OverlayControlsProps {
  streamId: Id<"streams">;
  settings: OverlaySettings;
  setToast: (toast: { message: string; type: "success" | "error" } | null) => void;
}

export function OverlayControls({ streamId, settings, setToast }: OverlayControlsProps) {
  const updateOverlay = useMutation(api.streams.updateOverlay);

  const handleToggle = async (key: keyof OverlaySettings, value: boolean | string) => {
    try {
      await updateOverlay({
        streamId,
        settings: {
          ...settings,
          [key]: value,
        },
      });
    } catch {
      setToast({ message: "Failed to update overlay", type: "error" });
    }
  };

  return (
    <div className="glass-panel corner-decor p-4">
      <h2 className="font-display text-sm tracking-wider text-cyan mb-4">OVERLAY CONTROLS</h2>

      <div className="space-y-4">
        {/* Toggle Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text">Show Chat Overlay</span>
            <button
              onClick={() => handleToggle("showChat", !settings.showChat)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                settings.showChat ? "bg-cyan" : "bg-void-lighter border border-glass-border"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.showChat ? "right-1" : "left-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-text">Show Alert Popups</span>
            <button
              onClick={() => handleToggle("showAlerts", !settings.showAlerts)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                settings.showAlerts ? "bg-magenta" : "bg-void-lighter border border-glass-border"
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.showAlerts ? "right-1" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Chat Position */}
        <div>
          <label className="block text-xs text-text-muted mb-2 tracking-wider">
            CHAT POSITION
          </label>
          <div className="flex gap-2">
            {["left", "right", "bottom"].map((pos) => (
              <button
                key={pos}
                onClick={() => handleToggle("chatPosition", pos)}
                className={`flex-1 py-2 text-xs uppercase tracking-wider rounded transition-all ${
                  settings.chatPosition === pos
                    ? "bg-cyan/20 text-cyan border border-cyan"
                    : "bg-void-lighter text-text-muted border border-glass-border hover:border-cyan/50"
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Selection */}
        <div>
          <label className="block text-xs text-text-muted mb-2 tracking-wider">
            STREAM THEME
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "cyberpunk", label: "Cyberpunk", colors: ["#00f0ff", "#ff00aa"] },
              { id: "neon", label: "Neon", colors: ["#b8ff00", "#00f0ff"] },
              { id: "sunset", label: "Sunset", colors: ["#ff6b6b", "#feca57"] },
              { id: "midnight", label: "Midnight", colors: ["#8b5cf6", "#3b82f6"] },
            ].map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleToggle("theme", theme.id)}
                className={`p-3 rounded transition-all ${
                  settings.theme === theme.id
                    ? "ring-2 ring-cyan"
                    : "hover:bg-void-lighter"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: theme.colors[0] }}
                  />
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: theme.colors[1] }}
                  />
                </div>
                <span className="text-xs text-text">{theme.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <label className="block text-xs text-text-muted mb-2 tracking-wider">
            QUICK ACTIONS
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button className="cyber-btn rounded py-3 text-xs">
              📷 Screenshot
            </button>
            <button className="cyber-btn rounded py-3 text-xs">
              🎬 Clip It
            </button>
            <button className="cyber-btn rounded py-3 text-xs">
              🔇 Mute
            </button>
            <button className="cyber-btn rounded py-3 text-xs">
              ⏸️ BRB
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

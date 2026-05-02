import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface Alert {
  _id: Id<"alerts">;
  streamId: Id<"streams">;
  type: string;
  username: string;
  message?: string;
  amount?: number;
  timestamp: number;
  isRead: boolean;
}

interface AlertsPanelProps {
  streamId: Id<"streams">;
}

const ALERT_ICONS: Record<string, string> = {
  donation: "💰",
  sub: "⭐",
  follow: "❤️",
  raid: "🚀",
};

const ALERT_COLORS: Record<string, string> = {
  donation: "#b8ff00",
  sub: "#8b5cf6",
  follow: "#ff00aa",
  raid: "#00f0ff",
};

export function AlertsPanel({ streamId }: AlertsPanelProps) {
  const alerts = useQuery(api.alerts.list, { streamId });
  const markRead = useMutation(api.alerts.markRead);

  const unreadCount = alerts?.filter((a: Alert) => !a.isRead).length || 0;

  return (
    <div className="glass-panel corner-decor p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-sm tracking-wider text-magenta">ALERTS</h2>
        {unreadCount > 0 && (
          <span className="px-2 py-0.5 bg-magenta text-void text-xs font-bold rounded-full">
            {unreadCount} NEW
          </span>
        )}
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto chat-scroll">
        {alerts?.length === 0 && (
          <p className="text-text-muted text-sm text-center py-4">
            No alerts yet...
          </p>
        )}

        {alerts?.map((alert: Alert) => (
          <div
            key={alert._id}
            onClick={() => !alert.isRead && markRead({ alertId: alert._id })}
            className={`p-3 rounded-lg cursor-pointer transition-all hover:scale-[1.02] alert-enter ${
              alert.isRead ? "bg-void-lighter opacity-60" : "bg-void-lighter"
            }`}
            style={{
              borderLeft: `3px solid ${ALERT_COLORS[alert.type] || "#00f0ff"}`,
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{ALERT_ICONS[alert.type] || "🔔"}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-bold"
                    style={{ color: ALERT_COLORS[alert.type] || "#00f0ff" }}
                  >
                    {alert.username}
                  </span>
                  <span className="text-xs text-text-muted capitalize">{alert.type}</span>
                  {!alert.isRead && (
                    <span className="w-2 h-2 bg-magenta rounded-full animate-pulse" />
                  )}
                </div>
                {alert.type === "donation" && alert.amount && (
                  <p className="text-sm text-lime font-bold">${alert.amount}</p>
                )}
                {alert.message && (
                  <p className="text-xs text-text-muted truncate">{alert.message}</p>
                )}
              </div>
              <span className="text-xs text-text-muted">
                {new Date(alert.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Alert Summary */}
      {alerts && alerts.length > 0 && (
        <div className="mt-4 pt-4 border-t border-glass-border">
          <div className="grid grid-cols-4 gap-2 text-center">
            {["donation", "sub", "follow", "raid"].map((type) => {
              const count = alerts.filter((a: Alert) => a.type === type).length;
              return (
                <div key={type} className="p-2">
                  <span className="text-lg">{ALERT_ICONS[type]}</span>
                  <p className="text-xs font-bold" style={{ color: ALERT_COLORS[type] }}>
                    {count}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

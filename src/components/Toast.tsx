import { useEffect } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`toast ${type === "error" ? "toast-error" : ""}`}
      onClick={onClose}
    >
      <div className="flex items-center gap-3">
        <span className="text-lg">
          {type === "success" ? "✓" : "✕"}
        </span>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
}

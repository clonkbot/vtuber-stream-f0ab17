import { useState, useEffect } from "react";

interface AvatarProps {
  mood: string;
  isSpeaking: boolean;
  onMoodChange: (mood: string) => void;
}

const MOODS = ["neutral", "happy", "excited", "thinking"];

export function Avatar({ mood, isSpeaking, onMoodChange }: AvatarProps) {
  const [blinking, setBlinking] = useState(false);

  // Random blink animation
  useEffect(() => {
    const blink = () => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 150);
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.7) blink();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getMoodColor = () => {
    switch (mood) {
      case "happy": return "#b8ff00";
      case "excited": return "#ff00aa";
      case "thinking": return "#8b5cf6";
      default: return "#00f0ff";
    }
  };

  const getEyeExpression = () => {
    if (blinking) return { height: 3 };
    switch (mood) {
      case "happy": return { height: 20, curved: true };
      case "excited": return { height: 28, scale: 1.2 };
      case "thinking": return { height: 20, offsetY: -5 };
      default: return { height: 24 };
    }
  };

  const getMouthPath = () => {
    if (isSpeaking) {
      // Animated talking mouth
      return "M 70 130 Q 100 145 130 130 Q 100 155 70 130";
    }
    switch (mood) {
      case "happy": return "M 70 125 Q 100 150 130 125";
      case "excited": return "M 70 125 Q 100 160 130 125";
      case "thinking": return "M 75 130 Q 100 125 125 130";
      default: return "M 75 130 Q 100 140 125 130";
    }
  };

  const eyeExpr = getEyeExpression();

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Avatar Display */}
      <div className="relative">
        {/* Glow effect */}
        <div
          className="absolute inset-0 blur-3xl opacity-30 rounded-full"
          style={{ background: getMoodColor() }}
        />

        {/* Avatar container */}
        <div className={`relative avatar-float ${isSpeaking ? "talking" : ""}`}>
          <svg
            viewBox="0 0 200 200"
            className="w-48 h-48 md:w-64 md:h-64"
            style={{ filter: `drop-shadow(0 0 20px ${getMoodColor()}40)` }}
          >
            {/* Background circle with gradient */}
            <defs>
              <radialGradient id="faceGrad" cx="50%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#2a2a35" />
                <stop offset="100%" stopColor="#1a1a22" />
              </radialGradient>
              <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={getMoodColor()} stopOpacity="0.3" />
                <stop offset="100%" stopColor={getMoodColor()} stopOpacity="0" />
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Outer glow ring */}
            <circle cx="100" cy="100" r="95" fill="url(#glowGrad)" />

            {/* Face */}
            <ellipse
              cx="100"
              cy="100"
              rx="75"
              ry="85"
              fill="url(#faceGrad)"
              stroke={getMoodColor()}
              strokeWidth="2"
              filter="url(#glow)"
            />

            {/* Hair */}
            <path
              d="M 30 80 Q 40 20 100 15 Q 160 20 170 80 Q 160 50 100 45 Q 40 50 30 80"
              fill="#1a1a22"
              stroke={getMoodColor()}
              strokeWidth="1"
              opacity="0.8"
            />
            <path
              d="M 35 90 Q 20 60 50 30 Q 45 70 35 90"
              fill="#1a1a22"
              stroke={getMoodColor()}
              strokeWidth="0.5"
            />
            <path
              d="M 165 90 Q 180 60 150 30 Q 155 70 165 90"
              fill="#1a1a22"
              stroke={getMoodColor()}
              strokeWidth="0.5"
            />

            {/* Left eye */}
            <g transform={`translate(0, ${eyeExpr.offsetY || 0})`}>
              <ellipse
                cx="70"
                cy="95"
                rx="15"
                ry={eyeExpr.height / 2}
                fill="#0a0a0f"
                stroke={getMoodColor()}
                strokeWidth="1.5"
                style={{ transform: eyeExpr.scale ? `scale(${eyeExpr.scale})` : undefined, transformOrigin: "70px 95px" }}
              />
              {!blinking && (
                <>
                  <circle cx="70" cy="95" r="6" fill={getMoodColor()} opacity="0.8" />
                  <circle cx="73" cy="92" r="2" fill="white" opacity="0.9" />
                </>
              )}
            </g>

            {/* Right eye */}
            <g transform={`translate(0, ${eyeExpr.offsetY || 0})`}>
              <ellipse
                cx="130"
                cy="95"
                rx="15"
                ry={eyeExpr.height / 2}
                fill="#0a0a0f"
                stroke={getMoodColor()}
                strokeWidth="1.5"
                style={{ transform: eyeExpr.scale ? `scale(${eyeExpr.scale})` : undefined, transformOrigin: "130px 95px" }}
              />
              {!blinking && (
                <>
                  <circle cx="130" cy="95" r="6" fill={getMoodColor()} opacity="0.8" />
                  <circle cx="133" cy="92" r="2" fill="white" opacity="0.9" />
                </>
              )}
            </g>

            {/* Eyebrows */}
            {mood === "thinking" && (
              <>
                <path d="M 55 75 Q 70 70 85 78" stroke={getMoodColor()} strokeWidth="2" fill="none" />
                <path d="M 145 75 Q 130 65 115 78" stroke={getMoodColor()} strokeWidth="2" fill="none" />
              </>
            )}

            {/* Blush for happy/excited */}
            {(mood === "happy" || mood === "excited") && (
              <>
                <ellipse cx="50" cy="115" rx="12" ry="6" fill="#ff6b6b" opacity="0.3" />
                <ellipse cx="150" cy="115" rx="12" ry="6" fill="#ff6b6b" opacity="0.3" />
              </>
            )}

            {/* Mouth */}
            <path
              d={getMouthPath()}
              fill={isSpeaking ? "#1a1a22" : "none"}
              stroke={getMoodColor()}
              strokeWidth="2"
              strokeLinecap="round"
              className="mouth"
              style={{ transformOrigin: "100px 135px" }}
            />

            {/* Antenna/accessory */}
            <g>
              <path
                d="M 100 15 L 100 0 Q 105 -5 110 0 L 105 -10"
                stroke={getMoodColor()}
                strokeWidth="2"
                fill="none"
              />
              <circle cx="105" cy="-12" r="4" fill={getMoodColor()} className="pulse-glow" />
            </g>

            {/* Ear accessories */}
            <circle cx="28" cy="100" r="8" fill="#1a1a22" stroke={getMoodColor()} strokeWidth="1" />
            <circle cx="28" cy="100" r="3" fill={getMoodColor()} className="pulse-glow" />
            <circle cx="172" cy="100" r="8" fill="#1a1a22" stroke={getMoodColor()} strokeWidth="1" />
            <circle cx="172" cy="100" r="3" fill={getMoodColor()} className="pulse-glow" />
          </svg>
        </div>

        {/* Speaking indicator */}
        {isSpeaking && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-1 bg-lime rounded-full"
                style={{
                  height: `${8 + Math.random() * 16}px`,
                  animation: `talk 0.3s ease-in-out infinite ${i * 0.05}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Mood Controls */}
      <div className="flex gap-2">
        {MOODS.map((m) => (
          <button
            key={m}
            onClick={() => onMoodChange(m)}
            className={`px-3 py-2 text-xs uppercase tracking-wider rounded transition-all ${
              mood === m
                ? `bg-opacity-20 border neon-border mood-${m}`
                : "text-text-muted hover:text-text border border-transparent"
            }`}
            style={mood === m ? { backgroundColor: `${getMoodColor()}20`, borderColor: getMoodColor() } : {}}
          >
            {m === "happy" && "😊"}
            {m === "excited" && "🤩"}
            {m === "thinking" && "🤔"}
            {m === "neutral" && "😐"}
            <span className="ml-1 hidden sm:inline">{m}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

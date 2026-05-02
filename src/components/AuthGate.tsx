import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

export function AuthGate() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("flow", flow);
      await signIn("password", formData);
    } catch (err) {
      setError(flow === "signIn" ? "Invalid credentials" : "Could not create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
    } catch {
      setError("Failed to continue as guest");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg hex-pattern flex items-center justify-center p-4 scanlines">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-cyan glow-cyan mb-2">
            VTUBE<span className="text-magenta">R</span>
          </h1>
          <p className="text-text-muted text-sm tracking-widest uppercase">
            Streaming Interface v2.087
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-panel corner-decor p-6 md:p-8">
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() => setFlow("signIn")}
              className={`flex-1 py-2 text-xs tracking-widest uppercase border-b-2 transition-all ${
                flow === "signIn"
                  ? "border-cyan text-cyan"
                  : "border-transparent text-text-muted hover:text-text"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setFlow("signUp")}
              className={`flex-1 py-2 text-xs tracking-widest uppercase border-b-2 transition-all ${
                flow === "signUp"
                  ? "border-magenta text-magenta"
                  : "border-transparent text-text-muted hover:text-text"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-text-muted mb-2 tracking-wider">
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vtuber@stream.tv"
                className="cyber-input rounded"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-text-muted mb-2 tracking-wider">
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="cyber-input rounded"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="text-magenta text-sm p-3 bg-magenta/10 rounded border border-magenta/30">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`cyber-btn ${
                flow === "signIn" ? "cyber-btn-solid" : "cyber-btn-magenta"
              } w-full rounded mt-6`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Processing...
                </span>
              ) : flow === "signIn" ? (
                "Initialize Connection"
              ) : (
                "Create Identity"
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-glass-border"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-void-lighter px-4 text-xs text-text-muted tracking-wider">
                OR
              </span>
            </div>
          </div>

          <button
            onClick={handleAnonymous}
            disabled={isLoading}
            className="cyber-btn w-full rounded text-text-muted hover:text-cyan"
          >
            Continue as Guest
          </button>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center">
          <p className="text-text-muted/50 text-xs">
            Requested by @luhgoat223 · Built by @clonkbot
          </p>
        </footer>
      </div>
    </div>
  );
}

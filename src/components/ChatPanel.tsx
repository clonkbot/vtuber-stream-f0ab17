import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface ChatMessage {
  _id: Id<"chatMessages">;
  streamId: Id<"streams">;
  username: string;
  message: string;
  isAiResponse: boolean;
  isHighlighted: boolean;
  timestamp: number;
}

interface ChatPanelProps {
  streamId: Id<"streams">;
  onSpeakingChange: (speaking: boolean) => void;
  onMoodChange: (mood: string) => void;
  setToast: (toast: { message: string; type: "success" | "error" } | null) => void;
}

function pcmToWav(base64Pcm: string): string {
  const pcm = Uint8Array.from(atob(base64Pcm), (c) => c.charCodeAt(0));
  const sampleRate = 24000;
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  const w = (o: number, s: string) =>
    s.split("").forEach((c, i) => view.setUint8(o + i, c.charCodeAt(0)));
  w(0, "RIFF");
  view.setUint32(4, 36 + pcm.length, true);
  w(8, "WAVE");
  w(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  w(36, "data");
  view.setUint32(40, pcm.length, true);
  const wav = new Uint8Array(44 + pcm.length);
  wav.set(new Uint8Array(header), 0);
  wav.set(pcm, 44);
  return URL.createObjectURL(new Blob([wav], { type: "audio/wav" }));
}

export function ChatPanel({ streamId, onSpeakingChange, onMoodChange, setToast }: ChatPanelProps) {
  const messages = useQuery(api.chat.list, { streamId });
  const sendMessage = useMutation(api.chat.send);
  const askQuestion = useMutation(api.chat.askQuestion);
  const saveAiResponse = useMutation(api.chat.saveAiResponse);
  const chat = useAction(api.ai.chat);
  const textToSpeech = useAction(api.ai.textToSpeech);

  const [input, setInput] = useState("");
  const [question, setQuestion] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingTTS, setIsGeneratingTTS] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    await sendMessage({ streamId, message: input.trim(), isAiResponse: false });
    setInput("");
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isProcessing) return;

    setIsProcessing(true);
    const viewerQuestion = question.trim();
    setQuestion("");

    try {
      // Add viewer question to chat
      await askQuestion({ streamId, question: viewerQuestion });

      // Get AI response
      const systemPrompt = `You are a friendly and entertaining VTuber streaming on Twitch. You have a cyberpunk anime avatar and a fun, energetic personality. Keep responses conversational, engaging, and relatively short (1-3 sentences). Use casual language and occasional gaming/streaming slang. React with appropriate emotions (happy, excited, thinking). If asked about yourself, be creative and playful.`;

      const response = await chat({
        messages: [{ role: "user", content: viewerQuestion }],
        systemPrompt,
      });

      // Determine mood from response
      let mood = "neutral";
      const lowerResponse = response.toLowerCase();
      if (lowerResponse.includes("!") || lowerResponse.includes("awesome") || lowerResponse.includes("amazing") || lowerResponse.includes("love")) {
        mood = "excited";
      } else if (lowerResponse.includes("haha") || lowerResponse.includes("lol") || lowerResponse.includes(":)") || lowerResponse.includes("thanks")) {
        mood = "happy";
      } else if (lowerResponse.includes("hmm") || lowerResponse.includes("well") || lowerResponse.includes("think") || lowerResponse.includes("?")) {
        mood = "thinking";
      }
      onMoodChange(mood);

      // Generate TTS
      setIsGeneratingTTS(true);
      try {
        const audioBase64 = await textToSpeech({ text: response, voice: "Kore" });

        // Save response with audio
        await saveAiResponse({
          streamId,
          viewerQuestion,
          aiResponse: response,
          audioBase64,
        });

        // Play audio
        if (audioBase64) {
          const audioUrl = pcmToWav(audioBase64);
          if (audioRef.current) {
            audioRef.current.pause();
          }
          const audio = new Audio(audioUrl);
          audioRef.current = audio;

          audio.onplay = () => onSpeakingChange(true);
          audio.onended = () => {
            onSpeakingChange(false);
            onMoodChange("neutral");
          };
          audio.onerror = () => onSpeakingChange(false);

          await audio.play();
        }
      } catch (ttsError) {
        console.error("TTS failed:", ttsError);
        // Still save response without audio
        await saveAiResponse({
          streamId,
          viewerQuestion,
          aiResponse: response,
        });
      } finally {
        setIsGeneratingTTS(false);
      }
    } catch (error) {
      console.error("AI response error:", error);
      setToast({ message: "Failed to generate AI response", type: "error" });
      onMoodChange("neutral");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="glass-panel corner-decor h-full flex flex-col" style={{ minHeight: "500px" }}>
      {/* Header */}
      <div className="p-4 border-b border-glass-border flex items-center justify-between">
        <h2 className="font-display text-sm tracking-wider text-cyan">LIVE CHAT</h2>
        <div className="flex items-center gap-2">
          {isProcessing && (
            <span className="text-xs text-lime animate-pulse">AI THINKING...</span>
          )}
          {isGeneratingTTS && (
            <span className="text-xs text-magenta animate-pulse">GENERATING VOICE...</span>
          )}
          <span className="text-xs text-text-muted">{messages?.length || 0} msgs</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 chat-scroll space-y-3">
        {messages?.map((msg: ChatMessage) => (
          <div
            key={msg._id}
            className={`p-3 rounded-lg ${
              msg.isAiResponse
                ? "bg-cyan/10 border border-cyan/30"
                : msg.isHighlighted
                ? "bg-magenta/10 border border-magenta/30"
                : "bg-void-lighter"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-xs font-bold ${
                  msg.isAiResponse
                    ? "text-cyan"
                    : msg.isHighlighted
                    ? "text-magenta"
                    : "text-lime"
                }`}
              >
                {msg.username}
              </span>
              <span className="text-xs text-text-muted">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
              {msg.isAiResponse && (
                <span className="text-xs bg-cyan/20 text-cyan px-2 py-0.5 rounded">AI</span>
              )}
            </div>
            <p className="text-sm text-text">{msg.message}</p>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* AI Question Input */}
      <div className="p-4 border-t border-glass-border bg-void-lighter/50">
        <form onSubmit={handleAskQuestion} className="mb-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask the VTuber a question..."
              className="cyber-input rounded flex-1 text-sm"
              disabled={isProcessing}
            />
            <button
              type="submit"
              disabled={isProcessing || !question.trim()}
              className="cyber-btn cyber-btn-solid rounded px-4 text-xs flex items-center gap-2 whitespace-nowrap"
            >
              {isProcessing ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>🎤</span>
                  ASK
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-text-muted mt-2">AI will respond with voice & lip-sync!</p>
        </form>

        {/* Regular Chat Input */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="cyber-input rounded flex-1 text-sm"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="cyber-btn rounded px-4 text-xs"
          >
            SEND
          </button>
        </form>
      </div>
    </div>
  );
}

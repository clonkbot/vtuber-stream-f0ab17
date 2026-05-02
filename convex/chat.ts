import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const VIEWER_NAMES = [
  "xX_GamerPro_Xx",
  "NeonDreamer99",
  "CyberKitty",
  "PixelNinja",
  "MoonRider",
  "TechWitch",
  "GlitchMaster",
  "ByteRunner",
  "NightOwl_TTV",
  "StardustFan",
  "VaporWave_",
  "RetroGamer",
  "DigitalGhost",
  "SynthLord",
  "ArcadeHero",
];

const VIEWER_MESSAGES = [
  "yo what game is this??",
  "LETS GOOO",
  "hi from brazil!",
  "that avatar is so cool",
  "can you do a backflip?",
  "first time here, love the vibes",
  "poggers",
  "what's your setup?",
  "the music is fire",
  "how long have you been streaming?",
  "greetings from germany",
  "love the aesthetic",
  "this stream is chill",
  "hey everyone!",
  "what's your favorite anime?",
];

export const list = query({
  args: { streamId: v.id("streams") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chatMessages")
      .withIndex("by_stream", (q) => q.eq("streamId", args.streamId))
      .order("desc")
      .take(50)
      .then((msgs) => msgs.reverse());
  },
});

export const send = mutation({
  args: {
    streamId: v.id("streams"),
    message: v.string(),
    isAiResponse: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);

    return await ctx.db.insert("chatMessages", {
      streamId: args.streamId,
      username: args.isAiResponse ? "AI-VTuber" : user?.email?.split("@")[0] || "Streamer",
      message: args.message,
      isAiResponse: args.isAiResponse,
      isHighlighted: args.isAiResponse,
      timestamp: Date.now(),
    });
  },
});

export const simulateViewerMessage = mutation({
  args: { streamId: v.id("streams") },
  handler: async (ctx, args) => {
    const username = VIEWER_NAMES[Math.floor(Math.random() * VIEWER_NAMES.length)];
    const message = VIEWER_MESSAGES[Math.floor(Math.random() * VIEWER_MESSAGES.length)];

    return await ctx.db.insert("chatMessages", {
      streamId: args.streamId,
      username,
      message,
      isAiResponse: false,
      isHighlighted: false,
      timestamp: Date.now(),
    });
  },
});

export const askQuestion = mutation({
  args: { streamId: v.id("streams"), question: v.string() },
  handler: async (ctx, args) => {
    const questionerNames = [
      "CuriousViewer",
      "NewFollower",
      "LongTimeFan",
      "FirstTimeChatter",
      "SuperFan2024",
    ];
    const username = questionerNames[Math.floor(Math.random() * questionerNames.length)];

    return await ctx.db.insert("chatMessages", {
      streamId: args.streamId,
      username,
      message: `@VTuber ${args.question}`,
      isAiResponse: false,
      isHighlighted: true,
      timestamp: Date.now(),
    });
  },
});

export const saveAiResponse = mutation({
  args: {
    streamId: v.id("streams"),
    viewerQuestion: v.string(),
    aiResponse: v.string(),
    audioBase64: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Save to conversation history
    await ctx.db.insert("aiConversations", {
      streamId: args.streamId,
      viewerQuestion: args.viewerQuestion,
      aiResponse: args.aiResponse,
      audioBase64: args.audioBase64,
      timestamp: Date.now(),
    });

    // Add AI response to chat
    await ctx.db.insert("chatMessages", {
      streamId: args.streamId,
      username: "AI-VTuber",
      message: args.aiResponse,
      isAiResponse: true,
      isHighlighted: true,
      timestamp: Date.now(),
    });
  },
});

export const getConversationHistory = query({
  args: { streamId: v.id("streams") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("aiConversations")
      .withIndex("by_stream", (q) => q.eq("streamId", args.streamId))
      .order("desc")
      .take(10)
      .then((convos) => convos.reverse());
  },
});

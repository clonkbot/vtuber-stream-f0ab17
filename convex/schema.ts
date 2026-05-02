import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // Stream sessions
  streams: defineTable({
    userId: v.id("users"),
    title: v.string(),
    isLive: v.boolean(),
    viewerCount: v.number(),
    startedAt: v.optional(v.number()),
    avatarMood: v.string(), // "happy", "excited", "thinking", "neutral"
    overlaySettings: v.object({
      showChat: v.boolean(),
      showAlerts: v.boolean(),
      chatPosition: v.string(),
      theme: v.string(),
    }),
  }).index("by_user", ["userId"]),

  // Chat messages (viewer + AI responses)
  chatMessages: defineTable({
    streamId: v.id("streams"),
    username: v.string(),
    message: v.string(),
    isAiResponse: v.boolean(),
    isHighlighted: v.boolean(),
    timestamp: v.number(),
  }).index("by_stream", ["streamId"]),

  // AI conversation history for context
  aiConversations: defineTable({
    streamId: v.id("streams"),
    viewerQuestion: v.string(),
    aiResponse: v.string(),
    audioBase64: v.optional(v.string()),
    timestamp: v.number(),
  }).index("by_stream", ["streamId"]),

  // Stream alerts (donations, subs, etc.)
  alerts: defineTable({
    streamId: v.id("streams"),
    type: v.string(), // "donation", "sub", "follow", "raid"
    username: v.string(),
    message: v.optional(v.string()),
    amount: v.optional(v.number()),
    timestamp: v.number(),
    isRead: v.boolean(),
  }).index("by_stream", ["streamId"]),
});

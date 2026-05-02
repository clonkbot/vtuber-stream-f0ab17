import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const stream = await ctx.db
      .query("streams")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return stream;
  },
});

export const create = mutation({
  args: { title: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if stream already exists
    const existing = await ctx.db
      .query("streams")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("streams", {
      userId,
      title: args.title,
      isLive: false,
      viewerCount: 0,
      avatarMood: "neutral",
      overlaySettings: {
        showChat: true,
        showAlerts: true,
        chatPosition: "right",
        theme: "cyberpunk",
      },
    });
  },
});

export const goLive = mutation({
  args: { streamId: v.id("streams") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.patch(args.streamId, {
      isLive: true,
      startedAt: Date.now(),
      viewerCount: Math.floor(Math.random() * 50) + 10, // Simulated
    });
  },
});

export const endStream = mutation({
  args: { streamId: v.id("streams") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.patch(args.streamId, {
      isLive: false,
      startedAt: undefined,
      viewerCount: 0,
    });
  },
});

export const updateMood = mutation({
  args: { streamId: v.id("streams"), mood: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.streamId, { avatarMood: args.mood });
  },
});

export const updateOverlay = mutation({
  args: {
    streamId: v.id("streams"),
    settings: v.object({
      showChat: v.boolean(),
      showAlerts: v.boolean(),
      chatPosition: v.string(),
      theme: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.streamId, { overlaySettings: args.settings });
  },
});

export const updateTitle = mutation({
  args: { streamId: v.id("streams"), title: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.streamId, { title: args.title });
  },
});

export const simulateViewers = mutation({
  args: { streamId: v.id("streams") },
  handler: async (ctx, args) => {
    const stream = await ctx.db.get(args.streamId);
    if (!stream || !stream.isLive) return;

    const change = Math.floor(Math.random() * 20) - 8;
    const newCount = Math.max(0, stream.viewerCount + change);
    await ctx.db.patch(args.streamId, { viewerCount: newCount });
  },
});

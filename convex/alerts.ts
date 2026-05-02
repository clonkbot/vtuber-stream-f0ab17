import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { streamId: v.id("streams") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("alerts")
      .withIndex("by_stream", (q) => q.eq("streamId", args.streamId))
      .order("desc")
      .take(20);
  },
});

export const simulateAlert = mutation({
  args: { streamId: v.id("streams") },
  handler: async (ctx, args) => {
    const types = ["donation", "sub", "follow", "raid"];
    const type = types[Math.floor(Math.random() * types.length)];

    const names = [
      "CoolDude42",
      "StreamerFan",
      "NightWatcher",
      "GamerGirl",
      "TechBro",
      "ArtLover",
      "MusicFan",
    ];
    const username = names[Math.floor(Math.random() * names.length)];

    const messages = [
      "Love the stream!",
      "Keep up the great work!",
      "You're awesome!",
      "Best VTuber ever!",
      "Hi from the raid!",
    ];

    await ctx.db.insert("alerts", {
      streamId: args.streamId,
      type,
      username,
      message: type === "donation" || type === "raid" ? messages[Math.floor(Math.random() * messages.length)] : undefined,
      amount: type === "donation" ? Math.floor(Math.random() * 50) + 1 : undefined,
      timestamp: Date.now(),
      isRead: false,
    });
  },
});

export const markRead = mutation({
  args: { alertId: v.id("alerts") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.alertId, { isRead: true });
  },
});

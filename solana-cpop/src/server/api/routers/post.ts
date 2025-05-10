import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { events } from "@/server/db/schema";

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: protectedProcedure
    .input(z.object({ eventName: z.string().min(1), tokenName: z.string().min(1), tokenSymbol: z.string().min(1), maxSupply: z.number().min(1), eventUri: z.string().url(), tokenUri: z.string().url() }))
    .mutation(async ({ ctx, input }) => {
      // Changed to use events table instead of posts
      await ctx.db.insert(events).values({
        eventName: input.eventName,
        tokenName: input.tokenName,
        tokenSymbol: input.tokenSymbol,
        maxSupply: input.maxSupply,
        eventUri: input.eventUri,
        tokenUri: input.tokenUri,
        creatorId: ctx.session.user.id,
        creatorWallet: (ctx.session.user as any).walletAddress || ''
      });
    }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const event = await ctx.db.query.events.findFirst({
      orderBy: (events, { desc }) => [desc(events.createdAt)],
    });

    return event ?? null;
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});

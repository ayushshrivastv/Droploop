import { z } from "zod";
import { eq } from "drizzle-orm";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { tokens, claims } from "~/server/db/schema";

export const tokenRouter = createTRPCRouter({
  // Get all tokens for an event
  getByEventId: publicProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.tokens.findMany({
        where: (tokens, { eq }) => eq(tokens.eventId, input.eventId),
      });
    }),

  // Get token by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.tokens.findFirst({
        where: (tokens, { eq }) => eq(tokens.id, input.id),
      });
    }),

  // Get claimed tokens by user
  getMyClaims: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.claims.findMany({
      where: (claims, { eq }) => eq(claims.userId, ctx.session.user.id),
      with: {
        token: true,
      },
    });
  }),

  // Verify token ownership
  verifyOwnership: protectedProcedure
    .input(z.object({
      tokenId: z.string(),
      merkleProof: z.array(z.string())
    }))
    .mutation(async ({ ctx, input }) => {
      // In a real implementation, this would interact with the Solana program
      // to verify the Merkle proof and return the verification result

      // For demonstration, we'll check if the user has claimed this token in our database
      const claim = await ctx.db.query.claims.findFirst({
        where: (claims, { and, eq }) =>
          and(
            eq(claims.tokenId, input.tokenId),
            eq(claims.userId, ctx.session.user.id),
            eq(claims.claimed, true)
          ),
      });

      // If claim exists, the user owns this token
      return {
        isVerified: !!claim,
        claimedAt: claim?.claimedAt,
      };
    }),

  // Update token metadata (creator only)
  updateMetadata: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      symbol: z.string().optional(),
      description: z.string().optional(),
      image: z.string().optional(),
      metadataUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get the token
      const token = await ctx.db.query.tokens.findFirst({
        where: (tokens, { eq }) => eq(tokens.id, input.id),
        with: {
          event: true,
        },
      });

      // Check if token exists and user has permission
      if (!token || token.event.creatorId !== ctx.session.user.id) {
        throw new Error("Unauthorized or token not found");
      }

      // Update token metadata
      const [updatedToken] = await ctx.db
        .update(tokens)
        .set({
          name: input.name ?? token.name,
          symbol: input.symbol ?? token.symbol,
          description: input.description ?? token.description,
          image: input.image ?? token.image,
          metadataUrl: input.metadataUrl ?? token.metadataUrl,
        })
        .where(eq(tokens.id, input.id))
        .returning();

      return updatedToken;
    }),
});

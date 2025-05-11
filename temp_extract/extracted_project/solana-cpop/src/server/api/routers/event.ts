import { z } from "zod";
import { eq } from "drizzle-orm";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { events, tokens, qrCodes, claims } from "~/server/db/schema";

export const eventRouter = createTRPCRouter({
  // Get all events (public)
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.events.findMany({
      orderBy: (events, { desc }) => [desc(events.createdAt)],
    });
  }),

  // Get event by ID (public)
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.events.findFirst({
        where: (events, { eq }) => eq(events.id, input.id),
      });
    }),

  // Get events created by current user
  getMyEvents: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.events.findMany({
      where: (events, { eq }) => eq(events.creatorId, ctx.session.user.id),
      orderBy: (events, { desc }) => [desc(events.createdAt)],
    });
  }),

  // Create a new event
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(3),
        description: z.string().min(10),
        location: z.string().optional(),
        startDate: z.string(),
        endDate: z.string(),
        tokenName: z.string().min(2),
        tokenSymbol: z.string().min(1).max(10),
        tokenDescription: z.string().min(10),
        tokenSupply: z.number().int().positive(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Insert event
      const [event] = await ctx.db
        .insert(events)
        .values({
          name: input.name,
          description: input.description,
          location: input.location,
          startDate: new Date(input.startDate),
          endDate: new Date(input.endDate),
          creatorId: ctx.session.user.id,
          isActive: true,
          maxParticipants: input.tokenSupply,
        })
        .returning();

      if (!event) {
        throw new Error("Failed to create event");
      }

      // Insert token
      const [token] = await ctx.db
        .insert(tokens)
        .values({
          eventId: event.id,
          name: input.tokenName,
          symbol: input.tokenSymbol,
          description: input.tokenDescription,
          maxSupply: input.tokenSupply,
          mintAuthority: ctx.session.user.walletAddress || "",
        })
        .returning();

      return { event, token };
    }),

  // Generate QR code for an event
  generateQRCode: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
        tokenId: z.string(),
        expiresAt: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify event belongs to user
      const event = await ctx.db.query.events.findFirst({
        where: (events, { and, eq }) =>
          and(
            eq(events.id, input.eventId),
            eq(events.creatorId, ctx.session.user.id)
          ),
      });

      if (!event) {
        throw new Error("Event not found or you don't have permission");
      }

      // Generate a random secret key
      const secretKey = crypto.randomUUID();

      // Insert QR code
      const [qrCode] = await ctx.db
        .insert(qrCodes)
        .values({
          eventId: input.eventId,
          tokenId: input.tokenId,
          secretKey,
          expiresAt: input.expiresAt,
          isActive: true,
        })
        .returning();

      return qrCode;
    }),

  // Claim a token via QR code
  claimToken: protectedProcedure
    .input(
      z.object({
        qrCodeId: z.string(),
        secretKey: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Find the QR code
      const qrCode = await ctx.db.query.qrCodes.findFirst({
        where: (qrCodes, { and, eq }) =>
          and(
            eq(qrCodes.id, input.qrCodeId),
            eq(qrCodes.secretKey, input.secretKey),
            eq(qrCodes.isActive, true)
          ),
        with: {
          token: true,
          event: true,
        },
      });

      if (!qrCode) {
        throw new Error("Invalid QR code");
      }

      // Check if QR code has expired
      if (qrCode.expiresAt && new Date() > qrCode.expiresAt) {
        throw new Error("QR code has expired");
      }

      // Check if user already claimed this token
      const existingClaim = await ctx.db.query.claims.findFirst({
        where: (claims, { and, eq }) =>
          and(
            eq(claims.qrCodeId, qrCode.id),
            eq(claims.userId, ctx.session.user.id)
          ),
      });

      if (existingClaim) {
        throw new Error("You have already claimed this token");
      }

      // Create claim record
      const [claim] = await ctx.db
        .insert(claims)
        .values({
          tokenId: qrCode.tokenId,
          userId: ctx.session.user.id,
          walletAddress: ctx.session.user.walletAddress || "",
          qrCodeId: qrCode.id,
          claimed: true,
          claimedAt: new Date(),
        })
        .returning();

      // Update QR code to inactive
      await ctx.db
        .update(qrCodes)
        .set({ isActive: false })
        .where(eq(qrCodes.id, qrCode.id));

      return {
        claim,
        token: qrCode.token,
        event: qrCode.event,
      };
    }),

  // Get tokens claimed by current user
  getMyTokens: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.claims.findMany({
      where: (claims, { eq }) => eq(claims.userId, ctx.session.user.id),
      with: {
        token: true,
        event: true,
      },
      orderBy: (claims, { desc }) => [desc(claims.createdAt)],
    });
  }),
});

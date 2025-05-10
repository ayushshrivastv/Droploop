import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { events, qrCodes } from "@/server/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { randomBytes } from "crypto";
import { Connection, Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import {
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
  getConcurrentMerkleTreeAccountSize,
} from "@solana/spl-account-compression";
import { 
  eventToDbFields, 
  qrCodeToDbFields,
  dbFieldsToEvent,
  dbFieldsToQrCode,
  EventInput,
  QrCodeInput
} from "@/utils/schema-adapters";

// Constants for the Merkle tree
const MERKLE_TREE_HEIGHT = 20;
const MERKLE_TREE_BUFFER_SIZE = 64;
const CANOPY_DEPTH = 0;

// Validation schema for creating events
const createEventSchema = z.object({
  eventName: z.string().min(3).max(50),
  tokenName: z.string().min(2).max(30),
  tokenSymbol: z.string().min(1).max(10),
  maxSupply: z.number().int().positive(),
  eventUri: z.string().url(),
  tokenUri: z.string().url(),
});

// Validation schema for generating QR codes
const generateQrCodeSchema = z.object({
  eventId: z.string(),
  expirationTime: z.number().int().optional(),
});

// Validation schema for claiming tokens
const claimTokenSchema = z.object({
  qrCodeId: z.string(),
  secretKey: z.string(),
});

export const eventRouter = createTRPCRouter({
  // Create a new event
  createEvent: protectedProcedure
    .input(createEventSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if user wallet address is available
        if (!(ctx.session?.user as any)?.walletAddress) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Wallet address required to create events",
          });
        }

        const creatorWallet = (ctx.session.user as any).walletAddress;

        // Create a database entry for the event using our adapter to convert field names
        const eventData = {
          creatorId: ctx.session.user.id,
          creatorWallet,
          eventName: input.eventName,
          tokenName: input.tokenName,
          tokenSymbol: input.tokenSymbol,
          maxSupply: input.maxSupply,
          isActive: true,
          eventUri: input.eventUri,
          tokenUri: input.tokenUri,
          merkleRoot: "" // Initial empty merkle root
        };
        
        // Convert to database fields with snake_case
        const [event] = await ctx.db.insert(events).values(eventToDbFields(eventData) as any).returning();

        // Return the created event
        return {
          success: true,
          event,
          message: "Event created successfully. Please complete the on-chain setup next.",
        };
      } catch (error) {
        console.error("Error creating event:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create event",
        });
      }
    }),

  // Get all events created by the current user
  getMyEvents: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Only return events created by the current user
      const userEvents = await ctx.db.query.events.findMany({
        where: eq(events.creatorId, ctx.session.user.id),
        orderBy: (events, { desc }) => [desc(events.createdAt)],
      });

      return userEvents;
    } catch (error) {
      console.error("Error getting user events:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch events",
      });
    }
  }),

  // Get a specific event by ID
  getEvent: publicProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const event = await ctx.db.query.events.findFirst({
          where: eq(events.id, input.eventId),
        });

        if (!event) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Event not found",
          });
        }

        return event;
      } catch (error) {
        console.error("Error getting event:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch event",
        });
      }
    }),

  // Update event's on-chain information after initialization
  updateEventOnChainInfo: protectedProcedure
    .input(z.object({
      eventId: z.string(),
      merkleTreeAddress: z.string(),
      transactionSignature: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify the user owns this event
        const event = await ctx.db.query.events.findFirst({
          where: and(
            eq(events.id, input.eventId),
            eq(events.creatorId, ctx.session.user.id)
          ),
        });

        if (!event) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Event not found or you are not the creator",
          });
        }

        // Update the event record with on-chain information
        await ctx.db
          .update(events)
          .set({
            merkleTreeAddress: input.merkleTreeAddress,
            lastTransactionSignature: input.transactionSignature,
            onChainInitialized: true,
          })
          .where(eq(events.id, input.eventId));

        return {
          success: true,
          event,
          message: "Event on-chain information updated successfully",
        };
      } catch (error) {
        console.error("Error updating event on-chain info:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update event on-chain information",
        });
      }
    }),

  // Generate a QR code for an event
  generateQrCode: protectedProcedure
    .input(generateQrCodeSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify the user owns this event
        const event = await ctx.db.query.events.findFirst({
          where: and(
            eq(events.id, input.eventId),
            eq(events.creatorId, ctx.session.user.id)
          ),
        });

        if (!event) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Event not found or you are not the creator",
          });
        }

        // Generate random data for the QR code
        const qrCodeId = `qr-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const secretKey = randomBytes(32).toString("hex");
        
        // Default expiration time is 24 hours from now
        const expirationTime = input.expirationTime || Math.floor(Date.now() / 1000) + 24 * 60 * 60;

        // Create a database entry for the QR code
        const [qrCode] = await ctx.db.insert(qrCodes).values({
          eventId: event.id,
          qrCodeId: qrCodeId,
          secretKey: secretKey,
          expirationTime: expirationTime,
          isUsed: false,
        }).returning();

        return {
          success: true,
          qrCode: {
            ...qrCode,
            qrCodeData: JSON.stringify({
              eventId: event.id,
              qrCodeId,
              secretKey,
            }),
          },
          message: "QR code generated successfully",
        };
      } catch (error) {
        console.error("Error generating QR code:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate QR code",
        });
      }
    }),

  // Get all QR codes for an event
  getEventQrCodes: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        // Verify the user owns this event
        const event = await ctx.db.query.events.findFirst({
          where: and(
            eq(events.id, input.eventId),
            eq(events.creatorId, ctx.session.user.id)
          ),
        });

        if (!event) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Event not found or you are not the creator",
          });
        }

        // Get all QR codes for this event
        const eventQrCodes = await ctx.db.query.qrCodes.findMany({
          where: eq(qrCodes.eventId, input.eventId),
          orderBy: (qrCodes, { desc }) => [desc(qrCodes.createdAt)],
        });

        return eventQrCodes;
      } catch (error) {
        console.error("Error getting event QR codes:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch QR codes",
        });
      }
    }),

  // Validate and claim a token using a QR code
  claimToken: publicProcedure
    .input(claimTokenSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Find the QR code
        const qrCode = await ctx.db.query.qrCodes.findFirst({
          where: eq(qrCodes.qrCodeId, input.qrCodeId),
        });

        if (!qrCode) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "QR code not found",
          });
        }

        // Check if QR code is already used
        if (qrCode.isUsed) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "QR code has already been used",
          });
        }

        // Verify secret key
        if (qrCode.secretKey !== input.secretKey) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid secret key",
          });
        }

        // Check if QR code is expired
        const currentTime = Math.floor(Date.now() / 1000);
        if (qrCode.expirationTime < currentTime) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "QR code has expired",
          });
        }

        // Get the event
        const event = await ctx.db.query.events.findFirst({
          where: eq(events.id, qrCode.eventId),
        });

        if (!event) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Event not found",
          });
        }

        // Check if event is active
        if (!event.isActive) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Event is not active",
          });
        }

        // Check if max supply has been reached
        if (event.claimedCount >= event.maxSupply) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Maximum token supply reached",
          });
        }

        // User must be authenticated to claim
        if (!ctx.session?.user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You must be logged in to claim a token",
          });
        }

        // Mark QR code as used
        await ctx.db
          .update(qrCodes)
          .set({
            isUsed: true,
            claimedBy: ctx.session.user.id,
            claimedAt: new Date(),
          })
          .where(eq(qrCodes.id, qrCode.id));

        // Increment claimed count
        await ctx.db
          .update(events)
          .set({
            claimedCount: event.claimedCount + 1,
          })
          .where(eq(events.id, event.id));

        return {
          success: true,
          message: "Token claim request registered successfully. Complete the on-chain transaction to finalize.",
          event,
          qrCode: {
            ...qrCode,
            isUsed: true,
            claimedBy: ctx.session.user.id,
            claimedAt: new Date(),
          },
        };
      } catch (error) {
        console.error("Error claiming token:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to claim token",
        });
      }
    }),

  // Get QR code details by ID for claiming
  getQrCodeDetails: publicProcedure
    .input(z.object({ qrCodeId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const qrCode = await ctx.db.query.qrCodes.findFirst({
          where: eq(qrCodes.qrCodeId, input.qrCodeId),
        });

        if (!qrCode) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "QR code not found",
          });
        }

        return qrCode;
      } catch (error) {
        console.error("Error getting QR code details:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get QR code details",
        });
      }
    }),
});

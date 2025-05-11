import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { events, qrCodes, claimedTokens } from "@/server/db/schema";
import { eq, and, isNull, sql } from "drizzle-orm";
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
import { createLeafHash } from "@/lib/compression";

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
  eventId: z.string().uuid(),
  expirationTime: z.number().int().optional(),
});

// Validation schema for claiming tokens
const claimTokenSchema = z.object({
  qrCodeId: z.string(),
  secretKey: z.string(),
});

// Validation schema for updating on-chain info
const updateEventOnChainInfoSchema = z.object({
  eventId: z.string().uuid(),
  merkleTreeAddress: z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "Invalid Solana address format"),
  transactionSignature: z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{87,88}$/, "Invalid transaction signature format"),
});

// Validation schema for token verification
const verifyTokenSchema = z.object({
  eventId: z.string().uuid(),
  tokenId: z.number().int().positive(),
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

        // Check for max events per user (optional limit)
        const eventsCountResult = await ctx.db.select({
          count: sql`count(*)`.mapWith(Number),
        })
        .from(events)
        .where(eq(events.creatorId, ctx.session.user.id));
        
        const userEventCount = eventsCountResult[0]?.count || 0;

        const MAX_EVENTS_PER_USER = 10; // This could be environment config
        if (userEventCount >= MAX_EVENTS_PER_USER) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `You have reached the maximum limit of ${MAX_EVENTS_PER_USER} events`,
          });
        }

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
          merkleRoot: "", // Initial empty merkle root
          claimedCount: 0,
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
        if (error instanceof TRPCError) {
          throw error;
        }
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
    .input(z.object({ eventId: z.string().uuid() }))
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
    .input(updateEventOnChainInfoSchema)
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

        // Validate the merkle tree address is a valid Solana address
        try {
          new PublicKey(input.merkleTreeAddress);
        } catch (err) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid Merkle tree address",
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

        // Check if event is initialized on-chain
        if (!event.onChainInitialized) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Event must be initialized on-chain before generating QR codes",
          });
        }

        // Check if max supply has been reached
        if (event.claimedCount >= event.maxSupply) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Maximum token supply reached. Cannot generate more QR codes.",
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
    .input(z.object({ eventId: z.string().uuid() }))
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
  claimToken: protectedProcedure
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

        // Check if user has a wallet address
        if (!(ctx.session.user as any).walletAddress) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You must connect a wallet to claim a token",
          });
        }

        const userWallet = (ctx.session.user as any).walletAddress;

        // Check if user has already claimed from this event
        const existingClaim = await ctx.db.query.claimedTokens.findFirst({
          where: and(
            eq(claimedTokens.eventId, event.id),
            eq(claimedTokens.userId, ctx.session.user.id)
          ),
        });

        if (existingClaim) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You have already claimed a token from this event",
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

        // Create the token data for the leaf hash
        if (!event.merkleTreeAddress) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Event Merkle tree has not been properly initialized",
          });
        }
        
        const eventPubkey = new PublicKey(event.merkleTreeAddress);
        const userPubkey = new PublicKey(userWallet);
        const tokenId = event.claimedCount + 1;
        
        // Create the leaf hash
        const leafHash = Buffer.from(
          createLeafHash(
            eventPubkey,
            userPubkey,
            tokenId,
            currentTime
          )
        ).toString('hex');

        // Create a new claimed token entry
        const [claimedToken] = await ctx.db.insert(claimedTokens).values({
          eventId: event.id,
          userId: ctx.session.user.id,
          claimerWallet: userWallet,
          tokenId: tokenId,
          leafHash: leafHash,
          claimTime: new Date(),
          qrCodeId: qrCode.id,
          verified: false,
        }).returning();

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
          claimedToken,
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

  // Update claimed token with on-chain information
  updateTokenOnChainInfo: protectedProcedure
    .input(z.object({
      claimedTokenId: z.string().uuid(),
      leafIndex: z.number().int().nonnegative(),
      transactionSignature: z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{87,88}$/, "Invalid transaction signature format"),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Find the claimed token
        const claimedToken = await ctx.db.query.claimedTokens.findFirst({
          where: and(
            eq(claimedTokens.id, input.claimedTokenId),
            eq(claimedTokens.userId, ctx.session.user.id)
          ),
        });

        if (!claimedToken) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Claimed token not found or you are not the claimer",
          });
        }

        // Update the claimed token record with on-chain information
        const [updatedToken] = await ctx.db
          .update(claimedTokens)
          .set({
            leafIndex: input.leafIndex,
            transactionSignature: input.transactionSignature,
            verified: true,
          })
          .where(eq(claimedTokens.id, input.claimedTokenId))
          .returning();

        return {
          success: true,
          claimedToken: updatedToken,
          message: "Token on-chain information updated successfully",
        };
      } catch (error) {
        console.error("Error updating token on-chain info:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update token on-chain information",
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

        // Do not return the secret key in the response for security
        const { secretKey, ...safeQrCode } = qrCode;

        return {
          ...safeQrCode,
          requiresSecretKey: true,
        };
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

  // Get claimed tokens for a user
  getMyClaimedTokens: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const tokens = await ctx.db.query.claimedTokens.findMany({
          where: eq(claimedTokens.userId, ctx.session.user.id),
          orderBy: (claimedTokens, { desc }) => [desc(claimedTokens.claimTime)],
          with: {
            event: true,
          },
        });

        return tokens;
      } catch (error) {
        console.error("Error getting claimed tokens:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch claimed tokens",
        });
      }
    }),

  // Get claimed tokens for an event (for event creator)
  getEventClaimedTokens: protectedProcedure
    .input(z.object({ eventId: z.string().uuid() }))
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

        // Get all claimed tokens for this event
        const eventTokens = await ctx.db.query.claimedTokens.findMany({
          where: eq(claimedTokens.eventId, input.eventId),
          orderBy: (claimedTokens, { desc }) => [desc(claimedTokens.claimTime)],
        });

        return eventTokens;
      } catch (error) {
        console.error("Error getting event claimed tokens:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch claimed tokens",
        });
      }
    }),

  // Toggle event active status
  toggleEventStatus: protectedProcedure
    .input(z.object({ 
      eventId: z.string().uuid(),
      isActive: z.boolean(),
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

        // Update the event status
        const [updatedEvent] = await ctx.db
          .update(events)
          .set({
            isActive: input.isActive,
          })
          .where(eq(events.id, input.eventId))
          .returning();

        return {
          success: true,
          event: updatedEvent,
          message: `Event ${input.isActive ? 'activated' : 'deactivated'} successfully`,
        };
      } catch (error) {
        console.error("Error toggling event status:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update event status",
        });
      }
    }),
});

import type { IdlAccounts } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

// This is a simplified type definition for the cPOP program
export interface Cpop {
  "version": "0.1.0",
  "name": "cpop",
  "instructions": [
    {
      "name": "initializeEvent",
      "accounts": [
        {
          "name": "event",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "merkleTree",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "eventName",
          "type": "string"
        },
        {
          "name": "maxAttendees",
          "type": "u32"
        }
      ]
    },
    {
      "name": "generateQrCode",
      "accounts": [
        {
          "name": "qrCode",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "event",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "tokenId",
          "type": "string"
        },
        {
          "name": "expiryTime",
          "type": "i64"
        }
      ]
    },
    {
      "name": "claimToken",
      "accounts": [
        {
          "name": "qrCode",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "event",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "merkleTree",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "claimer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "logWrapper",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "compressionProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "event",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "creator",
            "type": "publicKey"
          },
          {
            "name": "merkleTree",
            "type": "publicKey"
          },
          {
            "name": "maxAttendees",
            "type": "u32"
          },
          {
            "name": "claimedTokens",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "qrCode",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "event",
            "type": "publicKey"
          },
          {
            "name": "tokenId",
            "type": "string"
          },
          {
            "name": "claimed",
            "type": "bool"
          },
          {
            "name": "claimer",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "expiryTime",
            "type": "i64"
          }
        ]
      }
    }
  ]
}

export const IDL = {
  "version": "0.1.0",
  "name": "cpop",
  "instructions": [
    {
      "name": "initializeEvent",
      "accounts": [
        {
          "name": "event",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "merkleTree",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "eventName",
          "type": "string"
        },
        {
          "name": "maxAttendees",
          "type": "u32"
        }
      ]
    },
    {
      "name": "generateQrCode",
      "accounts": [
        {
          "name": "qrCode",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "event",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "tokenId",
          "type": "string"
        },
        {
          "name": "expiryTime",
          "type": "i64"
        }
      ]
    },
    {
      "name": "claimToken",
      "accounts": [
        {
          "name": "qrCode",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "event",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "merkleTree",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "claimer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "logWrapper",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "compressionProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "event",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "creator",
            "type": "publicKey"
          },
          {
            "name": "merkleTree",
            "type": "publicKey"
          },
          {
            "name": "maxAttendees",
            "type": "u32"
          },
          {
            "name": "claimedTokens",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "qrCode",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "event",
            "type": "publicKey"
          },
          {
            "name": "tokenId",
            "type": "string"
          },
          {
            "name": "claimed",
            "type": "bool"
          },
          {
            "name": "claimer",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "expiryTime",
            "type": "i64"
          }
        ]
      }
    }
  ]
};

// Define these directly to avoid Idl constraints
export interface Event {
  name: string;
  creator: PublicKey;
  merkleTree: PublicKey;
  maxAttendees: number;
  claimedTokens: number;
}

export interface QrCode {
  event: PublicKey;
  tokenId: string;
  claimed: boolean;
  claimer?: PublicKey;
  expiryTime: number;
}

"use client";

import { useState } from "react";

import { api } from "@/trpc/react";

export function LatestPost() {
  const [latestPost] = api.post.getLatest.useSuspenseQuery();

  const utils = api.useUtils();
  const [eventName, setEventName] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [maxSupply, setMaxSupply] = useState(100);
  const [eventUri, setEventUri] = useState("https://example.com/event");
  const [tokenUri, setTokenUri] = useState("https://example.com/token");
  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
      setEventName("");
      setTokenName("");
      setTokenSymbol("");
      setMaxSupply(100);
      setEventUri("https://example.com/event");
      setTokenUri("https://example.com/token");
    },
  });

  return (
    <div className="w-full max-w-xs">
      {latestPost ? (
        <p className="truncate">Your most recent event: {latestPost.eventName}</p>
      ) : (
        <p>You have no posts yet.</p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createPost.mutate({ 
            eventName,
            tokenName,
            tokenSymbol,
            maxSupply,
            eventUri,
            tokenUri
          });
        }}
        className="flex flex-col gap-2"
      >
        <input
          type="text"
          placeholder="Event Name"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          className="w-full rounded-full bg-white/10 px-4 py-2 text-white mb-2"
        />
        <input
          type="text"
          placeholder="Token Name"
          value={tokenName}
          onChange={(e) => setTokenName(e.target.value)}
          className="w-full rounded-full bg-white/10 px-4 py-2 text-white mb-2"
        />
        <input
          type="text"
          placeholder="Token Symbol"
          value={tokenSymbol}
          onChange={(e) => setTokenSymbol(e.target.value)}
          className="w-full rounded-full bg-white/10 px-4 py-2 text-white mb-2"
        />
        <input
          type="number"
          placeholder="Max Supply"
          value={maxSupply}
          onChange={(e) => setMaxSupply(parseInt(e.target.value))}
          className="w-full rounded-full bg-white/10 px-4 py-2 text-white"
        />
        <button
          type="submit"
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
          disabled={createPost.isPending}
        >
          {createPost.isPending ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}

"use node";
/// <reference types="node" />
import { action } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

const GEOAPIFY_BASE = "https://api.geoapify.com/v1";
const ROUTING_BASE = "https://api.geoapify.com/v1/routing";

export const autocomplete = action({
  args: {
    text: v.string(),
    countryCode: v.optional(v.string()),
  },
  handler: async (_ctx, args): Promise<{
    features: Array<{
      formatted: string;
      lat: number;
      lon: number;
      placeId: string;
    }>;
  }> => {
    const key = process.env.GEOAPIFY_API_KEY;
    if (!key) throw new ConvexError({ message: "Geoapify not configured", code: "BAD_REQUEST" });

    const params = new URLSearchParams({
      text: args.text,
      apiKey: key,
      limit: "8",
      lang: "en",
      filter: "countrycode:ph",
      bias: "proximity:120.9842,14.5995",
    });

    const res = await fetch(`${GEOAPIFY_BASE}/geocode/autocomplete?${params}`);
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`Geoapify autocomplete error: HTTP ${res.status}`, body);
      throw new ConvexError({ message: "Geoapify error", code: "EXTERNAL_SERVICE_ERROR" });
    }

    const data = await res.json() as {
      features: Array<{
        properties: {
          formatted: string;
          lat: number;
          lon: number;
          place_id: string;
        };
      }>;
    };

    return {
      features: (data.features || []).map((f) => ({
        formatted: f.properties.formatted,
        lat: f.properties.lat,
        lon: f.properties.lon,
        placeId: f.properties.place_id,
      })),
    };
  },
});

export const calculateDistance = action({
  args: {
    originLat: v.number(),
    originLon: v.number(),
    destLat: v.number(),
    destLon: v.number(),
  },
  handler: async (_ctx, args): Promise<{ distanceKm: number; durationMinutes: number }> => {
    const key = process.env.GEOAPIFY_API_KEY;
    if (!key) throw new ConvexError({ message: "Geoapify not configured", code: "BAD_REQUEST" });

    const params = new URLSearchParams({
      waypoints: `${args.originLat},${args.originLon}|${args.destLat},${args.destLon}`,
      mode: "drive",
      apiKey: key,
    });

    const res = await fetch(`${ROUTING_BASE}?${params}`);
    if (!res.ok) {
      const R = 6371;
      const dLat = ((args.destLat - args.originLat) * Math.PI) / 180;
      const dLon = ((args.destLon - args.originLon) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((args.originLat * Math.PI) / 180) *
          Math.cos((args.destLat * Math.PI) / 180) *
          Math.sin(dLon / 2) ** 2;
      const distanceKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return { distanceKm, durationMinutes: Math.round(distanceKm * 3) };
    }

    const data = await res.json() as {
      features: Array<{
        properties: { distance: number; time: number };
      }>;
    };

    const feature = data.features?.[0]?.properties;
    if (!feature) {
      return { distanceKm: 0, durationMinutes: 0 };
    }

    return {
      distanceKm: feature.distance / 1000,
      durationMinutes: Math.round(feature.time / 60),
    };
  },
});

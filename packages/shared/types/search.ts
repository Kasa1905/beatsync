import { z } from "zod";

// Search category types
export const SearchCategory = z.enum(["tracks", "albums", "artists", "all"]);
export type SearchCategoryType = z.infer<typeof SearchCategory>;

// Artist result schema
export const ArtistResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  images: z.array(z.object({
    url: z.string(),
    width: z.number().optional(),
    height: z.number().optional(),
  })).optional(),
  genres: z.array(z.string()).optional(),
  popularity: z.number().optional(),
  followers: z.number().optional(),
  external_urls: z.object({
    spotify: z.string().optional(),
  }).optional(),
});
export type ArtistResultType = z.infer<typeof ArtistResultSchema>;

// Album result schema  
export const AlbumResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  artists: z.array(z.object({
    id: z.string(),
    name: z.string(),
  })),
  images: z.array(z.object({
    url: z.string(),
    width: z.number().optional(),
    height: z.number().optional(),
  })).optional(),
  release_date: z.string().optional(),
  total_tracks: z.number().optional(),
  album_type: z.string().optional(), // "album", "single", "compilation"
  external_urls: z.object({
    spotify: z.string().optional(),
  }).optional(),
});
export type AlbumResultType = z.infer<typeof AlbumResultSchema>;

// Track result schema (existing but enhanced)
export const TrackResultSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string(),
  artist: z.string(),
  duration: z.number().optional(),
  thumbnail: z.string().optional(),
  source: z.enum(["external", "spotify", "mock"]).optional(),
  spotifyId: z.string().optional(),
  previewUrl: z.string().optional(),
  album: z.object({
    name: z.string(),
    image: z.string().optional(),
  }).optional(),
});
export type TrackResultType = z.infer<typeof TrackResultSchema>;

// Enhanced search response with categories
export const CategorizedSearchResponseSchema = z.object({
  tracks: z.object({
    items: z.array(TrackResultSchema),
    total: z.number(),
    hasMore: z.boolean().optional(),
  }).optional(),
  albums: z.object({
    items: z.array(AlbumResultSchema),
    total: z.number(),
    hasMore: z.boolean().optional(),
  }).optional(),
  artists: z.object({
    items: z.array(ArtistResultSchema),
    total: z.number(),
    hasMore: z.boolean().optional(),
  }).optional(),
  provider: z.string().optional(),
});
export type CategorizedSearchResponseType = z.infer<typeof CategorizedSearchResponseSchema>;

// Updated search request schema
export const SearchMusicRequestSchema = z.object({
  type: z.literal("SEARCH_MUSIC"),
  query: z.string(),
  category: SearchCategory.optional().default("tracks"),
  offset: z.number().optional().default(0),
  limit: z.number().optional().default(20),
});
export type SearchMusicRequestType = z.infer<typeof SearchMusicRequestSchema>;

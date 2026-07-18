export type SimplifiedTrack = {
  id: string
  name: string
  artist: string
  coverUrl: string
  durationMs: number
  spotifyUrl: string
}

type TokenCache = {
  accessToken: string
  expiresAt: number
}

let tokenCache: TokenCache | null = null

export async function getAccessToken(): Promise<string> {
  const now = Date.now()

  if (tokenCache && now < tokenCache.expiresAt) {
    return tokenCache.accessToken
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error("Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET")
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })

  if (!res.ok) {
    throw new Error(`Spotify token request failed: ${res.status}`)
  }

  const data = await res.json()

  // Cache with 55min TTL (token expires in 3600s)
  tokenCache = {
    accessToken: data.access_token,
    expiresAt: now + 55 * 60 * 1000,
  }

  return tokenCache.accessToken
}

export async function getPlaylistTracks(playlistId: string): Promise<SimplifiedTrack[]> {
  const token = await getAccessToken()

  const res = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks?fields=items(track(id,name,duration_ms,artists,album(images),external_urls))&limit=50`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  )

  if (!res.ok) {
    throw new Error(`Spotify playlist request failed: ${res.status}`)
  }

  const data = await res.json()

  return (data.items as Array<{ track: SpotifyTrack | null }>)
    .filter((item) => item.track !== null)
    .map((item) => {
      const track = item.track!
      return {
        id: track.id,
        name: track.name,
        artist: track.artists[0]?.name ?? "Unknown",
        coverUrl: pickCover(track.album.images),
        durationMs: track.duration_ms,
        spotifyUrl: track.external_urls.spotify,
      }
    })
}

/**
 * Spotify returns 3 sizes (≈640 / 300 / 64px). The widget renders the cover at 72px,
 * so grab the smallest that still looks crisp on retina (≥144px) instead of the 640px hero.
 * The image is still served intact from Spotify's CDN — no re-hosting, per their terms.
 */
function pickCover(images: Array<{ url: string; width?: number }>): string {
  if (images.length === 0) return ""
  const sorted = [...images].sort((a, b) => (a.width ?? 0) - (b.width ?? 0))
  const retina = sorted.find((img) => (img.width ?? 0) >= 144)
  return (retina ?? sorted[sorted.length - 1]).url
}

type SpotifyTrack = {
  id: string
  name: string
  duration_ms: number
  artists: Array<{ name: string }>
  album: { images: Array<{ url: string; width?: number; height?: number }> }
  external_urls: { spotify: string }
}

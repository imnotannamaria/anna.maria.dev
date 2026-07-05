import { NextResponse } from "next/server"
import { getPlaylistTracks } from "@/lib/spotify"

export const revalidate = 300

export async function GET() {
  const playlistId = process.env.SPOTIFY_PLAYLIST_ID

  if (!playlistId) {
    return NextResponse.json({ error: "Missing SPOTIFY_PLAYLIST_ID" }, { status: 500 })
  }

  try {
    const tracks = await getPlaylistTracks(playlistId)
    return NextResponse.json(tracks)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

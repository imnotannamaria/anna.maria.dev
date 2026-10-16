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
    // what went wrong is for the log: the message names env vars and upstream statuses
    console.error("[now-playing]", err)
    return NextResponse.json({ error: "Could not load the playlist." }, { status: 500 })
  }
}

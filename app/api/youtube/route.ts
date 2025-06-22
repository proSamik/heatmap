import { type NextRequest, NextResponse } from "next/server"
import { db, youtubeUploads, syncStatus } from "@/lib/db"
import { eq, and, gte, lte } from "drizzle-orm"
import { getDateRange } from "@/lib/utils/date"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")
  const forceRefresh = searchParams.get("refresh") === "true"

  if (!startDate || !endDate) {
    return NextResponse.json({ error: "Start date and end date are required" }, { status: 400 })
  }

  try {
    let missingDates: string[] = []

    if (forceRefresh) {
      missingDates = getDateRange(startDate, endDate)
    } else {
      const existingData = await db
        .select()
        .from(youtubeUploads)
        .where(and(gte(youtubeUploads.date, startDate), lte(youtubeUploads.date, endDate)))

      const existingDates = new Set(existingData.map((d) => d.date))
      const requiredDates = getDateRange(startDate, endDate)
      missingDates = requiredDates.filter((date) => !existingDates.has(date))
    }

    if (missingDates.length > 0) {
      await fetchAndStoreYoutubeData(missingDates, forceRefresh)
    }

    const allData = await db
      .select()
      .from(youtubeUploads)
      .where(and(gte(youtubeUploads.date, startDate), lte(youtubeUploads.date, endDate)))
      .orderBy(youtubeUploads.date)

    await db
      .update(syncStatus)
      .set({
        lastSyncDate: endDate,
        isInitialized: true,
        updatedAt: new Date(),
      })
      .where(eq(syncStatus.platform, "youtube"))

    return NextResponse.json({
      data: allData.map((d) => ({
        date: d.date,
        count: d.count,
        details: d.details,
      })),
    })
  } catch (error) {
    console.error("Error fetching YouTube data:", error)
    return NextResponse.json({ error: "Failed to fetch YouTube data" }, { status: 500 })
  }
}

async function fetchAndStoreYoutubeData(dates: string[], forceRefresh = false) {
  const channelHandle = process.env.YOUTUBE_USERNAME!
  const apiKey = process.env.YOUTUBE_API!

  try {
    let channelId: string | null = null

    // Try multiple methods to find channel
    const methods = [
      () => fetch(`https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${channelHandle}&key=${apiKey}`),
      () => fetch(`https://www.googleapis.com/youtube/v3/channels?part=id&forUsername=${channelHandle}&key=${apiKey}`),
      () =>
        fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(channelHandle)}&key=${apiKey}`,
        ),
    ]

    for (const [index, method] of methods.entries()) {
      try {
        const response = await method()
        if (response.ok) {
          const data = await response.json()
          if (data.items && data.items.length > 0) {
            channelId = index === 2 ? data.items[0].snippet.channelId : data.items[0].id
            break
          }
        }
      } catch (error) {
        continue
      }
    }

    if (!channelId) {
      throw new Error(`Channel not found for handle: ${channelHandle}`)
    }

    const startDate = new Date(Math.min(...dates.map((d) => new Date(d).getTime())))
    const endDate = new Date(Math.max(...dates.map((d) => new Date(d).getTime())))

    const publishedAfter = startDate.toISOString()
    const publishedBefore = new Date(endDate.getTime() + 24 * 60 * 60 * 1000).toISOString()

    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=50&publishedAfter=${publishedAfter}&publishedBefore=${publishedBefore}&key=${apiKey}`,
    )

    if (!videosResponse.ok) {
      throw new Error(`YouTube API error: ${videosResponse.status}`)
    }

    const videosData = await videosResponse.json()

    // Group videos by upload date with details
    const videosByDate = new Map<string, { id: string; title: string; thumbnail: string }[]>()

    videosData.items?.forEach((video: any) => {
      const uploadDate = video.snippet.publishedAt.split("T")[0]
      if (dates.includes(uploadDate)) {
        if (!videosByDate.has(uploadDate)) {
          videosByDate.set(uploadDate, [])
        }
        videosByDate.get(uploadDate)!.push({
          id: video.id.videoId,
          title: video.snippet.title,
          thumbnail: video.snippet.thumbnails.default.url,
        })
      }
    })

    const dataToStore = dates.map((date) => ({
      date,
      count: videosByDate.get(date)?.length || 0,
      videoIds: videosByDate.get(date)?.map((v) => v.id) || [],
      details: { videos: videosByDate.get(date) || [] },
    }))

    if (dataToStore.length > 0) {
      if (forceRefresh) {
        await db
          .delete(youtubeUploads)
          .where(and(gte(youtubeUploads.date, dates[0]), lte(youtubeUploads.date, dates[dates.length - 1])))
        await db.insert(youtubeUploads).values(dataToStore)
      } else {
        await db
          .insert(youtubeUploads)
          .values(dataToStore)
          .onConflictDoUpdate({
            target: youtubeUploads.date,
            set: {
              count: dataToStore[0].count,
              videoIds: dataToStore[0].videoIds,
              details: dataToStore[0].details,
              updatedAt: new Date(),
            },
          })
      }
    }
  } catch (error) {
    console.error("Error fetching from YouTube API:", error)
    const emptyData = dates.map((date) => ({ date, count: 0, videoIds: [], details: { videos: [] } }))
    await db.insert(youtubeUploads).values(emptyData).onConflictDoNothing()
    throw error
  }
}

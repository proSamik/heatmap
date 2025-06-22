import { type NextRequest, NextResponse } from "next/server"
import { db, githubContributions, syncStatus } from "@/lib/db"
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
        .from(githubContributions)
        .where(and(gte(githubContributions.date, startDate), lte(githubContributions.date, endDate)))

      const existingDates = new Set(existingData.map((d) => d.date))
      const requiredDates = getDateRange(startDate, endDate)
      missingDates = requiredDates.filter((date) => !existingDates.has(date))
    }

    if (missingDates.length > 0) {
      await fetchAndStoreGithubData(missingDates, forceRefresh)
    }

    const allData = await db
      .select()
      .from(githubContributions)
      .where(and(gte(githubContributions.date, startDate), lte(githubContributions.date, endDate)))
      .orderBy(githubContributions.date)

    await db
      .update(syncStatus)
      .set({
        lastSyncDate: endDate,
        isInitialized: true,
        updatedAt: new Date(),
      })
      .where(eq(syncStatus.platform, "github"))

    return NextResponse.json({
      data: allData.map((d) => ({
        date: d.date,
        count: d.count,
        details: d.details,
      })),
    })
  } catch (error) {
    console.error("Error fetching GitHub data:", error)
    return NextResponse.json({ error: "Failed to fetch GitHub data" }, { status: 500 })
  }
}

async function fetchAndStoreGithubData(dates: string[], forceRefresh = false) {
  const username = process.env.GITHUB_USERNAME!
  const token = process.env.GITHUB_API!

  const query = `
    query($username: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $username) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `

  try {
    const fromDate = new Date(dates[0])
    const toDate = new Date(dates[dates.length - 1])
    toDate.setDate(toDate.getDate() + 1) // Include the end date

    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables: {
          username,
          from: fromDate.toISOString(),
          to: toDate.toISOString(),
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const result = await response.json()
    const contributionDays = result.data.user.contributionsCollection.contributionCalendar.weeks.flatMap(
      (week: any) => week.contributionDays,
    )

    // Get detailed commit information for days with contributions
    const dataToStore = await Promise.all(
      contributionDays
        .filter((day: any) => dates.includes(day.date))
        .map(async (day: any) => {
          let details = { repos: [], commits: [] }

          if (day.contributionCount > 0) {
            try {
              // Fetch commits for this specific date
              const commitsResponse = await fetch(
                `https://api.github.com/search/commits?q=author:${username}+author-date:${day.date}&sort=author-date&order=desc`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/vnd.github.cloak-preview",
                  },
                },
              )

              if (commitsResponse.ok) {
                const commitsData = await commitsResponse.json()
                const repos = new Set<string>()
                const commits: { repo: string; message: string }[] = []

                commitsData.items?.forEach((commit: any) => {
                  const repoName = commit.repository.full_name
                  repos.add(repoName)
                  commits.push({
                    repo: repoName,
                    message: commit.commit.message.split("\n")[0], // First line only
                  })
                })

                details = {
                  repos: Array.from(repos),
                  commits: commits.slice(0, 10), // Limit to 10 commits
                }
              }
            } catch (error) {
              console.log(`Failed to fetch commit details for ${day.date}:`, error)
            }
          }

          return {
            date: day.date,
            count: day.contributionCount,
            details,
          }
        }),
    )

    if (dataToStore.length > 0) {
      if (forceRefresh) {
        await db
          .delete(githubContributions)
          .where(and(gte(githubContributions.date, dates[0]), lte(githubContributions.date, dates[dates.length - 1])))
        await db.insert(githubContributions).values(dataToStore)
      } else {
        await db
          .insert(githubContributions)
          .values(dataToStore)
          .onConflictDoUpdate({
            target: githubContributions.date,
            set: {
              count: dataToStore[0].count,
              details: dataToStore[0].details,
              updatedAt: new Date(),
            },
          })
      }
    }
  } catch (error) {
    console.error("Error fetching from GitHub API:", error)
    const emptyData = dates.map((date) => ({ date, count: 0, details: { repos: [], commits: [] } }))
    await db.insert(githubContributions).values(emptyData).onConflictDoNothing()
  }
}

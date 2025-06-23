"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, RefreshCw, Calendar, Lock, Eye, EyeOff, Share, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface RefreshPanelProps {
  onRefreshComplete?: () => void
}

export function RefreshPanel({ onRefreshComplete }: RefreshPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState("")

  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setMonth(date.getMonth() - 1)
    return date.toISOString().split("T")[0]
  })
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0]
  })
  const [loading, setLoading] = useState({ github: false, youtube: false })
  const [results, setResults] = useState<{
    github?: { success: boolean; message: string; count?: number }
    youtube?: { success: boolean; message: string; count?: number }
  }>({})

  const authenticate = async () => {
    setAuthLoading(true)
    setAuthError("")

    try {
      const response = await fetch("/api/auth-refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsAuthenticated(true)
        setPassword("")
      } else {
        setAuthError(data.error || "Authentication failed")
      }
    } catch (error) {
      setAuthError("Network error")
    } finally {
      setAuthLoading(false)
    }
  }

  const refreshData = async (platform: "github" | "youtube") => {
    setLoading((prev) => ({ ...prev, [platform]: true }))

    try {
      const url = `/api/${platform}?startDate=${startDate}&endDate=${endDate}&refresh=true`
      const response = await fetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      setResults((prev) => ({
        ...prev,
        [platform]: {
          success: true,
          message: `Successfully refreshed ${platform} data`,
          count: data.data?.length || 0,
        },
      }))

      onRefreshComplete?.()
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        [platform]: {
          success: false,
          message: error instanceof Error ? error.message : String(error),
        },
      }))
    } finally {
      setLoading((prev) => ({ ...prev, [platform]: false }))
    }
  }

  const refreshBoth = async () => {
    await Promise.all([refreshData("github"), refreshData("youtube")])
  }

  const setQuickDate = (days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - days)

    setStartDate(start.toISOString().split("T")[0])
    setEndDate(end.toISOString().split("T")[0])
  }

  const isLoading = loading.github || loading.youtube
  const [shareLoading, setShareLoading] = useState(false)

  const shareHeatmap = async (platform: 'github' | 'youtube' | 'both') => {
    setShareLoading(true)
    try {
      let elementId = ''
      let filename = ''
      
      if (platform === 'both') {
        elementId = 'heatmaps-container'
        filename = 'github-youtube-heatmaps.png'
      } else if (platform === 'github') {
        elementId = 'github-heatmap'
        filename = 'github-heatmap.png'
      } else {
        elementId = 'youtube-heatmap'
        filename = 'youtube-heatmap.png'
      }
      
      const element = document.getElementById(elementId)
      if (!element) {
        throw new Error('Heatmap element not found')
      }
      
      const { toPng } = await import('html-to-image')
      const dataUrl = await toPng(element, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#ffffff'
      })
      
      // Create download link
      const link = document.createElement('a')
      link.download = filename
      link.href = dataUrl
      link.click()
      
    } catch (error) {
      console.error('Error generating image:', error)
      alert('Failed to generate image. Please try again.')
    } finally {
      setShareLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <Card className="mb-6 border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Lock className="h-5 w-5" />
            Admin Access Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="password">Enter admin password to access manual refresh</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && authenticate()}
                placeholder="Admin password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button onClick={authenticate} disabled={authLoading || !password} className="w-full">
            {authLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
            Authenticate
          </Button>

          {authError && <div className="text-sm text-red-600">{authError}</div>}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-6 border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <RefreshCw className="h-5 w-5" />
          Manual Data Refresh
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAuthenticated(false)}
            className="ml-auto text-green-600 hover:text-green-800"
          >
            <Lock className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate}
            />
          </div>
          <div>
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>

        {/* Quick Date Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setQuickDate(7)}>
            Last 7 days
          </Button>
          <Button variant="outline" size="sm" onClick={() => setQuickDate(30)}>
            Last 30 days
          </Button>
          <Button variant="outline" size="sm" onClick={() => setQuickDate(90)}>
            Last 3 months
          </Button>
          <Button variant="outline" size="sm" onClick={() => setQuickDate(365)}>
            Last year
          </Button>
        </div>

        {/* Refresh Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => refreshData("github")} disabled={isLoading} className="flex items-center gap-2">
            {loading.github ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh GitHub
          </Button>

          <Button
            onClick={() => refreshData("youtube")}
            disabled={isLoading}
            variant="outline"
            className="flex items-center gap-2"
          >
            {loading.youtube ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh YouTube
          </Button>

          <Button onClick={refreshBoth} disabled={isLoading} variant="secondary" className="flex items-center gap-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh Both
          </Button>
        </div>

        {/* Share Buttons */}
        <div className="border-t pt-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Share className="h-4 w-4" />
            Share Heatmaps
          </h4>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => shareHeatmap('github')} 
              disabled={shareLoading}
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              {shareLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              GitHub Heatmap
            </Button>

            <Button 
              onClick={() => shareHeatmap('youtube')} 
              disabled={shareLoading}
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              {shareLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              YouTube Heatmap
            </Button>

            <Button 
              onClick={() => shareHeatmap('both')} 
              disabled={shareLoading}
              variant="default" 
              size="sm"
              className="flex items-center gap-2"
            >
              {shareLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Both Heatmaps
            </Button>
          </div>
        </div>

        {/* Results */}
        {(results.github || results.youtube) && (
          <div className="space-y-2">
            <h4 className="font-semibold">Refresh Results:</h4>
            {results.github && (
              <div className="flex items-center gap-2">
                <Badge variant={results.github.success ? "default" : "destructive"}>GitHub</Badge>
                <span className="text-sm">
                  {results.github.message}
                  {results.github.count !== undefined && ` (${results.github.count} records)`}
                </span>
              </div>
            )}
            {results.youtube && (
              <div className="flex items-center gap-2">
                <Badge variant={results.youtube.success ? "default" : "destructive"}>YouTube</Badge>
                <span className="text-sm">
                  {results.youtube.message}
                  {results.youtube.count !== undefined && ` (${results.youtube.count} records)`}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Date Range Info */}
        <div className="text-sm text-gray-600 flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Selected range: {startDate} to {endDate} (
          {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days)
        </div>
      </CardContent>
    </Card>
  )
}

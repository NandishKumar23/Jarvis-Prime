import { FunctionTool } from '@google/adk'
import { z } from 'zod'

/**
 * Live sports-news tool for the ADK sports agent.
 *
 * Fetches headlines from Google News RSS (free, no API key). Defaults to top
 * cricket & football coverage and supports both the India and World editions.
 */

const DEFAULT_QUERY = 'cricket OR football'

const EDITIONS = {
  IN: { hl: 'en-IN', gl: 'IN', ceid: 'IN:en' },
  WORLD: { hl: 'en-US', gl: 'US', ceid: 'US:en' },
} as const

type Region = keyof typeof EDITIONS

export interface NewsHeadline {
  title: string
  source: string
  publishedAt: string
  link: string
}

function buildFeedUrl(query: string, region: Region): string {
  const edition = EDITIONS[region]
  const params = new URLSearchParams({
    q: `${query} when:2d`,
    hl: edition.hl,
    gl: edition.gl,
    ceid: edition.ceid,
  })
  return `https://news.google.com/rss/search?${params.toString()}`
}

/** Extracts the first capture group of a regex, decoding common HTML entities. */
function firstMatch(block: string, pattern: RegExp): string {
  const match = block.match(pattern)
  if (!match?.[1]) return ''
  return decodeEntities(match[1].trim())
}

function decodeEntities(input: string): string {
  return input
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim()
}

/** Minimal RSS `<item>` parser (avoids adding an XML dependency). */
function parseItems(xml: string, limit: number): NewsHeadline[] {
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) ?? []
  return items.slice(0, limit).map((block) => {
    const rawTitle = firstMatch(block, /<title>([\s\S]*?)<\/title>/)
    // Google News titles are usually "Headline - Source"; split the source off.
    const dashIndex = rawTitle.lastIndexOf(' - ')
    const title = dashIndex > 0 ? rawTitle.slice(0, dashIndex) : rawTitle
    const titleSource = dashIndex > 0 ? rawTitle.slice(dashIndex + 3) : ''
    return {
      title,
      source: firstMatch(block, /<source[^>]*>([\s\S]*?)<\/source>/) || titleSource,
      publishedAt: firstMatch(block, /<pubDate>([\s\S]*?)<\/pubDate>/),
      link: firstMatch(block, /<link>([\s\S]*?)<\/link>/),
    }
  })
}

export const getSportsNews = new FunctionTool({
  name: 'get_sports_news',
  description:
    'Fetches the latest live sports headlines (defaults to top cricket and football). ' +
    'Use the query to focus on a team, league, or match (e.g. "India vs Australia", ' +
    '"Premier League"). Use region to choose the India or World edition.',
  parameters: z.object({
    query: z
      .string()
      .optional()
      .describe('Optional focus, e.g. a team/league/match. Defaults to cricket and football.'),
    region: z
      .enum(['IN', 'WORLD'])
      .optional()
      .describe('News edition: IN (India) or WORLD (global). Defaults to IN.'),
  }),
  execute: async ({ query, region }) => {
    const resolvedQuery = query?.trim() || DEFAULT_QUERY
    const resolvedRegion: Region = region ?? 'IN'

    try {
      const response = await fetch(buildFeedUrl(resolvedQuery, resolvedRegion), {
        headers: { 'User-Agent': 'Mozilla/5.0 (JarvisPrime ADK Sports Agent)' },
      })

      if (!response.ok) {
        return {
          status: 'error',
          message: `News feed request failed with status ${response.status}.`,
        }
      }

      const xml = await response.text()
      const headlines = parseItems(xml, 6)

      if (headlines.length === 0) {
        return {
          status: 'empty',
          query: resolvedQuery,
          region: resolvedRegion,
          message: 'No recent headlines found for this query.',
        }
      }

      return {
        status: 'success',
        query: resolvedQuery,
        region: resolvedRegion,
        count: headlines.length,
        headlines,
      }
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to fetch sports news.',
      }
    }
  },
})

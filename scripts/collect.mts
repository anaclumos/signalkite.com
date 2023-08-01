import { log, sanitize } from './util.mjs'
import { YoutubeTranscript } from 'youtube-transcript'
import puppeteer, { Browser } from 'puppeteer-core'

export const collect = async (url: string): Promise<string> => {
  if (url === '') return ''

  let body = ''

  // 1. Youtube
  if (url?.includes('youtu')) {
    try {
      const videoId =
        url.split('v=')[1].split('&')[0] ??
        url.split('youtu.be/')[1].split('&')[0] ??
        url.split('youtube.com/embed/')[1].split('&')[0] ??
        url.split('youtube.com/watch?v=')[1].split('&')[0]
      const transcript = await YoutubeTranscript.fetchTranscript(videoId)
      body = transcript.map((t) => t.text).join(' ')
      if (body?.toString().trim() === '') {
        throw new Error('😵 Youtube Transcript is empty')
      }
    } catch (e) {
      log(`❌ Error\tCannot Download Youtube Transcript for ${url}`, 'error')
    }
  }

  if (url?.includes('twitter')) {
    url = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`
    body = await fetch(url)
      .then((r) => r.json())
      .then((r) => r.html)
  }

  if (body === '') {
    let browser: Browser = null
    try {
      browser = await puppeteer.connect({
        browserWSEndpoint: `wss://${process.env.BRIGHTDATA_USERNAME}:${process.env.BRIGHTDATA_PASSWORD}@${process.env.BRIGHTDATA_PROXY}`,
      })
    } catch (e) {
      log(`🚨\t BrightData Proxy is not available`, 'error')
      browser = await puppeteer.launch()
    }
    body = await extract(url, browser)
    log(`✅ Downloaded\t BrightData for ${url}`, 'info')
  }

  return sanitize(body)
}

const extract = async (url: string, browser: Browser): Promise<string> => {
  let body = ''
  try {
    const page = await browser.newPage()
    page.setDefaultNavigationTimeout(2 * 60 * 1000)
    await page.goto(url)
    await page.waitForSelector('body')
    const article = await page.$('article')
    if (article) {
      body = await page.$eval('article', (el) => el.innerText)
    }
    const main = await page.$('main')
    if (main) {
      body = await page.$eval('main', (el) => el.innerText)
    }
    const bodyEl = await page.$('body')
    if (bodyEl) {
      body = await page.$eval('body', (el) => el.innerText)
    }
  } catch (e) {
    console.error('run failed', e)
  } finally {
    await browser?.close()
  }
  return sanitize(body)
}

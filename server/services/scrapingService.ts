import puppeteer from 'puppeteer';
import { storage } from '../storage';
import type { InsertWebsiteContent } from '@shared/schema';

export class ScrapingService {
  async scrapeWebsite(url: string, tenantId: string): Promise<{
    success: boolean;
    pages: number;
    error?: string;
  }> {
    let browser;
    let scrapedPages = 0;

    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle2' });

      // Extract main content
      const content = await page.evaluate(() => {
        // Remove script and style elements
        const scripts = document.querySelectorAll('script, style');
        scripts.forEach(el => el.remove());

        // Get main content
        const main = document.querySelector('main') || 
                    document.querySelector('[role="main"]') || 
                    document.querySelector('body');
        
        return {
          title: document.title,
          content: main?.textContent?.trim() || '',
          url: window.location.href
        };
      });

      // Store the scraped content
      const websiteContent: InsertWebsiteContent = {
        tenantId,
        url: content.url,
        title: content.title,
        content: content.content,
        contentType: 'webpage',
        isProcessed: false
      };

      await storage.createWebsiteContent(websiteContent);
      scrapedPages = 1;

      // Try to find and scrape linked pages
      const links = await page.$$eval('a[href]', (anchors) =>
        anchors
          .map(anchor => anchor.getAttribute('href'))
          .filter(href => href && !href.startsWith('#') && !href.startsWith('mailto:'))
          .slice(0, 10) // Limit to 10 additional pages
      );

      for (const link of links) {
        try {
          let fullUrl = link;
          if (link.startsWith('/')) {
            const baseUrl = new URL(url);
            fullUrl = `${baseUrl.protocol}//${baseUrl.host}${link}`;
          } else if (!link.startsWith('http')) {
            continue;
          }

          await page.goto(fullUrl, { waitUntil: 'networkidle2', timeout: 10000 });
          
          const pageContent = await page.evaluate(() => {
            const scripts = document.querySelectorAll('script, style');
            scripts.forEach(el => el.remove());

            const main = document.querySelector('main') || 
                        document.querySelector('[role="main"]') || 
                        document.querySelector('body');
            
            return {
              title: document.title,
              content: main?.textContent?.trim() || '',
              url: window.location.href
            };
          });

          const linkedContent: InsertWebsiteContent = {
            tenantId,
            url: pageContent.url,
            title: pageContent.title,
            content: pageContent.content,
            contentType: 'webpage',
            isProcessed: false
          };

          await storage.createWebsiteContent(linkedContent);
          scrapedPages++;
        } catch (error) {
          console.log(`Failed to scrape linked page ${link}:`, error);
          continue;
        }
      }

      return {
        success: true,
        pages: scrapedPages
      };

    } catch (error) {
      console.error('Scraping error:', error);
      return {
        success: false,
        pages: scrapedPages,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  async processScrapedContent(tenantId: string): Promise<void> {
    const unprocessedContent = await storage.getWebsiteContentByTenant(tenantId);
    
    for (const content of unprocessedContent.filter(c => !c.isProcessed)) {
      // Here you could add AI processing to extract key information
      // For now, just mark as processed
      await storage.updateWebsiteContent(content.id, {
        isProcessed: true
      }, tenantId);
    }
  }
}

export const scrapingService = new ScrapingService();
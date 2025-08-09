import puppeteer from "puppeteer";

export class ScrapingService {
  async scrapeWebsite(url: string) {
    let browser;
    
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      
      // Set user agent to avoid being blocked
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Extract content
      const content = await page.evaluate(() => {
        // Remove script and style elements
        const scripts = document.querySelectorAll('script, style, nav, footer, .cookie-banner, .advertisement');
        scripts.forEach(el => el.remove());

        // Get title
        const title = document.title || '';

        // Get main content
        const contentSelectors = [
          'main',
          '[role="main"]', 
          '.content',
          '.main-content',
          'article',
          '.post-content',
          '.entry-content'
        ];

        let mainContent = '';
        
        for (const selector of contentSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            mainContent = element.innerText || '';
            break;
          }
        }

        // Fallback to body if no main content found
        if (!mainContent) {
          mainContent = document.body.innerText || '';
        }

        // Clean up the text
        const cleanText = mainContent
          .replace(/\s+/g, ' ')
          .replace(/\n\s*\n/g, '\n')
          .trim();

        return {
          title,
          content: cleanText.substring(0, 10000), // Limit content size
          url: window.location.href
        };
      });

      return content;
    } catch (error) {
      console.error("Web scraping error:", error);
      throw new Error(`Failed to scrape website: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  async scrapeMultiplePages(baseUrl: string, maxPages: number = 10) {
    let browser;
    const results = [];
    
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      const visitedUrls = new Set();
      const urlsToVisit = [baseUrl];

      while (urlsToVisit.length > 0 && results.length < maxPages) {
        const currentUrl = urlsToVisit.shift();
        
        if (!currentUrl || visitedUrls.has(currentUrl)) {
          continue;
        }

        visitedUrls.add(currentUrl);

        try {
          await page.goto(currentUrl, { 
            waitUntil: 'networkidle2',
            timeout: 15000 
          });

          // Extract content and links
          const data = await page.evaluate((baseUrl) => {
            // Remove unwanted elements
            const scripts = document.querySelectorAll('script, style, nav, footer, .cookie-banner, .advertisement');
            scripts.forEach(el => el.remove());

            const title = document.title || '';
            
            const contentElement = document.querySelector('main, [role="main"], .content, .main-content, article') || document.body;
            const content = contentElement ? contentElement.innerText.replace(/\s+/g, ' ').trim() : '';

            // Find internal links
            const links = Array.from(document.querySelectorAll('a[href]'))
              .map(a => (a as HTMLAnchorElement).href)
              .filter(href => href.startsWith(baseUrl) && !href.includes('#'))
              .slice(0, 5); // Limit links per page

            return {
              title,
              content: content.substring(0, 5000),
              url: window.location.href,
              links
            };
          }, baseUrl);

          results.push(data);

          // Add new URLs to visit
          data.links.forEach(link => {
            if (!visitedUrls.has(link) && urlsToVisit.length < 20) {
              urlsToVisit.push(link);
            }
          });

        } catch (pageError) {
          console.error(`Error scraping ${currentUrl}:`, pageError);
        }
      }

      return results;
    } catch (error) {
      console.error("Multi-page scraping error:", error);
      throw new Error(`Failed to scrape website: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  async extractContactInfo(url: string) {
    let browser;
    
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle2' });

      const contactInfo = await page.evaluate(() => {
        const text = document.body.innerText;
        
        // Extract email addresses
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
        const emails = text.match(emailRegex) || [];

        // Extract phone numbers
        const phoneRegex = /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
        const phones = text.match(phoneRegex) || [];

        // Extract addresses (simple heuristic)
        const addressRegex = /\d+\s+[\w\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Place|Pl)/gi;
        const addresses = text.match(addressRegex) || [];

        return {
          emails: [...new Set(emails)],
          phones: [...new Set(phones)],
          addresses: [...new Set(addresses)]
        };
      });

      return contactInfo;
    } catch (error) {
      console.error("Contact extraction error:", error);
      return { emails: [], phones: [], addresses: [] };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}

export const scrapingService = new ScrapingService();

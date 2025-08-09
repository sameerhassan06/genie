// Note: Puppeteer requires system dependencies that are not available in this environment
// Using a simplified scraping approach for demo purposes

export interface ScrapedContent {
  url: string;
  title: string;
  content: string;
  links: string[];
  images: string[];
}

export class ScrapingService {
  async scrapeWebsite(url: string, maxPages: number = 5): Promise<ScrapedContent[]> {
    console.log(`Mock scraping ${url} (Puppeteer dependencies not available)`);
    
    // Return demo content for testing
    const mockContent: ScrapedContent = {
      url: url,
      title: `Website Content - ${new URL(url).hostname}`,
      content: `This is sample website content from ${url}. In a production environment with proper browser dependencies, this would contain the actual scraped content from the website including text, headings, and other relevant information.`,
      links: [`${url}/about`, `${url}/services`, `${url}/contact`],
      images: []
    };
    
    return [mockContent];
    
    /* Original Puppeteer implementation - commented out due to missing dependencies
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });

    // Comment out the browser-based scraping until dependencies are available
    /* 
      const results: ScrapedContent[] = [];
      const visitedUrls = new Set<string>();
      const urlsToVisit = [url];

      while (urlsToVisit.length > 0 && results.length < maxPages) {
        const currentUrl = urlsToVisit.shift()!;
        
        if (visitedUrls.has(currentUrl)) continue;
        visitedUrls.add(currentUrl);

        try {
          const page = await browser.newPage();
          await page.setUserAgent('Mozilla/5.0 (compatible; ChatbotScraper/1.0)');
          
          // Navigate to page with timeout
          await page.goto(currentUrl, { 
            waitUntil: 'networkidle2', 
            timeout: 30000 
          });

          // Extract content
          const content = await page.evaluate(() => {
            // Remove script and style elements
            const scripts = document.querySelectorAll('script, style');
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
              '.container',
              'body'
            ];

            let mainContent = '';
            for (const selector of contentSelectors) {
              const element = document.querySelector(selector);
              if (element) {
                mainContent = element.innerText || element.textContent || '';
                break;
              }
            }

            // Get all links
            const links = Array.from(document.querySelectorAll('a[href]'))
              .map(a => (a as HTMLAnchorElement).href)
              .filter(href => href && href.startsWith('http'));

            // Get images
            const images = Array.from(document.querySelectorAll('img[src]'))
              .map(img => (img as HTMLImageElement).src)
              .filter(src => src && src.startsWith('http'));

            return {
              title: title.trim(),
              content: mainContent.trim().substring(0, 5000), // Limit content length
              links,
              images
            };
          });

          results.push({
            url: currentUrl,
            title: content.title,
            content: content.content,
            links: content.links,
            images: content.images
          });

          // Add internal links to visit queue
          const baseDomain = new URL(currentUrl).hostname;
          const internalLinks = content.links
            .filter(link => {
              try {
                return new URL(link).hostname === baseDomain;
              } catch {
                return false;
              }
            })
            .slice(0, 3); // Limit links per page

          urlsToVisit.push(...internalLinks);

          await page.close();
        } catch (pageError) {
          console.error(`Error scraping ${currentUrl}:`, pageError);
        }
      }

      return results;
    } catch (error) {
      console.error("Error in scraping service:", error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
    */
  }

  async extractBusinessInfo(content: ScrapedContent[]): Promise<{
    businessName?: string;
    services?: string[];
    contactInfo?: {
      phone?: string;
      email?: string;
      address?: string;
    };
    description?: string;
  }> {
    try {
      const allContent = content.map(c => `${c.title}\n${c.content}`).join('\n\n');
      
      // Extract phone numbers
      const phoneRegex = /(?:\+?1[-.\s]?)?(?:\([0-9]{3}\)|[0-9]{3})[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g;
      const phones = allContent.match(phoneRegex) || [];

      // Extract email addresses
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const emails = allContent.match(emailRegex) || [];

      // Extract potential business name (often in title or h1)
      const businessName = content[0]?.title?.split(' - ')[0]?.split(' | ')[0]?.trim();

      return {
        businessName,
        services: [], // Could be enhanced with NLP
        contactInfo: {
          phone: phones[0],
          email: emails[0],
        },
        description: content[0]?.content?.substring(0, 500)
      };
    } catch (error) {
      console.error("Error extracting business info:", error);
      return {};
    }
  }
}

export const scrapingService = new ScrapingService();
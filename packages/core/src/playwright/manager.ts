import {
  chromium,
  type Browser,
  type BrowserContext,
  type Page,
} from 'playwright';

export class PlaywrightManager {
  private static instance: PlaywrightManager;
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private activePage: Page | null = null;

  private constructor() {}

  public static getInstance(): PlaywrightManager {
    if (!PlaywrightManager.instance) {
      PlaywrightManager.instance = new PlaywrightManager();
    }
    return PlaywrightManager.instance;
  }

  public async getPage(): Promise<Page> {
    if (!this.activePage || this.activePage.isClosed()) {
      await this.init();
    }
    if (!this.activePage) {
      throw new Error('Failed to initialize Playwright page.');
    }
    return this.activePage;
  }

  public async getPageMetadata() {
    if (!this.context) return { tabs: [], activeTabIndex: -1 };
    const pages = this.context.pages();
    const tabs = await Promise.all(
      pages.map(async (p, i) => {
        try {
          return { index: i, url: p.url(), title: await p.title() };
        } catch {
          return { index: i, url: p.url(), title: 'Unknown' };
        }
      })
    );
    const activeTabIndex = pages.findIndex((p) => p === this.activePage);
    return { tabs, activeTabIndex };
  }

  public async switchPage(index: number): Promise<Page> {
    if (!this.context) throw new Error('Context not initialized');
    const pages = this.context.pages();
    if (index >= 0 && index < pages.length) {
      this.activePage = pages[index];
      await this.activePage.bringToFront();
      return this.activePage;
    }
    throw new Error(`Invalid page index: ${index}`);
  }

  public async start() {
    await this.init();
  }

  private async init() {
    if (!this.browser || !this.browser.isConnected()) {
      this.browser = await chromium.launch({
        channel: 'chrome',
        headless: false,
      });

      this.browser.on('disconnected', () => {
        this.browser = null;
        this.context = null;
        this.activePage = null;
      });
    }

    if (!this.context) {
      this.context = await this.browser.newContext({
        viewport: { width: 1280, height: 800 },
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      });

      this.context.on('page', (page) => {
        // Automatically switch to the new page when it opens
        this.activePage = page;
        page.on('close', () => {
          if (this.activePage === page) {
            const pages = this.context?.pages() || [];
            this.activePage = pages.length > 0 ? pages[pages.length - 1] : null;
          }
        });
      });

      this.context.on('close', () => {
        this.context = null;
        this.activePage = null;
      });
    }

    if (!this.activePage || this.activePage.isClosed()) {
      const pages = this.context.pages();
      if (pages.length > 0) {
        this.activePage = pages[pages.length - 1];
      } else {
        this.activePage = await this.context.newPage();
      }
    }
  }

  public async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.context = null;
      this.activePage = null;
    }
  }
}

export const playwrightManager = PlaywrightManager.getInstance();

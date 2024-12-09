// Documentation: https://docs.anythingllm.com/agent/custom/introduction

class ArticleType {
    static get TYPES() {
      return {
        top_stories: "",
        world: "world",
        uk: "uk",
        business: "business",
        politics: "politics",
        health: "health",
        education: "education",
        science_and_environment: "science_and_environment",
        technology: "technology",
        entertainment_and_arts: "entertainment_and_arts",
        england: "england",
        northern_ireland: "northern_ireland",
        scotland: "scotland",
        wales: "wales",
        africa: "world/africa",
        asia: "world/asia",
        australia: "world/australia",
        europe: "world/europe",
        latin_america: "world/latin_america",
        middle_east: "world/middle_east",
        us_and_canada: "world/us_and_canada"
      };
    }
  
    static getName(type) {
      return type.replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase());
    }
  
    static getUrl(type) {
      if (type === "top_stories" || !this.TYPES[type]) return "https://feeds.bbci.co.uk/news/rss.xml";
      return `https://feeds.bbci.co.uk/news/${this.TYPES[type]}/rss.xml`;
    }
  }
  
  /**
   * @typedef {Object} AnythingLLM
   * @property {import('./plugin.json')} config - your plugin's config
   * @property {function(string|Error): void} logger - Logging function
   * @property {function(string): void} introspect - Print a string to the UI while agent skill is running
   * @property {{getLinkContent: function(url): Promise<{success: boolean, content: string}>}} webScraper - Scrape a website easily to bypass user-agent restrictions.
   */
  
  /** @type {AnythingLLM} */
  module.exports.runtime = {
    /**
     * @param {import('./plugin.json')['entrypoint']['params']} args - Arguments passed to the agent skill - defined in plugin.json
     */
    handler: async function (args = {}) {
      const callerId = `Using tool ${this.config.name}-v${this.config.version}`;
      this.introspect(callerId);
      this.logger(callerId);
  
      try {
        if (args.action === "getBBCNewsFeed") return await this.getBBCNewsFeed(args.type || "top_stories");
        if (args.action === "getBBCNewsContent") return await this.getBBCNewsContent(args.url);
  
        return `Nothing to do`;
      } catch (e) {
        this.logger(e)
        this.introspect(
          `${callerId} failed to execute. Reason: ${e.message}`
        );
        return `Failed to execute agent skill. Error ${e.message}`;
      }
    },
  
    /**
     * Fetch the latest BBC News feed for a given type via RSS.
     * @param {string} type - The type of BBC News feed to retrieve.
     */
    getBBCNewsFeed: async function (type) {
      try {
        this.logger(`getBBCNewsFeed: ${type}`);
        this.introspect(`Starting BBC News Feed retrieval for articles in the '${ArticleType.getName(type)}' category...`);
  
        const url = ArticleType.getUrl(type);
        const response = await fetch(url);
        if (response.status !== 200) throw new Error(`Error: '${type}' (${url}) not found (${response.status})`);
  
        const xml2js = require('xml2js');
        const result = await xml2js.parseStringPromise(await response.text());
        const items = result.rss.channel[0].item.map(item => ({
          title: item.title[0],
          description: item.description[0],
          link: item.link[0],
          published: item.pubDate[0]
        }));
  
        const completionDescription = `Retrieved ${items.length} news items from BBC News Feed for articles in the '${ArticleType.getName(type)}' category.`;
        this.introspect(completionDescription);
        this.logger('getBBCNewsFeed: complete');
  
        return JSON.stringify(items);
      } catch (err) {
        const errorDescription = `Failed to retrieve any news items from BBC News Feed: ${err.message}`;
        this.logger(`getBBCNewsFeed: ${errorDescription}`);
        this.introspect(`Error: ${errorDescription}`);
        return `Error: ${errorDescription}`;
      }
    },
  
    /**
     * Fetch the content of a BBC News article from a given URL - just scrapes the page using the webScraper tool
     * that bypasses user-agent restrictions and other traditional `fetch` restrictions.
     * @param {string} url - The full URL of the BBC News article to retrieve the content of.
     */
    getBBCNewsContent: async function (url = null) {
      try {
        if (!url) throw new Error("No URL provided");
        this.introspect(`Starting BBC News Article retrieval from '${url}'...`);
        this.logger(`getBBCNewsContent: Retrieving content from '${url}'...`);
  
        const { success, content } = await this.webScraper.getLinkContent(url);
        if (!success) throw new Error(`Failed to retrieve BBC News Article content from '${url}'`);
  
        this.introspect(`Retrieved BBC News Article content from '${url}' (${content.length} characters).`);
        this.logger(`getBBCNewsContent: Found content.`);
  
        return content;
      } catch (err) {
        const errorDescription = `Failed to retrieve BBC News Article content from '${url}': ${err.message}`;
        this.introspect(errorDescription);
        this.logger(`getBBCNewsContent: ${errorDescription}`);
        return `Error: ${errorDescription}`;
      }
    }
  };
  
  
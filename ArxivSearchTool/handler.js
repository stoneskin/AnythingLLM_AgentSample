/**
 * @typedef {Object} AnythingLLM
 * @property {import('./plugin.json')} config - your plugin's config
 * @property {function(string|Error): void} logger - Logging function
 * @property {function(string): void} introspect - Print a string to the UI while agent skill is running
 */

/** @type {AnythingLLM} */
module.exports.runtime = {
    handler: async function (args = {}) {
      const callerId = `${this.config.name}-v${this.config.version}`;
      const baseUrl = "http://export.arxiv.org/api/query";
  
      try {
        const topic = args.topic || "";
        const maxResults = args.limit || 5;
  
        if (!topic) {
          this.introspect("Topic is required for the search.");
          throw new Error("Topic is required for the search.");
        }
  
        // Log start of the search
        this.logger("Searching arXiv database...");
        this.introspect("Searching arXiv database...");
  
        // Construct search query
        const searchQuery = `all:"${topic}" OR abs:"${topic}" OR ti:"${topic}"`;
        this.introspect(searchQuery);
        const params = [
          ["search_query", encodeURIComponent(searchQuery)],
          ["start", 0],
          ["max_results", maxResults],
          ["sortBy", "submittedDate"],
          ["sortOrder", "descending"],
        ];
        const searchURL = new URL(baseUrl);
        const searchParams = new URLSearchParams(params);
        searchURL.search = searchParams.toString();
        const response = await fetch(searchURL, { timeout: 30000 });
        const xmlData = await response.text();
  
        const { parseStringPromise } = require("xml2js");
        const parsedData = await parseStringPromise(xmlData, { explicitArray: false });
        const entries = parsedData.feed.entry || [];
  
        if (!Array.isArray(entries) || entries.length === 0) {
          this.logger(`No papers found on arXiv related to '${topic}'`);
          this.introspect(`No papers found on arXiv related to '${topic}'`);
          return `No papers found on arXiv related to '${topic}'`;
        }
  
        this.introspect(`Found ${entries.length} recent papers on arXiv about '${topic}':`);
        let results = `Found ${entries.length} recent papers on arXiv about '${topic}':\n\n`;
  
        let entryThoughts = "";
        entries.forEach((entry, index) => {
          const title = entry.title || "Unknown Title";
          const authors = (entry.author || []).map((author) => author.name).join(", ") || "Unknown Authors";
          entryThoughts += `"${title}"\n`;
          const summary = entry.summary || "No summary available";
          const link = entry.id || "No link available";
          const published = entry.published
            ? new Date(entry.published).toISOString().split("T")[0]
            : "Unknown Date";
  
          results += `${index + 1}. ${title}\n`;
          results += `   Authors: ${authors}\n`;
          results += `   Published: ${published}\n`;
          results += `   URL: ${link}\n`;
          results += `   Summary: ${summary}\n\n`;
        });
  
        this.introspect(entryThoughts);
        this.logger("Search completed");
        this.introspect("Search completed - going over results...");
        return results;
      } catch (e) {
        this.logger(e)
        this.introspect(
          `${callerId} failed to execute. Reason: ${e.message}`
        );
        return `Failed to execute agent skill. Error ${e.message}`;
      }
    }
  };
  
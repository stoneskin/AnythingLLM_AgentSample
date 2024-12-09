# Create Agent for AnythingLLM

## Guidelines for creation of custom agent skills

- **Develop Guide:** 
    [https://docs.anythingllm.com/agent/custom/developer-guide](https://docs.anythingllm.com/agent/custom/developer-guide)

- **Plugin.json:**
 [https://docs.anythingllm.com/agent/custom/plugin-json](https://docs.anythingllm.com/agent/custom/plugin-json)
- **Handler.js:** 
[https://docs.anythingllm.com/agent/custom/handler-js](https://docs.anythingllm.com/agent/custom/handler-js)

## Notes

- **Location of the agent-skill **
in my case , when I run docker, the STORAGE_LOCATION is `\anythingllm_host\` folder, so my agent-sill is located in the following folder:
`\anythingllm_host\plugins\agent-skills`

    
- **Create the custom agent-skill**:
    - create a folder `"My-Custom-{your project name}-hudIds"` in the folder `anythingllm_host\plugins\agent-skills`
    - create a plugin.json file 
    
        ```json
        {
            "hubId": "My-Custom-project-hudId",
            "active": false,
            "name": "My Custom StockQuote agent",
            "version": "1.0.0",

            "description": "A plugin to get test custom agent skill",
            "author": "stoneskin",
            "author_url": "https://hub.anythingllm.com/u/stoneskin",
            "license": "MIT",
            "examples": [
            {
                "prompt": "Use datetime to tell me what time it is",
                "call": "{\"format\": \"time\", \"timezone\": \"America/New_York\"}"
            }
            ],
            "setup_args": {},
            "entrypoint": {
            "file": "handler.js",
            "params": {}
            }
        }
        ```
    - create the `handler.js` file with the following code:

        ```js
        module.exports.runtime = {
            handler: async function (symbol) {
                const callerId = `${this.config.name}-v${this.config.version}`;
                try {
                    this.introspect(
                        `${callerId} called to get current stock quote for ${symbol}`
                    );
                    let apikey=`******************`
                    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apikey}`;
                    const response = await fetch(url);

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();

                    // Check if the data has an error message directly from the API
                    if (data['Information'] && data['Information'].includes('Invalid API call')) {
                        throw new Error(data['Information']);
                    }

                    return data;

                } catch (e) {
                    let errorMessage = `${callerId} failed to get stock quote for ${symbol}. Reason: ${e.message}`;
                    this.introspect(
                        errorMessage
                    );
                    this.logger(
                        errorMessage
                    );
                    return errorMessage;
                }
            }
        };
        ```
    - copy the `node_modules` folder form other agent-skill,  or use `npm install` to install the required dependencies.

        ```sh
            # Node modules imported by this skill:
            .yarn-integrity
            sax
            xml2js
            xmlbuilder
        ```



   

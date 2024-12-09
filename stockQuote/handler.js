module.exports.runtime = {
    handler: async function (symbol) {
        const callerId = `${this.config.name}-v${this.config.version}`;
        try {
            this.introspect(
                `${callerId} called to get current date and time`
            );
            let apikey=`${this.config.apikey}`
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

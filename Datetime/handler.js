module.exports.runtime = {
    handler: async function () {
      const callerId = `${this.config.name}-v${this.config.version}`;
      try {
        this.introspect(
          `${callerId} called to get current date and time`
        );
  
        const now = new Date();
  
        const dateOptions = {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        };
        const currentDate = now.toLocaleDateString('en-US', dateOptions);
  
        const timeOptions = {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        };
        const currentTime = now.toLocaleTimeString('en-US', timeOptions);
  
        return JSON.stringify({
          date: `Today's date is ${currentDate}`,
          time: `Current Time: ${currentTime}`
        });
  
      } catch (e) {
        this.introspect(
          `${callerId} failed to get datetime info. Reason: ${e.message}`
        );
        this.logger(
          `${callerId} failed to get datetime info`,
          e.message
        );
        return `Failed to get datetime information. Error: ${e.message}`;
      }
    }
  };
  
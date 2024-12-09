## BBC News Feed

This is an agent skill for AnythingLLM that allows you to get the latest news from the BBC News website.
It can also be used to grab and summarize news articles from BBC News.

## Setup

1. Install the package by using its import ID from the AnythingLLM Community Hub and pasting that into the "Import ID" field in the AnythingLLM app.
2. Activate the skill by clicking the toggle button in the AnythingLLM app under the "Agent Skills" section.

## Usage

Once installed, you can ask the AnythingLLM app via `@agent` to get the latest news from the BBC News website using natural language.

~~~
@agent get the latest news from the bbc news website
~~~

You can also ask the AnythingLLM app to grab and summarize a news article from the BBC News website using natural language.

~~~
@agent get the latest news from the bbc news website
> Output: The latest news from the BBC News website is...
> [Article 1] - summary
> [Article 2] - summary
> [Article 3] - summary
...etc

// You can then follow up with a question about the summarized news articles.
@agent Tell me more about "Article 1"
> Will scrape content and LLM will summarize it here.
~~~


import { BRAVE_API_KEY } from "../constant";
import { checkRateLimit } from "./checkRateLimit";

export async function performWebSearch(query: string, count = 10, offset = 0) : Promise<string> {
  console.debug("🐞in performWebSearch");

  console.debug("🐞query");
  console.debug(query);
  checkRateLimit();

  const url = new URL("https://api.search.brave.com/res/v1/web/search");
  url.searchParams.set("q", query);
  url.searchParams.set("count", Math.min(count, 20).toString()); // API limit
  url.searchParams.set("offset", offset.toString());

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip",
      "X-Subscription-Token": BRAVE_API_KEY,
    } as any,
  });

  if (!response.ok) {
    throw new Error(
      `Brave API error: ${response.status} ${
        response.statusText
      }\n${await response.text()}`
    );
  }

  const searchResult = await response.json();

  console.debug("🐞searchResult");
  console.debug(searchResult);

  // Extract just web results
  const resultsFormatted = (searchResult.web?.results || []).map(
    (result: any) => ({
      title: result.title || "",
      description: result.description || "",
      url: result.url || "",
    })
  );

  console.debug("🐞resultsFormatted");
  console.debug(resultsFormatted);

  return resultsFormatted
    .map(
      (r: any) =>
        `Title: ${r.title}\nDescription: ${r.description}\nURL: ${r.url}`
    )
    .join("\n\n");
}

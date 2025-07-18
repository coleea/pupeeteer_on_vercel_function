import { RATE_LIMIT, requestCount } from "../constant";

export function checkRateLimit() { 
  const now = Date.now();

  if (now - requestCount.lastReset > 1000) {
	requestCount.second = 0;
	requestCount.lastReset = now;
  }

  if (
	requestCount.second >= RATE_LIMIT.perSecond ||
	requestCount.month >= RATE_LIMIT.perMonth
  ) {
	throw new Error("Rate limit exceeded");
  }

  requestCount.second++;
  requestCount.month++;
}

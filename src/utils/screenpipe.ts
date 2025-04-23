
import { pipe } from '@screenpipe/browser';

export async function getRecentScreenEvents() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const results = await pipe.queryScreenpipe({
    startTime: fiveMinutesAgo,
    limit: 10,
    contentType: "all",
  });
  return results?.data ?? [];
}

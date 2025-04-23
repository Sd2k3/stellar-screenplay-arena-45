
import { useState, useEffect } from "react";
import { pipe } from "@screenpipe/browser";

export interface ScreenpipeItem {
  id: string;
  type: string;
  content: any;
  timestamp?: string; // ISO
}

export function useScreenpipeActivity({ 
  minutes = 5, 
  contentType = "all", 
  limit = 10 
}: { 
  minutes?: number;
  contentType?: "ocr" | "audio" | "ui" | "all";
  limit?: number;
}) {
  const [data, setData] = useState<ScreenpipeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const since = new Date(Date.now() - minutes * 60 * 1000).toISOString();
        const results = await pipe.queryScreenpipe({
          startTime: since,
          limit,
          contentType
        });
        if (!results) {
          setError("No results or error occurred.");
          setData([]);
        } else {
          // Attach a unique id to each, if missing (fallback).
          setData(
            (results.data || []).map((item: any, idx: number) => ({
              ...item,
              id: item.id || idx + "-" + (item.type || "unknown"),
            }))
          );
        }
      } catch (e) {
        setError("Failed to load Screenpipe data: " + (e as any)?.message || e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [minutes, contentType, limit]);

  return { data, loading, error };
}

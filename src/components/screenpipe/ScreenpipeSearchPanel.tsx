
import React, { useState } from "react";
import { pipe } from "@screenpipe/browser";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { AlertCircle } from "lucide-react";

type Item = {
  id: string;
  type: string;
  content: any;
  timestamp?: string;
};

export default function ScreenpipeSearchPanel() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setResults([]);

    try {
      // Check if Screenpipe is available
      if (!pipe || typeof pipe.queryScreenpipe !== 'function') {
        throw new Error("Screenpipe is not properly initialized");
      }

      const now = new Date().toISOString();
      const startTime = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();
      const resp = await pipe.queryScreenpipe({
        q: query,
        contentType: "all",
        startTime,
        endTime: now,
        limit: 30,
        includeFrames: true,
      });
      
      if (!resp || !resp.data) {
        setResults([]);
      } else {
        setResults((resp.data || []).map((x: any, idx: number) => ({
          ...x,
          id: x.id || idx + "-" + (x.type || "unknown"),
        })));
      }
    } catch (e: any) {
      console.error("Screenpipe search error:", e);
      setErr(e?.message || "Unknown error searching screenpipe data");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full border border-space-stellar-blue bg-black/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🔎 Search Screen or Audio Content</span>
          {err && (
            <span className="text-xs text-red-400 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              Search Error
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="flex items-center gap-2 mb-4">
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Enter keyword, app, or phrase…"
            className="bg-black/40 text-white border border-space-stellar-blue"
          />
          <Button disabled={loading || query.trim().length === 0} type="submit">
            {loading ? "Searching…" : "Search"}
          </Button>
        </form>
        
        {err && (
          <div className="text-red-500 p-2 bg-red-500/10 rounded border border-red-500/30 mb-2">
            {err}
            <div className="mt-2 text-xs text-white/70">
              Make sure Screenpipe is running in your browser. If you don't have Screenpipe, 
              you can <a 
                href="https://www.screenpipe.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-space-nova-yellow underline"
              >
                download it here
              </a>.
            </div>
          </div>
        )}
        
        <ScrollArea className="h-60 pr-2">
          <ul className="space-y-4">
            {results.length === 0 && !loading && !err && <li className="text-slate-400">No results yet.</li>}
            {loading && <li className="text-slate-400">Searching...</li>}
            {results.map(item => (
              <li key={item.id} className="border-b border-space-stellar-blue/20 pb-2 text-white">
                <div className="text-xs opacity-70">
                  {new Date(item.content?.timestamp || item.timestamp || Date.now()).toLocaleString()}
                  {" · "}
                  <span className="font-mono">{item.type}</span>
                </div>
                {(item.type === "OCR" && item.content?.text) && (
                  <div className="whitespace-pre-wrap">{item.content.text}</div>
                )}
                {(item.type === "Audio" && item.content?.transcription) && (
                  <div className="whitespace-pre-wrap">{item.content.transcription}</div>
                )}
                {(item.type === "UI" && item.content?.element_type) && (
                  <div className="whitespace-pre-wrap text-xs">{JSON.stringify(item.content, null, 2)}</div>
                )}
                {(item.type === "OCR" && item.content?.frame) && (
                  <img
                    src={`data:image/png;base64,${item.content.frame}`}
                    alt="Screen capture"
                    className="w-full max-w-xs border border-space-nova-yellow rounded my-2"
                  />
                )}
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

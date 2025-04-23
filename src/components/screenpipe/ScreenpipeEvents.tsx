
import React, { useEffect, useState } from 'react';
import { getRecentScreenEvents } from '@/utils/screenpipe';
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";

export function ScreenpipeEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecentScreenEvents()
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to fetch events:', error);
        setLoading(false);
      });
  }, []);

  return (
    <Card className="w-full border border-space-stellar-blue bg-black/30">
      <CardHeader>
        <CardTitle>📊 Recent Screenpipe Events</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80 pr-2">
          {loading && <div className="text-slate-400">Loading events...</div>}
          {!loading && events.length === 0 && (
            <div className="text-slate-400">No recent events found.</div>
          )}
          <ul className="space-y-4">
            {events.map((event, i) => (
              <li key={i} className="border-b border-space-stellar-blue/30 pb-2">
                <div className="text-xs text-slate-400 mb-0.5">
                  {new Date(event.timestamp || Date.now()).toLocaleString()}
                  {" · "}
                  <span className="font-mono">{event.type}</span>
                </div>
                <pre className="whitespace-pre-wrap text-white text-sm">
                  {JSON.stringify(event.content, null, 2)}
                </pre>
                {event.type === "OCR" && event.content?.frame && (
                  <img
                    src={`data:image/png;base64,${event.content.frame}`}
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

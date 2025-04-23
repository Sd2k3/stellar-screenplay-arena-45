
import React, { useEffect, useState } from "react";
import { pipe } from "@screenpipe/browser";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";

type VisionEvent = {
  data: {
    text?: string;
    app_name?: string;
    image?: string; // base64
    timestamp?: string;
  };
};

type AudioEvent = {
  choices: { text: string }[];
  metadata?: { timestamp?: string; device?: string; isInput?: boolean };
};

export default function ScreenpipeLivePanel() {
  const [events, setEvents] = useState<any[]>([]);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    let isActive = true;
    let visionStop: (() => void) | null = null;
    let audioStop: (() => void) | null = null;

    async function startLive() {
      setListening(true);
      // Listen for vision events
      const visionAsync = (async () => {
        try {
          for await (const event of pipe.streamVision(true)) {
            if (!isActive) break;
            setEvents(prev => [
              { ...event, _type: "vision", timestamp: event.data.timestamp || new Date().toISOString() },
              ...prev.slice(0, 49),
            ]);
          }
        } catch (e) {
          setEvents(prev => [
            { _type: "vision", data: { text: "Error: " + (e as any)?.message } },
            ...prev
          ]);
        }
      })();

      // Listen for audio transcriptions
      const audioAsync = (async () => {
        try {
          for await (const chunk of pipe.streamTranscriptions()) {
            if (!isActive) break;
            setEvents(prev => [
              { ...chunk, _type: "audio", timestamp: chunk?.metadata?.timestamp || new Date().toISOString() },
              ...prev.slice(0, 49),
            ]);
          }
        } catch (e) {
          setEvents(prev => [
            { _type: "audio", choices: [{ text: "Error: " + (e as any)?.message }] },
            ...prev
          ]);
        }
      })();

      // Provide a way to stop on unmount
      visionStop = () => { isActive = false; };
      audioStop = () => { isActive = false; };
    }
    startLive();

    return () => {
      if (visionStop) visionStop();
      if (audioStop) audioStop();
      setListening(false);
    };
  }, []);

  return (
    <Card className="w-full border border-space-stellar-blue bg-black/30">
      <CardHeader>
        <CardTitle>👁️‍🗨️ Live Screen &amp; Audio Events</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80 pr-2">
          {!listening ? <div className="text-slate-400">Connecting…</div> : null}
          <ul className="space-y-3">
            {events.length === 0 && <li className="text-slate-400">Waiting for events…</li>}
            {events.map((item, idx) => (
              <li key={idx} className="border-b border-space-stellar-blue/20 pb-2 text-white">
                <div className="text-xs opacity-70 mb-1">
                  {item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : ""}
                  {" · "}
                  <span className="font-mono">
                    {item._type === "vision" ? "Vision" : "Audio"}
                  </span>
                </div>
                {item._type === "vision" && (
                  <>
                    <div className="whitespace-pre-wrap">{item.data?.text || "(no text detected)"}</div>
                    {item.data?.app_name && (
                      <div className="text-xs text-space-stellar-blue">App: {item.data.app_name}</div>
                    )}
                    {item.data?.image && (
                      <img src={`data:image/png;base64,${item.data.image}`} alt="Live Screenshot" className="w-full max-w-xs border border-space-nova-yellow rounded my-2" />
                    )}
                  </>
                )}
                {item._type === "audio" &&
                  <div className="whitespace-pre-wrap italic">{item.choices?.[0]?.text || "(no text)"}</div>
                }
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

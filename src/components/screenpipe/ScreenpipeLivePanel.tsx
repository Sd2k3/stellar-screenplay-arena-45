
import React, { useEffect, useState } from "react";
import { pipe } from "@screenpipe/browser";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { AlertCircle } from "lucide-react";

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    let visionStop: (() => void) | null = null;
    let audioStop: (() => void) | null = null;

    async function startLive() {
      try {
        if (!pipe || typeof pipe.streamVision !== 'function' || typeof pipe.streamTranscriptions !== 'function') {
          throw new Error("Screenpipe is not properly initialized");
        }

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
            if (isActive) {
              console.error("Vision stream error:", e);
              setEvents(prev => [
                { _type: "vision", data: { text: "Error: " + (e as any)?.message || String(e) } },
                ...prev
              ]);
            }
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
            if (isActive) {
              console.error("Audio stream error:", e);
              setEvents(prev => [
                { _type: "audio", choices: [{ text: "Error: " + (e as any)?.message || String(e) }] },
                ...prev
              ]);
              setError("Failed to connect to Screenpipe audio stream");
            }
          }
        })();

        // Provide a way to stop on unmount
        visionStop = () => { isActive = false; };
        audioStop = () => { isActive = false; };
      } catch (e) {
        if (isActive) {
          console.error("Screenpipe initialization error:", e);
          setError(`Failed to initialize Screenpipe: ${(e as any)?.message || String(e)}`);
          setListening(false);
        }
      }
    }
    startLive();

    return () => {
      if (visionStop) visionStop();
      if (audioStop) audioStop();
      isActive = false;
      setListening(false);
    };
  }, []);

  return (
    <Card className="w-full border border-space-stellar-blue bg-black/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>👁️‍🗨️ Live Screen &amp; Audio Events</span>
          {error && (
            <span className="text-xs text-red-400 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              Connection Error
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80 pr-2">
          {!listening && !error && <div className="text-slate-400">Connecting…</div>}
          
          {error && (
            <div className="text-red-500 p-2 bg-red-500/10 rounded border border-red-500/30">
              {error}
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
          
          <ul className="space-y-3">
            {events.length === 0 && !error && <li className="text-slate-400">Waiting for events…</li>}
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

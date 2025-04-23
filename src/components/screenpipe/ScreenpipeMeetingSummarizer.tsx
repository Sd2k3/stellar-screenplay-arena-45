
import React, { useEffect, useState } from "react";
import { pipe } from "@screenpipe/browser";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { AlertCircle } from "lucide-react";

export default function ScreenpipeMeetingSummarizer() {
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [lastSummarized, setLastSummarized] = useState<number>(Date.now());
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    let isActive = true;
    let fullTranscript = "";

    async function startTranscriptionStream() {
      try {
        if (!pipe || typeof pipe.streamTranscriptions !== 'function') {
          throw new Error("Screenpipe is not properly initialized");
        }

        setIsListening(true);
        
        for await (const chunk of pipe.streamTranscriptions()) {
          if (!isActive) break;
          const text = chunk.choices?.[0]?.text || "";
          if (text) {
            fullTranscript += text + " ";
            setTranscript(fullTranscript);

            if (Date.now() - lastSummarized > 30000 && fullTranscript.length > 200) {
              // Faking summary: For production, integrate with your AI provider as needed.
              setSummary("Summary: " + fullTranscript.substring(0, 200) + (fullTranscript.length > 200 ? "..." : ""));
              setLastSummarized(Date.now());
            }
          }
        }
      } catch (e) {
        if (isActive) {
          console.error("Transcription stream error:", e);
          setError(`Failed to connect to Screenpipe: ${(e as any)?.message || String(e)}`);
          setIsListening(false);
        }
      }
    }

    startTranscriptionStream();

    return () => { 
      isActive = false; 
      setIsListening(false);
    };
  }, [lastSummarized]);

  return (
    <Card className="w-full border border-space-stellar-blue bg-black/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>📝 Real-time Meeting Summarizer</span>
          {error && (
            <span className="text-xs text-red-400 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              Connection Error
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-red-500 p-2 bg-red-500/10 rounded border border-red-500/30 mb-4">
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
        
        <ScrollArea className="h-72 pr-2 mb-2">
          <div className="text-white text-xs whitespace-pre-wrap">
            {transcript || (isListening ? "Listening for meeting audio..." : "Waiting to connect...")}
          </div>
        </ScrollArea>
        <div className="mt-4 bg-space-stellar-blue/15 px-3 py-2 rounded text-space-nova-yellow">
          {summary || "Waiting for summary (talk for 30s+ and the text will appear)..."}
        </div>
      </CardContent>
    </Card>
  );
}

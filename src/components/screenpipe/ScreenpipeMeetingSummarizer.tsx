
import React, { useEffect, useState } from "react";
import { pipe } from "@screenpipe/browser";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";

export default function ScreenpipeMeetingSummarizer() {
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [lastSummarized, setLastSummarized] = useState<number>(Date.now());

  useEffect(() => {
    let isActive = true;
    let fullTranscript = "";

    (async () => {
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
    })();

    return () => { isActive = false; };
    // eslint-disable-next-line
  }, []);

  return (
    <Card className="w-full border border-space-stellar-blue bg-black/30">
      <CardHeader>
        <CardTitle>📝 Real-time Meeting Summarizer</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72 pr-2 mb-2">
          <div className="text-white text-xs whitespace-pre-wrap">{transcript || "Listening for meeting audio..."}</div>
        </ScrollArea>
        <div className="mt-4 bg-space-stellar-blue/15 px-3 py-2 rounded text-space-nova-yellow">
          {summary ? summary : "Waiting for summary (talk for 30s+ and the text will appear)..."}
        </div>
      </CardContent>
    </Card>
  );
}


import React from "react";
import { useScreenpipeActivity } from "@/hooks/useScreenpipeActivity";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";

export interface ScreenpipePanelProps {
  minutes?: number;
  limit?: number;
  contentType?: "ocr" | "audio" | "ui" | "all";
}

const typePretty = {
  OCR: "Screen Text",
  Audio: "Audio Transcript",
  UI: "UI Element",
  all: "All",
};

const ScreenpipePanel: React.FC<ScreenpipePanelProps> = ({
  minutes = 5,
  limit = 15,
  contentType = "all",
}) => {
  const { data, loading, error } = useScreenpipeActivity({ minutes, limit, contentType });

  return (
    <Card className="w-full border border-space-stellar-blue bg-black/30">
      <CardHeader>
        <CardTitle>
          🚀 Recent Screenpipe Activity (last {minutes} min)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80 pr-2">
          {loading && <div className="text-slate-400">Loading activity…</div>}
          {error && <div className="text-red-500">{error}</div>}
          {!loading && data.length === 0 && <div className="text-slate-400">No data found.</div>}
          <ul className="space-y-4">
            {data.map(item => (
              <li key={item.id} className="border-b border-space-stellar-blue/30 pb-2">
                <div className="text-xs text-slate-400 mb-0.5">
                  {new Date(item.content?.timestamp || item.timestamp || Date.now()).toLocaleString()} 
                  {" · "}
                  <span className="font-mono">{typePretty[item.type] || item.type}</span>
                </div>
                {(item.type === "OCR" && item.content?.text) && (
                  <div className="whitespace-pre-wrap text-white">
                    {item.content.text}
                  </div>
                )}
                {(item.type === "Audio" && item.content?.transcription) && (
                  <div className="whitespace-pre-wrap text-white">
                    {item.content.transcription}
                  </div>
                )}
                {(item.type === "UI" && item.content?.element_type) && (
                  <div className="whitespace-pre-wrap text-white">
                    {JSON.stringify(item.content, null, 2)}
                  </div>
                )}
                {/* Show image preview if available */}
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
};

export default ScreenpipePanel;


import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string | null;
  score: number;
  tokens: number;
  avatarUrl?: string;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  className?: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ entries, className }) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-xl">Top Players</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.map((entry, index) => (
          <React.Fragment key={entry.id}>
            {index > 0 && <Separator className="my-2" />}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-3">
                <div 
                  className={`flex items-center justify-center w-7 h-7 rounded-full text-white font-bold text-sm
                    ${entry.rank === 1 ? "bg-yellow-500" : 
                      entry.rank === 2 ? "bg-gray-400" : 
                      entry.rank === 3 ? "bg-amber-600" : "bg-gray-200 text-gray-700"}`}
                >
                  {entry.rank}
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={entry.avatarUrl} />
                  <AvatarFallback>
                    {entry.username && typeof entry.username === "string" && entry.username.trim() !== ""
                      ? entry.username.substring(0, 2).toUpperCase()
                      : "??"
                    }
                  </AvatarFallback>
                </Avatar>
                <div className="font-medium">{entry.username || "Anonymous Player"}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Score</div>
                  <div className="font-medium">{entry.score.toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-1 text-space-nova-yellow">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10" />
                    <path fill="white" d="M12 6l1.5 4.5h4.5l-3.6 2.7 1.4 4.3-3.8-2.8-3.8 2.8 1.4-4.3-3.6-2.7h4.5z" />
                  </svg>
                  <span className="font-medium">{entry.tokens}</span>
                </div>
              </div>
            </div>
          </React.Fragment>
        ))}
      </CardContent>
    </Card>
  );
};

export default Leaderboard;

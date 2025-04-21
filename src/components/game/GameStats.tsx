
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface GameStatsProps {
  currentScore: number;
  highScore: number;
  gamesPlayed: number;
  tokensEarned: number;
  className?: string;
}

const GameStats: React.FC<GameStatsProps> = ({
  currentScore,
  highScore,
  gamesPlayed,
  tokensEarned,
  className,
}) => {
  const [prevScore, setPrevScore] = useState(currentScore);
  const [isIncreasing, setIsIncreasing] = useState(false);
  
  useEffect(() => {
    if (currentScore > prevScore) {
      setIsIncreasing(true);
      const timer = setTimeout(() => {
        setIsIncreasing(false);
      }, 1000);
      setPrevScore(currentScore);
      return () => clearTimeout(timer);
    }
  }, [currentScore, prevScore]);

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Game Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-y-3 gap-x-6">
          <div>
            <div className="text-sm text-muted-foreground">Current Score</div>
            <div className={`text-xl font-bold ${isIncreasing ? "text-green-500" : ""}`}>
              {currentScore}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground">High Score</div>
            <div className="text-xl font-bold">{highScore}</div>
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground">Games Played</div>
            <div className="text-xl font-bold">{gamesPlayed}</div>
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground">Tokens Earned</div>
            <div className="flex items-center gap-1">
              <svg className="h-4 w-4 text-space-nova-yellow" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" />
                <path fill="white" d="M12 6l1.5 4.5h4.5l-3.6 2.7 1.4 4.3-3.8-2.8-3.8 2.8 1.4-4.3-3.6-2.7h4.5z" />
              </svg>
              <span className="text-xl font-bold">{tokensEarned}</span>
            </div>
          </div>
        </div>
        
        <Separator className="my-3" />
        
        <div className="text-sm text-muted-foreground">
          {currentScore >= 100 && currentScore < 200 && (
            <div className="flex items-center gap-2">
              <span className="block h-2 w-2 rounded-full bg-yellow-400 animate-pulse"></span>
              <span>Achievement "Stellar Novice" unlocked!</span>
            </div>
          )}
          
          {currentScore >= 200 && (
            <div className="flex items-center gap-2">
              <span className="block h-2 w-2 rounded-full bg-yellow-400 animate-pulse"></span>
              <span>Achievement "Cosmic Explorer" unlocked!</span>
            </div>
          )}
          
          {currentScore < 100 && (
            <span>Score 100 to unlock "Stellar Novice" achievement</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GameStats;


import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, RocketIcon, TrophyIcon, BarChart3Icon } from "lucide-react";
import GameCanvas from "@/components/game/GameCanvas";
import TokenBalance from "@/components/blockchain/TokenBalance";
import AchievementCard, { Achievement } from "@/components/blockchain/AchievementCard";
import Leaderboard from "@/components/blockchain/Leaderboard";
import GameStats from "@/components/game/GameStats";

const Index = () => {
  const [currentScore, setCurrentScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [tokensEarned, setTokensEarned] = useState(0);
  const [pendingTokens, setPendingTokens] = useState(0);
  
  // Handle game over
  const handleGameOver = (finalScore: number) => {
    setGamesPlayed(prev => prev + 1);
    if (finalScore > highScore) {
      setHighScore(finalScore);
    }
    
    // Calculate tokens earned (simplified for demo)
    const newTokens = Math.floor(finalScore / 10);
    setPendingTokens(prev => prev + newTokens);
    
    // Simulate verification after delay
    setTimeout(() => {
      setTokensEarned(prev => prev + newTokens);
      setPendingTokens(prev => prev - newTokens);
    }, 5000);
  };

  // Mock achievements data
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: "1",
      title: "Stellar Novice",
      description: "Score 100 points in a single game",
      rewardAmount: 5,
      completed: false,
      verificationStatus: "pending"
    },
    {
      id: "2",
      title: "Cosmic Explorer",
      description: "Score 200 points in a single game",
      rewardAmount: 10,
      completed: false,
      verificationStatus: "pending"
    },
    {
      id: "3",
      title: "Token Collector",
      description: "Collect 50 tokens in total",
      rewardAmount: 15,
      completed: false,
      verificationStatus: "pending"
    }
  ]);
  
  // Update achievements based on game progress
  useEffect(() => {
    let updatedAchievements = [...achievements];
    let changed = false;
    
    // Check for "Stellar Novice" achievement
    if (currentScore >= 100 && !achievements[0].completed) {
      updatedAchievements[0] = {
        ...updatedAchievements[0],
        completed: true,
        timestamp: new Date().toISOString(),
        verificationStatus: "verified"
      };
      changed = true;
    }
    
    // Check for "Cosmic Explorer" achievement
    if (currentScore >= 200 && !achievements[1].completed) {
      updatedAchievements[1] = {
        ...updatedAchievements[1],
        completed: true,
        timestamp: new Date().toISOString(),
        verificationStatus: "verified"
      };
      changed = true;
    }
    
    // Check for "Token Collector" achievement
    if (tokensEarned >= 50 && !achievements[2].completed) {
      updatedAchievements[2] = {
        ...updatedAchievements[2],
        completed: true,
        timestamp: new Date().toISOString(),
        verificationStatus: "verified"
      };
      changed = true;
    }
    
    if (changed) {
      setAchievements(updatedAchievements);
    }
  }, [currentScore, tokensEarned, achievements]);
  
  // Mock leaderboard data
  const leaderboardEntries = [
    { 
      id: "1", 
      rank: 1, 
      username: "CosmicWarrior", 
      score: 450, 
      tokens: 48 
    },
    { 
      id: "2", 
      rank: 2, 
      username: "StarDrifter", 
      score: 380, 
      tokens: 42 
    },
    { 
      id: "3", 
      rank: 3, 
      username: "NebulaHunter", 
      score: 320, 
      tokens: 35 
    },
    { 
      id: "4", 
      rank: 4, 
      username: "AstroRacer", 
      score: 290, 
      tokens: 31 
    },
    { 
      id: "5", 
      rank: 5, 
      username: "Player", 
      score: Math.max(highScore, currentScore), 
      tokens: tokensEarned 
    }
  ];

  return (
    <div className="min-h-screen space-gradient">
      <div className="container mx-auto py-8">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 text-white tracking-tight">Stellar Screenplay Arena</h1>
          <p className="text-lg text-slate-300">Play, earn Stellar tokens, and climb the leaderboard!</p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main game area */}
          <div className="lg:col-span-2">
            <GameCanvas 
              onScoreUpdate={setCurrentScore}
              onGameOver={handleGameOver}
              className="h-[600px] mb-4 shadow-xl shadow-space-cosmic-purple/20"
            />
            
            <Alert className="mt-4 bg-black/30 border border-space-stellar-blue text-white">
              <InfoIcon className="h-4 w-4 text-space-stellar-blue" />
              <AlertTitle>Game Controls</AlertTitle>
              <AlertDescription className="text-slate-300">
                Use LEFT and RIGHT arrow keys to move your ship. Collect Stellar tokens and avoid asteroids!
              </AlertDescription>
            </Alert>
          </div>
          
          {/* Side panel */}
          <div className="flex flex-col gap-4">
            <TokenBalance 
              balance={tokensEarned}
              pendingBalance={pendingTokens}
              className="border border-space-stellar-blue bg-black/30 text-white"
            />
            
            <GameStats 
              currentScore={currentScore}
              highScore={highScore}
              gamesPlayed={gamesPlayed}
              tokensEarned={tokensEarned}
              className="border border-space-stellar-blue bg-black/30 text-white"
            />
            
            <Tabs defaultValue="achievements" className="w-full">
              <TabsList className="w-full bg-black/50 border border-space-stellar-blue">
                <TabsTrigger value="achievements" className="data-[state=active]:bg-space-stellar-blue/20">
                  <TrophyIcon className="h-4 w-4 mr-2" />
                  Achievements
                </TabsTrigger>
                <TabsTrigger value="leaderboard" className="data-[state=active]:bg-space-stellar-blue/20">
                  <BarChart3Icon className="h-4 w-4 mr-2" />
                  Leaderboard
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="achievements" className="mt-2 space-y-3">
                {achievements.map(achievement => (
                  <AchievementCard 
                    key={achievement.id} 
                    achievement={achievement}
                    className="border border-space-stellar-blue bg-black/30 text-white"
                  />
                ))}
              </TabsContent>
              
              <TabsContent value="leaderboard" className="mt-2">
                <Leaderboard 
                  entries={leaderboardEntries}
                  className="border border-space-stellar-blue bg-black/30 text-white"
                />
              </TabsContent>
            </Tabs>
            
            <Button className="mt-2" variant="default">
              <RocketIcon className="h-4 w-4 mr-2" />
              Connect Blockchain Wallet
            </Button>
          </div>
        </div>
        
        {/* Footer with blockchain info */}
        <footer className="mt-10 text-center text-slate-400 text-sm">
          <p>Achievements tracked on Monad blockchain and verified via Screenpipe.</p>
          <p className="mt-1">©2025 Stellar Screenplay Arena</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;

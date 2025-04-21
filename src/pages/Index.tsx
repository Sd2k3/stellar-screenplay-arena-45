import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, RocketIcon, TrophyIcon, BarChart3Icon, WalletIcon } from "lucide-react";
import GameCanvas from "@/components/game/GameCanvas";
import TokenBalance from "@/components/blockchain/TokenBalance";
import AchievementCard, { Achievement } from "@/components/blockchain/AchievementCard";
import Leaderboard from "@/components/blockchain/Leaderboard";
import GameStats from "@/components/game/GameStats";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { 
  createBlockchainTransaction, 
  recordAchievementOnChain, 
  upsertPlayerTokenBalance, 
  getPlayerTokenBalance 
} from "@/integrations/supabase/blockchainApi";

const Index = () => {
  const [currentScore, setCurrentScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [tokensEarned, setTokensEarned] = useState(0);
  const [pendingTokens, setPendingTokens] = useState(0);
  
  const { 
    isConnected, 
    isConnecting, 
    address, 
    connectWallet, 
    disconnectWallet 
  } = useWalletConnection();

  // Sync player's token balance from Supabase when connected
  useEffect(() => {
    if (isConnected && address) {
      getPlayerTokenBalance(address).then(balanceRow => {
        if (balanceRow) {
          setTokensEarned(balanceRow.balance);
          setPendingTokens(balanceRow.pending_balance);
        }
      }).catch(console.error);
    }
  }, [isConnected, address]);

  // Handle game over
  const handleGameOver = async (finalScore: number) => {
    setGamesPlayed(prev => prev + 1);
    if (finalScore > highScore) {
      setHighScore(finalScore);
    }

    const newTokens = Math.floor(finalScore / 10);
    setPendingTokens(prev => prev + newTokens);

    if (isConnected && address && newTokens > 0) {
      // Write blockchain transaction, update balance as pending
      try {
        const tx = await createBlockchainTransaction({
          walletAddress: address,
          type: "earn_token",
          amount: newTokens,
        });

        await upsertPlayerTokenBalance({
          walletAddress: address,
          amount: tokensEarned,
          pendingAmount: pendingTokens + newTokens
        });

        // (Optional) Could also record on-chain achievement here if milestones met
      } catch (err) {
        console.error("Blockchain tx error", err);
      }
    }

    // Simulate verification after delay & update in Supabase
    setTimeout(async () => {
      setTokensEarned(prev => prev + newTokens);
      setPendingTokens(prev => prev - newTokens);

      if (isConnected && address && newTokens > 0) {
        await upsertPlayerTokenBalance({
          walletAddress: address,
          amount: tokensEarned + newTokens,
          pendingAmount: pendingTokens - newTokens
        });
      }
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

  // When an achievement is completed, record it on chain in Supabase
  useEffect(() => {
    if (isConnected && address) {
      achievements.forEach(async (a) => {
        if (a.completed && a.verificationStatus === "verified") {
          // Check if already stored (skip if so)
          // A real implementation may call Supabase for existence
          try {
            // Record as an "on chain" achievement, link to last tx if available
            const lastTx = await createBlockchainTransaction({
              walletAddress: address,
              type: "achievement",
              amount: a.rewardAmount
            });

            await recordAchievementOnChain({
              walletAddress: address,
              achievementId: a.id,
              achievementTitle: a.title,
              transactionId: lastTx?.id,
            });
          } catch (err) {
            // Already exists, ignore for now
          }
        }
      });
    }
    // Only run if address or achievements change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [achievements, isConnected, address]);
  
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
            
            <Button 
              className="mt-2" 
              variant={isConnected ? "outline" : "default"} 
              onClick={isConnected ? disconnectWallet : connectWallet}
              disabled={isConnecting}
            >
              <WalletIcon className="h-4 w-4 mr-2" />
              {isConnecting ? "Connecting..." : 
               isConnected ? `Connected: ${address}` : 
               "Connect Blockchain Wallet"}
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

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
import BlockchainSelector from "@/components/blockchain/BlockchainSelector";

const Index = () => {
  const [currentScore, setCurrentScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [tokensEarned, setTokensEarned] = useState(0);
  const [pendingTokens, setPendingTokens] = useState(0);
  const [blockchain, setBlockchain] = useState<"ethereum" | "polygon">("ethereum");

  const { 
    isConnected, 
    isConnecting, 
    address, 
    connectWallet, 
    disconnectWallet 
  } = useWalletConnection();

  const blockchainLabel =
    blockchain === "ethereum"
      ? "Ethereum (Goerli Testnet)"
      : "Polygon (Mumbai Testnet)";

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

  const handleGameOver = async (finalScore: number) => {
    setGamesPlayed(prev => prev + 1);
    if (finalScore > highScore) {
      setHighScore(finalScore);
    }

    const newTokens = Math.floor(finalScore / 10);
    setPendingTokens(prev => prev + newTokens);

    if (isConnected && address && newTokens > 0) {
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

      } catch (err) {
        console.error("Blockchain tx error", err);
      }
    }

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

  useEffect(() => {
    let updatedAchievements = [...achievements];
    let changed = false;
    
    if (currentScore >= 100 && !achievements[0].completed) {
      updatedAchievements[0] = {
        ...updatedAchievements[0],
        completed: true,
        timestamp: new Date().toISOString(),
        verificationStatus: "verified"
      };
      changed = true;
    }
    
    if (currentScore >= 200 && !achievements[1].completed) {
      updatedAchievements[1] = {
        ...updatedAchievements[1],
        completed: true,
        timestamp: new Date().toISOString(),
        verificationStatus: "verified"
      };
      changed = true;
    }
    
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

  useEffect(() => {
    if (isConnected && address) {
      achievements.forEach(async (a) => {
        if (a.completed && a.verificationStatus === "verified") {
          try {
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
  }, [achievements, isConnected, address]);

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
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 text-white tracking-tight">Stellar Screenplay Arena</h1>
          <p className="text-lg text-slate-300">Play, earn Stellar tokens, and climb the leaderboard!</p>
          <div className="mt-3">
            <a
              href="/notes"
              className="inline-block px-4 py-2 rounded bg-space-nova-yellow text-black font-medium hover:bg-yellow-400 transition"
            >
              Go to Notes
            </a>
          </div>
        </header>
        
        <div className="mb-4 flex items-center justify-end gap-3">
          <BlockchainSelector
            value={blockchain}
            onChange={val => setBlockchain(val as "ethereum" | "polygon")}
          />
          <span className="ml-4 px-3 py-1 rounded-full bg-space-stellar-blue/70 text-white text-xs font-semibold">
            Network: {blockchainLabel}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
            {isConnected && (
              <div className="mt-2 flex items-center gap-2 text-xs text-white">
                <span className="px-2 py-1 rounded bg-space-cosmic-purple/70">
                  On {blockchainLabel}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <footer className="mt-10 text-center text-slate-400 text-sm">
          <p>Achievements tracked on Monad blockchain and verified via Screenpipe.</p>
          <p className="mt-1">©2025 Stellar Screenplay Arena</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;


import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAchievementVerification } from "@/hooks/useAchievementVerification";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, RefreshCw, Shield } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ScreenpipeInstaller } from "./ScreenpipeInstaller";
import { Achievement } from "@/components/blockchain/AchievementCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ScreenpipeVerificationPanelProps {
  achievements: Achievement[];
  walletAddress: string | null;
  onVerificationComplete?: (achievementId: string, verified: boolean) => void;
}

export default function ScreenpipeVerificationPanel({
  achievements,
  walletAddress,
  onVerificationComplete
}: ScreenpipeVerificationPanelProps) {
  const { fetchScreenpipeData, recentScreenpipeData, verifying, error } = useAchievementVerification();
  const [isMockData, setIsMockData] = useState(false);
  const { toast } = useToast();
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    loadScreenpipeData();
  }, []);
  
  const loadScreenpipeData = async () => {
    try {
      await fetchScreenpipeData();
      setIsMockData(false);
    } catch (e) {
      console.error("Error loading Screenpipe data:", e);
      setIsMockData(true);
    }
  };
  
  const pendingAchievements = achievements.filter(a => 
    a.completed && a.verificationStatus === "pending"
  );
  
  const verifiedAchievements = achievements.filter(a => 
    a.verificationStatus === "verified"
  );
  
  const verifySelectedAchievement = async () => {
    if (!selectedAchievement || !walletAddress) return;
    
    try {
      const { verifyAchievement } = useAchievementVerification();
      const verified = await verifyAchievement(selectedAchievement, walletAddress);
      
      if (verified && onVerificationComplete) {
        onVerificationComplete(selectedAchievement.id, true);
        setSelectedAchievement(null);
      }
    } catch (e) {
      console.error("Verification error:", e);
      toast({
        title: "Verification Failed",
        description: `Error: ${(e as any)?.message || String(e)}`,
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full border border-space-stellar-blue bg-black/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🛡️ Achievement Verification</span>
          <Button 
            onClick={loadScreenpipeData} 
            size="sm"
            variant="outline"
            disabled={verifying}
            className="h-8"
          >
            <RefreshCw className={`h-3 w-3 mr-2 ${verifying ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-red-500 p-2 bg-red-500/10 rounded border border-red-500/30 mb-4">
            {error}
            <div className="mt-2 text-xs text-white/70">
              Make sure Screenpipe is running in your browser. If you don't have Screenpipe:
              <ScreenpipeInstaller />
            </div>
          </div>
        )}
        
        {isMockData && (
          <Alert className="mb-4 bg-yellow-500/10 border-yellow-500/30">
            <AlertCircle className="h-4 w-4 text-yellow-400" />
            <AlertTitle>Screenpipe Not Connected</AlertTitle>
            <AlertDescription className="text-white/70">
              Install Screenpipe to verify your achievements on the blockchain.
              <ScreenpipeInstaller />
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="pending" className="flex-1">
              Pending ({pendingAchievements.length})
            </TabsTrigger>
            <TabsTrigger value="verified" className="flex-1">
              Verified ({verifiedAchievements.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending">
            <ScrollArea className="h-[300px] pr-2">
              {pendingAchievements.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-white/70">
                  <Shield className="h-12 w-12 mb-2 opacity-30" />
                  <p>No pending achievements to verify</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingAchievements.map(achievement => (
                    <Card key={achievement.id} 
                      className={`border cursor-pointer transition-all ${
                        selectedAchievement?.id === achievement.id
                          ? 'border-space-stellar-blue bg-space-stellar-blue/10'
                          : 'border-white/20 hover:border-white/40'
                      }`}
                      onClick={() => setSelectedAchievement(achievement)}
                    >
                      <CardContent className="p-3">
                        <h4 className="font-semibold">{achievement.title}</h4>
                        <p className="text-sm text-white/70">{achievement.description}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-space-nova-yellow">
                            {achievement.rewardAmount} Tokens
                          </span>
                          <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full">
                            Pending
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
            
            {selectedAchievement && (
              <Button
                className="w-full mt-4 bg-space-stellar-blue hover:bg-space-stellar-blue/80"
                disabled={!walletAddress || verifying}
                onClick={verifySelectedAchievement}
              >
                {verifying ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Verify "{selectedAchievement.title}"
                  </>
                )}
              </Button>
            )}
          </TabsContent>
          
          <TabsContent value="verified">
            <ScrollArea className="h-[300px] pr-2">
              {verifiedAchievements.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-white/70">
                  <Shield className="h-12 w-12 mb-2 opacity-30" />
                  <p>No verified achievements yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {verifiedAchievements.map(achievement => (
                    <Card key={achievement.id} className="border border-green-500/50 bg-green-500/5">
                      <CardContent className="p-3">
                        <h4 className="font-semibold">{achievement.title}</h4>
                        <p className="text-sm text-white/70">{achievement.description}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-space-nova-yellow">
                            {achievement.rewardAmount} Tokens
                          </span>
                          <span className="text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full">
                            Verified
                          </span>
                        </div>
                        {achievement.timestamp && (
                          <p className="text-xs text-white/50 mt-1">
                            Verified on {new Date(achievement.timestamp).toLocaleDateString()}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
        
        <div className="text-xs text-white/50 mt-4">
          Screenpipe verifies achievements by analyzing screen content for evidence.
          Make sure the achievement is visible on your screen during verification.
        </div>
      </CardContent>
    </Card>
  );
}


import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface WalletState {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  balance: number | null;
}

export function useWalletConnection() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    isConnecting: false,
    address: null,
    balance: null,
  });
  const { toast } = useToast();

  const connectWallet = useCallback(async () => {
    // Don't try to connect if already connecting or connected
    if (walletState.isConnecting || walletState.isConnected) return;

    try {
      setWalletState(prev => ({ ...prev, isConnecting: true }));

      // Check if browser has window.ethereum (MetaMask or similar)
      if (typeof window !== "undefined" && window.ethereum) {
        // Simulate wallet connection process with a delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock connection values - in a real app this would make actual blockchain calls
        const mockAddress = `0x${Math.random().toString(16).slice(2, 12)}...${Math.random().toString(16).slice(2, 6)}`;
        const mockBalance = Math.floor(Math.random() * 100);

        setWalletState({
          isConnected: true,
          isConnecting: false,
          address: mockAddress,
          balance: mockBalance
        });

        toast({
          title: "Wallet Connected",
          description: `Connected to address ${mockAddress}`,
        });

        console.log("Wallet connected:", mockAddress);
        
        return true;
      } else {
        // Handle case where no wallet is available
        toast({
          variant: "destructive",
          title: "No Wallet Detected",
          description: "Please install MetaMask or another compatible wallet",
        });
        
        setWalletState(prev => ({ ...prev, isConnecting: false }));
        return false;
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Could not connect wallet"
      });
      
      setWalletState(prev => ({ ...prev, isConnecting: false }));
      return false;
    }
  }, [walletState.isConnecting, walletState.isConnected, toast]);

  const disconnectWallet = useCallback(() => {
    setWalletState({
      isConnected: false,
      isConnecting: false,
      address: null,
      balance: null
    });
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected"
    });
  }, [toast]);

  return {
    ...walletState,
    connectWallet,
    disconnectWallet
  };
}

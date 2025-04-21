
import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface WalletState {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  balance: number | null;
  chainId: string | null;
}

export function useWalletConnection() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    isConnecting: false,
    address: null,
    balance: null,
    chainId: null,
  });
  const { toast } = useToast();

  // Check if wallet is already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          // Check if already connected
          const accounts = await window.ethereum.request({ 
            method: 'eth_accounts' 
          });
          
          if (accounts.length > 0) {
            // Get chain ID
            const chainId = await window.ethereum.request({ 
              method: 'eth_chainId' 
            });
            
            // Get ETH balance
            const balance = await window.ethereum.request({ 
              method: 'eth_getBalance',
              params: [accounts[0], 'latest']
            });
            
            // Convert balance from wei to ETH
            const ethBalance = parseInt(balance) / 1e18;
            
            setWalletState({
              isConnected: true,
              isConnecting: false,
              address: accounts[0],
              balance: parseFloat(ethBalance.toFixed(4)),
              chainId,
            });
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error);
        }
      }
    };
    
    checkConnection();
  }, []);
  
  // Listen for account changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          setWalletState({
            isConnected: false,
            isConnecting: false,
            address: null,
            balance: null,
            chainId: null,
          });
          toast({
            title: "Wallet Disconnected",
            description: "Your wallet has been disconnected"
          });
        } else if (accounts[0] !== walletState.address) {
          // Account changed
          try {
            // Get chain ID
            const chainId = await window.ethereum.request({ 
              method: 'eth_chainId' 
            });
            
            // Get ETH balance
            const balance = await window.ethereum.request({ 
              method: 'eth_getBalance',
              params: [accounts[0], 'latest']
            });
            
            // Convert balance from wei to ETH
            const ethBalance = parseInt(balance) / 1e18;
            
            setWalletState({
              isConnected: true,
              isConnecting: false,
              address: accounts[0],
              balance: parseFloat(ethBalance.toFixed(4)),
              chainId,
            });
            
            toast({
              title: "Account Changed",
              description: `Connected to address ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
            });
          } catch (error) {
            console.error("Error handling account change:", error);
          }
        }
      };
      
      const handleChainChanged = (chainId: string) => {
        // Chain changed, reload the page as recommended by MetaMask
        window.location.reload();
      };
      
      // Subscribe to events
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      // Cleanup
      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [walletState.address, toast]);

  const connectWallet = useCallback(async () => {
    // Don't try to connect if already connecting or connected
    if (walletState.isConnecting || walletState.isConnected) return;

    try {
      setWalletState(prev => ({ ...prev, isConnecting: true }));

      // Check if browser has window.ethereum (MetaMask or similar)
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          // Request wallet connection - this will open the MetaMask popup
          const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
          });
          
          if (accounts.length > 0) {
            // Get chain ID
            const chainId = await window.ethereum.request({ 
              method: 'eth_chainId' 
            });
            
            // Get ETH balance
            const balance = await window.ethereum.request({ 
              method: 'eth_getBalance',
              params: [accounts[0], 'latest']
            });
            
            // Convert balance from wei to ETH
            const ethBalance = parseInt(balance) / 1e18;
            
            setWalletState({
              isConnected: true,
              isConnecting: false,
              address: accounts[0],
              balance: parseFloat(ethBalance.toFixed(4)),
              chainId,
            });

            toast({
              title: "Wallet Connected",
              description: `Connected to address ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
            });

            console.log("Wallet connected:", accounts[0]);
            
            return true;
          } else {
            throw new Error("No accounts found");
          }
        } catch (error: any) {
          if (error.code === 4001) {
            // User rejected the connection request
            toast({
              variant: "destructive",
              title: "Connection Rejected",
              description: "You rejected the connection request"
            });
          } else {
            throw error;
          }
        }
      } else {
        // Handle case where no wallet is available
        toast({
          variant: "destructive",
          title: "No Wallet Detected",
          description: "Please install MetaMask or another compatible wallet",
        });
      }
      
      setWalletState(prev => ({ ...prev, isConnecting: false }));
      return false;
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
      balance: null,
      chainId: null,
    });
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected"
    });
    
    // Note: MetaMask doesn't actually provide a disconnect method via their API
    // This just clears the connection state in our app, but the wallet remains connected
    // The user will need to disconnect from the wallet itself if desired
    
  }, [toast]);

  return {
    ...walletState,
    connectWallet,
    disconnectWallet
  };
}

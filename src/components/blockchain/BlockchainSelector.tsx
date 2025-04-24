
import React, { useState, useEffect } from "react";
import { Wifi, WifiOff } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BlockchainSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

interface NetworkInfo {
  chainId: string;
  chainName: string;
  nativeCurrency?: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls?: string[];
  blockExplorerUrls?: string[];
}

const BlockchainSelector: React.FC<BlockchainSelectorProps> = ({
  value,
  onChange,
  className,
}) => {
  const [networks, setNetworks] = useState<NetworkInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNetworks = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          // Request the user's permission to view their accounts
          await window.ethereum.request({
            method: 'eth_requestAccounts'
          });
          
          // Get current chain ID to restore it later
          const currentChainId = await window.ethereum.request({
            method: 'eth_chainId'
          });
          
          // Define common networks to check for
          const commonNetworks = [
            {
              chainId: '0x1',
              chainName: 'Ethereum Mainnet',
            },
            {
              chainId: '0x5',
              chainName: 'Goerli Testnet',
            },
            {
              chainId: '0x89',
              chainName: 'Polygon Mainnet',
            },
            {
              chainId: '0x13881',
              chainName: 'Mumbai Testnet',
            },
            {
              chainId: '0x397',  // 919 in decimal
              chainName: 'Monad Testnet',
            },
            {
              chainId: '0xA',  // 10 in decimal
              chainName: 'Optimism',
            },
            {
              chainId: '0xA4B1',  // 42161 in decimal
              chainName: 'Arbitrum One',
            },
            {
              chainId: '0xAA36A7',  // 11155111 in decimal
              chainName: 'Sepolia',
            },
          ];
          
          // Try to get all available networks
          const detectedNetworks: NetworkInfo[] = [];
          
          // Check for custom networks via provider state if available
          if (window.ethereum._state && window.ethereum._state.networkConfigurations) {
            try {
              const customNetworks = Object.values(window.ethereum._state.networkConfigurations);
              customNetworks.forEach((network: any) => {
                if (network && network.chainId) {
                  detectedNetworks.push({
                    chainId: network.chainId,
                    chainName: network.nickname || network.chainName || `Chain ${parseInt(network.chainId, 16)}`,
                  });
                }
              });
            } catch (err) {
              console.log("Could not read custom networks from provider state:", err);
            }
          }
          
          // If no networks detected from provider state, try checking common networks
          if (detectedNetworks.length === 0) {
            console.log("Checking common networks");
            // Test common networks
            for (const network of commonNetworks) {
              try {
                // Try switching to each chain to see if it's configured
                await window.ethereum.request({
                  method: 'wallet_switchEthereumChain',
                  params: [{ chainId: network.chainId }],
                });
                
                // If successful, add to detected networks
                detectedNetworks.push(network);
                
                // Small delay between requests to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
              } catch (error: any) {
                console.log(`Error checking network ${network.chainName}:`, error.code);
                // If error code is 4902, network is not available
                if (error.code !== 4902) {
                  // Any other error might be user rejection, so network exists
                  detectedNetworks.push(network);
                }
              }
            }
          }
          
          // Add current network if not already included
          if (currentChainId && !detectedNetworks.some(net => net.chainId === currentChainId)) {
            detectedNetworks.push({
              chainId: currentChainId,
              chainName: `Chain ${parseInt(currentChainId, 16)}`,
            });
          }
          
          // Switch back to original network
          if (currentChainId) {
            try {
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: currentChainId }],
              });
            } catch (error) {
              console.error("Error switching back to original chain:", error);
            }
          }

          // Set networks and remove duplicates
          const uniqueNetworks = detectedNetworks.filter((network, index, self) =>
            index === self.findIndex((n) => n.chainId === network.chainId)
          );
          
          console.log("Detected networks:", uniqueNetworks);
          setNetworks(uniqueNetworks);
        } catch (error) {
          console.error('Error fetching networks:', error);
        }
      }
      setIsLoading(false);
    };

    fetchNetworks();
  }, []);

  // Helper function to get network name from chain ID
  const getNetworkName = (chainId: string): string => {
    const network = networks.find(n => n.chainId === chainId);
    return network?.chainName || `Chain ${parseInt(chainId, 16)}`;
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-sm font-medium text-white">
        Blockchain Network
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-black/70 text-white border-space-stellar-blue focus:ring-space-stellar-blue">
          <SelectValue placeholder="Select network">
            <div className="flex items-center gap-2">
              {isLoading ? (
                <WifiOff className="h-4 w-4" />
              ) : (
                <Wifi className="h-4 w-4" />
              )}
              {getNetworkName(value) || "Select Network"}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-black/90 text-white border-space-stellar-blue">
          {networks.map((network) => (
            <SelectItem 
              key={network.chainId}
              value={network.chainId}
              className="text-white hover:bg-space-stellar-blue/20 focus:bg-space-stellar-blue/20"
            >
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4" />
                {network.chainName}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default BlockchainSelector;


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
          // Request the user's permission to view their accounts and networks
          await window.ethereum.request({
            method: 'eth_requestAccounts'
          });
          
          // Get current chain ID
          const currentChainId = await window.ethereum.request({
            method: 'eth_chainId'
          });
          
          // Get network details for well-known networks
          const wellKnownNetworks: NetworkInfo[] = [
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
            // Filter to only include networks that are actually configured in MetaMask
          ].filter(async (network) => {
            try {
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: network.chainId }],
              });
              return true;
            } catch (error: any) {
              // If error code 4902, network is not available in MetaMask
              if (error.code === 4902) return false;
              return true; // Include network if error is different (might be user rejection)
            }
          });

          // Switch back to original network
          if (currentChainId) {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: currentChainId }],
            });
          }

          // Set the networks
          const availableNetworks = await Promise.all(wellKnownNetworks);
          setNetworks(availableNetworks);

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


import React, { useState, useEffect } from "react";
import { NetworkType } from "@/integrations/supabase/types";
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
          // Get all available chain IDs
          const chainIds = await window.ethereum.request({
            method: 'wallet_getPermissions',
          });
          
          // Get details for each chain
          const networksInfo = await Promise.all(
            chainIds.map(async (permission: any) => {
              try {
                const chainId = await window.ethereum.request({
                  method: 'eth_chainId',
                });
                
                // Get network details
                const networkInfo: NetworkInfo = {
                  chainId,
                  chainName: getNetworkName(chainId),
                };
                
                return networkInfo;
              } catch (error) {
                console.error('Error fetching network details:', error);
                return null;
              }
            })
          );

          // Filter out null values and set networks
          setNetworks(networksInfo.filter((n): n is NetworkInfo => n !== null));
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
    const networks: { [key: string]: string } = {
      '0x1': 'Ethereum Mainnet',
      '0x5': 'Goerli Testnet',
      '0x13881': 'Mumbai Testnet',
      '0x89': 'Polygon Mainnet',
      // Add more networks as needed
    };
    return networks[chainId] || `Chain ${parseInt(chainId, 16)}`;
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


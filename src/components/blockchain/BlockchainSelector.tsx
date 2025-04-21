
import React from "react";

interface BlockchainSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const networks = [
  { name: "Ethereum (Goerli)", value: "ethereum" },
  { name: "Polygon (Mumbai)", value: "polygon" },
];

const BlockchainSelector: React.FC<BlockchainSelectorProps> = ({
  value,
  onChange,
  className,
}) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-sm font-medium text-white">
        Choose Blockchain Network
      </label>
      <select
        className="rounded border bg-black/70 text-white px-3 py-2 focus:outline-none"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        {networks.map(net => (
          <option key={net.value} value={net.value}>
            {net.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default BlockchainSelector;

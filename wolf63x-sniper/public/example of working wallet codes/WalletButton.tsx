import { FC, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import { formatSolBalance, getSolBalance } from '@/utils/solanaUtils';
import { Connection } from '@solana/web3.js';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletButtonProps {
  connection: Connection;
}

const WalletButton: FC<WalletButtonProps> = ({ connection }) => {
  const { connected, publicKey } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  
  useEffect(() => {
    if (connected && publicKey) {
      const fetchBalance = async () => {
        try {
          const bal = await getSolBalance(connection, publicKey);
          setBalance(bal);
        } catch (error) {
          console.error("Error fetching balance:", error);
        }
      };
      
      fetchBalance();
      const intervalId = setInterval(fetchBalance, 30000); // Update every 30 seconds
      
      return () => clearInterval(intervalId);
    } else {
      setBalance(null);
    }
  }, [connected, publicKey, connection]);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2">
      {connected && balance !== null && (
        <div className="px-4 py-2 bg-sniper-card rounded-lg text-sm flex items-center mr-2">
          <div className="w-2 h-2 bg-sniper-success rounded-full mr-2"></div>
          <span>{formatSolBalance(balance * 1e9)} SOL</span>
        </div>
      )}
      <WalletMultiButton className="!bg-sniper-accent hover:!bg-sniper-accent-hover !rounded-lg" />
    </div>
  );
};

export default WalletButton;

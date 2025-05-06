declare module '@solana/wallet-adapter-react-ui' {
  import React from 'react';
  export const WalletModalProvider: React.FC<{children: React.ReactNode}>;
  export const WalletMultiButton: React.FC<{className?: string}>;
}

declare module '@solana/wallet-adapter-base' {
  export enum WalletAdapterNetwork {
    Mainnet = 'mainnet-beta',
    Testnet = 'testnet',
    Devnet = 'devnet'
  }
}
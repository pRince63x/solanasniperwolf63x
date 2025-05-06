import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  SendOptions,
  Keypair,
  TransactionInstruction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID, 
  getAssociatedTokenAddress,
} from '@solana/spl-token';
import { Buffer } from 'buffer';

// Make Buffer available globally
window.Buffer = window.Buffer || Buffer;

/**
 * Validates a Solana address
 */
export const isValidSolanaAddress = (address: string): boolean => {
  try {
    new PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Formats SOL balance with the appropriate number of decimal places
 */
export const formatSolBalance = (lamports: number): string => {
  return (lamports / LAMPORTS_PER_SOL).toFixed(4);
};

/**
 * Get token account for a specific mint address
 */
export const getTokenAccount = async (
  connection: Connection,
  walletAddress: PublicKey,
  tokenMintAddress: PublicKey
): Promise<PublicKey> => {
  return await getAssociatedTokenAddress(
    tokenMintAddress,
    walletAddress
  );
};

/**
 * Buy a token on a supported DEX using the wallet
 */
export const buyToken = async (
  connection: Connection,
  wallet: any,
  tokenAddress: string,
  amountInSol: number,
  slippagePercentage: number
): Promise<string> => {
  try {
    // This is a simplified version. In a real implementation, you would:
    // 1. Create a transaction to swap SOL for the token via a DEX like Jupiter or Raydium
    // 2. Handle slippage protection
    // 3. Send and confirm the transaction
    
    // For demonstration purposes, we'll create a mock transaction
    const transaction = new Transaction();
    
    // Mock instruction - in a real app you would interact with a DEX
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: new PublicKey(tokenAddress),
        lamports: amountInSol * LAMPORTS_PER_SOL,
      })
    );

    // Sign and send transaction
    const signature = await wallet.sendTransaction(
      transaction,
      connection
    );

    // Wait for confirmation
    await connection.confirmTransaction(signature, 'confirmed');
    return signature;
  } catch (error) {
    console.error("Error buying token:", error);
    throw error;
  }
};

/**
 * Sell a token on a supported DEX using the wallet
 */
export const sellToken = async (
  connection: Connection,
  wallet: any,
  tokenAddress: string,
  amountToSell: number,
  slippagePercentage: number
): Promise<string> => {
  try {
    // This is a simplified version. In a real implementation, you would:
    // 1. Get the token account
    // 2. Create a transaction to swap the token for SOL via a DEX
    // 3. Handle slippage protection
    // 4. Send and confirm the transaction
    
    const transaction = new Transaction();
    
    // Mock instruction - in a real app you would interact with a DEX
    const tokenMint = new PublicKey(tokenAddress);
    const tokenAccount = await getTokenAccount(connection, wallet.publicKey, tokenMint);
    
    // This is just a placeholder - real implementation would use DEX instructions
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: wallet.publicKey,
        lamports: 0, // Just a placeholder
      })
    );

    // Sign and send transaction
    const signature = await wallet.sendTransaction(
      transaction,
      connection
    );

    // Wait for confirmation
    await connection.confirmTransaction(signature, 'confirmed');
    return signature;
  } catch (error) {
    console.error("Error selling token:", error);
    throw error;
  }
};

/**
 * Get account balance in SOL
 */
export const getSolBalance = async (
  connection: Connection,
  walletAddress: PublicKey
): Promise<number> => {
  try {
    const balance = await connection.getBalance(walletAddress);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error("Error fetching SOL balance:", error);
    throw error;
  }
};

/**
 * Get transaction status
 */
export const getTransactionStatus = async (
  connection: Connection,
  signature: string
): Promise<string> => {
  try {
    const status = await connection.getSignatureStatus(signature);
    if (status.value?.confirmationStatus) {
      return status.value.confirmationStatus;
    }
    return 'unknown';
  } catch (error) {
    console.error("Error getting transaction status:", error);
    return 'error';
  }
};

/**
 * Fetch all tokens for an address
 */
export const getTokenBalances = async (
  connection: Connection,
  walletAddress: PublicKey
) => {
  try {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      walletAddress,
      { programId: TOKEN_PROGRAM_ID }
    );
    
    return tokenAccounts.value.map(accountInfo => {
      const parsedInfo = accountInfo.account.data.parsed.info;
      return {
        mint: parsedInfo.mint,
        amount: parsedInfo.tokenAmount.uiAmount,
        decimals: parsedInfo.tokenAmount.decimals,
      };
    });
  } catch (error) {
    console.error("Error fetching token balances:", error);
    throw error;
  }
};

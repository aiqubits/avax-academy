'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import Button from '../components/Button'
import { erc721FactoryAbi, erc721Abi } from './erc721Abi'
import * as dotenv from 'dotenv';
dotenv.config({ path: './.env.development.local' });

export default function Nft() {
  const t = useTranslations('')
  const { address, isConnected } = useAccount()
  
  // Form state
  const [collectionName, setCollectionName] = useState('')
  const [collectionSymbol, setCollectionSymbol] = useState('')
  const [baseURI, setBaseURI] = useState('https://avatars.githubusercontent.com/u/193314995?s=400&u=ed1052cfc869ed1ee510b66d2df249c8eee14b50&v=4')
  const [mintPrice, setMintPrice] = useState('0')
  
  // Validation state
  const [errors, setErrors] = useState({
    collectionName: '',
    collectionSymbol: '',
    baseURI: '',
    mintPrice: ''
  })
  
  // Transaction state
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployedCollectionAddress, setDeployedCollectionAddress] = useState('')
  const [transactionHash, setTransactionHash] = useState('')
  const [mintTransactionHash, setMintTransactionHash] = useState('')
  const [mintedTokenId, setMintedTokenId] = useState('')
  
  // Contract deployment hooks
  const { data: hash, isPending, writeContractAsync, error: writeError } = useWriteContract()
  
  
  const { 
    data: receipt,
    isLoading: isConfirming,
    error: confirmError,
    isSuccess: isConfirmed,
    isError: isReceiptError,
    status: receiptStatus    
  } = useWaitForTransactionReceipt({ 
    hash,
    confirmations: 1,
    query: {
      enabled: !!hash,
      retry: 3,
      retryDelay: 1000
    }    
  })
  
  // Mint NFT hooks
  const { data: mintHash, isPending: isMintPending, writeContract: writeMintContract, error: mintWriteError } = useWriteContract()
  
  const { 
    data: mintReceipt,
    isLoading: isMintConfirming,
    error: mintConfirmError
  } = useWaitForTransactionReceipt({ 
    hash: mintHash,
    confirmations: 1,
    query: {
      enabled: !!hash,
      retry: 3,
      retryDelay: 1000
    }
  })
  
  // Update transaction state when hash is available
  useEffect(() => {
    if (hash) {
      setTransactionHash(hash)
    }
  }, [hash])
  
  // Update mint transaction state when mint hash is available
  useEffect(() => {
    if (mintHash) {
      setMintTransactionHash(mintHash)
    }
  }, [mintHash])
  
  // Update deployed collection address when receipt is available
  useEffect(() => {
    console.log(`Update deployed collection address`);
    
    if (!receipt) {
      console.log('Skipping receipt processing - no receipt or not mounted');
      return;
    }
  
  // Debug: Log all events in the receipt
  if (receipt.logs && Array.isArray(receipt.logs)) {    
    // Look for the token address in the logs
    // Based on the logs, we can see the token address in the second log's topics
    if (receipt.logs.length >= 2) {
      const nftLog = receipt.logs[0]; // Second log seems to have the token info
      
      if (nftLog.topics && nftLog.topics[2]) {
        try {
          // Extract the address from the third topic (index 2) which contains the "to" address
          const addressHex = nftLog.address.slice(-40); // Last 40 characters
          const tokenAddress = `0x${addressHex}`.toLowerCase();

          setDeployedCollectionAddress(tokenAddress);
          setIsDeploying(false);
          return;
        } catch (error) {
          console.error('Error parsing token address from logs:', error);
        }
      }
    }

    // Fallback: Try to find any address that looks like a token address
    for (const log of receipt.logs) {
      if (log.topics) {
        for (const topic of log.topics) {
          // Look for a topic that contains an address (40 hex chars)
          const addressMatch = topic.match(/0x[a-fA-F0-9]{40}/);
          if (addressMatch) {
            const potentialAddress = addressMatch[0].toLowerCase();
            console.log('Found potential nft address:', potentialAddress);
            setDeployedCollectionAddress(potentialAddress);
            setIsDeploying(false);
            return;
          }
        }
      }
    }
  }

  // If we get here, we couldn't find the token address in the logs
  console.warn('Could not find token address in receipt logs');
  // setIsDeploying(false);
  }, [receipt])
  
  // Update minted token ID when mint receipt is available
  useEffect(() => {
    console.log(`Update minted token ID`);
    if (mintReceipt) {
      // Extract the minted token ID from the Transfer event
      const transferEvent = mintReceipt.logs.find(log => {
        // Check if this log is from our contract and is the Transfer event
        return log.topics && log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
      });
      
      if (transferEvent && transferEvent.topics && transferEvent.topics[3]) {
        // Extract the token ID from the event
        const tokenId = parseInt(transferEvent.topics[3], 16).toString();
        setMintedTokenId(tokenId);
      }
    }
  }, [mintReceipt])
  
  // Validate form
  const validateForm = () => {
    let isValid = true
    const newErrors = {
      collectionName: '',
      collectionSymbol: '',
      baseURI: '',
      mintPrice: ''
    }
    
    if (!collectionName.trim()) {
      newErrors.collectionName = 'Collection name is required'
      isValid = false
    }
    
    if (!collectionSymbol.trim()) {
      newErrors.collectionSymbol = 'Collection symbol is required'
      isValid = false
    }
    
    // Base URI is optional, but if provided, should be a valid URL
    if (baseURI.trim() && !baseURI.trim().startsWith('http')) {
      newErrors.baseURI = 'Base URI should be a valid URL starting with http:// or https://'
      isValid = false
    }
    
    // Mint price is optional, but if provided, should be a valid number
    if (mintPrice.trim() && (isNaN(Number(mintPrice)) || Number(mintPrice) < 0)) {
      newErrors.mintPrice = 'Mint price must be a non-negative number'
      isValid = false
    }
    
    setErrors(newErrors)
    return isValid
  }

  const chainId = useChainId();

  const getExplorerUrl = (hash: string) => {
      switch (chainId) {
        case 1:
          return `https://etherscan.io/tx/${hash}`;
        case 4:
          return `https://rinkeby.etherscan.io/tx/${hash}`;
        case 137:
          return `https://polygonscan.com/tx/${hash}`;
        case 80001:
          return `https://mumbai.polygonscan.com/tx/${hash}`;
        case 43114:
          return `https://snowtrace.io/tx/${hash}`;
        case 11155111:
          return `https://sepolia.etherscan.io/tx/${hash}`;
        default:
          return "";
      }
    }
  
  // Handle form submission
  const handleDeployCollection = async () => {
    let contractAddress;

    switch (chainId) {
      case 1:
        contractAddress = process.env.NEXT_PUBLIC_ETH_NFT_FACTORY_CONTRACT_ADDRESS as `0x${string}`;
        break;
      case 4:
        contractAddress = process.env.NEXT_PUBLIC_RINKEBY_NFT_FACTORY_CONTRACT_ADDRESS as `0x${string}`;
        break;
      case 137:
        contractAddress = process.env.NEXT_PUBLIC_POLYGON_NFT_FACTORY_CONTRACT_ADDRESS as `0x${string}`;
        break;
      case 80001:
        contractAddress = process.env.NEXT_PUBLIC_MUMBAI_NFT_FACTORY_CONTRACT_ADDRESS as `0x${string}`;
        break;
      case 43114:
        contractAddress = process.env.NEXT_PUBLIC_AVALANCHE_NFT_FACTORY_CONTRACT_ADDRESS as `0x${string}`;
        break;
      case 11155111:
        contractAddress = process.env.NEXT_PUBLIC_SEPOLIA_NFT_FACTORY_CONTRACT_ADDRESS as `0x${string}`;
        break;
      default:
        contractAddress = process.env.NEXT_PUBLIC_NFT_FACTORY_CONTRACT_ADDRESS as `0x${string}`;
    }

    if (!isConnected || !address) {
      console.error('Wallet not connected');
      return;
    }

    if (!validateForm()) {
      console.error('Form validation failed');
      return
    }

    // Ensure we have a valid contract address
    if (!contractAddress) {
      throw new Error('No contract address found for the current network');
    }
    
    try {
      setIsDeploying(true)
      
      const txHash = await writeContractAsync({
        address: contractAddress,
        abi: erc721FactoryAbi,
        functionName: 'createCollection',
        args: [
          collectionName,
          collectionSymbol,
          baseURI
        ],
        chainId: chainId,
      })

      setTransactionHash(txHash);

    } catch (error) {
      console.error('Deployment error:', error)
      setIsDeploying(false)
    }
  }
  
  // Handle NFT minting
  const handleMintNFT = async () => {
    try {
      writeMintContract({
        address: deployedCollectionAddress as `0x${string}`,
        abi: erc721Abi,
        functionName: 'mint',
        args: [
          address as `0x${string}`
        ]
      })
    } catch (error) {
      console.error('Minting error:', error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        {t('issue_erc721_nft') || 'Issue ERC721 NFT Collection'}
      </h1>
      
      <div className="max-w-2xl mx-auto bg-card p-6 rounded-lg shadow-md">
        {!deployedCollectionAddress ? (
          <form className="space-y-4">
            {/* Collection Name */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('collection_name') || 'Collection Name'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                className="w-full p-2 border rounded-md bg-input"
                placeholder="My Cool Cats"
              />
              {errors.collectionName && <p className="text-red-500 text-sm mt-1">{errors.collectionName}</p>}
              <p className="text-sm text-muted-foreground mt-1">
                {t('collection_name_description') || 'The name of your NFT collection (e.g., "My Cool Cats")'}
              </p>
            </div>
            
            {/* Collection Symbol */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('collection_symbol') || 'Collection Symbol'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={collectionSymbol}
                onChange={(e) => setCollectionSymbol(e.target.value)}
                className="w-full p-2 border rounded-md bg-input"
                placeholder="MCC"
              />
              {errors.collectionSymbol && <p className="text-red-500 text-sm mt-1">{errors.collectionSymbol}</p>}
              <p className="text-sm text-muted-foreground mt-1">
                {t('collection_symbol_description') || 'The symbol of your NFT collection (e.g., "MCC")'}
              </p>
            </div>
            
            {/* Base URI */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('base_uri') || 'Base URI'}
              </label>
              <input
                type="text"
                value={baseURI}
                onChange={(e) => setBaseURI(e.target.value)}
                className="w-full p-2 border rounded-md bg-input"
                placeholder="https://avatars.githubusercontent.com/u/193314995?s=400&u=ed1052cfc869ed1ee510b66d2df249c8eee14b50&v=4"
              />
              {errors.baseURI && <p className="text-red-500 text-sm mt-1">{errors.baseURI}</p>}
              <p className="text-sm text-muted-foreground mt-1">
                {t('base_uri_description') || 'The base URI for token metadata (optional, e.g., "https://example.com/api/nft_logo.jpg")'}
              </p>
            </div>
            
            {/* Deploy Button */}
            <div className="pt-4">
              <Button
                onClick={handleDeployCollection}
                disabled={!isConnected || isPending || isConfirming}
                className="w-full"
              >
                {isPending || isConfirming ? (
                  t('deploying') || 'Deploying...'
                ) : (
                  t('deploy_collection') || 'Deploy NFT Collection'
                )}
              </Button>
              
              {!isConnected && (
                <p className="text-amber-500 text-sm mt-2">
                  {t('connect_wallet_first') || 'Please connect your wallet first'}
                </p>
              )}
              
              {writeError && (
                <p className="text-red-500 text-sm mt-2">
                  {t('deployment_nft_error') || 'Error deploying collection'}: {writeError.message}
                </p>
              )}
            </div>
          </form>
        ) : (
          <div className="text-center py-6">
            <h2 className="text-2xl font-bold text-green-500 mb-4">
              {t('collection_deployed_successfully') || 'NFT Collection Deployed Successfully!'}
            </h2>
            
            <div className="bg-muted p-4 rounded-md mb-4">
              <p className="font-medium">{t('collection_address') || 'Collection Address'}:</p>
              <p className="font-mono break-all">{deployedCollectionAddress}</p>
            </div>
            
            <div className="bg-muted p-4 rounded-md mb-6">
              <p className="font-medium">{t('transaction_hash') || 'Transaction Hash'}:</p>
              <p className="font-mono break-all">{transactionHash}</p>
              <a 
                href={getExplorerUrl(transactionHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline mt-2 inline-block"
              >
                {t('view_on_explorer') || 'View on Explorer'}
              </a>
            </div>
            
            {!mintedTokenId ? (
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-4">
                  {t('mint_your_first_nft') || 'Mint Your First NFT'}
                </h3>
                <Button
                  onClick={handleMintNFT}
                  disabled={isMintPending || isMintConfirming}
                  className="w-full"
                >
                  {isMintPending || isMintConfirming ? (
                    t('minting') || 'Minting...'
                  ) : (
                    t('mint_nft') || 'Mint NFT'
                  )}
                </Button>
                
                {mintWriteError && (
                  <p className="text-red-500 text-sm mt-2">
                    {t('minting_error') || 'Error minting NFT'}: {mintWriteError.message}
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-green-500 mb-4">
                  {t('nft_minted_successfully') || 'NFT Minted Successfully!'}
                </h3>
                <div className="bg-muted p-4 rounded-md mb-4">
                  <p className="font-medium">{t('current_nft_id') || 'Current NFT ID'}:</p>
                  <p className="font-mono">{mintedTokenId}</p>
                </div>
                <div className="bg-muted p-4 rounded-md mb-6">
                  <p className="font-medium">{t('mint_transaction_hash') || 'Mint Transaction Hash'}:</p>
                  <p className="font-mono break-all">{mintTransactionHash}</p>
                  <a 
                    href={getExplorerUrl(mintTransactionHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline mt-2 inline-block"
                  >
                    {t('view_on_explorer') || 'View on Explorer'}
                  </a>
                </div>
                  <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-4">
                    {t('mint_another_nft') || 'Mint Another NFT'}
                  </h3>
                  <Button
                    onClick={handleMintNFT}
                    disabled={isMintPending || isMintConfirming}
                    className="w-full"
                  >
                    {isMintPending || isMintConfirming ? (
                      t('minting') || 'Minting...'
                    ) : (
                      t('mint_nft') || 'Mint NFT'
                    )}
                  </Button>
                  
                  {mintWriteError && (
                    <p className="text-red-500 text-sm mt-2">
                      {t('minting_error') || 'Error minting NFT'}: {mintWriteError.message}
                    </p>
                  )}
                </div>
              </div>
            )}
            
            <div className="mt-6">
              <Button
                onClick={() => {
                  setDeployedCollectionAddress('')
                  setTransactionHash('')
                  setMintTransactionHash('')
                  setMintedTokenId('')
                  setCollectionName('')
                  setCollectionSymbol('')
                  setBaseURI('')
                }}
                variant="secondary"
              >
                {t('deploy_another_collection') || 'Deploy Another Collection'}
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Transaction Status */}
      {(isPending || isConfirming) && !deployedCollectionAddress && (
        <div className="max-w-2xl mx-auto mt-6 p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md">
          <h3 className="font-medium text-amber-800 dark:text-amber-300">
            {t('transaction_in_progress') || 'Transaction in Progress'}
          </h3>
          <p className="text-sm mt-1">
            {isPending 
              ? (t('waiting_for_confirmation') || 'Waiting for confirmation in your wallet...') 
              : (t('waiting_for_blockchain') || 'Transaction submitted, waiting for blockchain confirmation...')}
          </p>
          {transactionHash && (
            <a 
              href={getExplorerUrl(transactionHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline text-sm mt-2 inline-block"
            >
              {t('view_on_explorer') || 'View on Explorer'}
            </a>
          )}
        </div>
      )}
      
      {/* Mint Transaction Status */}
      {(isMintPending || isMintConfirming) && !mintedTokenId && (
        <div className="max-w-2xl mx-auto mt-6 p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md">
          <h3 className="font-medium text-amber-800 dark:text-amber-300">
            {t('minting_in_progress') || 'Minting in Progress'}
          </h3>
          <p className="text-sm mt-1">
            {isMintPending 
              ? (t('waiting_for_mint_confirmation') || 'Waiting for confirmation in your wallet...') 
              : (t('waiting_for_mint_blockchain') || 'Transaction submitted, waiting for blockchain confirmation...')}
          </p>
          {mintTransactionHash && (
            <a 
              href={getExplorerUrl(mintTransactionHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline text-sm mt-2 inline-block"
            >
              {t('view_on_explorer') || 'View on Explorer'}
            </a>
          )}
        </div>
      )}
    </div>
  )
}

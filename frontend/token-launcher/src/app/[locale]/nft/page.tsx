'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
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
  const [baseURI, setBaseURI] = useState('')
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
  const { data: hash, isPending, writeContract, error: writeError } = useWriteContract()
  
  const { 
    data: receipt,
    isLoading: isConfirming,
    error: confirmError
  } = useWaitForTransactionReceipt({ 
    hash,
  })
  
  // Mint NFT hooks
  const { data: mintHash, isPending: isMintPending, writeContract: writeMintContract, error: mintWriteError } = useWriteContract()
  
  const { 
    data: mintReceipt,
    isLoading: isMintConfirming,
    error: mintConfirmError
  } = useWaitForTransactionReceipt({ 
    hash: mintHash,
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
    if (receipt) {
      // For ERC721, we need to extract the deployed address from logs
      // The CollectionCreated event has the collection address as the second indexed parameter
      const collectionCreatedEvent = receipt.logs.find(log => {
        // Check if this log is from our contract and is the CollectionCreated event
        return log.topics && log.topics[0] === '0x3e7a3ee3a2b3d5360d9ab555d2a6c425f6d89d5ff11a66c03d7e0c1b35af3b91';
      });
      
      if (collectionCreatedEvent && collectionCreatedEvent.topics && collectionCreatedEvent.topics[2]) {
        // Extract the collection address from the event
        const collectionAddress = `0x${collectionCreatedEvent.topics[2].slice(26)}`;
        setDeployedCollectionAddress(collectionAddress);
        setIsDeploying(false);
      }
    }
  }, [receipt])
  
  // Update minted token ID when mint receipt is available
  useEffect(() => {
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
  
  // Handle form submission
  const handleDeployCollection = async () => {
    if (!validateForm()) return
    
    try {
      setIsDeploying(true)
      
      writeContract({
        address: process.env.NEXT_PUBLIC_NFT_FACTORY_CONTRACT_ADDRESS as `0x${string}`, // Replace with actual factory contract address
        abi: erc721FactoryAbi,
        functionName: 'createCollection',
        args: [
          collectionName,
          collectionSymbol,
          baseURI
        ]
      })
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
                placeholder="https://example.com/api/nft_logo.jpg"
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
                href={`https://snowtrace.io/tx/${transactionHash}`}
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
                  <p className="font-medium">{t('token_id') || 'Token ID'}:</p>
                  <p className="font-mono">{mintedTokenId}</p>
                </div>
                <div className="bg-muted p-4 rounded-md mb-6">
                  <p className="font-medium">{t('mint_transaction_hash') || 'Mint Transaction Hash'}:</p>
                  <p className="font-mono break-all">{mintTransactionHash}</p>
                  <a 
                    href={`https://snowtrace.io/tx/${mintTransactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline mt-2 inline-block"
                  >
                    {t('view_on_explorer') || 'View on Explorer'}
                  </a>
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
              href={`https://snowtrace.io/tx/${transactionHash}`}
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
              href={`https://snowtrace.io/tx/${mintTransactionHash}`}
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

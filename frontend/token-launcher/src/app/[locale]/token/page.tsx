'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits } from 'viem'
import Button from '../components/Button'
import { erc20Abi } from './erc20Abi'
import * as dotenv from 'dotenv';
dotenv.config({ path: './.env.development.local' });

export default function Token() {
  const t = useTranslations('')
  const { address, isConnected } = useAccount()
  
  // Form state
  const [tokenName, setTokenName] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [decimals, setDecimals] = useState('18')
  const [totalSupply, setTotalSupply] = useState('')
  const [initialHolder, setInitialHolder] = useState<`0x${string}` | ''>('')
  
  // Validation state
  const [errors, setErrors] = useState({
    tokenName: '',
    tokenSymbol: '',
    decimals: '',
    totalSupply: '',
    initialHolder: ''
  })
  
  // Transaction state
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployedTokenAddress, setDeployedTokenAddress] = useState('')
  const [transactionHash, setTransactionHash] = useState('')
  
  // Set initial holder to connected wallet address
  useEffect(() => {
    if (address) {
      setInitialHolder(address as `0x${string}`)
    }
  }, [address])
  
  // Contract deployment hooks
  const { data: hash, isPending, writeContract, error: writeError } = useWriteContract()
  
  const { 
    data: receipt,
    isLoading: isConfirming,
    error: confirmError
  } = useWaitForTransactionReceipt({ 
    hash,
  })
  
  // Update transaction state when hash is available
  useEffect(() => {
    if (hash) {
      setTransactionHash(hash)
    }
  }, [hash])
  
  // Update deployed token address when receipt is available
  useEffect(() => {
    if (receipt?.contractAddress) {
      setDeployedTokenAddress(receipt.contractAddress)
      setIsDeploying(false)
    }
  }, [receipt])
  
  // Validate form
  const validateForm = () => {
    let isValid = true
    const newErrors = {
      tokenName: '',
      tokenSymbol: '',
      decimals: '',
      totalSupply: '',
      initialHolder: ''
    }
    
    if (!tokenName.trim()) {
      newErrors.tokenName = 'Token name is required'
      isValid = false
    }
    
    if (!tokenSymbol.trim()) {
      newErrors.tokenSymbol = 'Token symbol is required'
      isValid = false
    }
    
    const decimalsNum = parseInt(decimals)
    if (isNaN(decimalsNum) || decimalsNum < 0 || decimalsNum > 18) {
      newErrors.decimals = 'Decimals must be between 0 and 18'
      isValid = false
    }
    
    if (!totalSupply.trim() || isNaN(Number(totalSupply)) || Number(totalSupply) <= 0) {
      newErrors.totalSupply = 'Total supply must be a positive number'
      isValid = false
    }
    
    if (!initialHolder.trim() || !/^0x[a-fA-F0-9]{40}$/.test(initialHolder)) {
      newErrors.initialHolder = 'Valid wallet address is required'
      isValid = false
    }
    
    setErrors(newErrors)
    return isValid
  }
  
  // Handle form submission
  const handleDeployToken = async () => {
    if (!validateForm()) return
    
    try {
      setIsDeploying(true)
      
      const totalSupplyWithDecimals = parseUnits(
        totalSupply, 
        parseInt(decimals)
      )
      
      writeContract({
        address: process.env.NEXT_PUBLIC_TOKEN_FACTORY_CONTRACT_ADDRESS as `0x${string}`,
        abi: erc20Abi,
        functionName: 'createERC20',
        args: [
          tokenName,
          tokenSymbol,
          parseInt(decimals),
          totalSupplyWithDecimals,
          initialHolder as `0x${string}`
        ]
      })
    } catch (error) {
      console.error('Deployment error:', error)
      setIsDeploying(false)
    }
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        {t('issue_erc20_token') || 'Issue ERC20 Token'}
      </h1>
      
      <div className="max-w-2xl mx-auto bg-card p-6 rounded-lg shadow-md">
        {!deployedTokenAddress ? (
          <form className="space-y-4">
            {/* Token Name */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('token_name') || 'Token Name'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                className="w-full p-2 border rounded-md bg-input"
                placeholder="My Awesome Token"
              />
              {errors.tokenName && <p className="text-red-500 text-sm mt-1">{errors.tokenName}</p>}
              <p className="text-sm text-muted-foreground mt-1">
                {t('token_name_description') || 'The name of your token (e.g., "My Awesome Token")'}
              </p>
            </div>
            
            {/* Token Symbol */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('token_symbol') || 'Token Symbol'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={tokenSymbol}
                onChange={(e) => setTokenSymbol(e.target.value)}
                className="w-full p-2 border rounded-md bg-input"
                placeholder="MAT"
              />
              {errors.tokenSymbol && <p className="text-red-500 text-sm mt-1">{errors.tokenSymbol}</p>}
              <p className="text-sm text-muted-foreground mt-1">
                {t('token_symbol_description') || 'The symbol of your token (e.g., "MAT")'}
              </p>
            </div>
            
            {/* Decimals */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('decimals') || 'Decimals'} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={decimals}
                onChange={(e) => setDecimals(e.target.value)}
                className="w-full p-2 border rounded-md bg-input"
                min="0"
                max="18"
              />
              {errors.decimals && <p className="text-red-500 text-sm mt-1">{errors.decimals}</p>}
              <p className="text-sm text-muted-foreground mt-1">
                {t('decimals_description') || 'The number of decimal places (usually 18 for most tokens)'}
              </p>
            </div>
            
            {/* Total Supply */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('total_supply') || 'Total Supply'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={totalSupply}
                onChange={(e) => setTotalSupply(e.target.value)}
                className="w-full p-2 border rounded-md bg-input"
                placeholder="1000000"
              />
              {errors.totalSupply && <p className="text-red-500 text-sm mt-1">{errors.totalSupply}</p>}
              <p className="text-sm text-muted-foreground mt-1">
                {t('total_supply_description') || 'The total number of tokens to be created'}
              </p>
            </div>
            
            {/* Initial Holder */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('initial_holder') || 'Initial Holder'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={initialHolder || address}
                onChange={(e) => setInitialHolder(e.target.value as `0x${string}`)}
                className="w-full p-2 border rounded-md bg-input"
                placeholder="0x..."
              />
              {errors.initialHolder && <p className="text-red-500 text-sm mt-1">{errors.initialHolder}</p>}
              <p className="text-sm text-muted-foreground mt-1">
                {t('initial_holder_description') || 'The wallet address that will initially hold all tokens (defaults to your connected wallet)'}
              </p>
            </div>
            
            {/* Deploy Button */}
            <div className="pt-4">
              <Button
                onClick={handleDeployToken}
                disabled={!isConnected || isPending || isConfirming}
                className="w-full"
              >
                {isPending || isConfirming ? (
                  t('deploying') || 'Deploying...'
                ) : (
                  t('deploy_token') || 'Deploy Token'
                )}
              </Button>
              
              {!isConnected && (
                <p className="text-amber-500 text-sm mt-2">
                  {t('connect_wallet_first') || 'Please connect your wallet first'}
                </p>
              )}
              
              {writeError && (
                <p className="text-red-500 text-sm mt-2">
                  {t('deployment_token_error') || 'Error deploying token'}: {writeError.message}
                </p>
              )}
            </div>
          </form>
        ) : (
          <div className="text-center py-6">
            <h2 className="text-2xl font-bold text-green-500 mb-4">
              {t('token_deployed_successfully') || 'Token Deployed Successfully!'}
            </h2>
            
            <div className="bg-muted p-4 rounded-md mb-4">
              <p className="font-medium">{t('token_address') || 'Token Address'}:</p>
              <p className="font-mono break-all">{deployedTokenAddress}</p>
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
            
            <Button
              onClick={() => {
                setDeployedTokenAddress('')
                setTransactionHash('')
                setTokenName('')
                setTokenSymbol('')
                setDecimals('18')
                setTotalSupply('')
              }}
            >
              {t('deploy_another_token') || 'Deploy Another Token'}
            </Button>
          </div>
        )}
      </div>
      
      {/* Transaction Status */}
      {(isPending || isConfirming) && !deployedTokenAddress && (
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
    </div>
  )
}
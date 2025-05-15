'use client'
import React from 'react'

import { ConnectButton } from '@rainbow-me/rainbowkit';

const WalletButton: React.FC = () => {
  return (
    <div className='items-center text-destructive inline-flex w-full justify-between gap-3'>
      <ConnectButton
        accountStatus={{
          smallScreen: 'avatar',
          largeScreen: 'full',
        }} 
      />
    </div>
  )
}

export default WalletButton

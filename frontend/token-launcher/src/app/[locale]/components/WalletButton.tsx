'use client'
import React from 'react'

import { ConnectButton } from '@rainbow-me/rainbowkit';

const WalletButton: React.FC = () => {
  return (
    <div className='items-center text-destructive inline-flex w-full justify-between gap-3'>
      <ConnectButton
        chainStatus={{
          smallScreen: 'icon',
          largeScreen: 'full',
        }}
        accountStatus={{
          smallScreen: 'address',
          largeScreen: 'address',
        }} 
        showBalance={{
          smallScreen: false,
          largeScreen: false,
        }}
      />
    </div>
  )
}

export default WalletButton

import { getDefaultConfig, Chain } from '@rainbow-me/rainbowkit';
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  sepolia,
  avalanche,
} from 'wagmi/chains';
import { http } from 'wagmi';
import '@rainbow-me/rainbowkit/styles.css';
import * as dotenv from 'dotenv';
dotenv.config({ path: './.env.development.local' });

const  customChain = {
    id: Number(process.env.NEXT_PUBLIC_CUSTOM_CHAIN_ID),
    name: process.env.NEXT_PUBLIC_CUSTOM_CHAIN_NAME || '',
    iconUrl: process.env.NEXT_PUBLIC_CUSTOM_CHAIN_ICON_URL || '',
    iconBackground: '#fff',
    nativeCurrency: {
      name: process.env.NEXT_PUBLIC_CUSTOM_CHAIN_NATIVE_CURRENCY_NAME || '',
      symbol: process.env.NEXT_PUBLIC_CUSTOM_CHAIN_NATIVE_CURRENCY_SYMBOL || '',
      decimals: Number(process.env.NEXT_PUBLIC_CUSTOM_CHAIN_NATIVE_CURRENCY_DECIMALS),
    },
    rpcUrls: {
      default: { http: [ process.env.NEXT_PUBLIC_CUSTOM_CHAIN_RPC_URL || ''] },
    },
    blockExplorers: {
      default: {
        name: process.env.NEXT_PUBLIC_CUSTOM_CHAIN_EXPLORE_NAME || '',
        url: process.env.NEXT_PUBLIC_CUSTOM_CHAIN_EXPLORE_URL || '',
      },
    },
  } as const satisfies Chain;

export const config = getDefaultConfig({
  appName: 'Token Launcher',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "",
  chains: [
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    avalanche,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia] : []),
    customChain || undefined,
  ],
  transports: {
    [mainnet.id]: http(process.env.NEXT_PUBLIC_ETH_TRANSPORTS_MAINNET_URL || ''),
    [sepolia.id]: http(process.env.NEXT_PUBLIC_ETH_TRANSPORTS_SEPOLIA_URL || ''),
  },
  ssr: true,
});

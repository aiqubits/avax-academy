import { getDefaultConfig } from '@rainbow-me/rainbowkit';
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
  ],
  transports: {
    [mainnet.id]: http('https://eth-mainnet.g.alchemy.com/v2/...'),
    [sepolia.id]: http('https://eth-sepolia.g.alchemy.com/v2/...'),
  },
  ssr: true,
});

'use client'
import { Link } from '@/src/navigation'
import { useTranslations } from 'next-intl'
import { FC } from 'react'
import GithubIcon from '../../icons/github'
import LogoIcon from '../../icons/logo'
import LangSwitcher from './LangSwitcher'
import ThemeSwitch from './ThemeSwitch'
import  WalletButton  from './WalletButton';

interface Props {
  locale: string
}
export const Header: FC<Props> = ({ locale }) => {
  const t = useTranslations('')
  return (
    <div className='mx-auto flex max-w-screen-2xl flex-row items-center justify-between p-5'>
      <Link lang={locale} href='/'>
        <div className='flex flex-row items-center'>
          <div className='mb-2 h-14 w-14'>
            <LogoIcon />
          </div>
          <strong className='mx-2 select-none'>Token Launcher</strong>
        </div>
      </Link>
      {/* width: max-content; */}
      <div className='flex flex-row items-center gap-3 w-2/3'>
        <nav className='mr-10 inline-flex gap-5 text-2xl w-full'>
          <Link lang={locale} href={`/token`}>
            {t('Token')}
          </Link>
          <Link lang={locale} href={`/nft`}>
            {t('NFT')}
          </Link>
          <Link lang={locale} href={`/about`}>
            {t('About')}
          </Link>
        </nav>
        <ThemeSwitch />
        <LangSwitcher />
        <WalletButton />
      </div>
    </div>
  )
}

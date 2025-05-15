'use client'
import {
  createLocalizedPathnamesNavigation,
  Pathnames
} from 'next-intl/navigation'
import { routing } from './i18n/routing'

const locales =  routing.locales;

export const localePrefix = 'always'

export const pathnames = {
  '/': '/',
  '/token': '/token',
  '/nft': '/nft',
  '/about': '/about'
} satisfies Pathnames<typeof locales>

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createLocalizedPathnamesNavigation({ locales, localePrefix, pathnames })

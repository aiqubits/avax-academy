import createMiddleware from 'next-intl/middleware'
import { NextRequest } from 'next/server'
import { routing } from './i18n/routing'
import { localePrefix } from './navigation'
type CustomMiddleware = (req: NextRequest) => Promise<NextRequest>
const customMiddleware: CustomMiddleware = async req => {
  console.log('Custom middleware executed before next-intl')
  return req
}

const locales = routing.locales;

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'en-US',
  localePrefix
})

export default async function middleware(
  req: NextRequest
): Promise<ReturnType<typeof intlMiddleware>> {
  await customMiddleware(req)
  return intlMiddleware(req)
}

export const config = {
  matcher: ['/', '/(zh-CN|en-US)/:path*']
}

import { useTranslations } from 'next-intl'
import Button from './components/Button'
import { Link } from '@/src/navigation'

export default function DashboardPage() {
  const t = useTranslations('')
  return (
    <div>
      <section className='flex flex-col items-center justify-center py-24'>
        <h1 className='text-center text-7xl font-extrabold leading-tight'>
          {t('An')}{' '}
          <span className='bg-span-bg bg-clip-text text-transparent'>
            {t('Launcher')}
          </span>
          <br />
          {t('to_Your_Customized_Token')}
        </h1>
        <div className='my-6 px-20 text-center text-2xl text-text-secondary'>
          {t(
            'An_approachable_security_and_versatile_protocol(ERC)_for_building_customized_token'
          )}
        </div>
        <div className='mt-4 flex flex-row gap-4'>
          <a href={`https://github.com/TokenFounder`}>
            <Button rounded size='large'>
              {t('Start_Launching')}
            </Button>
          </a>
          {/* <a
            href='/token'
            target='_blank'
          >
            <Button rounded size='large'>
              {t('Start_Launching')}
            </Button>
          </a> */}
          {/* <a
            href='https://github.com/'
            target='_blank'
          >
            <Button rounded size='large' variant='secondary'>
              {t('Learn_More')}
            </Button>
          </a> */}
        </div>
      </section>
      <section className='bg-background-secondary py-20 max-lg:py-10'>
        <div className='mx-auto grid max-w-screen-lg grid-cols-3 gap-7 px-8 py-5 max-lg:max-w-fit max-lg:grid-cols-1 max-lg:gap-10'>
          <div className='text-center'>
            <h2 className='mb-3  text-xl font-semibold'>{t('Approachable')}</h2>
            <p className='text-text-secondary max-lg:max-w-[500px]'>
              {t(
                'User_perspective_usage_easy_to_understand_parameter_settings_with_clear_annotations'
              )}
            </p>
          </div>
          <div className='text-center'>
            <h2 className='mb-3 text-xl font-semibold'>{t('Versatile')}</h2>
            <p className='text-text-secondary max-lg:max-w-[500px]'>
              {t(
                'Supports_multiple_protocol_tokens_ERC20_ERC721_ERC1155_AND_SO_ON'
              )}
            </p>
          </div>
          <div className='text-center'>
            <h2 className='mb-3 text-xl font-semibold'>{t('Performant')}</h2>
            <p className='text-text-secondary max-lg:max-w-[500px]'>
              {t(
                'Pure_static_no_backend_no_database_no_caching_platform_does_not_store_any_user_data_information_only_authorizes_wallet_access'
              )}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

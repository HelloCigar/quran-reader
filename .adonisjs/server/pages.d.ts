import '@adonisjs/inertia/types'

import type React from 'react'
import type { Prettify } from '@adonisjs/core/types/common'

type ExtractProps<T> =
  T extends React.FC<infer Props>
    ? Prettify<Omit<Props, 'children'>>
    : T extends React.Component<infer Props>
      ? Prettify<Omit<Props, 'children'>>
      : never

declare module '@adonisjs/inertia/types' {
  export interface InertiaPages {
    'account/activate': ExtractProps<(typeof import('../../inertia/pages/account/activate.tsx'))['default']>
    'app/dashboard': ExtractProps<(typeof import('../../inertia/pages/app/dashboard.tsx'))['default']>
    'auth/forgot_password': ExtractProps<(typeof import('../../inertia/pages/auth/forgot_password.tsx'))['default']>
    'auth/login': ExtractProps<(typeof import('../../inertia/pages/auth/login.tsx'))['default']>
    'auth/reset_password': ExtractProps<(typeof import('../../inertia/pages/auth/reset_password.tsx'))['default']>
    'auth/signup': ExtractProps<(typeof import('../../inertia/pages/auth/signup.tsx'))['default']>
    'auth/verify_email': ExtractProps<(typeof import('../../inertia/pages/auth/verify_email.tsx'))['default']>
    'bookmarks/index': ExtractProps<(typeof import('../../inertia/pages/bookmarks/index.tsx'))['default']>
    'errors/not_found': ExtractProps<(typeof import('../../inertia/pages/errors/not_found.tsx'))['default']>
    'errors/quran_unavailable': ExtractProps<(typeof import('../../inertia/pages/errors/quran_unavailable.tsx'))['default']>
    'errors/server_error': ExtractProps<(typeof import('../../inertia/pages/errors/server_error.tsx'))['default']>
    'marketing/home': ExtractProps<(typeof import('../../inertia/pages/marketing/home.tsx'))['default']>
    'quran/index': ExtractProps<(typeof import('../../inertia/pages/quran/index.tsx'))['default']>
    'quran/show': ExtractProps<(typeof import('../../inertia/pages/quran/show.tsx'))['default']>
    'settings/profile': ExtractProps<(typeof import('../../inertia/pages/settings/profile.tsx'))['default']>
    'settings/security': ExtractProps<(typeof import('../../inertia/pages/settings/security.tsx'))['default']>
  }
}

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
    'app/dashboard': ExtractProps<(typeof import('../../inertia/pages/app/dashboard.tsx'))['default']>
    'auth/login': ExtractProps<(typeof import('../../inertia/pages/auth/login.tsx'))['default']>
    'auth/signup': ExtractProps<(typeof import('../../inertia/pages/auth/signup.tsx'))['default']>
    'bookmarks/index': ExtractProps<(typeof import('../../inertia/pages/bookmarks/index.tsx'))['default']>
    'errors/not_found': ExtractProps<(typeof import('../../inertia/pages/errors/not_found.tsx'))['default']>
    'errors/quran_unavailable': ExtractProps<(typeof import('../../inertia/pages/errors/quran_unavailable.tsx'))['default']>
    'errors/server_error': ExtractProps<(typeof import('../../inertia/pages/errors/server_error.tsx'))['default']>
    'marketing/home': ExtractProps<(typeof import('../../inertia/pages/marketing/home.tsx'))['default']>
    'quran/index': ExtractProps<(typeof import('../../inertia/pages/quran/index.tsx'))['default']>
    'quran/show': ExtractProps<(typeof import('../../inertia/pages/quran/show.tsx'))['default']>
  }
}

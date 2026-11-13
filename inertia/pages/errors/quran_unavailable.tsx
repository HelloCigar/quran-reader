import ErrorPage from '~/components/errors/error_page'
import MarketingLayout from '~/components/marketing/marketing_layout'
import type { InertiaProps } from '~/types'

type PageProps = InertiaProps<{ message: string }>

export default function QuranUnavailable({ message }: PageProps) {
  return <ErrorPage status={503} title="Quran text unavailable" description={message} />
}

QuranUnavailable.layout = [MarketingLayout]

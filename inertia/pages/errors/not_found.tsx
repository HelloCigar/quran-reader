import ErrorPage from '~/components/errors/error_page'
import MarketingLayout from '~/components/marketing/marketing_layout'

export default function NotFound() {
  return (
    <ErrorPage
      status={404}
      title="Not found"
      description="That route hasn't been built yet. Check the URL or head back home."
    />
  )
}

NotFound.layout = [MarketingLayout]

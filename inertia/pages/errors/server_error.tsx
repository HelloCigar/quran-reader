import ErrorPage from '~/components/errors/error_page'
import MarketingLayout from '~/components/marketing/marketing_layout'

export default function ServerError() {
  return (
    <ErrorPage
      status={500}
      title="Something broke"
      description="The server hit an unexpected error. Try again in a moment. If the problem persists, check the server logs for the underlying exception."
    />
  )
}

ServerError.layout = [MarketingLayout]

import LoggedOutHeader from '../components/logged-out-header'
import LoginSignupForm from '../components/login-signup-form/page'

export const dynamic = 'force-dynamic'

export default async function LoginSignupPage({ searchParams }: any) {
  const params = await searchParams
  console.log('searchParams', params)

  return (
    <main className="flex flex-col min-h-screen bg-background transition-colors duration-200">
      <LoggedOutHeader />
      <LoginSignupForm action={params?.action} />
    </main>
  )
}

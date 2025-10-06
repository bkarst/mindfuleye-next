import LoginSignupForm from '../components/login-signup-form/page'

export const dynamic = 'force-dynamic'

export default function LoginSignupPage({ searchParams }: any) {
  console.log('searchParams', searchParams)
  
  return (
    <main className="flex flex-col min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      
      <LoginSignupForm action={searchParams && searchParams.action} />
    </main>
  )
}

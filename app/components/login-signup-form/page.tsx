'use client'
import { signInWithEmail, signUpEmail, signUpWithGoogle } from '@/lib/auth'
import {
  Button,
  Card,
  CardBody,
  Divider,
  Input,
  Tab,
  Tabs
} from '@heroui/react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import React, { useEffect } from 'react'

import { getRedirectResult, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'

const LoginSignupForm = ({ action }: any) => {
  const [selected, setSelected] = React.useState(action || 'login')
  const [currentUser, setCurrentUser]: any = React.useState(null)
  const { theme, setTheme } = useTheme()
  const FontLoadingContext = React.createContext(false)

    const debugRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth)
        console.log('result', result)
        if (result) {
          // const details = getAdditionalUserInfo(result)
          console.log(result) // details.isNewUser to determine if a new or returning user
        } else {
          // Everything is fine
        }
      } catch (error) {
        console.log(error) // Debug errors from redirect response
      }
    }


  useEffect(() => {
    const user = auth.currentUser
    console.log('auth.currentUser', auth.currentUser)
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      console.log('onAuthStateChanged, user', user)
      console.log('onAuthStateChanged, auth', auth)
      debugRedirectResult()
    })
    return () => unsubscribe()
  }, [])

  return (
    <div>
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg big-border-radius transition-colors duration-200">
          <CardBody className="p-10">
            <Tabs
              fullWidth
              size="md"
              aria-label="Tabs form"
              selectedKey={selected}
              onSelectionChange={setSelected}
            >
              <Tab key="login" title="Login">
                <div className="space-y-4 mt-6">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Email
                    </label>
                    <Input id="email" placeholder="Email" className="w-full" />
                  </div>
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Password
                    </label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Password"
                      className="w-full"
                    />
                  </div>
                  <Button
                    id="login-button"
                    variant={'solid'}
                    color="primary"
                    className="w-full transition-colors duration-200"
                    onPress={signInWithEmail}
                  >
                    Sign In
                  </Button>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    margin: '25px 0'
                  }}
                >
                  <Divider style={{ flex: 1 }} />
                  <span className="mx-2.5 text-gray-500 dark:text-gray-400 text-sm uppercase transition-colors duration-200">
                    or
                  </span>
                  <Divider style={{ flex: 1 }} />
                </div>

                <div className="space-y-4">
                  <Button
                    variant={'flat'}
                    className="w-full"
                    id="google-signup"
                    onPress={signUpWithGoogle}
                  >
                    <img
                      src="/google2.svg"
                      alt="Google logo"
                      className="mr-2"
                    />
                    Login with Google
                  </Button>
                </div>
              </Tab>
              <Tab key="signup" title="Sign Up">
                <div className="space-y-4 pt-6">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Email
                    </label>
                    <Input id="email" placeholder="Email" className="w-full" />
                  </div>
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Password
                    </label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Password"
                      className="w-full"
                    />
                  </div>
                  <div className="flex">
                    <div className="mt-4 mb-4 text-gray-600 dark:text-gray-400 transition-colors duration-200">
                      By signing up, you agree to our{' '}
                      <Link href={'/privacy-policy'}>
                        <span className="italic text-blue-600 dark:text-blue-400 hover:underline">privacy policy</span>
                      </Link>{' '}
                      and{' '}
                      <Link href={'/terms'}>
                        <span className="italic text-blue-600 dark:text-blue-400 hover:underline">terms and conditions</span>
                      </Link>
                      .
                    </div>
                  </div>
                  <Button
                    variant="solid"
                    color="primary"
                    className="w-full transition-colors duration-200"
                    onClick={signUpEmail}
                  >
                    Create account
                  </Button>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    margin: '25px 0'
                  }}
                >
                  <Divider style={{ flex: 1 }} />
                  <span className="mx-2.5 text-gray-500 dark:text-gray-400 text-sm uppercase transition-colors duration-200">
                    or
                  </span>
                  <Divider style={{ flex: 1 }} />
                </div>

                <div className="mt-0 space-y-4">
                  <Button
                    variant={'flat'}
                    className="w-full"
                    onPress={signUpWithGoogle}
                  >
                    <img
                      src="/google2.svg"
                      alt="Google logo"
                      className="mr-2"
                    />
                    Sign up with Google
                  </Button>
                </div>
              </Tab>
            </Tabs>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

export default LoginSignupForm

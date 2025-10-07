'use client'

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword
} from 'firebase/auth'
import { addToast } from '@heroui/react'
import { LOGGED_IN_HOME } from '@/app/constants'
import { auth } from './firebase'

const provider = new GoogleAuthProvider()
provider.addScope('email')
provider.addScope('profile')

export const signOutFB = async () => {
  const user = auth.currentUser
  signOut(auth).then(() => {
    fetch('/api/auth/firebase/logout', {
      method: 'POST'
    }).then(() => {
      window.location.href = '/login-signup'
    })
  })

  // router.push('/');
}

export const getFBUser = () => {
  return auth.currentUser
}

export const sendResetPassword = async () => {
  const email = (document.getElementById('email') as HTMLInputElement).value
  sendPasswordResetEmail(auth, email).then(() => {
    alert('Password reset link sent!')
  })
}

export const createNewPassword = async () => {
  const newPassword = (document.getElementById('password') as HTMLInputElement)
    .value
  const user = auth.currentUser
  if (!user) {
    alert('No user found')
    return
  }
  updatePassword(user, newPassword).then(() => {
    alert('Password updated!')
  })
}

export const signInWithEmail = async () => {
  const email = (document.getElementById('email') as HTMLInputElement).value
  const password = (document.getElementById('password') as HTMLInputElement)
    .value
  signInWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      // Signed in
      const user = userCredential.user

      if (user.emailVerified) {
        window.location.href = LOGGED_IN_HOME
      } else {
        addToast({
          title: 'Email not verified',
          description:
            'Please verify your email. Check your inbox. You may need to check your spam folder.'
        })
      }
    })
    .catch(error => {
      const errorCode = error.code
      const errorMessage = error.message
      alert(errorMessage)
    })
}


export const signUpEmail = async () => {
  const email = (document.getElementById('email') as HTMLInputElement).value
  const password = (document.getElementById('password') as HTMLInputElement)
    .value
  if (!email) {
    addToast({
      title: 'Email Required',
      description: 'Please enter your email to sign up.'
    })
    return
  }
  if (!password) {
    addToast({
      title: 'Password Required',
      description: 'Please enter your password to sign up.'
    })
    return
  }
  createUserWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      // Signed up
      sendEmailVerification(userCredential.user).then(() => {
        console.log('email sent')
        addToast({
          title: 'Thanks for signing up!',
          description:
            'Please check your email for a verification link. Once your email has been verified, you will be able to login.'
        })
      })
      // ...
    })
    .catch(error => {
      const errorCode = error.code
      const errorMessage = error.message
      alert(errorMessage)
      console.log(errorMessage)
    })
}

export const signUpWithGoogle = async () => {
  try {
    // Set persistence before redirect
    // signInWithRedirect(auth, provider)
    signInWithPopup(auth, provider).then(result => {
      const user = result.user
      console.log('user', user)
      // Redirect to dashboard after successful authentication
      window.location.href = LOGGED_IN_HOME
    })
  } catch (error: unknown) {
    console.error('Google sign up error:', error)
    addToast({
      title: 'Google sign up error',
      description: error instanceof Error ? error.message : 'An unknown error occurred'
    })
  }
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Card, CardHeader, CardBody, Button, Spinner } from "@heroui/react";
import { signOutFB } from "@/lib/auth";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // User is signed in
        setUser(currentUser);
        setLoading(false);
      } else {
        // User is signed out, redirect to login
        router.push("/login-signup?action=login");
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    await signOutFB();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Welcome back, {user.displayName || user.email}
            </p>
          </div>
          <Button
            color="default"
            variant="flat"
            onPress={handleSignOut}
          >
            Sign Out
          </Button>
        </div>

        {/* User Info Card */}
        <Card>
          <CardHeader className="flex flex-col gap-3">
            <h2 className="text-2xl font-semibold">Account Information</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {user.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">User ID</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white font-mono text-sm">
                  {user.uid}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Email Verified</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {user.emailVerified ? "✓ Yes" : "✗ No"}
                </p>
              </div>
              {user.displayName && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Display Name</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {user.displayName}
                  </p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardBody className="text-center p-6">
              <p className="text-4xl font-bold text-primary mb-2">0</p>
              <p className="text-gray-600 dark:text-gray-400">Active Surveys</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center p-6">
              <p className="text-4xl font-bold text-primary mb-2">0</p>
              <p className="text-gray-600 dark:text-gray-400">Children</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center p-6">
              <p className="text-4xl font-bold text-primary mb-2">0</p>
              <p className="text-gray-600 dark:text-gray-400">Notifications</p>
            </CardBody>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-col gap-3">
            <h2 className="text-2xl font-semibold">Recent Activity</h2>
          </CardHeader>
          <CardBody>
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p>No recent activity</p>
              <p className="text-sm mt-2">Your recent surveys and updates will appear here</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Card, CardHeader, CardBody, Button, Spinner, useDisclosure, Chip } from "@heroui/react";
import { signOutFB } from "@/lib/auth";
import { Plus } from "lucide-react";
import AddStudentModal from "./components/AddStudentModal";
import Link from "next/link";

interface Student {
  studentId: string;
  firstName: string;
  lastName: string;
  nickname?: string;
  grade: string;
  schoolId: string;
  dateOfBirth: string;
  profileColor?: string;
  status: string;
  currentWeeklySurvey?: string;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
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

  useEffect(() => {
    if (user) {
      fetchStudents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchStudents = async () => {
    try {
      setStudentsLoading(true);
      const response = await fetch("/api/students");
      if (!response.ok) throw new Error("Failed to fetch students");
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleStudentSuccess = () => {
    fetchStudents();
  };

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
              <p className="text-4xl font-bold text-primary mb-2">{students.length}</p>
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

        {/* Students Section */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">My Students</h2>
            <Button
              color="primary"
              onPress={onOpen}
              startContent={<Plus className="w-4 h-4" />}
              size="sm"
            >
              Add Student
            </Button>
          </CardHeader>
          <CardBody>
            {studentsLoading ? (
              <div className="flex justify-center items-center py-12">
                <Spinner size="lg" />
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <p>No students added yet</p>
                <p className="text-sm mt-2">Click &quot;Add Student&quot; to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map((student) => (
                  <Link
                    key={student.studentId}
                    href={`/student/${student.studentId}/dashboard`}
                    className="block"
                  >
                    <Card
                      isPressable
                      isHoverable
                      className="transition-transform hover:scale-105"
                    >
                      <CardBody className="p-6">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-semibold"
                            style={{
                              backgroundColor:
                                student.profileColor === "blue"
                                  ? "#3b82f6"
                                  : student.profileColor === "green"
                                  ? "#10b981"
                                  : student.profileColor === "purple"
                                  ? "#8b5cf6"
                                  : student.profileColor === "pink"
                                  ? "#ec4899"
                                  : student.profileColor === "orange"
                                  ? "#f97316"
                                  : student.profileColor === "red"
                                  ? "#ef4444"
                                  : student.profileColor === "yellow"
                                  ? "#eab308"
                                  : student.profileColor === "teal"
                                  ? "#14b8a6"
                                  : "#6b7280",
                            }}
                          >
                            {student.firstName.charAt(0)}
                            {student.lastName.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {student.nickname || `${student.firstName} ${student.lastName}`}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Grade {student.grade}
                            </p>
                            <Chip
                              size="sm"
                              color={student.status === "active" ? "success" : "default"}
                              variant="flat"
                              className="mt-2"
                            >
                              {student.status}
                            </Chip>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

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

      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={isOpen}
        onClose={onClose}
        onSuccess={handleStudentSuccess}
      />
    </main>
  );
}

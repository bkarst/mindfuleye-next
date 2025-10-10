"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Spinner,
  Chip,
  Progress,
} from "@heroui/react";
import { ArrowLeft, Calendar, School, User as UserIcon } from "lucide-react";
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

export default function StudentDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  const [studentLoading, setStudentLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const studentId = params.studentId as string;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        router.push("/login-signup?action=login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (user && studentId) {
      fetchStudent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, studentId]);

  const fetchStudent = async () => {
    try {
      setStudentLoading(true);
      const response = await fetch(`/api/students/${studentId}`);
      if (!response.ok) throw new Error("Failed to fetch student");
      const data = await response.json();
      setStudent(data);
    } catch (error) {
      console.error("Error fetching student:", error);
    } finally {
      setStudentLoading(false);
    }
  };

  if (loading || studentLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user || !student) {
    return null;
  }

  const displayName = student.nickname || `${student.firstName} ${student.lastName}`;
  const profileColorHex =
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
      : "#6b7280";

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button
              isIconOnly
              variant="flat"
              color="default"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              {displayName}&apos;s Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Grade {student.grade} • School ID: {student.schoolId}
            </p>
          </div>
          <Chip
            size="lg"
            color={student.status === "active" ? "success" : "default"}
            variant="flat"
          >
            {student.status}
          </Chip>
        </div>

        {/* Student Profile Card */}
        <Card>
          <CardHeader className="flex flex-col gap-3">
            <h2 className="text-2xl font-semibold">Student Profile</h2>
          </CardHeader>
          <CardBody>
            <div className="flex items-start gap-6">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-semibold flex-shrink-0"
                style={{ backgroundColor: profileColorHex }}
              >
                {student.firstName.charAt(0)}
                {student.lastName.charAt(0)}
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <UserIcon className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Full Name</p>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {student.firstName} {student.lastName}
                    </p>
                    {student.nickname && (
                      <p className="text-sm text-gray-500">Nickname: {student.nickname}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Date of Birth</p>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {new Date(student.dateOfBirth).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <School className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">School ID</p>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {student.schoolId}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 text-gray-400 mt-1 flex items-center justify-center font-bold">
                    #
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Grade Level</p>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      Grade {student.grade}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardBody className="text-center p-6">
              <p className="text-4xl font-bold text-primary mb-2">0</p>
              <p className="text-gray-600 dark:text-gray-400">Surveys Completed</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center p-6">
              <p className="text-4xl font-bold text-primary mb-2">0</p>
              <p className="text-gray-600 dark:text-gray-400">Pending Surveys</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center p-6">
              <p className="text-4xl font-bold text-primary mb-2">0</p>
              <p className="text-gray-600 dark:text-gray-400">Total Responses</p>
            </CardBody>
          </Card>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardHeader className="flex flex-col gap-3">
            <h2 className="text-2xl font-semibold">Progress Overview</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Weekly Check-ins</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">0/4 this month</span>
                </div>
                <Progress value={0} color="primary" className="max-w-full" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Academic Assessments</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">0/2 this quarter</span>
                </div>
                <Progress value={0} color="success" className="max-w-full" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Behavioral Observations</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">0/8 this month</span>
                </div>
                <Progress value={0} color="warning" className="max-w-full" />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Recent Surveys */}
        <Card>
          <CardHeader className="flex flex-col gap-3">
            <h2 className="text-2xl font-semibold">Recent Surveys</h2>
          </CardHeader>
          <CardBody>
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p>No surveys completed yet</p>
              <p className="text-sm mt-2">Survey responses will appear here</p>
            </div>
          </CardBody>
        </Card>

        {/* Notes & Observations */}
        <Card>
          <CardHeader className="flex flex-col gap-3">
            <h2 className="text-2xl font-semibold">Notes & Observations</h2>
          </CardHeader>
          <CardBody>
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p>No notes added yet</p>
              <p className="text-sm mt-2">Teacher and parent observations will appear here</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Spinner,
  useDisclosure,
  Chip,
} from "@heroui/react";
import { Plus, Trash2 } from "lucide-react";
import { addToast } from "@heroui/react";

interface StudentSurvey {
  surveyId: string;
  studentId: string;
  parentId: string;
  surveyTimestamp: string;
  weekNumber: number;
  academicProgressJson?: string;
  contentConcernsJson?: string;
  safetyCheckJson?: string;
  behaviorChangesJson?: string;
  teacherCommunicationJson?: string;
  actionItemsJson?: string;
  completionTimeMinutes?: number;
  flags?: string[];
  followUpRequired?: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminDashboard() {
  const [surveys, setSurveys] = useState<StudentSurvey[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Form state
  const [formData, setFormData] = useState({
    studentId: "",
    parentId: "",
    weekNumber: 1,
  });

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/student-surveys");
      if (!response.ok) throw new Error("Failed to fetch surveys");
      const data = await response.json();
      setSurveys(data);
    } catch (error) {
      console.error("Error fetching surveys:", error);
      addToast({
        title: "Error",
        description: "Failed to fetch surveys",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSurvey = async () => {
    if (!formData.studentId || !formData.parentId) {
      addToast({
        title: "Validation Error",
        description: "Student ID and Parent ID are required",
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch("/api/student-surveys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: formData.studentId,
          parentId: formData.parentId,
          surveyTimestamp: new Date().toISOString(),
          weekNumber: formData.weekNumber,
        }),
      });

      if (!response.ok) throw new Error("Failed to create survey");

      const newSurvey = await response.json();
      setSurveys([newSurvey, ...surveys]);
      onClose();
      setFormData({ studentId: "", parentId: "", weekNumber: 1 });
      addToast({
        title: "Success",
        description: "Survey created successfully",
      });
    } catch (error) {
      console.error("Error creating survey:", error);
      addToast({
        title: "Error",
        description: "Failed to create survey",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSurvey = async (
    studentId: string,
    surveyTimestamp: string,
    surveyId: string
  ) => {
    if (!confirm("Are you sure you want to delete this survey?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/student-surveys/${encodeURIComponent(
          studentId
        )}/${encodeURIComponent(surveyTimestamp)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete survey");

      setSurveys(surveys.filter((s) => s.surveyId !== surveyId));
      addToast({
        title: "Success",
        description: "Survey deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting survey:", error);
      addToast({
        title: "Error",
        description: "Failed to delete survey",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage student surveys
            </p>
          </div>
          <Button
            color="primary"
            onPress={onOpen}
            startContent={<Plus className="w-4 h-4" />}
          >
            Add Survey
          </Button>
        </div>

        {/* Surveys Table */}
        <Card>
          <CardHeader className="flex flex-col gap-3">
            <h2 className="text-2xl font-semibold">Student Surveys</h2>
          </CardHeader>
          <CardBody>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Spinner size="lg" />
              </div>
            ) : surveys.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No surveys found</p>
                <p className="text-sm mt-2">Click &quot;Add Survey&quot; to create one</p>
              </div>
            ) : (
              <Table aria-label="Student surveys table">
                <TableHeader>
                  <TableColumn>SURVEY ID</TableColumn>
                  <TableColumn>STUDENT ID</TableColumn>
                  <TableColumn>PARENT ID</TableColumn>
                  <TableColumn>WEEK #</TableColumn>
                  <TableColumn>TIMESTAMP</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                  {surveys.map((survey) => (
                    <TableRow key={survey.surveyId}>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {survey.surveyId}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {survey.studentId}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {survey.parentId}
                        </span>
                      </TableCell>
                      <TableCell>{survey.weekNumber}</TableCell>
                      <TableCell>{formatDate(survey.surveyTimestamp)}</TableCell>
                      <TableCell>
                        {survey.followUpRequired ? (
                          <Chip color="warning" size="sm">
                            Follow-up Required
                          </Chip>
                        ) : (
                          <Chip color="success" size="sm">
                            Complete
                          </Chip>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          isIconOnly
                          color="danger"
                          variant="light"
                          size="sm"
                          onPress={() =>
                            handleDeleteSurvey(
                              survey.studentId,
                              survey.surveyTimestamp,
                              survey.surveyId
                            )
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Add Survey Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Add New Survey
          </ModalHeader>
          <ModalBody>
            <Input
              label="Student ID"
              placeholder="Enter student ID"
              value={formData.studentId}
              onValueChange={(value) =>
                setFormData({ ...formData, studentId: value })
              }
              isRequired
            />
            <Input
              label="Parent ID"
              placeholder="Enter parent ID"
              value={formData.parentId}
              onValueChange={(value) =>
                setFormData({ ...formData, parentId: value })
              }
              isRequired
            />
            <Input
              type="number"
              label="Week Number"
              placeholder="Enter week number"
              value={formData.weekNumber.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, weekNumber: parseInt(value) || 1 })
              }
              min={1}
              isRequired
            />
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleCreateSurvey}
              isLoading={submitting}
            >
              Create Survey
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </main>
  );
}

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
  Spinner,
  useDisclosure,
  Chip,
} from "@heroui/react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { addToast } from "@heroui/react";
import AddSurveyModal from "./components/AddSurveyModal";
import EditSurveyModal from "./components/EditSurveyModal";

interface Survey {
  surveyId: string;
  name: string;
  grade_level?: string;
  description?: string;
  surveyType: string;
  targetAudience?: string;
  isActive: string;
  version?: number;
  instructions?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminDashboard() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/surveys");
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

  const handleOpenCreate = () => {
    onAddOpen();
  };

  const handleOpenEdit = (survey: Survey) => {
    setSelectedSurvey(survey);
    onEditOpen();
  };

  const handleEditModalClose = () => {
    setSelectedSurvey(null);
    onEditClose();
  };

  const handleSurveySuccess = () => {
    fetchSurveys();
  };

  const handleDeleteSurvey = async (surveyId: string) => {
    if (!confirm("Are you sure you want to delete this survey template?")) {
      return;
    }

    try {
      const response = await fetch(`/api/surveys/${surveyId}`, {
        method: "DELETE",
      });

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
              Manage survey templates
            </p>
          </div>
          <Button
            color="primary"
            onPress={handleOpenCreate}
            startContent={<Plus className="w-4 h-4" />}
          >
            Add Survey
          </Button>
        </div>

        {/* Surveys Table */}
        <Card>
          <CardHeader className="flex flex-col gap-3">
            <h2 className="text-2xl font-semibold">Survey Templates</h2>
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
              <Table aria-label="Surveys table">
                <TableHeader>
                  <TableColumn>NAME</TableColumn>
                  <TableColumn>TYPE</TableColumn>
                  <TableColumn>GRADE LEVEL</TableColumn>
                  <TableColumn>AUDIENCE</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>VERSION</TableColumn>
                  <TableColumn>CREATED</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                  {surveys.map((survey) => (
                    <TableRow key={survey.surveyId}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold">{survey.name}</span>
                          {survey.description && (
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              {survey.description}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip size="sm" variant="flat">
                          {survey.surveyType}
                        </Chip>
                      </TableCell>
                      <TableCell>{survey.grade_level || "—"}</TableCell>
                      <TableCell>{survey.targetAudience || "—"}</TableCell>
                      <TableCell>
                        {survey.isActive === "true" ? (
                          <Chip color="success" size="sm">
                            Active
                          </Chip>
                        ) : (
                          <Chip color="default" size="sm">
                            Inactive
                          </Chip>
                        )}
                      </TableCell>
                      <TableCell>{survey.version || 1}</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(survey.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            isIconOnly
                            color="primary"
                            variant="light"
                            size="sm"
                            onPress={() => handleOpenEdit(survey)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            isIconOnly
                            color="danger"
                            variant="light"
                            size="sm"
                            onPress={() => handleDeleteSurvey(survey.surveyId)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
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
      <AddSurveyModal
        isOpen={isAddOpen}
        onClose={onAddClose}
        onSuccess={handleSurveySuccess}
      />

      {/* Edit Survey Modal */}
      {selectedSurvey && (
        <EditSurveyModal
          isOpen={isEditOpen}
          onClose={handleEditModalClose}
          survey={selectedSurvey}
          onSuccess={handleSurveySuccess}
        />
      )}
    </main>
  );
}

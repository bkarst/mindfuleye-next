"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Tabs,
  Tab,
} from "@heroui/react";
import { addToast } from "@heroui/react";
import QuestionsTab from "./QuestionsTab";

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

interface EditSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  survey: Survey;
  onSuccess: () => void;
}

const SURVEY_TYPES = ["Weekly", "Monthly", "Quarterly", "OneTime", "Custom"];
const TARGET_AUDIENCES = ["Parents", "Teachers", "Students"];

export default function EditSurveyModal({
  isOpen,
  onClose,
  survey,
  onSuccess,
}: EditSurveyModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    grade_level: "",
    description: "",
    surveyType: "Weekly",
    targetAudience: "Parents",
    isActive: true,
    version: 1,
    instructions: "",
    createdBy: "",
  });

  useEffect(() => {
    if (survey) {
      setFormData({
        name: survey.name,
        grade_level: survey.grade_level || "",
        description: survey.description || "",
        surveyType: survey.surveyType,
        targetAudience: survey.targetAudience || "Parents",
        isActive: survey.isActive === "true",
        version: survey.version || 1,
        instructions: survey.instructions || "",
        createdBy: survey.createdBy || "",
      });
    }
  }, [survey, isOpen]);

  const handleSave = async () => {
    if (!formData.name || !formData.surveyType) {
      addToast({
        title: "Validation Error",
        description: "Survey name and type are required",
      });
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`/api/surveys/${survey.surveyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update survey");

      addToast({
        title: "Success",
        description: "Survey updated successfully",
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating survey:", error);
      addToast({
        title: "Error",
        description: "Failed to update survey",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          Edit Survey
        </ModalHeader>
        <ModalBody>
          <Tabs aria-label="Survey edit tabs" fullWidth>
            <Tab key="details" title="Details">
              <div className="space-y-4 py-4">
            <Input
              label="Survey Name"
              placeholder="e.g., Weekly Student Check-in"
              value={formData.name}
              onValueChange={(value) =>
                setFormData({ ...formData, name: value })
              }
              isRequired
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Survey Type"
                placeholder="Select type"
                selectedKeys={[formData.surveyType]}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;
                  setFormData({ ...formData, surveyType: value });
                }}
                isRequired
              >
                {SURVEY_TYPES.map((type) => (
                  <SelectItem key={type}>
                    {type}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Target Audience"
                placeholder="Select audience"
                selectedKeys={[formData.targetAudience]}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;
                  setFormData({ ...formData, targetAudience: value });
                }}
              >
                {TARGET_AUDIENCES.map((audience) => (
                  <SelectItem key={audience}>
                    {audience}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <Input
              label="Grade Level"
              placeholder="e.g., 5, K-2, 9-12"
              value={formData.grade_level}
              onValueChange={(value) =>
                setFormData({ ...formData, grade_level: value })
              }
            />

            <Textarea
              label="Description"
              placeholder="Describe the purpose of this survey"
              value={formData.description}
              onValueChange={(value) =>
                setFormData({ ...formData, description: value })
              }
              minRows={2}
            />

            <Textarea
              label="Instructions"
              placeholder="Instructions for survey takers"
              value={formData.instructions}
              onValueChange={(value) =>
                setFormData({ ...formData, instructions: value })
              }
              minRows={3}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                label="Version"
                placeholder="Version number"
                value={formData.version.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, version: parseInt(value) || 1 })
                }
                min={1}
              />

              <Input
                label="Created By"
                placeholder="Admin user ID"
                value={formData.createdBy}
                onValueChange={(value) =>
                  setFormData({ ...formData, createdBy: value })
                }
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-4 h-4 rounded border-gray-300"
              />
              <label htmlFor="isActive" className="text-sm">
                Active (available for use)
              </label>
            </div>
              </div>
            </Tab>
            <Tab key="questions" title="Questions">
              <div className="py-4">
                <QuestionsTab surveyId={survey.surveyId} />
              </div>
            </Tab>
          </Tabs>
        </ModalBody>
        <ModalFooter>
          <Button color="default" variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleSave}
            isLoading={submitting}
          >
            Update Survey
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

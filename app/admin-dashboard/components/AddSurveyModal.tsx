"use client";

import { useState } from "react";
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
} from "@heroui/react";
import { addToast } from "@heroui/react";

interface AddSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SURVEY_TYPES = ["Weekly", "Monthly", "Quarterly", "OneTime", "Custom"];
const TARGET_AUDIENCES = ["Parents", "Teachers", "Students"];

export default function AddSurveyModal({
  isOpen,
  onClose,
  onSuccess,
}: AddSurveyModalProps) {
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

  const resetForm = () => {
    setFormData({
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
  };

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

      const response = await fetch("/api/surveys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to create survey");

      addToast({
        title: "Success",
        description: "Survey created successfully",
      });

      onSuccess();
      onClose();
      resetForm();
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

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          Add New Survey
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
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
        </ModalBody>
        <ModalFooter>
          <Button color="default" variant="light" onPress={handleClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleSave}
            isLoading={submitting}
          >
            Create Survey
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

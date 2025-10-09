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
  Select,
  SelectItem,
} from "@heroui/react";
import { addToast } from "@heroui/react";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const GRADES = ["K", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const PROFILE_COLORS = ["blue", "green", "purple", "pink", "orange", "red", "yellow", "teal"];

export default function AddStudentModal({
  isOpen,
  onClose,
  onSuccess,
}: AddStudentModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    schoolId: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    grade: "K",
    nickname: "",
    profileColor: "blue",
  });

  const resetForm = () => {
    setFormData({
      schoolId: "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      grade: "K",
      nickname: "",
      profileColor: "blue",
    });
  };

  const handleSave = async () => {
    if (!formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.schoolId) {
      addToast({
        title: "Validation Error",
        description: "First name, last name, date of birth, and school ID are required",
      });
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to create student");

      addToast({
        title: "Success",
        description: "Student added successfully",
      });

      onSuccess();
      onClose();
      resetForm();
    } catch (error) {
      console.error("Error creating student:", error);
      addToast({
        title: "Error",
        description: "Failed to add student",
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
          Add New Student
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="Enter first name"
                value={formData.firstName}
                onValueChange={(value) =>
                  setFormData({ ...formData, firstName: value })
                }
                isRequired
              />

              <Input
                label="Last Name"
                placeholder="Enter last name"
                value={formData.lastName}
                onValueChange={(value) =>
                  setFormData({ ...formData, lastName: value })
                }
                isRequired
              />
            </div>

            <Input
              label="Nickname"
              placeholder="Optional nickname"
              value={formData.nickname}
              onValueChange={(value) =>
                setFormData({ ...formData, nickname: value })
              }
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                label="Date of Birth"
                value={formData.dateOfBirth}
                onValueChange={(value) =>
                  setFormData({ ...formData, dateOfBirth: value })
                }
                isRequired
              />

              <Select
                label="Grade"
                placeholder="Select grade"
                selectedKeys={[formData.grade]}
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;
                  setFormData({ ...formData, grade: value });
                }}
                isRequired
              >
                {GRADES.map((grade) => (
                  <SelectItem key={grade}>
                    {grade}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <Input
              label="School ID"
              placeholder="Enter school ID"
              value={formData.schoolId}
              onValueChange={(value) =>
                setFormData({ ...formData, schoolId: value })
              }
              isRequired
              description="The ID of the school this student attends"
            />

            <Select
              label="Profile Color"
              placeholder="Select color"
              selectedKeys={[formData.profileColor]}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as string;
                setFormData({ ...formData, profileColor: value });
              }}
            >
              {PROFILE_COLORS.map((color) => (
                <SelectItem key={color}>
                  {color.charAt(0).toUpperCase() + color.slice(1)}
                </SelectItem>
              ))}
            </Select>
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
            Add Student
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

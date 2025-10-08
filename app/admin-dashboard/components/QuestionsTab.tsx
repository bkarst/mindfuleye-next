"use client";

import { useState, useEffect } from "react";
import {
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
  Textarea,
  Select,
  SelectItem,
  Spinner,
  Chip,
  useDisclosure,
} from "@heroui/react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { addToast } from "@heroui/react";

interface SurveyQuestion {
  surveyId: string;
  sortKey: string;
  questionId: string;
  questionText: string;
  questionCategory: string;
  responseType: string;
  orderIndex: number;
  isRequired: string;
  isActive: string;
  questionOptions?: string[];
  helperText?: string;
  sectionName?: string;
  conditionalLogic?: string;
  createdAt: string;
  updatedAt: string;
}

interface QuestionsTabProps {
  surveyId: string;
}

const RESPONSE_TYPES = ["Text", "Number", "Boolean", "Scale", "MultipleChoice", "Checkbox"];
const QUESTION_CATEGORIES = ["Academic", "Safety", "Social", "Behavioral", "Communication"];

export default function QuestionsTab({ surveyId }: QuestionsTabProps) {
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingQuestion, setEditingQuestion] = useState<SurveyQuestion | null>(null);

  const [formData, setFormData] = useState({
    questionText: "",
    questionCategory: "Academic",
    responseType: "Text",
    orderIndex: 1,
    isRequired: true,
    isActive: true,
    questionOptions: [] as string[],
    helperText: "",
    sectionName: "",
  });

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surveyId]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/surveys/${surveyId}/questions`);
      if (!response.ok) throw new Error("Failed to fetch questions");
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error("Error fetching questions:", error);
      addToast({
        title: "Error",
        description: "Failed to fetch questions",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      questionText: "",
      questionCategory: "Academic",
      responseType: "Text",
      orderIndex: questions.length + 1,
      isRequired: true,
      isActive: true,
      questionOptions: [],
      helperText: "",
      sectionName: "",
    });
    setEditingQuestion(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setFormData(prev => ({ ...prev, orderIndex: questions.length + 1 }));
    onOpen();
  };

  const handleOpenEdit = (question: SurveyQuestion) => {
    setFormData({
      questionText: question.questionText,
      questionCategory: question.questionCategory,
      responseType: question.responseType,
      orderIndex: question.orderIndex,
      isRequired: question.isRequired === "true",
      isActive: question.isActive === "true",
      questionOptions: question.questionOptions || [],
      helperText: question.helperText || "",
      sectionName: question.sectionName || "",
    });
    setEditingQuestion(question);
    onOpen();
  };

  const handleSave = async () => {
    if (!formData.questionText || !formData.questionCategory) {
      addToast({
        title: "Validation Error",
        description: "Question text and category are required",
      });
      return;
    }

    try {
      setSubmitting(true);

      if (editingQuestion) {
        // Update existing question
        const response = await fetch(
          `/api/surveys/${surveyId}/questions/${encodeURIComponent(editingQuestion.sortKey)}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          }
        );

        if (!response.ok) throw new Error("Failed to update question");

        addToast({
          title: "Success",
          description: "Question updated successfully",
        });
      } else {
        // Create new question
        const response = await fetch(`/api/surveys/${surveyId}/questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error("Failed to create question");

        addToast({
          title: "Success",
          description: "Question created successfully",
        });
      }

      fetchQuestions();
      onClose();
      resetForm();
    } catch (error) {
      console.error("Error saving question:", error);
      addToast({
        title: "Error",
        description: editingQuestion ? "Failed to update question" : "Failed to create question",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (question: SurveyQuestion) => {
    if (!confirm("Are you sure you want to delete this question?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/surveys/${surveyId}/questions/${encodeURIComponent(question.sortKey)}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Failed to delete question");

      setQuestions(questions.filter((q) => q.sortKey !== question.sortKey));
      addToast({
        title: "Success",
        description: "Question deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting question:", error);
      addToast({
        title: "Error",
        description: "Failed to delete question",
      });
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleOptionsChange = (value: string) => {
    const options = value.split('\n').filter(opt => opt.trim() !== '');
    setFormData({ ...formData, questionOptions: options });
  };

  const showOptionsField = formData.responseType === "MultipleChoice" || formData.responseType === "Checkbox";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Survey Questions</h3>
        <Button
          color="primary"
          onPress={handleOpenCreate}
          startContent={<Plus className="w-4 h-4" />}
          size="sm"
        >
          Add Question
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No questions added yet</p>
          <p className="text-sm mt-2">Click &quot;Add Question&quot; to create one</p>
        </div>
      ) : (
        <Table aria-label="Survey questions table">
          <TableHeader>
            <TableColumn>ORDER</TableColumn>
            <TableColumn>QUESTION</TableColumn>
            <TableColumn>TYPE</TableColumn>
            <TableColumn>CATEGORY</TableColumn>
            <TableColumn>REQUIRED</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>ACTIONS</TableColumn>
          </TableHeader>
          <TableBody>
            {questions.map((question) => (
              <TableRow key={question.sortKey}>
                <TableCell>{question.orderIndex}</TableCell>
                <TableCell>
                  <div className="max-w-md">
                    <p className="font-medium">{question.questionText}</p>
                    {question.helperText && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {question.helperText}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Chip size="sm" variant="flat">
                    {question.responseType}
                  </Chip>
                </TableCell>
                <TableCell>{question.questionCategory}</TableCell>
                <TableCell>
                  {question.isRequired === "true" ? (
                    <Chip color="danger" size="sm" variant="flat">
                      Required
                    </Chip>
                  ) : (
                    <Chip color="default" size="sm" variant="flat">
                      Optional
                    </Chip>
                  )}
                </TableCell>
                <TableCell>
                  {question.isActive === "true" ? (
                    <Chip color="success" size="sm">
                      Active
                    </Chip>
                  ) : (
                    <Chip color="default" size="sm">
                      Inactive
                    </Chip>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      isIconOnly
                      color="primary"
                      variant="light"
                      size="sm"
                      onPress={() => handleOpenEdit(question)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      isIconOnly
                      color="danger"
                      variant="light"
                      size="sm"
                      onPress={() => handleDelete(question)}
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

      {/* Add/Edit Question Modal */}
      <Modal isOpen={isOpen} onClose={handleClose} size="2xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader>
            {editingQuestion ? "Edit Question" : "Add New Question"}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Textarea
                label="Question Text"
                placeholder="Enter your question"
                value={formData.questionText}
                onValueChange={(value) =>
                  setFormData({ ...formData, questionText: value })
                }
                isRequired
                minRows={2}
              />

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Response Type"
                  placeholder="Select type"
                  selectedKeys={[formData.responseType]}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string;
                    setFormData({ ...formData, responseType: value });
                  }}
                  isRequired
                >
                  {RESPONSE_TYPES.map((type) => (
                    <SelectItem key={type}>
                      {type}
                    </SelectItem>
                  ))}
                </Select>

                <Select
                  label="Category"
                  placeholder="Select category"
                  selectedKeys={[formData.questionCategory]}
                  onSelectionChange={(keys) => {
                    const value = Array.from(keys)[0] as string;
                    setFormData({ ...formData, questionCategory: value });
                  }}
                  isRequired
                >
                  {QUESTION_CATEGORIES.map((category) => (
                    <SelectItem key={category}>
                      {category}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              {showOptionsField && (
                <Textarea
                  label="Answer Options"
                  placeholder="Enter one option per line"
                  value={(formData.questionOptions || []).join('\n')}
                  onValueChange={handleOptionsChange}
                  minRows={4}
                  description="For MultipleChoice or Checkbox questions"
                />
              )}

              <Textarea
                label="Helper Text"
                placeholder="Optional guidance for respondents"
                value={formData.helperText}
                onValueChange={(value) =>
                  setFormData({ ...formData, helperText: value })
                }
                minRows={2}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="number"
                  label="Order Index"
                  placeholder="Display order"
                  value={formData.orderIndex.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, orderIndex: parseInt(value) || 1 })
                  }
                  min={1}
                />

                <Input
                  label="Section Name"
                  placeholder="Optional section grouping"
                  value={formData.sectionName}
                  onValueChange={(value) =>
                    setFormData({ ...formData, sectionName: value })
                  }
                />
              </div>

              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isRequired"
                    checked={formData.isRequired}
                    onChange={(e) =>
                      setFormData({ ...formData, isRequired: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <label htmlFor="isRequired" className="text-sm">
                    Required
                  </label>
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
                    Active
                  </label>
                </div>
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
              {editingQuestion ? "Update Question" : "Add Question"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

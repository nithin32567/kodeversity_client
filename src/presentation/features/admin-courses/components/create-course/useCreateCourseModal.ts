import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { managementService } from "@/infrastructure/admin/managementService";
import { instructorService } from "@/infrastructure/instructor/instructorService";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";
import type { Instructor } from "@/domain/course";
import { initialFormState, slugify } from "./utils";

export function useCreateCourseModal(
  isOpen: boolean,
  instructors: Instructor[],
  onSubmitSuccess: () => void,
  onClose: () => void,
) {
  const { user } = useAuth();
  const [formState, setFormState] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manuallyEditedSlug, setManuallyEditedSlug] = useState(false);

  const [localInstructors, setLocalInstructors] = useState<Instructor[]>([]);
  const [showAddInstructor, setShowAddInstructor] = useState(false);
  const [newInstructor, setNewInstructor] = useState({
    name: "",
    designation: "",
    bio: "",
    avatarUrl: "",
  });
  const [isCreatingInstructor, setIsCreatingInstructor] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLocalInstructors(instructors);
      setShowAddInstructor(false);
      setFormState({ ...initialFormState, instructorId: "" });
      setManuallyEditedSlug(false);
    }
  }, [isOpen, instructors]);

  const handleCreateInstructor = async () => {
    if (!newInstructor.name || !newInstructor.designation || !newInstructor.bio) {
      toast.error("Please fill in all required fields (Name, Designation, and Bio).");
      return;
    }

    setIsCreatingInstructor(true);
    try {
      const created = await managementService.createInstructor({
        name: newInstructor.name,
        designation: newInstructor.designation,
        bio: newInstructor.bio,
        avatarUrl: newInstructor.avatarUrl || null,
      });

      toast.success("Instructor created successfully!");
      setLocalInstructors((prev) => [...prev, created]);
      setFormState((prev) => ({ ...prev, instructorId: created.id }));
      setNewInstructor({
        name: "",
        designation: "",
        bio: "",
        avatarUrl: "",
      });
      setShowAddInstructor(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create instructor.");
    } finally {
      setIsCreatingInstructor(false);
    }
  };

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setFormState((prev) => ({
        ...prev,
        title: val,
        slug: manuallyEditedSlug ? prev.slug : slugify(val),
      }));
    },
    [manuallyEditedSlug],
  );

  const handleSlugChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setManuallyEditedSlug(true);
    setFormState((prev) => ({ ...prev, slug: e.target.value }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (showAddInstructor) {
      toast.error("Please save or cancel the instructor creation form first.");
      return;
    }
    if (!formState.title || !formState.slug || !formState.subtitle || !formState.description) {
      toast.error("Please fill in all required fields (Title, Slug, Subtitle, and Description).");
      return;
    }

    setIsSubmitting(true);

    const priceNum = parseFloat(formState.price);
    const discPriceNum = formState.discountPrice ? parseFloat(formState.discountPrice) : null;
    const durationNum = parseInt(formState.totalDuration, 10);
    const lessonsNum = parseInt(formState.lessonsCount, 10);
    const projectsNum = parseInt(formState.projectsCount, 10);

    if (isNaN(priceNum) || priceNum < 0) {
      toast.error("Price must be a valid number greater than or equal to 0.");
      setIsSubmitting(false);
      return;
    }

    if (discPriceNum !== null && (isNaN(discPriceNum) || discPriceNum < 0)) {
      toast.error("Discount price must be a valid number greater than or equal to 0.");
      setIsSubmitting(false);
      return;
    }

    if (discPriceNum !== null && discPriceNum > priceNum) {
      toast.error("Discount price must be less than or equal to the base price.");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      title: formState.title,
      slug: formState.slug,
      subtitle: formState.subtitle,
      description: formState.description,
      promoVideoUrl: formState.promoVideoUrl || null,
      thumbnailUrl: formState.thumbnailUrl || null,
      price: priceNum,
      discountPrice: discPriceNum,
      currency: formState.currency,
      level: formState.level,
      totalDuration: isNaN(durationNum) ? 60 : durationNum,
      lessonsCount: isNaN(lessonsNum) ? 5 : lessonsNum,
      projectsCount: isNaN(projectsNum) ? 1 : projectsNum,
      hasCertificate: formState.hasCertificate,
      whatYouWillLearn: formState.whatYouWillLearnRaw
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      courseIncludes: formState.courseIncludesRaw
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      instructorId: formState.instructorId || null,
    };

    try {
      if (user?.role === "INSTRUCTOR") {
        await instructorService.createCourse(payload as any);
      } else {
        await managementService.createCourse(payload);
      }
      toast.success("Course created successfully!");
      setFormState({
        ...initialFormState,
        instructorId: "",
      });
      setManuallyEditedSlug(false);
      onSubmitSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      let errMsg = "Failed to create course.";
      if (err instanceof Error) {
        const code = (err as Error & { code?: string }).code;
        if (code === "SLUG_ALREADY_EXISTS") {
          errMsg = "A course with this URL slug already exists. Please choose a unique slug.";
        } else if (code === "INSTRUCTOR_NOT_FOUND") {
          errMsg = "The selected instructor was not found.";
        } else if (code === "UNAUTHORIZED") {
          errMsg = "You are not authorized to create courses. Please log in again.";
        } else {
          errMsg = err.message || errMsg;
        }
      }
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    state: {
      formState,
      isSubmitting,
      localInstructors,
      showAddInstructor,
      newInstructor,
      isCreatingInstructor,
    },
    actions: {
      setFormState,
      setShowAddInstructor,
      setNewInstructor,
      handleCreateInstructor,
      handleTitleChange,
      handleSlugChange,
      handleSubmit,
    },
  };
}

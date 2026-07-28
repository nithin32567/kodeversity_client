import { RefreshCw } from "lucide-react";
import { useAccentRgb } from "@/presentation/lib/useAccent";
import { StudentProfileEditModal } from "./StudentProfileEditModal";
import { useProfilePage } from "./profile-page/useProfilePage";
import { ProfileHeader } from "./profile-page/components/ProfileHeader";
import { PurchasedCourses } from "./profile-page/components/PurchasedCourses";

export function StudentProfilePage() {
  const glow = useAccentRgb();
  const {
    user,
    isAuthLoading,
    profileDetail,
    loading,
    editModalOpen,
    setEditModalOpen,
    purchasedCourses,
    loadProfileData,
  } = useProfilePage();

  if (isAuthLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-[var(--accent-cyan)] animate-spin" />
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Loading your profile information...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative flex-1 w-full overflow-hidden bg-background py-8 md:py-12">
      {user && (
        <StudentProfileEditModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          userId={user.id}
          initialData={{
            name: user.name,
            phone: profileDetail?.phone,
            highestQualification: profileDetail?.highestQualification,
            email: user.email,
          }}
          onSuccess={loadProfileData}
        />
      )}
      <div className="relative mx-auto max-w-7xl px-4 md:px-6 space-y-8 md:space-y-12">
        <ProfileHeader 
          user={user} 
          profileDetail={profileDetail} 
          glow={glow} 
          onEditClick={() => setEditModalOpen(true)} 
        />
        <PurchasedCourses 
          purchasedCourses={purchasedCourses} 
          glow={glow} 
        />
      </div>
    </main>
  );
}

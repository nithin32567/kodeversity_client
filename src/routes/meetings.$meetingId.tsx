import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";
import {
  RealtimeKitProvider,
  useRealtimeKitClient,
  useRealtimeKitMeeting,
} from "@cloudflare/realtimekit-react";
import { RtkMeeting } from "@cloudflare/realtimekit-react-ui";
import { toast } from "sonner";
import { RefreshCw, AlertTriangle } from "lucide-react";
import axios from "axios";
import { tokenStore } from "@/infrastructure/http/apiClient";

export const Route = createFileRoute("/meetings/$meetingId")({
  head: () => ({ meta: [{ title: "Live Class — Kodeversity" }] }),
  component: MeetingRoom,
});

export function MeetingRoom() {
  const { meetingId } = Route.useParams();
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [meeting, initMeeting] = useRealtimeKitClient();
  const [error, setError] = useState<string | null>(null);

  const [, setTabViolations] = useState(0);

  useEffect(() => {
    if (isAuthLoading || !user) return;

    let isMounted = true;

    const joinMeeting = async () => {
      try {
        const role = user.role === "STUDENT" ? "participant" : "host";
        const currentToken = tokenStore.get();

        const response = await axios.post(
          `http://localhost:4002/api/meetings/${meetingId}/join`,
          {
            userId: user.id,
            name: user.name || (role === "host" ? "Instructor" : "Student"),
            role,
          },
          {
            withCredentials: true,
            headers: currentToken ? { Authorization: `Bearer ${currentToken}` } : {},
          },
        );

        const token = response.data.data.token;

        if (isMounted) {
          if (token.startsWith("mock-")) {
            throw new Error(
              "Received a mock token because backend failed to contact the RealtimeKit API. Please ensure API credentials are correct and create a new meeting.",
            );
          }
          await initMeeting({
            authToken: token,
            defaults: {
              audio: false,
              video: false,
            },
          });
        }
      } catch (err: unknown) {
        if (isMounted) {
          const responseData = axios.isAxiosError(err)
            ? (err.response?.data as { message?: string } | undefined)
            : undefined;
          const errorMessage =
            responseData?.message ||
            (err instanceof Error ? err.message : undefined) ||
            "Failed to join meeting";
          setError(errorMessage);
          toast.error(errorMessage);
        }
      }
    };

    joinMeeting();

    return () => {
      isMounted = false;
    };
  }, [meetingId, user, isAuthLoading, initMeeting]);

  useEffect(() => {
    if (user?.role !== "STUDENT" || !meeting) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabViolations((prev) => {
          const newViolations = prev + 1;
          if (newViolations > 3) {
            meeting.leaveRoom();
          } else {
            alert("Warning: Do not leave the classroom tab!");
          }
          return newViolations;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [user, meeting]);

  useEffect(() => {
    if (!meeting || !user) return;

    const handleRoomLeft = () => {
      if (window.history.length > 2) {
        router.history.back();
      } else {
        if (user.role === "ADMIN") {
          router.navigate({ to: "/admin/live-classes" });
        } else if (user.role === "INSTRUCTOR") {
          router.navigate({ to: "/instructor/meetings" });
        } else {
          router.navigate({ to: "/student/live-classes" });
        }
      }
    };

    meeting.self.on("roomLeft", handleRoomLeft);

    return () => {
      meeting.self.removeListener("roomLeft", handleRoomLeft);
    };
  }, [meeting, user, router]);

  if (isAuthLoading || (!meeting && !error)) {
    return (
      <div className="flex-1 flex h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-blue-400 animate-spin" />
          <p className="text-sm text-muted-foreground">Connecting to live class...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-3 max-w-md text-center p-6 bg-red-950/20 border border-red-500/20 rounded-2xl">
          <AlertTriangle className="h-12 w-12 text-red-500" />
          <h2 className="text-xl font-bold text-foreground">Connection Error</h2>
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative bg-black">
      <RealtimeKitProvider value={meeting}>
        {user?.role === "STUDENT" && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden flex flex-wrap justify-around items-center opacity-20 select-none">
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                className="transform -rotate-45 text-white whitespace-nowrap m-12 text-xl font-bold tracking-widest"
              >
                {user.email || user.id}
              </div>
            ))}
          </div>
        )}
        <MeetingUi />
      </RealtimeKitProvider>
    </div>
  );
}

function MeetingUi() {
  const { meeting } = useRealtimeKitMeeting();

  return <RtkMeeting mode="fill" meeting={meeting} showSetupScreen={true} />;
}

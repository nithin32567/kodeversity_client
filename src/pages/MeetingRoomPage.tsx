import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";
import {
  RealtimeKitProvider,
  useRealtimeKitClient,
  useRealtimeKitMeeting,
} from "@cloudflare/realtimekit-react";
import { RtkMeeting } from "@cloudflare/realtimekit-react-ui";
import { toast } from "sonner";
import { RefreshCw, AlertTriangle, ChevronLeft } from "lucide-react";
import axios from "axios";
import { tokenStore } from "@/infrastructure/http/apiClient";
import { useConfirm } from "@/presentation/global/contexts/ConfirmContext";

export function MeetingRoomPage() {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { confirm } = useConfirm();

  const [meeting, initMeeting] = useRealtimeKitClient();
  const [error, setError] = useState<string | null>(null);

  const [, setTabViolations] = useState(0);

  useEffect(() => {
    if (isAuthLoading || !user || !meetingId) return;

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

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        setTabViolations((prev) => {
          const newViolations = prev + 1;
          if (newViolations > 3) {
            meeting.leaveRoom();
            toast.error("You have been disconnected due to tab switching violations.");
            navigate("/student/dashboard");
          } else {
            confirm({
              title: "Warning",
              message: `Warning: Do not leave the classroom tab! (${newViolations}/3 violations)`,
              confirmText: "I understand",
              cancelText: "" // hide cancel button
            });
          }
          return newViolations;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [user, meeting, navigate, confirm]);

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
          <div className="flex gap-4 mt-4 w-full">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 px-4 py-2 border border-border rounded-lg text-white hover:bg-white/10 transition"
            >
              Go Back
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative bg-black flex flex-col">
      {/* Back button overlay if needed */}
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={async () => {
            if (await confirm("Are you sure you want to leave the live class?")) {
              meeting?.leaveRoom();
              navigate(-1);
            }
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-white text-xs border border-white/10 transition"
        >
          <ChevronLeft className="h-4 w-4" />
          Leave Class
        </button>
      </div>

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

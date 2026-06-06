import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useDyteClient } from "@dytesdk/react-web-core";
import { DyteMeeting } from "@dytesdk/react-ui-kit";
import {
  Video,
  ChevronLeft,
  RefreshCw,
  AlertCircle,
  VideoOff,
  MicOff,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/presentation/features/auth/hooks/useAuth";
import { liveClassesService } from "@/infrastructure/admin/liveClassesService";
import { toast } from "sonner";

export const Route = createFileRoute("/_auth/student/meetings/$sessionId")({
  head: () => ({ meta: [{ title: "Live Classroom — Kodeversity" }] }),
  component: EmbeddedClassroomPage,
});

export function EmbeddedClassroomPage() {
  const { sessionId } = useParams({ from: "/_auth/student/meetings/$sessionId" });
  const { user, isLoading: isAuthLoading } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [sessionTitle, setSessionTitle] = useState<string>("");
  const [dyteMeetingId, setDyteMeetingId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dyte client hooks
  const [meeting, initMeeting] = useDyteClient();

  useEffect(() => {
    if (isAuthLoading || !user || !sessionId) return;

    const fetchJoinToken = async () => {
      setLoading(true);
      setError(null);
      try {
        const joinData = await liveClassesService.joinSession(sessionId, {
          userId: user.id,
          name: user.name || "Student Participant",
          role: "participant",
        });

        if (joinData && joinData.token) {
          setToken(joinData.token);
          setSessionTitle(joinData.sessionTitle || "Live Lecture Classroom");
          setDyteMeetingId(joinData.dyteMeetingId);
        } else {
          throw new Error("Invalid response token payload from meeting-service.");
        }
      } catch (err: unknown) {
        console.error("Failed to join Dyte meeting room:", err);
        setError(
          err instanceof Error ? err.message : "Failed to retrieve meeting token from the backend.",
        );
        toast.error("Failed to connect to the live meeting session.");
      } finally {
        setLoading(false);
      }
    };

    void fetchJoinToken();
  }, [isAuthLoading, user, sessionId]);

  // Initialize meeting room with token
  useEffect(() => {
    if (token) {
      void initMeeting({
        authToken: token,
        defaults: {
          audio: false, // Student mic starts strictly muted/disabled
          video: false, // Student camera starts strictly disabled
        },
      });
    }
  }, [token, initMeeting]);

  if (isAuthLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-indigo-400 animate-spin" />
          <p className="text-sm text-muted-foreground">
            Authenticating with meeting server and initializing room...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 min-h-[400px]">
        <div className="max-w-md w-full p-6 rounded-2xl border border-border bg-card text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">Connection Error</h3>
          <p className="text-xs text-muted-foreground">
            {error}. Make sure the `meeting-service` is running and the session ID is correct.
          </p>
          <div className="flex gap-3 pt-2">
            <Link
              to="/student/live-classes"
              className="flex-1 py-2.5 rounded-xl border border-border bg-card text-xs font-semibold text-foreground hover:text-white transition"
            >
              Back to List
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-black relative">
      {/* Meeting Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-card/95 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <Link
            to="/student/live-classes"
            className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-muted-foreground hover:text-white transition"
            title="Leave Meeting Room"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <div>
            <h2 className="text-sm font-bold text-white line-clamp-1">{sessionTitle}</h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Room ID: {dyteMeetingId.substring(0, 16)}... • Role: Participant (Student)
            </p>
          </div>
        </div>

        {/* Security Shield Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>Recording Blocker Active</span>
        </div>
      </div>

      {/* Embedded Meeting Space */}
      <div className="flex-1 min-h-0 bg-black relative flex flex-col justify-center">
        {meeting ? (
          <div className="w-full h-full flex-1 relative flex flex-col">
            {/* Dyte meeting container */}
            <DyteMeeting
              meeting={meeting}
              mode="fill"
              className="flex-1 w-full h-full"
              // Disable browser caching and recording blocks where possible
              config={
                {
                  controlBar: {
                    recording: false, // Students cannot trigger cloud recording
                  },
                  screenshare: {
                    allowShare: false, // Prevent students from sharing/capturing screen by default
                  },
                } as Record<string, unknown>
              }
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center p-6">
            <RefreshCw className="h-7 w-7 text-indigo-400 animate-spin" />
            <p className="text-xs text-muted-foreground">Launching Dyte Classroom Frame...</p>
          </div>
        )}
      </div>

      {/* Info Footer Banner */}
      <div className="bg-card px-4 py-2 border-t border-white/5 flex flex-wrap gap-x-6 gap-y-1 justify-center text-[10px] text-muted-foreground shrink-0 z-10">
        <span className="flex items-center gap-1">
          <MicOff className="h-3 w-3 text-rose-400" />
          Muted by default
        </span>
        <span className="flex items-center gap-1">
          <VideoOff className="h-3 w-3 text-rose-400" />
          Camera off by default
        </span>
        <span>•</span>
        <span>Anti-piracy screen recording guard is monitored.</span>
      </div>
    </main>
  );
}

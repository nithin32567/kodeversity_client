import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  useRealtimeKitMeeting,
  useRealtimeKitSelector,
  type BroadcastMessagePayload,
  type Message,
  type RTKChat,
  type RTKParticipant,
  type RTKSelf,
} from "@cloudflare/realtimekit-react";
import {
  Camera,
  CameraOff,
  Hand,
  MessageCircle,
  Mic,
  MicOff,
  PanelRightClose,
  PanelRightOpen,
  PhoneOff,
  ScreenShare,
  ScreenShareOff,
  Search,
  Send,
  ShieldCheck,
  UserRound,
  UsersRound,
  Video,
  VideoOff,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/presentation/lib/utils";

type SidebarTab = "participants" | "chat";

type ParticipantRef = {
  id: string;
  isLocal: boolean;
};

type ParticipantRecord = {
  id: string;
  userId: string;
  name: string;
  picture?: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenShareEnabled: boolean;
  presetName?: string;
  isHost?: boolean;
  role?: unknown;
  isLocal: boolean;
};

type ParticipantMedia = RTKParticipant | RTKSelf;

type AttachableTrack = MediaStreamTrack & {
  attach?: (element: HTMLVideoElement) => HTMLVideoElement | HTMLMediaElement | void;
  detach?: (element?: HTMLVideoElement) => HTMLVideoElement[] | HTMLMediaElement[] | void;
};

type VideoRegistrant = {
  registerVideoElement?: (element: HTMLVideoElement) => void;
  deregisterVideoElement?: (element?: HTMLVideoElement) => void;
};

type ChatBridge = RTKChat & {
  send?: (message: string) => Promise<void> | void;
};

const RAISE_HAND_EVENT = "classroom:raise-hand";

export default function CustomClassroom() {
  const { meeting } = useRealtimeKitMeeting();
  const roomJoined = useRealtimeKitSelector((currentMeeting) => currentMeeting.self.roomJoined);
  const self = useRealtimeKitSelector((currentMeeting) => currentMeeting.self);
  const joinedParticipants = useRealtimeKitSelector(
    (currentMeeting) => currentMeeting.participants.joined,
  );
  const activeSpeakerId = useRealtimeKitSelector(
    (currentMeeting) => currentMeeting.participants.lastActiveSpeaker,
  );
  const meetingTitle = useRealtimeKitSelector(
    (currentMeeting) => currentMeeting.meta.meetingTitle,
  );
  const meetingStartedAt = useRealtimeKitSelector(
    (currentMeeting) => currentMeeting.meta.meetingStartedTimestamp,
  );

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<SidebarTab>("participants");
  const [raisedHands, setRaisedHands] = useState<Set<string>>(new Set());

  const remoteParticipants = joinedParticipants.toArray().filter((participant) => {
    return participant.id !== self.id;
  });

  const participants = [
    toParticipantRecord(self, true),
    ...remoteParticipants.map((participant) => toParticipantRecord(participant, false)),
  ];

  const participantRefs = orderParticipants(
    [
      { id: self.id, isLocal: true },
      ...remoteParticipants.map((participant) => ({ id: participant.id, isLocal: false })),
    ],
    activeSpeakerId,
  );

  const duration = useMeetingDuration(meetingStartedAt, roomJoined);
  const participantIdsKey = participants.map((participant) => participant.id).join(":");

  useEffect(() => {
    const handleBroadcast = (event: {
      type: string;
      payload: BroadcastMessagePayload;
      timestamp: number;
    }) => {
      if (event.type !== RAISE_HAND_EVENT) return;

      const peerId =
        typeof event.payload.peerId === "string"
          ? event.payload.peerId
          : typeof event.payload.participantId === "string"
            ? event.payload.participantId
            : undefined;
      const raised = typeof event.payload.raised === "boolean" ? event.payload.raised : false;

      if (!peerId) return;

      setRaisedHands((current) => {
        const next = new Set(current);
        if (raised) {
          next.add(peerId);
        } else {
          next.delete(peerId);
        }
        return next;
      });
    };

    meeting.participants.addListener("broadcastedMessage", handleBroadcast);

    return () => {
      meeting.participants.removeListener("broadcastedMessage", handleBroadcast);
    };
  }, [meeting]);

  useEffect(() => {
    const activeParticipantIds = new Set(participants.map((participant) => participant.id));

    setRaisedHands((current) => {
      const next = new Set([...current].filter((participantId) => activeParticipantIds.has(participantId)));
      return next.size === current.size ? current : next;
    });
  }, [participantIdsKey]);

  if (!roomJoined) {
    return <ClassroomLobby title={meetingTitle || "Live Classroom"} self={self} />;
  }

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-zinc-950 text-white">
      <main className="flex min-w-0 flex-1 flex-col">
        <ClassroomHeader
          title={meetingTitle || "Live Classroom"}
          duration={duration}
          participantCount={participants.length}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((value) => !value)}
        />

        <section className="min-h-0 flex-1 px-3 pb-28 pt-3 sm:px-5 sm:pb-32">
          <VideoGrid
            participants={participantRefs}
            activeSpeakerId={activeSpeakerId}
            raisedHands={raisedHands}
          />
        </section>

        <ControlBar
          self={self}
          raised={raisedHands.has(self.id)}
          onRaiseHand={async () => {
            const nextRaised = !raisedHands.has(self.id);

            setRaisedHands((current) => {
              const next = new Set(current);
              if (nextRaised) {
                next.add(self.id);
              } else {
                next.delete(self.id);
              }
              return next;
            });

            try {
              await meeting.participants.broadcastMessage(RAISE_HAND_EVENT, {
                peerId: self.id,
                participantId: self.id,
                userId: self.userId,
                name: self.name,
                raised: nextRaised,
                timestamp: Date.now(),
              });
            } catch (error) {
              setRaisedHands((current) => {
                const next = new Set(current);
                if (nextRaised) {
                  next.delete(self.id);
                } else {
                  next.add(self.id);
                }
                return next;
              });
              toast.error(getErrorMessage(error, "Could not update raised hand"));
            }
          }}
        />
      </main>

      {sidebarOpen && (
        <ClassroomSidebar
          participants={participants}
          raisedHands={raisedHands}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      {!sidebarOpen && (
        <button
          type="button"
          title="Open sidebar"
          aria-label="Open sidebar"
          onClick={() => setSidebarOpen(true)}
          className="absolute right-4 top-4 z-40 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-zinc-900/90 text-zinc-200 shadow-lg shadow-black/30 transition hover:bg-zinc-800 hover:text-white"
        >
          <PanelRightOpen className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

function ClassroomLobby({ title, self }: { title: string; self: RTKSelf }) {
  const { meeting } = useRealtimeKitMeeting();
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    setJoining(true);
    try {
      await meeting.joinRoom();
      await meeting.self.playAudio().catch(() => undefined);
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not join the class"));
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-zinc-950 px-5 text-white">
      <div className="grid w-full max-w-5xl gap-5 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="min-h-[420px] overflow-hidden rounded-lg border border-white/10 bg-zinc-900">
          <ParticipantTile participantId={self.id} isLocal isFocus raised={false} />
        </div>

        <div className="flex flex-col justify-between rounded-lg border border-white/10 bg-zinc-900/80 p-5 shadow-xl shadow-black/30">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-red-200">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Live class
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Check your camera and microphone before entering the classroom.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <LobbyToggle
                active={self.audioEnabled}
                activeIcon={<Mic className="h-5 w-5" />}
                inactiveIcon={<MicOff className="h-5 w-5" />}
                label={self.audioEnabled ? "Mic on" : "Mic off"}
                onClick={async () => {
                  try {
                    if (self.audioEnabled) {
                      await self.disableAudio();
                    } else {
                      await self.enableAudio();
                    }
                  } catch (error) {
                    toast.error(getErrorMessage(error, "Could not update microphone"));
                  }
                }}
              />
              <LobbyToggle
                active={self.videoEnabled}
                activeIcon={<Camera className="h-5 w-5" />}
                inactiveIcon={<CameraOff className="h-5 w-5" />}
                label={self.videoEnabled ? "Camera on" : "Camera off"}
                onClick={async () => {
                  try {
                    if (self.videoEnabled) {
                      await self.disableVideo();
                    } else {
                      await self.enableVideo();
                    }
                  } catch (error) {
                    toast.error(getErrorMessage(error, "Could not update camera"));
                  }
                }}
              />
            </div>

            <button
              type="button"
              onClick={handleJoin}
              disabled={joining}
              className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-emerald-500 px-5 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {joining ? "Joining..." : "Join class"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClassroomHeader({
  title,
  duration,
  participantCount,
  sidebarOpen,
  onToggleSidebar,
}: {
  title: string;
  duration: string;
  participantCount: number;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-zinc-950/95 px-4 backdrop-blur sm:px-6">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-200">
            <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_16px_rgba(239,68,68,0.85)]" />
            LIVE
          </span>
          <h1 className="truncate text-sm font-semibold text-white sm:text-base">{title}</h1>
        </div>
        <div className="mt-1 flex items-center gap-3 text-xs text-zinc-400">
          <span>{duration}</span>
          <span className="h-1 w-1 rounded-full bg-zinc-600" />
          <span className="inline-flex items-center gap-1.5">
            <UsersRound className="h-3.5 w-3.5" />
            {participantCount}
          </span>
        </div>
      </div>

      <button
        type="button"
        title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        onClick={onToggleSidebar}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-zinc-900 text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
      >
        {sidebarOpen ? <PanelRightClose className="h-5 w-5" /> : <PanelRightOpen className="h-5 w-5" />}
      </button>
    </header>
  );
}

function VideoGrid({
  participants,
  activeSpeakerId,
  raisedHands,
}: {
  participants: ParticipantRef[];
  activeSpeakerId: string;
  raisedHands: Set<string>;
}) {
  const total = participants.length;
  const hasFocusTile = total > 4 && participants.some((participant) => participant.id === activeSpeakerId);

  return (
    <div className={cn("grid h-full min-h-0 gap-3 auto-rows-fr", getGridClass(total))}>
      {participants.map((participant, index) => {
        const isFocus = hasFocusTile && participant.id === activeSpeakerId;

        return (
          <div
            key={participant.id}
            className={cn(
              "min-h-[180px]",
              total === 1 && "mx-auto w-full max-w-5xl",
              isFocus && "sm:col-span-2 sm:row-span-2",
              !isFocus && hasFocusTile && index > 6 && "hidden xl:block",
            )}
          >
            <ParticipantTile
              participantId={participant.id}
              isLocal={participant.isLocal}
              isFocus={isFocus || total === 1}
              raised={raisedHands.has(participant.id)}
            />
          </div>
        );
      })}
    </div>
  );
}

function ParticipantTile({
  participantId,
  isLocal,
  isFocus,
  raised,
}: {
  participantId: string;
  isLocal: boolean;
  isFocus: boolean;
  raised: boolean;
}) {
  const participant = useRealtimeKitSelector((meeting) => {
    if (isLocal) return meeting.self;
    return meeting.participants.active.get(participantId) ?? meeting.participants.joined.get(participantId);
  }) as ParticipantMedia | undefined;

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const videoEnabled = Boolean(participant?.videoEnabled && participant.videoTrack);
  const audioEnabled = Boolean(participant?.audioEnabled);
  const screenShareEnabled = Boolean(participant?.screenShareEnabled);
  const name = participant?.name || (isLocal ? "You" : "Participant");
  const isInstructor = participant ? isInstructorRecord(toParticipantRecord(participant, isLocal)) : false;

  useVideoAttachment({
    videoRef,
    participant,
    videoTrack: participant?.videoTrack,
    enabled: videoEnabled,
  });
  useAudioAttachment({
    audioRef,
    audioTrack: isLocal ? undefined : participant?.audioTrack,
    enabled: !isLocal && audioEnabled,
  });

  return (
    <article
      className={cn(
        "group relative h-full min-h-[180px] overflow-hidden rounded-lg border bg-zinc-900 shadow-xl shadow-black/30",
        isFocus ? "border-emerald-400/70" : "border-white/10",
      )}
    >
      <div className="absolute inset-0 bg-zinc-900">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={cn(
            "h-full w-full bg-zinc-900 object-cover transition-opacity duration-300",
            videoEnabled ? "opacity-100" : "opacity-0",
          )}
        />
        {!isLocal && <audio ref={audioRef} autoPlay playsInline />}

        {!videoEnabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(135deg,#18181b,#0f172a_55%,#111827)]">
            <Avatar name={name} picture={participant?.picture} size={isFocus ? "lg" : "md"} />
          </div>
        )}
      </div>

      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
        <div className="flex flex-wrap items-center gap-2">
          {isInstructor && (
            <StatusBadge className="border-sky-400/30 bg-sky-400/10 text-sky-100">
              <ShieldCheck className="h-3.5 w-3.5" />
              Instructor
            </StatusBadge>
          )}
          {screenShareEnabled && (
            <StatusBadge className="border-amber-400/30 bg-amber-400/10 text-amber-100">
              <ScreenShare className="h-3.5 w-3.5" />
              Presenting
            </StatusBadge>
          )}
          {raised && (
            <StatusBadge className="border-yellow-300/40 bg-yellow-300/10 text-yellow-100">
              <Hand className="h-3.5 w-3.5" />
              Raised
            </StatusBadge>
          )}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {name}
              {isLocal ? " (You)" : ""}
            </p>
            <p className="mt-0.5 text-xs text-zinc-300">
              {videoEnabled ? "Camera active" : "Camera off"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span
              title={audioEnabled ? "Microphone on" : "Microphone muted"}
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-full border",
                audioEnabled
                  ? "border-emerald-400/30 bg-emerald-400/15 text-emerald-100"
                  : "border-red-400/30 bg-red-500/15 text-red-100",
              )}
            >
              {audioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </span>
            <span
              title={videoEnabled ? "Camera on" : "Camera off"}
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-full border",
                videoEnabled
                  ? "border-sky-400/30 bg-sky-400/15 text-sky-100"
                  : "border-zinc-500/30 bg-zinc-800/80 text-zinc-300",
              )}
            >
              {videoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function ClassroomSidebar({
  participants,
  raisedHands,
  activeTab,
  onTabChange,
  onClose,
}: {
  participants: ParticipantRecord[];
  raisedHands: Set<string>;
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  onClose: () => void;
}) {
  return (
    <aside className="absolute right-0 top-0 z-30 flex h-full w-full max-w-[390px] flex-col border-l border-white/10 bg-zinc-950/98 shadow-2xl shadow-black/50 backdrop-blur lg:relative">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-4">
        <div className="inline-flex rounded-full border border-white/10 bg-zinc-900 p-1">
          <SidebarTabButton
            active={activeTab === "participants"}
            label="People"
            icon={<UsersRound className="h-4 w-4" />}
            onClick={() => onTabChange("participants")}
          />
          <SidebarTabButton
            active={activeTab === "chat"}
            label="Chat"
            icon={<MessageCircle className="h-4 w-4" />}
            onClick={() => onTabChange("chat")}
          />
        </div>

        <button
          type="button"
          title="Close sidebar"
          aria-label="Close sidebar"
          onClick={onClose}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-zinc-900 text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
        >
          <PanelRightClose className="h-5 w-5" />
        </button>
      </div>

      {activeTab === "participants" ? (
        <ParticipantsPanel participants={participants} raisedHands={raisedHands} />
      ) : (
        <ChatPanel />
      )}
    </aside>
  );
}

function ParticipantsPanel({
  participants,
  raisedHands,
}: {
  participants: ParticipantRecord[];
  raisedHands: Set<string>;
}) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const visibleParticipants = normalizedQuery
    ? participants.filter((participant) => participant.name.toLowerCase().includes(normalizedQuery))
    : participants;
  const instructors = visibleParticipants.filter(isInstructorRecord);
  const students = visibleParticipants.filter((participant) => !isInstructorRecord(participant));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-white/10 p-4">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search participants"
            className="h-10 w-full rounded-lg border border-white/10 bg-zinc-900 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-emerald-400/50"
          />
        </label>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
        <ParticipantGroup
          title="Instructor"
          emptyLabel="No instructor visible"
          participants={instructors}
          raisedHands={raisedHands}
        />
        <ParticipantGroup
          title={`Students (${students.length})`}
          emptyLabel="No students visible"
          participants={students}
          raisedHands={raisedHands}
        />
      </div>
    </div>
  );
}

function ParticipantGroup({
  title,
  emptyLabel,
  participants,
  raisedHands,
}: {
  title: string;
  emptyLabel: string;
  participants: ParticipantRecord[];
  raisedHands: Set<string>;
}) {
  return (
    <section>
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
        {title}
      </h2>
      {participants.length === 0 ? (
        <p className="rounded-lg border border-dashed border-white/10 px-3 py-4 text-sm text-zinc-500">
          {emptyLabel}
        </p>
      ) : (
        <div className="space-y-2">
          {participants.map((participant) => (
            <ParticipantListItem
              key={participant.id}
              participant={participant}
              raised={raisedHands.has(participant.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ParticipantListItem({
  participant,
  raised,
}: {
  participant: ParticipantRecord;
  raised: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-zinc-900/70 p-3">
      <Avatar name={participant.name} picture={participant.picture} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">
          {participant.name}
          {participant.isLocal ? " (You)" : ""}
        </p>
        <p className="text-xs text-zinc-500">
          {isInstructorRecord(participant) ? "Instructor" : "Student"}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {raised && (
          <span
            title="Hand raised"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-yellow-300/10 text-yellow-100"
          >
            <Hand className="h-4 w-4" />
          </span>
        )}
        <MediaIndicator enabled={participant.audioEnabled} kind="audio" />
        <MediaIndicator enabled={participant.videoEnabled} kind="video" />
      </div>
    </div>
  );
}

function ChatPanel() {
  const self = useRealtimeKitSelector((meeting) => meeting.self);
  const chat = useRealtimeKitSelector((meeting) => meeting.chat);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messages = chat.messages;

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;

    setSending(true);
    try {
      await sendChatMessage(chat, text);
      setDraft("");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not send message"));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <MessageCircle className="mx-auto h-9 w-9 text-zinc-600" />
              <p className="mt-3 text-sm font-medium text-zinc-300">No messages yet</p>
              <p className="mt-1 text-xs text-zinc-500">Classroom chat will appear here.</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessageBubble
              key={message.id}
              message={message}
              mine={message.userId === self.userId}
            />
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="sticky bottom-0 border-t border-white/10 bg-zinc-950 p-4">
        <div className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Message the class"
            maxLength={chat.maxTextLimit || 500}
            className="h-11 min-w-0 flex-1 rounded-lg border border-white/10 bg-zinc-900 px-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-emerald-400/50"
          />
          <button
            type="submit"
            title="Send message"
            aria-label="Send message"
            disabled={sending || draft.trim().length === 0}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

function ChatMessageBubble({ message, mine }: { message: Message; mine: boolean }) {
  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[82%] rounded-lg border px-3 py-2",
          mine
            ? "border-emerald-400/20 bg-emerald-500/15 text-emerald-50"
            : "border-white/10 bg-zinc-900 text-zinc-100",
        )}
      >
        <div className="mb-1 flex items-center gap-2 text-[11px]">
          <span className={cn("truncate font-semibold", mine ? "text-emerald-100" : "text-zinc-300")}>
            {mine ? "You" : message.displayName || "Participant"}
          </span>
          <span className={mine ? "text-emerald-200/70" : "text-zinc-500"}>
            {formatMessageTime(message)}
          </span>
        </div>
        <p className="whitespace-pre-wrap break-words text-sm leading-5">{getMessageBody(message)}</p>
      </div>
    </div>
  );
}

function ControlBar({
  self,
  raised,
  onRaiseHand,
}: {
  self: RTKSelf;
  raised: boolean;
  onRaiseHand: () => Promise<void>;
}) {
  const { meeting } = useRealtimeKitMeeting();
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const runAction = async (action: string, callback: () => Promise<void>) => {
    setBusyAction(action);
    try {
      await callback();
    } catch (error) {
      toast.error(getErrorMessage(error, "Classroom control failed"));
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-3 pb-4 sm:pb-6">
      <div className="pointer-events-auto flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-zinc-900/95 p-2 shadow-2xl shadow-black/50 backdrop-blur">
        <ControlButton
          label={self.audioEnabled ? "Mute microphone" : "Unmute microphone"}
          active={self.audioEnabled}
          loading={busyAction === "audio"}
          activeClassName="bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
          inactiveClassName="bg-red-500 text-white hover:bg-red-400"
          icon={self.audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          onClick={() =>
            runAction("audio", async () => {
              if (self.audioEnabled) {
                await self.disableAudio();
              } else {
                await self.enableAudio();
              }
            })
          }
        />

        <ControlButton
          label={self.videoEnabled ? "Turn camera off" : "Turn camera on"}
          active={self.videoEnabled}
          loading={busyAction === "video"}
          activeClassName="bg-sky-500 text-sky-950 hover:bg-sky-400"
          inactiveClassName="bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
          icon={self.videoEnabled ? <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />}
          onClick={() =>
            runAction("video", async () => {
              if (self.videoEnabled) {
                await self.disableVideo();
              } else {
                await self.enableVideo();
              }
            })
          }
        />

        <ControlButton
          label={self.screenShareEnabled ? "Stop screen share" : "Share screen"}
          active={self.screenShareEnabled}
          loading={busyAction === "screen"}
          activeClassName="bg-amber-400 text-amber-950 hover:bg-amber-300"
          inactiveClassName="bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
          icon={
            self.screenShareEnabled ? (
              <ScreenShareOff className="h-5 w-5" />
            ) : (
              <ScreenShare className="h-5 w-5" />
            )
          }
          onClick={() =>
            runAction("screen", async () => {
              if (self.screenShareEnabled) {
                await self.disableScreenShare();
              } else {
                await self.enableScreenShare();
              }
            })
          }
        />

        <ControlButton
          label={raised ? "Lower hand" : "Raise hand"}
          active={raised}
          loading={busyAction === "hand"}
          activeClassName="bg-yellow-300 text-yellow-950 hover:bg-yellow-200"
          inactiveClassName="bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
          icon={<Hand className="h-5 w-5" />}
          onClick={() => runAction("hand", onRaiseHand)}
        />

        <div className="mx-1 h-8 w-px bg-white/10" />

        <button
          type="button"
          title="Leave class"
          aria-label="Leave class"
          onClick={() =>
            runAction("leave", async () => {
              await meeting.leaveRoom();
            })
          }
          disabled={busyAction === "leave"}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-red-700 px-4 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60 sm:px-5"
        >
          <PhoneOff className="h-5 w-5" />
          <span className="hidden sm:inline">Leave Class</span>
        </button>
      </div>
    </footer>
  );
}

function ControlButton({
  label,
  active,
  loading,
  icon,
  activeClassName,
  inactiveClassName,
  onClick,
}: {
  label: string;
  active: boolean;
  loading: boolean;
  icon: ReactNode;
  activeClassName: string;
  inactiveClassName: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={loading}
      onClick={onClick}
      className={cn(
        "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition disabled:cursor-wait disabled:opacity-70",
        active ? activeClassName : inactiveClassName,
      )}
    >
      {icon}
    </button>
  );
}

function SidebarTabButton({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-8 items-center gap-2 rounded-full px-3 text-xs font-semibold transition",
        active ? "bg-white text-zinc-950" : "text-zinc-400 hover:text-white",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function LobbyToggle({
  active,
  activeIcon,
  inactiveIcon,
  label,
  onClick,
}: {
  active: boolean;
  activeIcon: ReactNode;
  inactiveIcon: ReactNode;
  label: string;
  onClick: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        setBusy(true);
        try {
          await onClick();
        } finally {
          setBusy(false);
        }
      }}
      disabled={busy}
      className={cn(
        "flex h-12 items-center justify-center gap-2 rounded-lg border text-sm font-semibold transition disabled:cursor-wait disabled:opacity-70",
        active
          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/15"
          : "border-white/10 bg-zinc-950 text-zinc-300 hover:bg-zinc-800",
      )}
    >
      {active ? activeIcon : inactiveIcon}
      {label}
    </button>
  );
}

function MediaIndicator({ enabled, kind }: { enabled: boolean; kind: "audio" | "video" }) {
  const isAudio = kind === "audio";
  const label = isAudio
    ? enabled
      ? "Microphone on"
      : "Microphone muted"
    : enabled
      ? "Camera on"
      : "Camera off";

  return (
    <span
      title={label}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-full",
        enabled ? "bg-emerald-400/10 text-emerald-100" : "bg-zinc-800 text-zinc-400",
      )}
    >
      {isAudio ? (
        enabled ? (
          <Mic className="h-4 w-4" />
        ) : (
          <MicOff className="h-4 w-4" />
        )
      ) : enabled ? (
        <Video className="h-4 w-4" />
      ) : (
        <VideoOff className="h-4 w-4" />
      )}
    </span>
  );
}

function StatusBadge({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-lg shadow-black/20 backdrop-blur",
        className,
      )}
    >
      {children}
    </span>
  );
}

function Avatar({
  name,
  picture,
  size,
}: {
  name: string;
  picture?: string;
  size: "sm" | "md" | "lg";
}) {
  const sizeClassName = {
    sm: "h-10 w-10 text-sm",
    md: "h-20 w-20 text-2xl",
    lg: "h-28 w-28 text-4xl",
  }[size];

  if (picture) {
    return (
      <img
        src={picture}
        alt={name}
        className={cn("shrink-0 rounded-full border border-white/10 object-cover", sizeClassName)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border border-white/10 bg-zinc-800 font-semibold text-white shadow-lg shadow-black/30",
        sizeClassName,
      )}
    >
      {getInitials(name)}
    </div>
  );
}

function useVideoAttachment({
  videoRef,
  participant,
  videoTrack,
  enabled,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  participant?: ParticipantMedia;
  videoTrack?: MediaStreamTrack;
  enabled: boolean;
}) {
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return undefined;

    const registrant = participant as (ParticipantMedia & VideoRegistrant) | undefined;
    const attachableTrack = videoTrack as AttachableTrack | undefined;
    let attachedWithTrack = false;

    if (enabled && videoTrack) {
      if (typeof attachableTrack?.attach === "function") {
        attachableTrack.attach(videoElement);
        attachedWithTrack = true;
      } else if (typeof registrant?.registerVideoElement === "function") {
        registrant.registerVideoElement(videoElement);
      } else {
        const stream = new MediaStream([videoTrack]);
        videoElement.srcObject = stream;
      }

      void videoElement.play().catch(() => undefined);
    } else {
      if (typeof registrant?.deregisterVideoElement === "function") {
        registrant.deregisterVideoElement(videoElement);
      }
      videoElement.srcObject = null;
    }

    return () => {
      if (attachedWithTrack && typeof attachableTrack?.detach === "function") {
        attachableTrack.detach(videoElement);
      }

      if (typeof registrant?.deregisterVideoElement === "function") {
        registrant.deregisterVideoElement(videoElement);
      }

      videoElement.srcObject = null;
    };
  }, [enabled, participant, videoRef, videoTrack]);
}

function useAudioAttachment({
  audioRef,
  audioTrack,
  enabled,
}: {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  audioTrack?: MediaStreamTrack;
  enabled: boolean;
}) {
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return undefined;

    if (enabled && audioTrack) {
      audioElement.srcObject = new MediaStream([audioTrack]);
      void audioElement.play().catch(() => undefined);
    } else {
      audioElement.srcObject = null;
    }

    return () => {
      audioElement.srcObject = null;
    };
  }, [audioRef, audioTrack, enabled]);
}

function useMeetingDuration(startedAt: Date | undefined, active: boolean) {
  const fallbackStart = useRef(Date.now());
  const [now, setNow] = useState(Date.now());
  const startedAtMs = startedAt instanceof Date ? startedAt.getTime() : fallbackStart.current;

  useEffect(() => {
    if (!active) return undefined;

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [active]);

  return formatDuration(Math.max(0, now - startedAtMs));
}

async function sendChatMessage(chat: RTKChat, message: string) {
  const bridge = chat as ChatBridge;

  if (typeof bridge.send === "function") {
    await bridge.send(message);
    return;
  }

  await chat.sendTextMessage(message);
}

function toParticipantRecord(participant: ParticipantMedia, isLocal: boolean): ParticipantRecord {
  return {
    id: participant.id,
    userId: participant.userId,
    name: participant.name || (isLocal ? "You" : "Participant"),
    picture: participant.picture,
    audioEnabled: Boolean(participant.audioEnabled),
    videoEnabled: Boolean(participant.videoEnabled),
    screenShareEnabled: Boolean(participant.screenShareEnabled),
    presetName: "presetName" in participant ? participant.presetName : undefined,
    isHost: "isHost" in participant ? participant.isHost : undefined,
    role: "role" in participant ? participant.role : undefined,
    isLocal,
  };
}

function isInstructorRecord(participant: ParticipantRecord) {
  const presetName = participant.presetName?.toLowerCase() ?? "";
  const role = typeof participant.role === "string" ? participant.role.toLowerCase() : "";

  return (
    Boolean(participant.isHost) ||
    presetName.includes("host") ||
    presetName.includes("instructor") ||
    role.includes("host") ||
    role.includes("instructor")
  );
}

function orderParticipants(participants: ParticipantRef[], activeSpeakerId: string) {
  if (!activeSpeakerId) return participants;

  const activeSpeakerIndex = participants.findIndex((participant) => participant.id === activeSpeakerId);
  if (activeSpeakerIndex <= 0) return participants;

  const orderedParticipants = [...participants];
  const [activeSpeaker] = orderedParticipants.splice(activeSpeakerIndex, 1);
  return activeSpeaker ? [activeSpeaker, ...orderedParticipants] : participants;
}

function getGridClass(total: number) {
  if (total <= 1) return "grid-cols-1";
  if (total === 2) return "grid-cols-1 md:grid-cols-2";
  if (total <= 4) return "grid-cols-1 sm:grid-cols-2";
  if (total <= 6) return "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3";
  return "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4";
}

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return initials || "KV";
}

function formatDuration(durationMs: number) {
  const totalSeconds = Math.floor(durationMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${padTime(minutes)}:${padTime(seconds)}`;
  }

  return `${padTime(minutes)}:${padTime(seconds)}`;
}

function padTime(value: number) {
  return value.toString().padStart(2, "0");
}

function formatMessageTime(message: Message) {
  const timestamp = message.time instanceof Date ? message.time : new Date(message.timeMs ?? Date.now());

  return timestamp.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getMessageBody(message: Message) {
  switch (message.type) {
    case "text":
      return message.message;
    case "image":
      return "Image shared";
    case "file":
      return message.name ? `File shared: ${message.name}` : "File shared";
    case "custom":
      return message.message || "Custom classroom update";
    default:
      return "Unsupported message";
  }
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

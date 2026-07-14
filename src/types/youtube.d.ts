// Minimal ambient declarations for the YouTube IFrame Player API.
// See: https://developers.google.com/youtube/iframe_api_reference

declare namespace YT {
  interface PlayerVars {
    autoplay?: 0 | 1;
    controls?: 0 | 1 | 2;
    rel?: 0 | 1;
    modestbranding?: 0 | 1;
    iv_load_policy?: 1 | 3;
    [key: string]: unknown;
  }

  interface OnStateChangeEvent {
    data: number;
    target: Player;
  }

  interface Events {
    onReady?: (event: { target: Player }) => void;
    onStateChange?: (event: OnStateChangeEvent) => void;
    onError?: (event: { data: number }) => void;
  }

  interface PlayerOptions {
    videoId?: string;
    width?: number | string;
    height?: number | string;
    playerVars?: PlayerVars;
    events?: Events;
  }

  class Player {
    constructor(elementOrId: HTMLElement | string, options: PlayerOptions);
    destroy(): void;
    playVideo(): void;
    pauseVideo(): void;
    stopVideo(): void;
    seekTo(seconds: number, allowSeekAhead: boolean): void;
    getPlayerState(): number;
    getCurrentTime(): number;
    getDuration(): number;
  }

  const PlayerState: {
    ENDED: 0;
    PLAYING: 1;
    PAUSED: 2;
    BUFFERING: 3;
    CUED: 5;
  };
}

interface Window {
  YT: typeof YT & { Player: typeof YT.Player };
  onYouTubeIframeAPIReady: () => void;
}

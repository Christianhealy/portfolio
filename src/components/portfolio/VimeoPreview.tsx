import Player from "@vimeo/player";
import { useEffect, useRef, useState } from "react";

export function VimeoPreview({ src, title }: { src: string; title: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!frame.current) return;
    const player = new Player(frame.current);
    let disposed = false;
    const onTimeUpdate = () => {
      if (!disposed) setPlaying(true);
    };
    const onError = () => {
      if (!disposed) setPlaying(false);
    };
    player.on("timeupdate", onTimeUpdate);
    player.on("error", onError);
    void player
      .ready()
      .then(async () => {
        if (disposed) return;
        await player.setVolume(0);
        if (!disposed) await player.play();
      })
      .catch(() => {
        if (!disposed) setPlaying(false);
      });
    return () => {
      disposed = true;
      player.off("timeupdate", onTimeUpdate);
      player.off("error", onError);
    };
  }, [src]);

  return (
    <iframe
      ref={frame}
      src={src}
      title={`${title} — muted preview`}
      allow="autoplay; fullscreen; encrypted-media"
      tabIndex={-1}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 size-full border-0 transition-opacity duration-300 ${playing ? "opacity-100" : "opacity-0"}`}
    />
  );
}

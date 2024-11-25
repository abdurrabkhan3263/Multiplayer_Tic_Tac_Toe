import React, { useEffect, useRef } from "react";

const BackgroundMusic: React.FC<{ music: boolean }> = ({ music }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!audioRef.current) return;

    const playAudio = () => {
      audioRef.current!.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
      audioRef.current!.volume = 0.1;
    };

    if (music) {
      window.addEventListener("click", playAudio, { once: true });
    } else {
      audioRef.current.pause();
    }

    return () => {
      window.removeEventListener("click", playAudio);
    };
  }, [music]);

  return <audio ref={audioRef} src="/audio/background.mp3" />;
};

export default BackgroundMusic;

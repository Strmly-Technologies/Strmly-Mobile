import { useEffect, useState } from "react";

export function useThumbnailsGenerate(videos: { id: string; url: string }[]) {
  const [thumbnails, setThumbnails] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const generateThumbnail = (videoUrl: string, videoId: string) => {
      const video = document.createElement("video");
      video.src = videoUrl;
      video.crossOrigin = "anonymous";
      video.currentTime = 5;

      video.addEventListener("loadeddata", () => {
        const canvas = document.createElement("canvas");
        canvas.width = 320;
        canvas.height = 180;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataURL = canvas.toDataURL("image/jpeg");
          setThumbnails((prev) => ({ ...prev, [videoId]: dataURL }));
        }
      });
    };

    videos.forEach((vid) => {
      if (!thumbnails[vid.id]) {
        generateThumbnail(vid.url, vid.id);
      }
    });
  }, [videos]);

  return thumbnails;
}
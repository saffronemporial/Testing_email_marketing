import React, { useRef, useEffect } from 'react';
import Hls from 'hls.js';

export default function LiveFarmFeed({ src }) {
  const videoRef = useRef();
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      return () => { hls.destroy(); };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    }
  }, [src]);
  return <video ref={videoRef} controls style={{ width: '100%' }} />;
}

import React from 'react';

const VideoPlayer = ({ videoUrl }) => {
  if (!videoUrl) {
    return <p>Loading video...</p>;
  }

  return (
    <div className="video-container">
      {/* The HTML5 video tag is used to play the video from the provided URL */}
      <video 
        width="600" 
        controls // 'controls' attribute provides default playback controls (play, pause, volume, etc.)
        src={videoUrl}
      >
        {/* Fallback text for browsers that do not support the video tag */}
        Sorry, your browser does not support embedded videos.
      </video>
    </div>
  );
};

export default VideoPlayer;

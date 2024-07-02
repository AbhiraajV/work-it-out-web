import YouTube from "react-youtube";
const YouTubePlayer = ({ videoId }: { videoId: string }) => {
  // Set up event handlers
  const onReady = (event: any) => {
    // Access the player instance
    const player = event.target;

    // For example, you can automatically play the video
    player.pauseVideo();
  };

  const onError = (error: any) => {
    console.error("YouTube Player Error:", error);
  };

  return (
    <YouTube
      opts={{
        height: "180px",
        width: "290px",
        playerVars: {
          autoplay: 1,
        },
      }}
      videoId={videoId}
      onReady={onReady}
      onError={onError}
    />
  );
};

export default YouTubePlayer;

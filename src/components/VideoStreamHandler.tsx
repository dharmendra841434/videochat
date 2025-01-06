"use client";

import React, { useRef, useState, useEffect } from "react";

const VideoStreamHandler: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(true);

  const startVideoStream = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("MediaDevices API not supported in this browser.");
        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => (track.enabled = !isMuted));
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream
        .getVideoTracks()
        .forEach((track) => (track.enabled = !isVideoEnabled));
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  useEffect(() => {
    // Cleanup media stream when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return (
    <div>
      <video ref={videoRef} width="600" autoPlay muted={isMuted}></video>
      <div style={{ marginTop: "10px" }}>
        <button onClick={startVideoStream}>Start Video Stream</button>
        <button onClick={toggleMute}>
          {isMuted ? "Unmute Audio" : "Mute Audio"}
        </button>
        <button onClick={toggleVideo}>
          {isVideoEnabled ? "Disable Video" : "Enable Video"}
        </button>
      </div>
    </div>
  );
};

export default VideoStreamHandler;

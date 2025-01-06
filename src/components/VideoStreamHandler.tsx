"use client";

import React, { useRef, useState } from "react";

const VideoStreamHandler = () => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const startVideoStream = async () => {
    try {
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

  return (
    <div>
      <video ref={videoRef} width="600" autoPlay muted={isMuted}></video>
      <div style={{ marginTop: "10px" }} className=" space-x-5 px-5">
        <button
          className=" border border-gray-400 rounded-md px-4"
          onClick={startVideoStream}
        >
          Start Video Stream
        </button>
        <button
          className=" border border-gray-400 rounded-md px-4"
          onClick={toggleMute}
        >
          {isMuted ? "Unmute Audio" : "Mute Audio"}
        </button>
        <button
          className=" border border-gray-400 rounded-md px-4"
          onClick={toggleVideo}
        >
          {isVideoEnabled ? "Disable Video" : "Enable Video"}
        </button>
      </div>
    </div>
  );
};

export default VideoStreamHandler;

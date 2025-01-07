"use client";

import React, { useRef, useState, useEffect } from "react";
import io, { Socket } from "socket.io-client";

const SERVER_URL = "http://localhost:4000"; // Replace with your server URL

const VideoStreamHandler: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);

  const [roomId, setRoomId] = useState<string>("");

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

  const joinRoom = (room: string) => {
    if (socket) {
      setRoomId(room);
      socket.emit("join-room", room);
    }
  };

  useEffect(() => {
    const newSocket = io(SERVER_URL);
    setSocket(newSocket);

    const pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302", // Public STUN server
        },
      ],
    });
    setPeerConnection(pc);

    newSocket.on("offer", async (offer: RTCSessionDescriptionInit) => {
      if (peerConnection) {
        await peerConnection.setRemoteDescription(offer);
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        newSocket.emit("answer", answer, roomId);
      }
    });

    newSocket.on("answer", async (answer: RTCSessionDescriptionInit) => {
      if (peerConnection) {
        await peerConnection.setRemoteDescription(answer);
      }
    });

    newSocket.on("ice-candidate", async (candidate: RTCIceCandidateInit) => {
      if (peerConnection) {
        await peerConnection.addIceCandidate(candidate);
      }
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        newSocket.emit("ice-candidate", event.candidate, roomId);
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    return () => {
      if (newSocket) newSocket.disconnect();
      if (pc) pc.close();
    };
  }, [peerConnection]);

  useEffect(() => {
    if (stream && peerConnection) {
      stream
        .getTracks()
        .forEach((track) => peerConnection.addTrack(track, stream));
    }
  }, [stream, peerConnection]);

  return (
    <div>
      <div>
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="border border-gray-400 rounded-md px-4"
        />
        <button
          onClick={() => joinRoom(roomId)}
          className="ml-2 border border-gray-400 rounded-md px-4"
        >
          Join Room
        </button>
      </div>
      <video ref={videoRef} width="300" autoPlay muted playsInline></video>
      <video ref={remoteVideoRef} width="300" autoPlay playsInline></video>
      <div style={{ marginTop: "10px" }} className="space-x-4 px-5">
        <button
          className="border border-gray-400 rounded-md px-4"
          onClick={startVideoStream}
        >
          Start Video Stream
        </button>
      </div>
    </div>
  );
};

export default VideoStreamHandler;

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Peer from 'simple-peer';
import { io, Socket } from 'socket.io-client';
import { Phone, PhoneOff, ArrowLeft, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';

const socket: Socket = io('https://nexus-backend-jlqe.onrender.com');

export const VideoCall: React.FC = () => {
  const { user } = useAuth();
  const { userId: otherUserId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [stream, setStream] = useState<MediaStream | undefined>();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState('');
  const [callerSignal, setCallerSignal] = useState<any>();
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);

  // NEW: State for audio/video toggles
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const myVideo = useRef<HTMLVideoElement>(null);
  const userVideo = useRef<HTMLVideoElement>(null);
  const connectionRef = useRef<any>();

  useEffect(() => {
    // 1. Get Camera and Mic permissions
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
      setStream(currentStream);
      if (myVideo.current) {
        myVideo.current.srcObject = currentStream;
      }
    });

    // 2. Join personal socket room
    if (user?.id) {
      socket.emit('join_room', user.id);
    }

    // 3. Listen for incoming calls
    socket.on('incoming_call', (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setCallerSignal(data.signal);
    });

    // Cleanup camera when leaving page
    return () => {
      socket.off('incoming_call');
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [user]);

  // NEW: Toggle Audio Function
  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // NEW: Toggle Video Function
  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const callUser = () => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream
    });

    peer.on('signal', (data) => {
      socket.emit('call_user', {
        userToCall: otherUserId,
        signalData: data,
        from: user?.id
      });
    });

    peer.on('stream', (currentStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }
    });

    socket.on('call_accepted', (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream
    });

    peer.on('signal', (data) => {
      socket.emit('answer_call', { signal: data, to: caller });
    });

    peer.on('stream', (currentStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = currentStream;
      }
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current?.destroy();
    navigate(-1); // Go back to previous page
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-900 rounded-lg overflow-hidden relative">
      {/* Header */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/60 to-transparent">
        <button onClick={() => navigate(-1)} className="text-white hover:text-gray-300 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-white font-semibold">Nexus Video Chamber</h2>
        <div className="w-6" /> {/* Spacer */}
      </div>

      {/* Video Grid */}
      <div className="flex-1 flex flex-col md:flex-row justify-center items-center p-4 gap-4 mt-12">
        {/* My Video */}
        <div className="relative w-full md:w-1/2 max-w-2xl bg-black rounded-lg overflow-hidden shadow-lg border-2 border-gray-700">
          {stream ? (
            <video 
              playsInline 
              muted 
              ref={myVideo} 
              autoPlay 
              className={`w-full h-auto object-cover transform scale-x-[-1] transition-opacity ${isVideoOff ? 'opacity-0' : 'opacity-100'}`} 
            />
          ) : (
            <div className="w-full aspect-video flex items-center justify-center text-gray-500">Starting camera...</div>
          )}
          {isVideoOff && (
             <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white font-medium">
               Camera Disabled
             </div>
          )}
          <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded text-white text-sm backdrop-blur-sm">
            You {isMuted ? '(Muted)' : ''}
          </div>
        </div>

        {/* Their Video */}
        {callAccepted && !callEnded ? (
          <div className="relative w-full md:w-1/2 max-w-2xl bg-black rounded-lg overflow-hidden shadow-lg border-2 border-primary-500">
            <video playsInline ref={userVideo} autoPlay className="w-full h-auto object-cover" />
            <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded text-white text-sm backdrop-blur-sm">
              Remote User
            </div>
          </div>
        ) : (
          <div className="w-full md:w-1/2 max-w-2xl aspect-video bg-gray-800 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-700 p-8">
            {receivingCall && !callAccepted ? (
              <div className="text-center animate-pulse">
                <h3 className="text-xl text-white font-bold mb-4">Incoming Call...</h3>
                <Button variant="primary" onClick={answerCall} leftIcon={<Phone size={18} />}>
                  Answer Call
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <h3 className="text-gray-400 mb-4">Ready to connect</h3>
                <Button variant="outline" className="text-white border-white hover:bg-white hover:text-gray-900 transition-colors" onClick={callUser} leftIcon={<Phone size={18} />}>
                  Start Call
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* NEW: Updated Call Controls Footer */}
      <div className="p-6 flex justify-center gap-6 bg-gray-900 border-t border-gray-800">
        <button 
          onClick={toggleAudio}
          className={`p-4 rounded-full flex items-center justify-center transition-colors ${
            isMuted ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-700 text-white hover:bg-gray-600'
          }`}
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>

        <button 
          onClick={toggleVideo}
          className={`p-4 rounded-full flex items-center justify-center transition-colors ${
            isVideoOff ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-700 text-white hover:bg-gray-600'
          }`}
          title={isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
        >
          {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
        </button>

        {callAccepted && !callEnded && (
          <button 
            onClick={leaveCall}
            className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 flex items-center justify-center transition-colors shadow-lg shadow-red-900/50"
            title="End Call"
          >
            <PhoneOff size={24} />
          </button>
        )}
      </div>
    </div>
  );
};
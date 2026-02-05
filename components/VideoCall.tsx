import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { Mic, MicOff, Video, VideoOff, PhoneOff, ShieldCheck, User as UserIcon } from 'lucide-react';
import { Peer, MediaConnection } from 'peerjs';

interface VideoCallProps {
  onEndCall: () => void;
  activeId: string | null;
  isGroup: boolean;
  participants: User[];
  isVoiceOnly: boolean;
  peer: Peer | null;
}

const VideoCall: React.FC<VideoCallProps> = ({ onEndCall, activeId, isGroup, participants, isVoiceOnly, peer }) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(isVoiceOnly);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    async function startMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: !isVoiceOnly,
          audio: true
        });
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        peer?.on('call', (call) => {
          call.answer(stream);
          call.on('stream', (remoteStream) => {
            setRemoteStreams(prev => new Map(prev).set(call.peer, remoteStream));
          });
        });

        participants.forEach(p => {
          const remotePeerId = (p as any).peerId;
          if (remotePeerId && peer && remotePeerId !== peer.id) {
            const call = peer.call(remotePeerId, stream);
            call.on('stream', (remoteStream) => {
              setRemoteStreams(prev => new Map(prev).set(remotePeerId, remoteStream));
            });
          }
        });

      } catch (err) {
        console.error("Media error:", err);
      }
    }

    startMedia();

    return () => {
      localStream?.getTracks().forEach(t => t.stop());
    };
  }, [peer]);

  const allStreamEntries = Array.from(remoteStreams.entries());
  const gridClass = (allStreamEntries.length + 1) <= 1 ? 'grid-cols-1' : (allStreamEntries.length + 1) <= 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3';

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 p-6">
      <div className={`flex-1 grid ${gridClass} gap-4`}>
        <div className="relative rounded-[2rem] overflow-hidden bg-zinc-900 border border-emerald-500/20 shadow-2xl">
          <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[9px] uppercase font-black tracking-widest text-zinc-300">
            YOU
          </div>
          {!isCameraOff ? (
            <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-900">
               <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center border border-white/5">
                  <UserIcon size={32} className="text-zinc-600" />
               </div>
            </div>
          )}
        </div>

        {allStreamEntries.map(([peerId, stream]) => (
          <div key={peerId} className="relative rounded-[2rem] overflow-hidden bg-zinc-900 border border-white/5 shadow-2xl">
            <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[9px] uppercase font-black tracking-widest text-zinc-300">
              PEER: {peerId.slice(-4)}
            </div>
            <video 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover" 
              ref={v => { if (v) v.srcObject = stream; }} 
            />
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-center gap-6">
        <button onClick={() => setIsMuted(!isMuted)} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isMuted ? 'bg-red-600' : 'bg-zinc-900 border border-white/5'}`}>
          {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
        <button onClick={onEndCall} className="w-18 h-18 rounded-[2rem] bg-red-600 text-white flex items-center justify-center hover:scale-110 transition-all">
          <PhoneOff size={28} />
        </button>
        {!isVoiceOnly && (
          <button onClick={() => setIsCameraOff(!isCameraOff)} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isCameraOff ? 'bg-red-600' : 'bg-zinc-900 border border-white/5'}`}>
            {isCameraOff ? <VideoOff size={20} /> : <Video size={20} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoCall;

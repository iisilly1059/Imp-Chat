
import React, { useState, useEffect, useRef } from 'react';
import { Message, User, Group } from '../types';
import { ShieldCheck, Video, Phone, Paperclip, ArrowUp, Lock, Ghost, MoreHorizontal, Users } from 'lucide-react';

interface ChatWindowProps {
  activeId: string | null;
  isGroup: boolean;
  messages: Message[];
  contacts: User[];
  friends: User[];
  groups: Group[];
  currentUser: User;
  onSendMessage: (text: string) => void;
  onStartCall: (voice: boolean) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  activeId, 
  isGroup, 
  messages, 
  contacts, 
  friends,
  groups, 
  currentUser,
  onSendMessage,
  onStartCall
}) => {
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!activeId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center mb-6 border border-zinc-800">
          <Lock size={24} className="text-zinc-700" />
        </div>
        <h2 className="text-lg font-black mb-2 uppercase tracking-tight">ENCRYPTED BRIDGE IDLE</h2>
        <p className="text-[9px] text-zinc-600 max-w-xs leading-relaxed uppercase font-black tracking-[0.3em]">Handshake required. Select a peer node.</p>
      </div>
    );
  }

  const activeEntity = isGroup 
    ? groups.find(g => g.id === activeId)
    : (friends.find(f => f.id === activeId) || contacts.find(c => c.id === activeId));

  const filteredMessages = messages.filter(m => 
    isGroup ? m.groupId === activeId : (
      (m.senderId === activeId && m.receiverId === currentUser.id) ||
      (m.senderId === currentUser.id && m.receiverId === activeId)
    )
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-black/5">
      <header className="h-16 px-6 flex items-center justify-between border-b border-white/5 bg-zinc-950/30 backdrop-blur-xl z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            {isGroup ? (
              <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center border border-white">
                <Users size={18} />
              </div>
            ) : (
              <img src={(activeEntity as User)?.pfp} className="w-10 h-10 rounded-full ring-1 ring-zinc-800" />
            )}
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-black rounded-full"></div>
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-black tracking-tight text-white truncate">{(activeEntity as any)?.username || (activeEntity as any)?.name}</h2>
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={10} className="text-emerald-500" />
              <span className="text-[8px] text-emerald-500 font-black uppercase tracking-widest">VERIFIED</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onStartCall(true)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-900 border border-white/5 text-zinc-500 hover:text-white transition-all">
            <Phone size={14} />
          </button>
          <button onClick={() => onStartCall(false)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-900 border border-white/5 text-zinc-500 hover:text-white transition-all">
            <Video size={14} />
          </button>
          <div className="w-px h-5 bg-white/5 mx-1"></div>
          <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-900 border border-white/5 text-zinc-500 hover:text-white transition-all">
            <MoreHorizontal size={14} />
          </button>
        </div>
      </header>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-8 space-y-6 scrollbar-hide"
      >
        {filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 opacity-10">
            <Ghost size={48} className="mb-4" />
            <p className="text-[9px] font-black uppercase tracking-widest text-center leading-loose">HISTORY PURGED OR VACANT</p>
          </div>
        ) : (
          filteredMessages.map((msg, i) => {
            const isMe = msg.senderId === currentUser.id;
            const sender = (friends.find(f => f.id === msg.senderId) || contacts.find(c => c.id === msg.senderId) || currentUser);
            
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`flex gap-3 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  {!isMe && isGroup && (
                    <img src={sender.pfp} className="w-7 h-7 rounded-full self-end mb-1 border border-zinc-800 shadow-xl opacity-70" />
                  )}
                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-2.5 rounded-2xl text-[13px] font-medium leading-relaxed tracking-tight ${
                      isMe 
                      ? 'bg-white text-black rounded-br-none shadow-lg' 
                      : 'bg-zinc-900 border border-white/5 text-zinc-200 rounded-bl-none shadow-lg'
                    }`}>
                      {msg.originalText || msg.text}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5 px-1 opacity-40">
                      <span className="text-[7px] font-black uppercase tracking-widest text-zinc-500">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isMe && <ShieldCheck size={8} className="text-emerald-500" />}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <footer className="px-6 pb-6">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto flex items-center gap-3 bg-zinc-900/40 p-2 pl-6 rounded-2xl border border-white/5 focus-within:border-white/20 transition-all backdrop-blur-2xl">
          <input 
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Transmit secure bytes..."
            className="flex-1 bg-transparent text-xs font-semibold py-2.5 focus:outline-none placeholder:text-zinc-700 text-white"
          />
          <div className="flex items-center gap-1">
            <button type="button" className="w-9 h-9 rounded-full text-zinc-600 hover:text-white transition-colors">
              <Paperclip size={16} />
            </button>
            <button 
              type="submit"
              className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              <ArrowUp size={18} />
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
};

export default ChatWindow;

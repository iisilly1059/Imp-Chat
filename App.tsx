
import React, { useState, useEffect, useRef } from 'react';
import { AppView, AppState, Message, User, Group } from './types';
import { SYSTEM_OGG_URL } from './constants';
import { ParticleBackground } from './components/ParticleBackground';
import { socket } from './services/socketService';
import { UsersDB, MessagesDB, GroupsDB } from './services/databaseService';
import { CryptoService } from './services/cryptoService';

import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import VideoCall from './components/VideoCall';
import Settings from './components/Settings';
import Auth from './components/Auth';
import Profile from './components/Profile';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    currentUser: null,
    currentView: AppView.LOGIN,
    activeChatId: null,
    viewingProfileId: null,
    isGroupChat: false,
    messages: [],
    groups: [],
    contacts: [],
    friends: [],
    pendingFriendRequests: [],
    activeCallParticipants: [],
    isVoiceOnly: false,
    connected: false,
    settings: {
      oggEnabled: false,
      particlesEnabled: true,
      encryptionLevel: 'Military'
    }
  });

  const privateKeyRef = useRef<CryptoKey | null>(null);
  const [myPeerId, setMyPeerId] = useState('');

  useEffect(() => {
    const init = async () => {
      const storedGroups = await GroupsDB.find();
      const storedMessages = await MessagesDB.find();
      
      const persistentUserStr = localStorage.getItem('imp_user');
      if (persistentUserStr) {
        const user = JSON.parse(persistentUserStr);
        // Regenerate keys on session resume for security, though in a real app 
        // you'd likely store the keys in IndexedDB.
        const keyPair = await CryptoService.generateKeyPair();
        privateKeyRef.current = keyPair.privateKey;
        user.publicKey = await CryptoService.exportPublicKey(keyPair.publicKey);
        
        const peerId = await socket.connect(user);
        setMyPeerId(peerId);
        
        setState(prev => ({ 
          ...prev, 
          currentUser: user, 
          currentView: AppView.CHAT,
          groups: storedGroups,
          messages: storedMessages,
          connected: true
        }));
      }
    };
    init();
  }, []);

  useEffect(() => {
    socket.on('messageReceived', async (msg: Message) => {
      const isForMe = msg.receiverId === state.currentUser?.id;
      const isForMyGroup = msg.groupId && state.groups.some(g => g.id === msg.groupId);

      if (!isForMe && !isForMyGroup) return;

      if (isForMe && msg.encrypted && privateKeyRef.current) {
        try {
          msg.originalText = await CryptoService.decrypt(msg.text, privateKeyRef.current);
        } catch (e) {
          msg.originalText = "[Decryption Failed]";
        }
      }
      
      setState(prev => {
        if (prev.messages.some(m => m.id === msg.id)) return prev;
        return { ...prev, messages: [...prev.messages, msg] };
      });
      MessagesDB.insertOne(msg);
    });

    socket.on('presence_announcement', (remoteUser: User & { peerId: string }) => {
      setState(prev => {
        const exists = prev.contacts.some(c => c.id === remoteUser.id);
        if (exists) return prev;
        return { ...prev, contacts: [...prev.contacts, remoteUser] };
      });
      if (state.currentUser) {
        socket.emit('presence_response', { ...state.currentUser, peerId: myPeerId }, remoteUser.peerId);
      }
    });

    socket.on('presence_response', (remoteUser: User & { peerId: string }) => {
      setState(prev => {
        const exists = prev.contacts.some(c => c.id === remoteUser.id);
        if (exists) return prev;
        return { ...prev, contacts: [...prev.contacts, remoteUser] };
      });
    });

    socket.on('user_connected', ({ peerId }) => {
      if (state.currentUser) {
        socket.emit('presence_announcement', { ...state.currentUser, peerId: myPeerId }, peerId);
      }
    });

    socket.on('group_sync', (group: Group) => {
      setState(prev => {
        const exists = prev.groups.some(g => g.id === group.id);
        if (exists) return prev;
        GroupsDB.insertOne(group);
        return { ...prev, groups: [...prev.groups, group] };
      });
    });

  }, [state.currentUser, myPeerId, state.groups]);

  const handleLogin = async (username: string, email: string, pfp: string) => {
    const userId = username.toLowerCase().replace(/\s/g, '_');
    const newUser: User = {
      id: userId,
      username,
      email,
      pfp,
      status: 'online',
      friends: [],
      pendingRequests: [],
      sentRequests: []
    };
    
    const keyPair = await CryptoService.generateKeyPair();
    privateKeyRef.current = keyPair.privateKey;
    newUser.publicKey = await CryptoService.exportPublicKey(keyPair.publicKey);

    const peerId = await socket.connect(newUser);
    setMyPeerId(peerId);
    localStorage.setItem('imp_user', JSON.stringify(newUser));
    
    setState(prev => ({ ...prev, currentUser: newUser, currentView: AppView.CHAT, connected: true }));
  };

  const handleConnectToPeer = (id: string) => {
    socket.connectToPeer(id);
  };

  const handleCreateGroup = (name: string, memberIds: string[]) => {
    if (!state.currentUser) return;
    
    const newGroup: Group = {
      id: `group-${Math.random().toString(36).substr(2, 9)}`,
      name,
      members: [state.currentUser.id, ...memberIds],
      lastMessage: 'Group created'
    };

    GroupsDB.insertOne(newGroup);
    setState(prev => ({ ...prev, groups: [...prev.groups, newGroup] }));

    memberIds.forEach(mId => {
      const member = state.contacts.find(c => c.id === mId) as any;
      if (member?.peerId) {
        socket.emit('group_sync', newGroup, member.peerId);
      }
    });
  };

  const handleSendMessage = async (text: string) => {
    if (!state.currentUser || !state.activeChatId) return;

    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: state.currentUser.id,
      text: '',
      timestamp: Date.now(),
      encrypted: !state.isGroupChat,
      originalText: text
    };

    if (state.isGroupChat) {
      newMessage.groupId = state.activeChatId;
      newMessage.text = text;
      
      const group = state.groups.find(g => g.id === state.activeChatId);
      if (group) {
        group.members.forEach(memberId => {
          if (memberId === state.currentUser?.id) return;
          const member = state.contacts.find(c => c.id === memberId) as any;
          if (member?.peerId) {
            socket.emit('messageReceived', newMessage, member.peerId);
          }
        });
      }
    } else {
      newMessage.receiverId = state.activeChatId;
      const receiver = state.contacts.find(c => c.id === state.activeChatId);
      if (receiver?.publicKey) {
        const pubKey = await CryptoService.importPublicKey(receiver.publicKey);
        newMessage.text = await CryptoService.encrypt(text, pubKey);
      } else {
        newMessage.text = text;
      }

      const peerContact = receiver as any;
      if (peerContact?.peerId) {
        socket.emit('messageReceived', newMessage, peerContact.peerId);
      }
    }

    setState(prev => ({ ...prev, messages: [...prev.messages, newMessage] }));
    MessagesDB.insertOne(newMessage);
  };

  const viewingUser = state.viewingProfileId === state.currentUser?.id 
    ? { ...state.currentUser!, peerId: myPeerId }
    : state.contacts.find(c => c.id === state.viewingProfileId);

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden font-sans">
      {state.settings.particlesEnabled && <ParticleBackground />}
      
      {state.currentView === AppView.LOGIN ? (
        <Auth onLogin={handleLogin} />
      ) : (
        <>
          <Sidebar 
            contacts={state.contacts}
            groups={state.groups}
            friends={state.friends}
            pendingRequests={state.pendingFriendRequests}
            activeId={state.activeChatId}
            onSelect={(id, isGroup) => setState(prev => ({ ...prev, activeChatId: id, isGroupChat: isGroup, currentView: AppView.CHAT }))}
            onViewProfile={(id) => setState(prev => ({ ...prev, viewingProfileId: id, currentView: AppView.PROFILE }))}
            onCreateGroup={handleCreateGroup} 
            onAddFriend={() => {}}
            onAcceptRequest={() => {}}
            onDeclineRequest={() => {}}
            onSettings={() => setState(prev => ({ ...prev, currentView: AppView.SETTINGS }))}
            onLogout={() => { 
              socket.disconnect(); 
              localStorage.removeItem('imp_user');
              setState(prev => ({ ...prev, currentUser: null, currentView: AppView.LOGIN, connected: false })); 
            }}
            currentUser={{ ...state.currentUser!, peerId: myPeerId } as any}
            connected={state.connected}
            onManualConnect={handleConnectToPeer}
          />
          
          <main className="flex-1 flex flex-col relative z-10">
            {state.currentView === AppView.CHAT && (
              <ChatWindow 
                activeId={state.activeChatId}
                isGroup={state.isGroupChat}
                messages={state.messages}
                contacts={state.contacts}
                friends={state.friends}
                groups={state.groups}
                currentUser={state.currentUser!}
                onSendMessage={handleSendMessage}
                onStartCall={(voice) => setState(prev => ({ ...prev, currentView: AppView.VIDEO_CALL, isVoiceOnly: voice }))}
              />
            )}
            
            {state.currentView === AppView.PROFILE && viewingUser && (
              <Profile 
                user={viewingUser as any}
                onBack={() => setState(prev => ({ ...prev, currentView: AppView.CHAT }))}
                onMessage={(userId) => setState(prev => ({ ...prev, activeChatId: userId, isGroupChat: false, currentView: AppView.CHAT }))}
                onCall={(userId) => setState(prev => ({ ...prev, activeChatId: userId, currentView: AppView.VIDEO_CALL, isVoiceOnly: false }))}
              />
            )}

            {state.currentView === AppView.VIDEO_CALL && (
              <VideoCall 
                onEndCall={() => setState(prev => ({ ...prev, currentView: AppView.CHAT }))}
                activeId={state.activeChatId}
                isGroup={state.isGroupChat}
                participants={[state.currentUser!, ...state.contacts.slice(0, 3)]}
                isVoiceOnly={state.isVoiceOnly}
                peer={socket.getPeerInstance()}
              />
            )}
            
            {state.currentView === AppView.SETTINGS && (
              <Settings 
                settings={state.settings}
                updateSettings={s => setState(prev => ({ ...prev, settings: s }))}
                onBack={() => setState(prev => ({ ...prev, currentView: AppView.CHAT }))}
              />
            )}
          </main>
        </>
      )}
    </div>
  );
};

export default App;

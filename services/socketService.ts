import { Peer } from 'peerjs';
import { io, Socket } from 'socket.io-client';
import { User, Message } from '../types';

type SocketCallback = (data: any) => void;

class GlobalPeerSocket {
  private peer: Peer | null = null;
  private socket: Socket | null = null;
  private handlers: { [key: string]: SocketCallback[] } = {};
  public myPeerId: string = '';
  public connected: boolean = false;

  private BACKEND_URL = 'https://imp-chat.onrender.com'; 

  constructor() {}

  async connect(user: User): Promise<string> {
    return new Promise((resolve) => {
      this.socket = io(this.BACKEND_URL, {
        auth: { user },
        transports: ['websocket']
      });

      this.socket.on('connect', () => {
        this.connected = true;
      });

      const peerId = `imp-${user.id}-${Math.random().toString(36).substr(2, 4)}`;
      this.peer = new Peer(peerId, {
        config: {
          'iceServers': [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        }
      });

      this.peer.on('open', (id) => {
        this.myPeerId = id;
        this.socket?.emit('sync_peer_id', id);
        resolve(id);
      });

      this.socket.onAny((event, payload) => {
        if (this.handlers[event]) {
          this.handlers[event].forEach(cb => cb(payload));
        }
      });
    });
  }

  on(event: string, callback: SocketCallback) {
    if (!this.handlers[event]) this.handlers[event] = [];
    this.handlers[event].push(callback);
  }

  emit(event: string, payload: any, targetId?: string) {
    if (!this.socket) return;
    if (targetId) {
      this.socket.emit(event, { ...payload, targetId });
    } else {
      this.socket.emit(event, payload);
    }
  }

  joinRoom(roomId: string) {
    this.socket?.emit('join_room', roomId);
  }

  getPeerInstance() {
    return this.peer;
  }

  disconnect() {
    this.socket?.disconnect();
    this.peer?.destroy();
    this.connected = false;
  }

  connectToPeer(targetPeerId: string) {
     this.socket?.emit('request_handshake', targetPeerId);
  }
}

export const socket = new GlobalPeerSocket();

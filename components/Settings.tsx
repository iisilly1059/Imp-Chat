import React, { useState } from 'react';
import { AppState, User } from '../types';
import { ArrowLeft, Monitor, Music, Shield, AlertTriangle, User as UserIcon, ShieldAlert } from 'lucide-react';

interface SettingsProps {
  settings: AppState['settings'];
  currentUser: User;
  updateSettings: (s: AppState['settings']) => void;
  updateBio: (bio: string) => void;
  onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, currentUser, updateSettings, updateBio, onBack }) => {
  const [bio, setBio] = useState(currentUser.bio || '');

  return (
    <div className="flex-1 flex flex-col p-10 max-w-4xl mx-auto w-full overflow-y-auto scrollbar-hide">
      <div className="flex items-center gap-6 mb-16">
        <button onClick={onBack} className="p-4 bg-zinc-900 rounded-3xl text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all border border-zinc-800">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-black tracking-tighter">NODE PREFERENCES</h1>
      </div>

      <div className="space-y-16">
        <section>
          <h2 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.4em] mb-8 flex items-center gap-2">
            <UserIcon size={12} /> Personal Metadata
          </h2>
          <div className="space-y-4">
            <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem]">
              <div className="font-black text-sm uppercase tracking-wider mb-4">Node Description (About Me)</div>
              <textarea 
                value={bio}
                onChange={(e) => {
                  setBio(e.target.value);
                  updateBio(e.target.value);
                }}
                className="w-full bg-black border border-zinc-800 rounded-2xl p-4 text-xs font-medium text-zinc-300 focus:outline-none focus:border-white min-h-[120px] transition-all"
                placeholder="Share your technical background, alias details, or node status..."
              />
              <p className="text-[9px] text-zinc-600 mt-3 font-bold uppercase tracking-widest">This metadata will be visible during peer handshakes.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.4em] mb-8 flex items-center gap-2">
            <Shield size={12} /> Crypto Layer & Safety
          </h2>
          <div className="space-y-4">
             <div className="flex items-center justify-between p-8 bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <ShieldAlert size={20} className="text-emerald-500" />
                </div>
                <div>
                  <div className="font-black text-sm uppercase tracking-wider">Profanity Shield</div>
                  <div className="text-[11px] text-zinc-500 font-medium mt-1">Filter out "wild shit" and offensive language from transmissions.</div>
                </div>
              </div>
              <button 
                onClick={() => updateSettings({ ...settings, filterEnabled: !settings.filterEnabled })}
                className={`w-16 h-9 rounded-full relative transition-all ${settings.filterEnabled ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-zinc-800'}`}
              >
                <div className={`absolute top-1 w-7 h-7 rounded-full transition-all ${
                  settings.filterEnabled ? 'left-8 bg-black' : 'left-1 bg-zinc-500'
                }`}></div>
              </button>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.4em] mb-8 flex items-center gap-2">
            <Monitor size={12} /> Environment Visuals
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-8 bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem]">
              <div>
                <div className="font-black text-sm uppercase tracking-wider">Mesh Particles</div>
                <div className="text-[11px] text-zinc-500 font-medium mt-1">Render atmospheric debris in the node background.</div>
              </div>
              <button 
                onClick={() => updateSettings({ ...settings, particlesEnabled: !settings.particlesEnabled })}
                className={`w-16 h-9 rounded-full relative transition-all ${settings.particlesEnabled ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'bg-zinc-800'}`}
              >
                <div className={`absolute top-1 w-7 h-7 rounded-full transition-all ${
                  settings.particlesEnabled ? 'left-8 bg-black' : 'left-1 bg-zinc-500'
                }`}></div>
              </button>
            </div>
          </div>
        </section>

        <div className="p-8 bg-red-950/10 border border-red-900/30 rounded-[2.5rem] flex items-center justify-between mt-12 mb-20">
          <div className="text-red-500 text-[11px] font-black uppercase tracking-widest flex items-center gap-3">
            <AlertTriangle size={16} /> Wipe Node Cache?
          </div>
          <button className="px-8 py-3 bg-red-900/40 text-red-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-xl">
            PURGE
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;


import React from 'react';
import { AppState } from '../types';
import { ArrowLeft, Monitor, Music, Shield, AlertTriangle } from 'lucide-react';

interface SettingsProps {
  settings: AppState['settings'];
  updateSettings: (s: AppState['settings']) => void;
  onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, updateSettings, onBack }) => {
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

        <section>
          <h2 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.4em] mb-8 flex items-center gap-2">
            <Music size={12} /> Audio Frequencies
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-8 bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem]">
              <div>
                <div className="font-black text-sm uppercase tracking-wider">Atmosphere Loop</div>
                <div className="text-[11px] text-zinc-500 font-medium mt-1">Sustain low-frequency acoustic privacy barrier.</div>
              </div>
              <button 
                onClick={() => updateSettings({ ...settings, oggEnabled: !settings.oggEnabled })}
                className={`w-16 h-9 rounded-full relative transition-all ${settings.oggEnabled ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'bg-zinc-800'}`}
              >
                <div className={`absolute top-1 w-7 h-7 rounded-full transition-all ${
                  settings.oggEnabled ? 'left-8 bg-black' : 'left-1 bg-zinc-500'
                }`}></div>
              </button>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.4em] mb-8 flex items-center gap-2">
            <Shield size={12} /> Crypto Layer
          </h2>
          <div className="grid grid-cols-3 gap-6">
            {(['Standard', 'Military', 'Quantum'] as const).map(level => (
              <button
                key={level}
                onClick={() => updateSettings({ ...settings, encryptionLevel: level })}
                className={`p-8 border rounded-[2rem] text-left transition-all ${
                  settings.encryptionLevel === level 
                  ? 'bg-white border-white text-black shadow-2xl' 
                  : 'bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                }`}
              >
                <div className="text-[10px] uppercase font-black tracking-widest mb-2">{level}</div>
                <div className="text-[11px] opacity-70 font-medium">
                  {level === 'Standard' && 'AES-256 Base'}
                  {level === 'Military' && 'SHA-512 + Salting'}
                  {level === 'Quantum' && 'Lattice-X Mesh'}
                </div>
              </button>
            ))}
          </div>
        </section>

        <div className="p-8 bg-red-950/10 border border-red-900/30 rounded-[2.5rem] flex items-center justify-between mt-12">
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

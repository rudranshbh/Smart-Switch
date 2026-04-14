import { useState, useEffect, FormEvent } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollection, useDocument } from 'react-firebase-hooks/firestore';
import { collection, doc, updateDoc, setDoc } from 'firebase/firestore';
import { auth, db, loginWithEmail, signOut } from './firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Power, Lightbulb, Zap, LogOut } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SwitchData {
  id: string;
  name: string;
  state: boolean;
  type: 'bulb' | 'plug';
}

interface UserConfig {
  roomNumber: string;
  email: string;
  profilePic: string;
  password?: string;
}

export default function App() {
  const [user, authLoading] = useAuthState(auth);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [configValue] = useDocument(doc(db, 'config', 'user'));
  const config = configValue?.data() as UserConfig | undefined;

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  if (authLoading) {
    return <div className="min-h-screen bg-[#020617] flex items-center justify-center"><Zap className="w-8 h-8 text-cyan-500 animate-pulse" /></div>;
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'bg-[#020617]' : 'bg-slate-100'}`}>
      <div className="max-w-md mx-auto p-4 sm:p-6">
        <header className="flex items-center justify-between mb-8 mt-4">
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              SMART<span className="text-cyan-500">SWITCH</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              <span className={`text-xs font-bold tracking-widest uppercase ${theme === 'dark' ? 'text-cyan-500/80' : 'text-cyan-600'}`}>
                {user ? 'System Online' : 'Authentication'}
              </span>
            </div>
          </div>

          {user && (
            <div className={`flex items-center gap-3 p-2 pr-4 rounded-full border ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} backdrop-blur-md`}>
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center overflow-hidden">
                <img 
                  src={config?.profilePic || "https://lh3.googleusercontent.com/d/12CB9vV3Tu0AV9vfkdyw81TasNBOmaDQa"} 
                  alt="User Profile" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col hidden sm:flex">
                <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{config?.roomNumber || 'B-106'}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={signOut} className="rounded-full hover:bg-red-500/10 hover:text-red-400 ml-1">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </header>

        {user ? (
          <DashboardView theme={theme} setTheme={setTheme} />
        ) : (
          <AuthView theme={theme} config={config} />
        )}

        <footer className="mt-16 pb-8 text-center">
          <p className={`text-[9px] font-black tracking-[0.4em] uppercase ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'} flex items-center justify-center gap-2`}>
            Made with <span className="text-red-500/80 animate-pulse">❤️</span> by RUDRANSH
          </p>
        </footer>
      </div>
    </div>
  );
}

function AuthView({ theme, config }: { theme: 'dark' | 'light', config?: UserConfig }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (config) {
        if (email !== config.email || password !== config.password) {
          throw new Error('Invalid credentials provided.');
        }
      }
      await loginWithEmail(email, password);
    } catch (err: any) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-sm mx-auto">
        <Card className={`border-0 shadow-2xl ${theme === 'dark' ? 'bg-slate-900/60 shadow-cyan-900/20' : 'bg-white/80 shadow-slate-200/50'} backdrop-blur-2xl overflow-hidden rounded-[2rem]`}>
          <CardContent className="p-8">
            <div className="mb-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Power className="w-8 h-8 text-white" />
              </div>
              <h2 className={`text-2xl font-black tracking-tight mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>ACCESS PORTAL</h2>
              <p className={`text-xs font-bold tracking-widest uppercase ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Enter credentials to continue</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</Label>
                <Input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`h-12 rounded-xl px-4 text-sm font-medium border-0 ring-1 ring-inset ${theme === 'dark' ? 'bg-slate-950/50 ring-slate-800 focus-visible:ring-cyan-500 text-white' : 'bg-slate-50 ring-slate-200 focus-visible:ring-cyan-500 text-slate-900'} transition-all`}
                  placeholder={config?.email || "admin@b106.com"}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Password</Label>
                <Input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`h-12 rounded-xl px-4 text-sm font-medium border-0 ring-1 ring-inset ${theme === 'dark' ? 'bg-slate-950/50 ring-slate-800 focus-visible:ring-cyan-500 text-white' : 'bg-slate-50 ring-slate-200 focus-visible:ring-cyan-500 text-slate-900'} transition-all`}
                  placeholder="••••••••"
                  required 
                />
              </div>
              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-bold text-red-400 text-center bg-red-400/10 py-2 rounded-lg">
                  {error}
                </motion.p>
              )}
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold tracking-wide shadow-lg shadow-cyan-500/25 transition-all active:scale-[0.98]"
              >
                {loading ? 'VERIFYING...' : 'INITIALIZE LINK'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function DashboardView({ theme, setTheme }: { theme: 'dark' | 'light', setTheme: (t: 'dark' | 'light') => void }) {
  const [switchesValue] = useCollection(collection(db, 'switches'));
  const switches = switchesValue?.docs.map(d => ({ id: d.id, ...d.data() } as SwitchData)) || [];

  // Initialize switches if they don't exist
  useEffect(() => {
    if (switchesValue && switches.length === 0) {
      const initialSwitches: SwitchData[] = [
        { id: '0', name: 'Bulb 1', state: false, type: 'bulb' },
        { id: '1', name: 'Bulb 2', state: false, type: 'bulb' },
        { id: '2', name: 'Plug 1', state: false, type: 'plug' },
        { id: '3', name: 'Plug 2', state: false, type: 'plug' },
      ];
      initialSwitches.forEach(s => {
        setDoc(doc(db, 'switches', s.id), s);
      });
    }
  }, [switchesValue, switches.length]);

  // Master Sync Engine: Keeps status/sync document updated for the ESP32
  const switchStatesStr = switches.map(s => s.state).join(',');
  useEffect(() => {
    if (switches.length === 4) {
      const states = switches.sort((a, b) => a.id.localeCompare(b.id)).map(s => s.state);
      setDoc(doc(db, 'status', 'sync'), { states }, { merge: true }).catch(console.error);
    }
  }, [switchStatesStr]);

  const toggleSwitch = (id: string, currentState: boolean) => {
    const newState = !currentState;
    
    // Optimistic update via Firestore
    updateDoc(doc(db, 'switches', id), { state: newState }).catch(console.error);

    // Immediately update sync to prevent ESP32 from reverting state
    if (switches.length === 4) {
      const newStates = switches.sort((a, b) => a.id.localeCompare(b.id)).map(s => s.id === id ? newState : s.state);
      setDoc(doc(db, 'status', 'sync'), { states: newStates }, { merge: true }).catch(console.error);
    }
  };

  const allOff = () => {
    switches.forEach(s => updateDoc(doc(db, 'switches', s.id), { state: false }).catch(console.error));
    setDoc(doc(db, 'status', 'sync'), { states: [false, false, false, false] }, { merge: true }).catch(console.error);
  };

  const allOn = () => {
    switches.forEach(s => updateDoc(doc(db, 'switches', s.id), { state: true }).catch(console.error));
    setDoc(doc(db, 'status', 'sync'), { states: [true, true, true, true] }, { merge: true }).catch(console.error);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4">
        <Button 
          onClick={allOn}
          className="h-14 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-500 border border-cyan-500/20 font-bold tracking-wide"
        >
          <Zap className="w-4 h-4 mr-2" /> TURN ALL ON
        </Button>
        <Button 
          onClick={allOff}
          className={`h-14 rounded-2xl ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'} font-bold tracking-wide`}
        >
          <Power className="w-4 h-4 mr-2" /> TURN ALL OFF
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AnimatePresence>
          {switches.sort((a, b) => a.id.localeCompare(b.id)).map((s) => (
            <motion.div key={s.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <Card className={`relative overflow-hidden transition-all duration-300 ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200 shadow-sm'} ${s.state ? 'bg-cyan-500/10 ring-1 ring-cyan-500/30' : (theme === 'dark' ? 'bg-slate-900/40' : 'bg-white')}`}>
                {s.state && <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/20 blur-[40px] rounded-full pointer-events-none" />}
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-8">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-300 ${s.state ? 'bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)]' : (theme === 'dark' ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400')}`}>
                      {s.type === 'bulb' ? <Lightbulb className="w-7 h-7" /> : <Zap className="w-7 h-7" />}
                    </div>
                    <Switch 
                      checked={s.state} 
                      onCheckedChange={() => toggleSwitch(s.id, s.state)}
                      className="data-[state=checked]:bg-cyan-500"
                    />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{s.name}</h3>
                    <p className={`text-sm font-medium transition-colors duration-300 ${s.state ? 'text-cyan-500' : (theme === 'dark' ? 'text-slate-500' : 'text-slate-600')}`}>
                      {s.state ? 'ACTIVE' : 'INACTIVE'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      <div className="flex justify-center pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className={`rounded-full ${theme === 'dark' ? 'border-slate-800 text-slate-400 hover:text-white' : 'border-slate-300 text-slate-600 hover:text-slate-900'}`}
        >
          {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </Button>
      </div>
    </div>
  );
}

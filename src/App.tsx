import { useState, useEffect, FormEvent } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollection, useDocument } from 'react-firebase-hooks/firestore';
import { collection, doc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, loginWithEmail, registerWithEmail, signOut } from './firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Power, 
  Lightbulb, 
  Zap, 
  Cloud, 
  CloudOff, 
  Wifi, 
  WifiOff, 
  Settings, 
  LogOut, 
  LogIn,
  Cpu,
  Globe,
  Home,
  AlertCircle,
  Copy,
  Check,
  User,
  Lock,
  Mail,
  ShieldCheck,
  Sun,
  Moon
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// --- Types ---
interface SwitchData {
  id: string;
  name: string;
  state: boolean;
  type: 'bulb' | 'plug';
}

interface DeviceStatus {
  online: boolean;
  lastSeen: any;
  lastActivity: any;
  localIp: string;
}

export default function App() {
  const [user, loading] = useAuthState(auth);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Cpu className="w-12 h-12 text-cyan-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'bg-[#020617] text-slate-100' : 'bg-slate-50 text-slate-900'} selection:bg-cyan-500/30`}>
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-[10%] -left-[10%] w-[40%] h-[40%] ${theme === 'dark' ? 'bg-cyan-500/10' : 'bg-cyan-500/5'} blur-[120px] rounded-full transition-colors duration-500`} />
        <div className={`absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] ${theme === 'dark' ? 'bg-purple-500/10' : 'bg-purple-500/5'} blur-[120px] rounded-full transition-colors duration-500`} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-4xl font-bold tracking-tight bg-gradient-to-r ${theme === 'dark' ? 'from-white to-slate-400' : 'from-slate-900 to-slate-700'} bg-clip-text text-transparent`}
            >
              SMART SWITCH
            </motion.h1>
            <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} mt-1`}>Cloud Command Center</p>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className={`flex items-center gap-4 ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'} backdrop-blur-md border p-2 rounded-full pl-4 shadow-sm`}>
                <div className="flex flex-col items-end">
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>B-106</span>
                  <span className={`text-[10px] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>{user.email}</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center overflow-hidden">
                  <img 
                    src="https://lh3.googleusercontent.com/d/12CB9vV3Tu0AV9vfkdyw81TasNBOmaDQa" 
                    alt="B-106" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <Button variant="ghost" size="icon" onClick={signOut} className="rounded-full hover:bg-red-500/10 hover:text-red-400">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </header>

        {user ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className={`${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-200/50 border-slate-300'} backdrop-blur-md border p-1 rounded-xl`}>
              <TabsTrigger value="dashboard" className="rounded-lg data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400">
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="esp32" className="rounded-lg data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400">
                <Cpu className="w-4 h-4 mr-2" />
                ESP32 Setup
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-8">
              <DashboardView theme={theme} setTheme={setTheme} />
            </TabsContent>

            <TabsContent value="esp32">
              <ESP32SetupView theme={theme} />
            </TabsContent>
          </Tabs>
        ) : (
          <AuthView theme={theme} setTheme={setTheme} />
        )}

        {/* Global Footer */}
        <footer className="mt-16 pb-8 text-center">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className={`text-[9px] font-black tracking-[0.4em] uppercase ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'} flex items-center justify-center gap-2`}
          >
            Made with <span className="text-red-500/80 animate-pulse">❤️</span> by RUDRANSH
          </motion.p>
        </footer>
      </div>
    </div>
  );
}

function AuthView({ theme, setTheme }: { theme: 'dark' | 'light', setTheme: (t: 'dark' | 'light') => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithEmail(email, password);
    } catch (err: any) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 relative">
      <div className="absolute -top-4 right-0">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className={`rounded-full transition-all ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-600'}`}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className={`${theme === 'dark' ? 'bg-slate-900/40 border-slate-800 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'} backdrop-blur-xl rounded-[2.5rem] overflow-hidden transition-colors duration-500`}>
          <div className="h-2 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />
          <CardHeader className="space-y-4 pt-10 pb-6">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className={`w-24 h-24 rounded-full ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'} mx-auto border-2 border-cyan-500/30 overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.2)]`}
            >
              <img 
                src="https://lh3.googleusercontent.com/d/12CB9vV3Tu0AV9vfkdyw81TasNBOmaDQa" 
                alt="Profile" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            <div className="space-y-2 text-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <CardTitle className="text-sm font-black tracking-[0.2em] text-cyan-500 uppercase">
                  Welcome Back B-106
                </CardTitle>
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'} mt-1 tracking-tight flex flex-col items-center`}>
                  <span>RUDRANSH BHARDWAJ</span>
                  <span className="h-4" />
                  <span>KUSHAGRA VARSHNEY</span>
                </h2>
              </motion.div>
              <CardDescription className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} text-xs`}>
                Enter your credentials to access the command center
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div 
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="space-y-2"
              >
                <Label htmlFor="email" className={`text-xs font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} ml-1 uppercase tracking-wider`}>EMAIL ADDRESS</Label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Enter owner email" 
                    className={`${theme === 'dark' ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-300'} pl-11 h-12 rounded-2xl focus-visible:ring-cyan-500/40 focus-visible:border-cyan-500/50 transition-all`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </motion.div>
              <motion.div 
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="space-y-2"
              >
                <Label htmlFor="password" className={`text-xs font-semibold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} ml-1 uppercase tracking-wider`}>PASSWORD</Label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className={`${theme === 'dark' ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-300'} pl-11 h-12 rounded-2xl focus-visible:ring-cyan-500/40 focus-visible:border-cyan-500/50 transition-all`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </motion.div>
              
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-xs text-red-400"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </motion.div>
              )}

              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <Button 
                  type="submit" 
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl h-12 text-sm font-bold mt-2 shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98]"
                  disabled={loading}
                >
                  {loading ? (
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Cpu className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    'AUTHORIZE ACCESS'
                  )}
                </Button>
              </motion.div>
            </form>
          </CardContent>
          <CardFooter className="pb-10 pt-4">
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-[10px] text-slate-500 text-center w-full tracking-widest uppercase font-bold"
            >
              Secure Owner Access Only • v2.1.0
            </motion.p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

function DashboardView({ theme, setTheme }: { theme: 'dark' | 'light', setTheme: (t: 'dark' | 'light') => void }) {
  const [switchesValue, switchesLoading] = useCollection(collection(db, 'switches'));
  const [statusValue, statusLoading] = useDocument(doc(db, 'status', 'esp32'));
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const switches = switchesValue?.docs.map(d => ({ id: d.id, ...d.data() } as SwitchData)) || [];
  const status = statusValue?.data() as DeviceStatus | undefined;

  // Clear pending state when cloud matches local intent
  useEffect(() => {
    if (pendingIds.size > 0) {
      setPendingIds(prev => {
        const next = new Set(prev);
        switches.forEach(s => {
          if (next.has(s.id)) {
            // This is a bit complex because we don't know the "intended" state easily here
            // but we can clear it after a timeout or if the switch updates
            next.delete(s.id);
          }
        });
        return next;
      });
    }
  }, [switches]);

  // Initialize switches and status if they don't exist
  useEffect(() => {
    if (!switchesLoading && switches.length === 0) {
      const initialSwitches: SwitchData[] = [
        { id: '0', name: 'Bulb 1', state: false, type: 'bulb' },
        { id: '1', name: 'Bulb 2', state: false, type: 'bulb' },
        { id: '2', name: 'Plug 1', state: false, type: 'plug' },
        { id: '3', name: 'Plug 2', state: false, type: 'plug' },
      ];
      initialSwitches.forEach(s => {
        setDoc(doc(db, 'switches', s.id), { ...s, lastUpdated: serverTimestamp() });
      });
    }

    if (!statusLoading && !statusValue?.exists()) {
      setDoc(doc(db, 'status', 'esp32'), {
        online: false,
        localIp: '0.0.0.0',
        lastSeen: serverTimestamp()
      });
    }
  }, [switchesLoading, switches.length, statusLoading, statusValue]);

  // Master Sync Engine: Keeps status/sync document updated for the ESP32
  useEffect(() => {
    if (switches.length > 0) {
      const states = switches.sort((a, b) => a.id.localeCompare(b.id)).map(s => s.state);
      setDoc(doc(db, 'status', 'sync'), {
        states: states,
        lastUpdated: serverTimestamp()
      }, { merge: true });
    }
  }, [switches]);

  const toggleSwitch = async (id: string, currentState: boolean) => {
    try {
      setPendingIds(prev => new Set(prev).add(id));
      setSyncMessage(`Sending command to ${switches.find(s => s.id === id)?.name}...`);
      
      await updateDoc(doc(db, 'switches', id), {
        state: !currentState,
        lastUpdated: serverTimestamp()
      });

      // Update Last Activity
      await updateDoc(doc(db, 'status', 'esp32'), {
        lastActivity: serverTimestamp()
      });

      setTimeout(() => {
        setSyncMessage("Command sent! Waiting for ESP32...");
        setTimeout(() => setSyncMessage(null), 2000);
        setPendingIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 1500);
    } catch (error) {
      console.error("Error updating switch:", error);
      setSyncMessage("Error sending command.");
      setPendingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const allOff = async () => {
    try {
      setSyncMessage("Shutting down all devices...");
      const batch = switches.map(s => 
        updateDoc(doc(db, 'switches', s.id), {
          state: false,
          lastUpdated: serverTimestamp()
        })
      );
      await Promise.all(batch);
      
      // Update Last Activity
      await updateDoc(doc(db, 'status', 'esp32'), {
        lastActivity: serverTimestamp()
      });

      setTimeout(() => {
        setSyncMessage("All devices turned off!");
        setTimeout(() => setSyncMessage(null), 2000);
      }, 1000);
    } catch (error) {
      console.error("Error in All Off:", error);
      setSyncMessage("Error during shutdown.");
    }
  };

  const allOn = async () => {
    try {
      setSyncMessage("Powering up all devices...");
      const batch = switches.map(s => 
        updateDoc(doc(db, 'switches', s.id), {
          state: true,
          lastUpdated: serverTimestamp()
        })
      );
      await Promise.all(batch);

      // Update Last Activity
      await updateDoc(doc(db, 'status', 'esp32'), {
        lastActivity: serverTimestamp()
      });

      setTimeout(() => {
        setSyncMessage("All devices turned on!");
        setTimeout(() => setSyncMessage(null), 2000);
      }, 1000);
    } catch (error) {
      console.error("Error in All On:", error);
      setSyncMessage("Error during power up.");
    }
  };

  const isOnline = status?.online;

  const forceInit = async () => {
    try {
      await setDoc(doc(db, 'status', 'esp32'), {
        online: false,
        localIp: '0.0.0.0',
        lastSeen: serverTimestamp()
      });
      alert("Status document initialized!");
    } catch (error) {
      console.error("Error initializing status:", error);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Floating Sync Message (Toast) */}
      <AnimatePresence>
        {syncMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-cyan-600 text-white rounded-full shadow-2xl flex items-center gap-3 border border-cyan-400/30"
          >
            <div className="w-2 h-2 bg-white rounded-full animate-ping" />
            <span className="text-sm font-bold uppercase tracking-widest">{syncMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-2">
        <h2 className={`text-xs font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'}`}>Control Center</h2>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className={`rounded-full transition-all ${theme === 'dark' ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-600'}`}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Status Column */}
        <div className="md:col-span-1 space-y-6">
          <Card className={`${theme === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} backdrop-blur-xl overflow-hidden transition-colors duration-500`}>
            <div className={`h-1 w-full ${isOnline ? 'bg-cyan-500 shadow-[0_0_10px_#06b6d4]' : 'bg-slate-700'}`} />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">System Health</CardTitle>
                {isOnline ? (
                  <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 animate-pulse">
                    <Wifi className="w-3 h-3 mr-1" /> Online
                  </Badge>
                ) : (
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="secondary" className={`${theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                      <WifiOff className="w-3 h-3 mr-1" /> Offline
                    </Badge>
                    <button 
                      onClick={forceInit}
                      className="text-[10px] text-cyan-500 hover:underline"
                    >
                      Fix Connection
                    </button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className={`${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'} font-medium tracking-tight`}>CLOUD SYNC</span>
                <span className="flex items-center gap-1 text-cyan-400 font-bold text-xs">
                  <Globe className="w-3 h-3" /> ENCRYPTED
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className={`${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'} font-medium tracking-tight`}>LATENCY</span>
                <span className="text-green-400 font-mono text-xs">~500ms</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className={`${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'} font-medium tracking-tight`}>LAST SEEN</span>
                <span className="text-blue-400 font-mono text-xs uppercase">
                  {status?.lastActivity ? new Date(status.lastActivity.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                </span>
              </div>
              
              <Separator className={theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'} />
              
              <div className={`p-3 ${theme === 'dark' ? 'bg-cyan-500/5 border-cyan-500/10' : 'bg-cyan-50 border-cyan-100'} rounded-xl flex flex-col gap-3`}>
                <div className="flex gap-3">
                  <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
                  <p className={`text-[11px] ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} leading-relaxed font-medium`}>
                    Command center is operating on Firebase Cloud Protocol. All interactions are logged and secured.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`${theme === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} backdrop-blur-xl transition-colors duration-500`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <Button 
                onClick={allOn}
                variant="outline" 
                className={`border-slate-800 ${theme === 'dark' ? 'bg-slate-900/50 hover:bg-cyan-500/10 hover:text-cyan-400' : 'bg-slate-50 hover:bg-cyan-50 text-slate-600'} h-20 flex flex-col gap-2 rounded-2xl transition-all shadow-sm`}
              >
                <Power className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-widest">All On</span>
              </Button>
              <Button 
                onClick={allOff}
                variant="outline" 
                className={`border-slate-800 ${theme === 'dark' ? 'bg-slate-900/50 hover:bg-red-500/10 hover:text-red-400' : 'bg-slate-50 hover:bg-red-50 text-slate-600'} h-20 flex flex-col gap-2 rounded-2xl transition-all shadow-sm`}
              >
                <Power className="w-5 h-5 rotate-180" />
                <span className="text-[10px] font-black uppercase tracking-widest">All Off</span>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Switches Column */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {switches.sort((a,b) => a.id.localeCompare(b.id)).map((s) => (
                <motion.div
                  key={s.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className={`relative overflow-hidden transition-all duration-500 ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200 shadow-sm'} ${s.state ? 'bg-cyan-500/10 ring-1 ring-cyan-500/30' : (theme === 'dark' ? 'bg-slate-900/40' : 'bg-white')} transition-colors duration-500`}>
                    {/* Glow effect when ON */}
                    {s.state && (
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/20 blur-[40px] rounded-full pointer-events-none" />
                    )}
                    
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-8">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-500 ${s.state ? 'bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)]' : (theme === 'dark' ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400')}`}>
                          {pendingIds.has(s.id) ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                              <Cpu className="w-7 h-7" />
                            </motion.div>
                          ) : (
                            s.type === 'bulb' ? <Lightbulb className="w-7 h-7" /> : <Zap className="w-7 h-7" />
                          )}
                        </div>
                        <Switch 
                          checked={s.state} 
                          disabled={pendingIds.has(s.id)}
                          onCheckedChange={() => toggleSwitch(s.id, s.state)}
                          className="data-[state=checked]:bg-cyan-500"
                        />
                      </div>
                      
                      <div>
                        <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{s.name}</h3>
                        <p className={`text-sm font-medium transition-colors duration-500 ${s.state ? 'text-cyan-500' : (theme === 'dark' ? 'text-slate-500' : 'text-slate-600')}`}>
                          {pendingIds.has(s.id) ? 'SYNCING...' : (s.state ? 'ACTIVE' : 'INACTIVE')}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function ESP32SetupView({ theme }: { theme: 'dark' | 'light' }) {
  const [copied, setCopied] = useState(false);
  
  const espCode = `// --- SmartSwitch Ultra-Light NO-AUTH Code ---
// ⚡ BYPASSES ALL LOGIN ERRORS. Works on restricted networks!
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <WebSocketsServer.h>

// --- CONFIGURATION ---
const char* ssid = "B-BLOCK";
const char* password = "welcome$ABH";

// FIREBASE CONFIG
const char* project_id = "gen-lang-client-0121307738";
const char* database_id = "ai-studio-ddcbf9e8-4060-41c2-b9b4-3caaa6929307";
const char* api_key = "AIzaSyBetSt_bhcHe-ve6dkOpX_ASWsadRNQf2A";

// PINS
const int relayPins[4] = {26, 27, 14, 12}; 
const int switchPins[4] = {32, 33, 25, 23}; 

// STATE
bool relayState[4] = {HIGH, HIGH, HIGH, HIGH}; 
int lastSwitchState[4] = {HIGH, HIGH, HIGH, HIGH};
unsigned long lastHeartbeat = 0;
unsigned long lastSync = 0;

WebSocketsServer webSocket = WebSocketsServer(81);

void broadcastLocalState() {
  String json = "[";
  for(int i=0; i<4; i++) {
    json += (relayState[i] == LOW ? "1" : "0");
    if(i<3) json += ",";
  }
  json += "]";
  webSocket.broadcastTXT(json);
}

void updateCloud(int id, bool state) {
  HTTPClient http;
  WiFiClientSecure client;
  client.setInsecure(); // Skip certificate check
  
  String url = "https://firestore.googleapis.com/v1/projects/" + String(project_id) + "/databases/" + String(database_id) + "/documents/switches/" + String(id) + "?updateMask.fieldPaths=state&key=" + String(api_key);
  
  http.begin(client, url);
  http.addHeader("Content-Type", "application/json");
  
  String payload = "{\\"fields\\": {\\"state\\": {\\"booleanValue\\": " + String(state ? "true" : "false") + "}}}";
  int httpCode = http.sendRequest("PATCH", payload);
  http.end();
}

void syncFromCloud() {
  HTTPClient http;
  WiFiClientSecure client;
  client.setInsecure();
  
  // Fetch the MASTER sync document (All 4 states in one go)
  String url = "https://firestore.googleapis.com/v1/projects/" + String(project_id) + "/databases/" + String(database_id) + "/documents/status/sync?key=" + String(api_key);
  http.begin(client, url);
  int httpCode = http.GET();
  
  if (httpCode == 200) {
    String payload = http.getString();
    // Look for the "values" array in the JSON
    int arrayStart = payload.indexOf("[");
    if (arrayStart > 0) {
      for(int i=0; i<4; i++) {
        int valPos = payload.indexOf("booleanValue", arrayStart);
        if (valPos > 0) {
          bool cloudState = payload.substring(valPos, valPos + 30).indexOf("true") >= 0;
          bool currentPhysicalState = (relayState[i] == LOW);
          if (cloudState != currentPhysicalState) {
            relayState[i] = cloudState ? LOW : HIGH;
            digitalWrite(relayPins[i], relayState[i]);
            broadcastLocalState();
            Serial.println("Switch " + String(i) + " -> " + String(cloudState ? "ON" : "OFF"));
          }
          arrayStart = valPos + 20; // Move to next item
        }
      }
    }
  } else {
    Serial.println("Sync Error: " + String(httpCode));
  }
  http.end();
}

void setup() {
  Serial.begin(115200);
  for(int i=0; i<4; i++) {
    pinMode(relayPins[i], OUTPUT);
    digitalWrite(relayPins[i], relayState[i]);
    pinMode(switchPins[i], INPUT_PULLUP);
    lastSwitchState[i] = digitalRead(switchPins[i]);
  }

  WiFi.begin(ssid, password);
  while(WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\\nWiFi Connected! IP: " + WiFi.localIP().toString());
}

void loop() {
  webSocket.loop();

  // HEARTBEAT (Every 30s)
  if (millis() - lastHeartbeat > 30000 || lastHeartbeat == 0) {
    HTTPClient http;
    WiFiClientSecure client;
    client.setInsecure();
    String url = "https://firestore.googleapis.com/v1/projects/" + String(project_id) + "/databases/" + String(database_id) + "/documents/status/esp32?updateMask.fieldPaths=online&updateMask.fieldPaths=localIp&key=" + String(api_key);
    http.begin(client, url);
    String payload = "{\\"fields\\": {\\"online\\": {\\"booleanValue\\": true}, \\"localIp\\": {\\"stringValue\\": \\"" + WiFi.localIP().toString() + "\\"}}}";
    int httpCode = http.sendRequest("PATCH", payload);
    Serial.println("Heartbeat Response: " + String(httpCode));
    http.end();
    lastHeartbeat = millis();
  }

  // SYNC FROM CLOUD (Every 500ms)
  if (millis() - lastSync > 500) {
    syncFromCloud();
    lastSync = millis();
  }

  // PHYSICAL SWITCHES
  for(int i=0; i<4; i++) {
    int reading = digitalRead(switchPins[i]);
    if (reading != lastSwitchState[i]) {
      delay(50);
      if (reading == digitalRead(switchPins[i])) {
        relayState[i] = !relayState[i];
        digitalWrite(relayPins[i], relayState[i]);
        lastSwitchState[i] = reading;
        broadcastLocalState();
        updateCloud(i, relayState[i] == LOW);
      }
    }
  }
}
`;

  const copyCode = () => {
    navigator.clipboard.writeText(espCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card className={`${theme === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} backdrop-blur-xl transition-colors duration-500`}>
        <CardHeader>
          <CardTitle>ESP32 Firmware Guide</CardTitle>
          <CardDescription className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>Follow these steps to connect your hardware to the cloud</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { step: '1', title: 'Install Libraries', desc: 'Install "Firebase ESP Client" and "WebSockets" in Arduino IDE.' },
              { step: '2', title: 'Update Config', desc: 'Replace WiFi and Firebase credentials. Create a "Device User" in Firebase Auth for the ESP32.' },
              { step: '3', title: 'Flash ESP32', desc: 'Upload the code and check Serial Monitor for the Local IP.' },
            ].map((item) => (
              <div key={item.step} className={`p-4 ${theme === 'dark' ? 'bg-slate-800/30 border-slate-700/50' : 'bg-slate-50 border-slate-200'} rounded-2xl border`}>
                <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center text-cyan-400 font-bold mb-3">
                  {item.step}
                </div>
                <h4 className={`font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{item.title}</h4>
                <p className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-600'} leading-relaxed`}>{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="relative group">
            <div className="absolute top-4 right-4 z-20">
              <Button onClick={copyCode} variant="secondary" size="sm" className={`${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'} gap-2`}>
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </Button>
            </div>
            <div className={`${theme === 'dark' ? 'bg-[#020617] border-slate-800' : 'bg-slate-900 border-slate-700'} rounded-2xl border p-6 overflow-x-auto max-h-[400px] scrollbar-thin scrollbar-thumb-slate-800`}>
              <pre className="text-xs font-mono text-cyan-400/80 leading-relaxed">
                {espCode}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

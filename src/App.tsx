import { useState, useEffect, FormEvent } from 'react';
import mqtt from 'mqtt';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocument } from 'react-firebase-hooks/firestore';
import { doc } from 'firebase/firestore';
import { auth, db, loginWithEmail, signOut } from './firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Power, Lightbulb, Zap, LogOut, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Using HiveMQ public broker for reliable global access
const BROKER_URL = 'wss://broker.hivemq.com:8884/mqtt';
const TOPIC_COMMAND = 'smartswitch/rudransh/b106/commands';
const TOPIC_STATE = 'smartswitch/rudransh/b106/state';

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

  const [states, setStates] = useState<boolean[]>([false, false, false, false]);
  const [client, setClient] = useState<mqtt.MqttClient | null>(null);
  const [mqttStatus, setMqttStatus] = useState('Connecting to Global Server...');

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    let isMounted = true;
    
    // Connect to MQTT Broker via Secure WebSockets
    const mqttClient = mqtt.connect(BROKER_URL, {
      clientId: 'webapp_' + Math.random().toString(16).substring(2, 10),
      clean: true,
      connectTimeout: 5000,
      reconnectPeriod: 2000,
      keepalive: 60,
    });

    mqttClient.on('connect', () => {
      if (!isMounted) return;
      setMqttStatus('🟢 Connected to Global Server (Instant Latency)');
      mqttClient.subscribe(TOPIC_STATE);
    });

    mqttClient.on('reconnect', () => {
      if (!isMounted) return;
      setMqttStatus('🟡 Reconnecting...');
    });

    mqttClient.on('error', (err) => {
      if (!isMounted) return;
      if (err.message === 'client disconnecting') return;
      setMqttStatus('🔴 Connection Error');
      console.error('MQTT Error:', err);
    });

    mqttClient.on('message', (topic, message) => {
      if (!isMounted) return;
      if (topic === TOPIC_STATE) {
        try {
          const newStates = JSON.parse(message.toString());
          if (Array.isArray(newStates) && newStates.length === 4) {
            setStates(newStates);
          }
        } catch (e) {
          console.error("Invalid message format");
        }
      }
    });

    setClient(mqttClient);

    return () => {
      isMounted = false;
      mqttClient.end(true);
    };
  }, []);

  const toggleSwitch = (index: number) => {
    const newStates = [...states];
    newStates[index] = !newStates[index];
    
    // 1. Optimistic UI update (Instant for the user)
    setStates(newStates);

    // 2. Publish command instantly to the world
    if (client && client.connected) {
      client.publish(TOPIC_COMMAND, JSON.stringify(newStates));
    }
  };

  const allOn = () => {
    const newStates = [true, true, true, true];
    setStates(newStates);
    if (client && client.connected) {
      client.publish(TOPIC_COMMAND, JSON.stringify(newStates));
    }
  };

  const allOff = () => {
    const newStates = [false, false, false, false];
    setStates(newStates);
    if (client && client.connected) {
      client.publish(TOPIC_COMMAND, JSON.stringify(newStates));
    }
  };

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
          <div className="space-y-12">
            <DashboardView 
              theme={theme} 
              setTheme={setTheme} 
              states={states} 
              toggleSwitch={toggleSwitch} 
              allOn={allOn} 
              allOff={allOff}
              mqttStatus={mqttStatus}
            />
            <ESP32SetupView theme={theme} />
          </div>
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

function DashboardView({ 
  theme, 
  setTheme, 
  states, 
  toggleSwitch, 
  allOn, 
  allOff,
  mqttStatus
}: { 
  theme: 'dark' | 'light', 
  setTheme: (t: 'dark' | 'light') => void,
  states: boolean[],
  toggleSwitch: (index: number) => void,
  allOn: () => void,
  allOff: () => void,
  mqttStatus: string
}) {
  const switchNames = ['Bulb 1', 'Bulb 2', 'Plug 1', 'Plug 2'];
  const switchTypes = ['bulb', 'bulb', 'plug', 'plug'];

  return (
    <div className="space-y-8">
      <div className="flex justify-center mb-2">
        <div className={`text-[10px] font-bold px-3 py-1.5 rounded-full tracking-widest uppercase ${mqttStatus.includes('Connected') ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
          {mqttStatus}
        </div>
      </div>

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
          {states.map((state, index) => (
            <motion.div key={index} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <Card className={`relative overflow-hidden transition-all duration-300 ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200 shadow-sm'} ${state ? 'bg-cyan-500/10 ring-1 ring-cyan-500/30' : (theme === 'dark' ? 'bg-slate-900/40' : 'bg-white')}`}>
                {state && <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/20 blur-[40px] rounded-full pointer-events-none" />}
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-8">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-300 ${state ? 'bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)]' : (theme === 'dark' ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400')}`}>
                      {switchTypes[index] === 'bulb' ? <Lightbulb className="w-7 h-7" /> : <Zap className="w-7 h-7" />}
                    </div>
                    <Switch 
                      checked={state} 
                      onCheckedChange={() => toggleSwitch(index)}
                      className="data-[state=checked]:bg-cyan-500"
                    />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{switchNames[index]}</h3>
                    <p className={`text-sm font-medium transition-colors duration-300 ${state ? 'text-cyan-500' : (theme === 'dark' ? 'text-slate-500' : 'text-slate-600')}`}>
                      {state ? 'ACTIVE' : 'INACTIVE'}
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

function ESP32SetupView({ theme }: { theme: 'dark' | 'light' }) {
  const [copied, setCopied] = useState(false);
  
  const espCode = `// --- SmartSwitch MQTT (INSTANT GLOBAL CONTROL) ---
// ⚡ Requires: PubSubClient library by Nick O'Leary
#include <WiFi.h>
#include <PubSubClient.h>

const char* ssid = "B-BLOCK";
const char* password = "welcome$ABH";

// HiveMQ Public Broker
const char* mqtt_server = "broker.hivemq.com";
const int mqtt_port = 1883;

const char* topic_command = "smartswitch/rudransh/b106/commands";
const char* topic_state = "smartswitch/rudransh/b106/state";

WiFiClient espClient;
PubSubClient client(espClient);

const int relayPins[4] = {26, 27, 14, 12}; 
bool relayState[4] = {HIGH, HIGH, HIGH, HIGH}; // HIGH is OFF for active-low relays

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWiFi connected");
}

void callback(char* topic, byte* payload, unsigned int length) {
  // Create a temporary character array (Zero heap memory used!)
  char msg[length + 1];
  for (int i = 0; i < length; i++) {
    msg[i] = (char)payload[i];
  }
  msg[length] = '\\0'; // Null terminator
  
  Serial.print("Received: ");
  Serial.println(msg);
  
  // Lightning-fast parsing without String objects
  int pinIndex = 0;
  for (int i = 0; i < length && pinIndex < 4; i++) {
    if (msg[i] == 't') { // "true"
      relayState[pinIndex] = LOW; // Turn ON
      digitalWrite(relayPins[pinIndex], LOW);
      pinIndex++;
      i += 3; // skip the rest of "true"
    } else if (msg[i] == 'f') { // "false"
      relayState[pinIndex] = HIGH; // Turn OFF
      digitalWrite(relayPins[pinIndex], HIGH);
      pinIndex++;
      i += 4; // skip the rest of "false"
    }
  }
  
  // Acknowledge state
  client.publish(topic_state, msg);
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    String clientId = "ESP32Client-";
    clientId += String(random(0xffff), HEX);
    
    if (client.connect(clientId.c_str())) {
      Serial.println("connected");
      client.subscribe(topic_command);
      
      // Publish initial state
      client.publish(topic_state, "[false,false,false,false]");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200); // Make sure your Serial Monitor is set to 115200 baud!
  for(int i=0; i<4; i++) {
    pinMode(relayPins[i], OUTPUT);
    digitalWrite(relayPins[i], relayState[i]);
  }
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
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
          <CardDescription className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>Flash this code for instant global control via MQTT</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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

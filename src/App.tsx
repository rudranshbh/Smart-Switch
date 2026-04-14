import React, { useState, useEffect } from 'react';
import mqtt from 'mqtt';
import { motion, AnimatePresence } from 'motion/react';
import { Power, Lightbulb, Zap, Copy, Check, Server, Activity, ShieldCheck, Lock, LogOut } from 'lucide-react';

// HiveMQ Public Broker
const BROKER_URL = 'wss://broker.hivemq.com:8884/mqtt';
const TOPIC_COMMAND = 'smartswitch/rudransh/b106/commands';
const TOPIC_STATE = 'smartswitch/rudransh/b106/state';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [states, setStates] = useState<boolean[]>([false, false, false, false]);
  const [client, setClient] = useState<mqtt.MqttClient | null>(null);
  const [mqttStatus, setMqttStatus] = useState('INITIALIZING CONNECTION...');

  useEffect(() => {
    // Force dark mode on the HTML element
    document.documentElement.classList.add('dark');
    document.documentElement.style.backgroundColor = '#000000';
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;
    
    const mqttClient = mqtt.connect(BROKER_URL, {
      clientId: 'b106_cmd_' + Math.random().toString(16).substring(2, 10),
      clean: true,
      connectTimeout: 5000,
      reconnectPeriod: 2000,
      keepalive: 60,
    });

    mqttClient.on('connect', () => {
      if (!isMounted) return;
      setMqttStatus('SECURE CONNECTION ESTABLISHED');
      mqttClient.subscribe(TOPIC_STATE);
    });

    mqttClient.on('reconnect', () => {
      if (!isMounted) return;
      setMqttStatus('REESTABLISHING CONNECTION...');
    });

    mqttClient.on('error', (err) => {
      if (!isMounted) return;
      if (err.message === 'client disconnecting') return;
      setMqttStatus('CONNECTION FAILURE');
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
  }, [isAuthenticated]);

  const toggleSwitch = (index: number) => {
    const newStates = [...states];
    newStates[index] = !newStates[index];
    setStates(newStates);
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

  return (
    <div className="min-h-screen bg-black text-neutral-200 font-sans selection:bg-cyan-500/30">
      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <AuthView key="auth" onAuthenticate={() => setIsAuthenticated(true)} />
        ) : (
          <DashboardView 
            key="dashboard"
            states={states} 
            toggleSwitch={toggleSwitch} 
            allOn={allOn} 
            allOff={allOff}
            mqttStatus={mqttStatus}
            onLogout={() => setIsAuthenticated(false)}
          />
        )}
      </AnimatePresence>
      
      <footer className="mt-16 pb-8 text-center relative z-10">
        <p className="text-[9px] font-black tracking-[0.4em] uppercase text-neutral-600 flex items-center justify-center gap-2">
          Made with <span className="text-red-500/80 animate-pulse">❤️</span> by RUDRANSH
        </p>
      </footer>
    </div>
  );
}

interface AuthViewProps {
  onAuthenticate: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onAuthenticate }) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'bhardwaj') {
      onAuthenticate();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0, filter: 'blur(10px)', scale: 1.05 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
    >
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="mb-12 text-center space-y-6">
          <h2 className="text-3xl font-black tracking-tight text-white mb-8">
            SMART<span className="text-cyan-500">SWITCH</span>
          </h2>

          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
            className="w-24 h-24 rounded-full bg-cyan-500/20 border-2 border-cyan-500/30 mx-auto flex items-center justify-center overflow-hidden shadow-lg shadow-cyan-500/20"
          >
            <img 
              src="https://lh3.googleusercontent.com/d/12CB9vV3Tu0AV9vfkdyw81TasNBOmaDQa" 
              alt="Room Profile" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          
          <div className="space-y-2">
            <p className="text-xs font-bold tracking-[0.3em] text-cyan-400/80 uppercase mb-2">
              WELCOME BACK B-106
            </p>
            <h1 className="text-2xl font-black tracking-tighter text-white">
              RUDRANSH BHARDWAJ
              <br />
              KUSHAGRA VARSHNEY
            </h1>
            <p className="text-xs font-bold tracking-widest uppercase text-neutral-500 mt-4">
              Enter credentials to continue
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-neutral-500" />
            </div>
            <input 
              type="password" 
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className={`w-full bg-[#0A0A0A] border ${error ? 'border-red-500/50 text-red-400' : 'border-white/10 text-white focus:border-cyan-500/50'} rounded-xl py-4 pl-12 pr-4 text-sm font-mono tracking-widest outline-none transition-all duration-300 placeholder:text-neutral-700`}
              placeholder="Password"
              autoFocus
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-white text-black hover:bg-neutral-200 py-4 rounded-xl text-xs font-black tracking-[0.2em] uppercase transition-colors duration-300"
          >
            INITIALIZE LINK
          </button>
        </form>
      </div>
    </motion.div>
  );
}

interface DashboardViewProps {
  states: boolean[];
  toggleSwitch: (index: number) => void;
  allOn: () => void;
  allOff: () => void;
  mqttStatus: string;
  onLogout: () => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ 
  states, 
  toggleSwitch, 
  allOn, 
  allOff,
  mqttStatus,
  onLogout
}) => {
  const switchNames = ['Bulb 1', 'Bulb 2', 'Plug 1', 'Plug 2'];
  const switchTypes = ['bulb', 'bulb', 'plug', 'plug'];
  const isConnected = mqttStatus.includes('ESTABLISHED');

  // Staggered animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.6 }}
      className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 lg:p-12 relative z-10"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white rounded-lg text-xs font-bold tracking-widest uppercase transition-colors"
        >
          <LogOut className="w-4 h-4" /> LOGOUT
        </button>
        
        <div className="flex items-center gap-3 bg-[#0A0A0A] border border-white/5 p-1.5 pr-4 rounded-full">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-cyan-500/30">
            <img 
              src="https://lh3.googleusercontent.com/d/12CB9vV3Tu0AV9vfkdyw81TasNBOmaDQa" 
              alt="Profile" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="text-xs font-bold text-white tracking-widest">B-106</span>
        </div>
      </div>

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-white/10 pb-8">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white leading-none">
            SMART<span className="text-cyan-500">SWITCH</span>
          </h1>
          <div className="flex items-center gap-3 mt-4">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Server className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-xs font-mono tracking-widest text-neutral-500 uppercase">System Online</span>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-[#0A0A0A] border border-white/5 px-4 py-2.5 rounded-full">
          <div className="relative flex h-2.5 w-2.5">
            {isConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? 'bg-cyan-500' : 'bg-red-500'}`}></span>
          </div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400">
            {mqttStatus}
          </span>
        </div>
      </header>

      {/* Global Controls */}
      <div className="flex flex-wrap gap-4 mb-12">
        <button 
          onClick={allOn}
          className="flex items-center gap-2 px-6 py-3 bg-white text-black hover:bg-neutral-200 rounded-lg text-xs font-black tracking-[0.2em] transition-colors"
        >
          <Zap className="w-4 h-4" /> TURN ALL ON
        </button>
        <button 
          onClick={allOff}
          className="flex items-center gap-2 px-6 py-3 bg-[#0A0A0A] text-neutral-400 hover:text-white border border-white/10 hover:border-white/20 rounded-lg text-xs font-black tracking-[0.2em] transition-all"
        >
          <Power className="w-4 h-4" /> TURN ALL OFF
        </button>
      </div>

      {/* Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {states.map((state, index) => (
          <motion.div key={index} variants={itemVariants}>
            <div className={`relative group overflow-hidden rounded-2xl border transition-all duration-500 ${state ? 'bg-[#0A0A0A] border-cyan-500/30' : 'bg-[#050505] border-white/5 hover:border-white/10'}`}>
              {/* Active Glow Background */}
              {state && <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 blur-[50px] rounded-full pointer-events-none transition-opacity duration-1000" />}
              
              <div className="p-6 md:p-8">
                <div className="flex items-start justify-between mb-12">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-500 ${state ? 'bg-cyan-500/10 text-cyan-400' : 'bg-white/5 text-neutral-500'}`}>
                    {switchTypes[index] === 'bulb' ? <Lightbulb className="w-5 h-5" strokeWidth={1.5} /> : <Zap className="w-5 h-5" strokeWidth={1.5} />}
                  </div>
                  
                  {/* Premium Custom Toggle */}
                  <button
                    onClick={() => toggleSwitch(index)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-500 focus:outline-none ${state ? 'bg-cyan-500' : 'bg-white/10'}`}
                  >
                    <motion.span
                      layout
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ${state ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className={`w-3 h-3 ${state ? 'text-cyan-400' : 'text-neutral-600'}`} />
                    <span className={`text-[10px] font-mono tracking-widest uppercase ${state ? 'text-cyan-400' : 'text-neutral-600'}`}>
                      {state ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold tracking-tight text-white">{switchNames[index]}</h3>
                  <p className="text-xs font-mono text-neutral-500 mt-1">CH-{index + 1} // {switchTypes[index].toUpperCase()}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Firmware Section */}
      <motion.div 
        variants={itemVariants}
        initial="hidden"
        animate="show"
        className="mt-24"
      >
        <ESP32SetupView />
      </motion.div>
    </motion.div>
  );
}

function ESP32SetupView() {
  const [copied, setCopied] = useState(false);
  
  const espCode = `// --- B-106 COMMAND PROTOCOL (MQTT) ---
// Requires: PubSubClient by Nick O'Leary
#include <WiFi.h>
#include <PubSubClient.h>

const char* ssid = "B-BLOCK";
const char* password = "welcome$ABH";

const char* mqtt_server = "broker.hivemq.com";
const int mqtt_port = 1883;

const char* topic_command = "smartswitch/rudransh/b106/commands";
const char* topic_state = "smartswitch/rudransh/b106/state";

WiFiClient espClient;
PubSubClient client(espClient);

const int relayPins[4] = {26, 27, 14, 12}; 
bool relayState[4] = {HIGH, HIGH, HIGH, HIGH};

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
  char msg[length + 1];
  for (int i = 0; i < length; i++) {
    msg[i] = (char)payload[i];
  }
  msg[length] = '\\0';
  
  Serial.print("Received: ");
  Serial.println(msg);
  
  int pinIndex = 0;
  for (int i = 0; i < length && pinIndex < 4; i++) {
    if (msg[i] == 't') {
      relayState[pinIndex] = LOW;
      digitalWrite(relayPins[pinIndex], LOW);
      pinIndex++;
      i += 3;
    } else if (msg[i] == 'f') {
      relayState[pinIndex] = HIGH;
      digitalWrite(relayPins[pinIndex], HIGH);
      pinIndex++;
      i += 4;
    }
  }
  client.publish(topic_state, msg);
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    String clientId = "B106-Node-";
    clientId += String(random(0xffff), HEX);
    
    if (client.connect(clientId.c_str())) {
      Serial.println("connected");
      client.subscribe(topic_command);
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
  Serial.begin(115200);
  for(int i=0; i<4; i++) {
    pinMode(relayPins[i], OUTPUT);
    digitalWrite(relayPins[i], relayState[i]);
  }
  setup_wifi();
  client.setBufferSize(512); 
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  yield();
}
`;

  const copyCode = () => {
    navigator.clipboard.writeText(espCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#050505]">
        <div>
          <h2 className="text-white font-bold tracking-tight">ESP32 Firmware Guide</h2>
          <p className="text-neutral-500 text-xs font-mono mt-1">Flash this code for instant global control via MQTT</p>
        </div>
        <button 
          onClick={copyCode}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg text-xs font-bold tracking-widest uppercase transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-cyan-400" /> : <Copy className="w-4 h-4" />}
          {copied ? 'COPIED' : 'COPY CODE'}
        </button>
      </div>
      <div className="p-6 overflow-x-auto">
        <pre className="text-cyan-400/70 text-xs font-mono leading-relaxed">
          {espCode}
        </pre>
      </div>
    </div>
  );
}

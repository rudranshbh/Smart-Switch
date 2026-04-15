# SMART SWITCH 

A high-performance, cloud-integrated IoT solution for **Global Remote Appliance Control**. This project bridges a modern React web dashboard with a custom ESP32-based smart switch via Firebase Realtime Database, optimized for low-latency and high-reliability operations from any corner of the world.

## Problem Statement
In a traditional environment without smart automation, users face several challenges:
- **Manual Dependency**: Appliances must be physically toggled, which is inconvenient and time-consuming.
- **Energy Waste**: Forgetting to turn off lights or fans when leaving a room leads to significant electricity wastage.
- **Lack of Remote Monitoring**: There is no way to verify or change the state of appliances while away from home.
- **Accessibility Barriers**: Individuals with limited mobility often struggle with physical switches located in hard-to-reach areas.

The B-106 System addresses these issues by providing a centralized, secure, and globally accessible control hub.

## The Backstory: Life in Room B-106
This project wasn't just built for a portfolio—it was built for survival in our hostel room, **B-106**. As roommates, we faced the ultimate daily struggle: who has to get up from their bed to turn off the lights?

I developed this system so we could control everything in our room without moving an inch:
- **Main Lights & Night Bulbs**: Toggle the room vibe instantly from our beds.
- **Fairy Lights**: Perfect for late-night study sessions or just chilling.
- **Laptop Chargers**: No more overcharging or having to crawl under the desk to plug/unplug.

Whether we are cozy in our blankets, sitting in a lecture at college, or traveling back home, we have total control over B-106.

## System Architecture Diagram
```
[ User Dashboard ] <----(WebSockets)----> [ Firebase Cloud ] <----(SSL Stream)----> [ ESP32 Device ]
      (React)                                (RTDB)                               (Relay Controller)
         |                                                                               |
         |                                                                               |
   [ Web Browser ]                                                                 [ Physical Relays ]
                                                                                   [   Appliance 1   ]
                                                                                   [   Appliance 2   ]
                                                                                   [   Appliance 3   ]
                                                                                   [   Appliance 4   ]
```

## Tech Stack

### Frontend (Dashboard)
- Framework: React 18+ with Vite
- Styling: Tailwind CSS (Utility-first design)
- Animations: Framer Motion (Smooth UI transitions)
- Icons: Lucide React
- Database SDK: Firebase JS SDK (Realtime Database)

### Backend (Cloud)
- Database: Firebase Realtime Database (NoSQL)
- Security: Test Mode Rules (Optimized for development speed)
- Protocol: WebSockets for real-time state propagation

### Firmware (Hardware)
- Platform: ESP32 (Expressif)
- Device: Custom Smart Switch with 4-Channel Relay Control
- Language: C++ (Arduino Framework)
- Library: Firebase_ESP_Client by Mobizt
- Security: BearSSL with NTP Time Synchronization
- Logic: Active-Low Relay Control

## Architecture Details
The system follows a Reactive IoT Pattern:
1. Web Client: When a user toggles a switch, the React app updates a specific 4-digit binary string (e.g., "1010") at the /devices/b106_main/state path in Firebase.
2. Firebase RTDB: Acts as the "Single Source of Truth." It instantly pushes the change to all connected clients via WebSockets.
3. ESP32 Device:
   - Primary: Maintains a persistent SSL stream to the database for instant updates.
   - Secondary: Performs a "Heartbeat Sync" every 10 seconds to ensure state consistency even if the stream drops.
   - Execution: Parses the binary string and triggers physical GPIO pins (26, 27, 14, 12) to switch high-voltage relays.

## Key Features
- **Global Control from Anywhere**: Control your room from any corner of the world with an internet connection. Whether you are in another city or another country, your switches are just a click away.
- **Instant Cloud Sync**: The dashboard reflects the actual state of the database instantly, providing real-time feedback regardless of your location.
- Bulletproof Connectivity:
  - NTP Sync: Automatically fetches internet time for secure SSL handshakes.
  - SSL Buffer Tuning: Optimized memory allocation to prevent crashes.
  - Auto-Recovery: Automatically reconnects to WiFi and Firebase if the signal is lost.
- Ultra-Lightweight Payload: Uses a 4-bit protocol to minimize data usage and processing overhead.

## Use Cases
- **Global Home Management**: Control lights, fans, or AC units remotely while traveling or from your workplace.
- **Remote Industrial Monitoring**: Reset servers or network equipment from any location without being physically present.
- Energy Management: Schedule or manually turn off appliances to save power.
- Accessibility: Providing easy-to-use interfaces for people with limited mobility.

## Setup and Installation

### 1. Hardware Requirements
- ESP32 Development Board
- 4-Channel Relay Module (Active-Low)
- Jumper Wires

### 2. Software Requirements
- Arduino IDE with ESP32 Board Support
- Library: Firebase ESP Client by Mobizt (Install via Library Manager)

### 3. Configuration
1. Update your WiFi credentials in the ESP32 code:
   ```cpp
   const char* ssid = "YOUR_SSID";
   const char* password = "YOUR_PASSWORD";
   ```
2. Ensure your Firebase RTDB is in Test Mode or has appropriate security rules.

---
*Developed for Room B-106 System Integration.*

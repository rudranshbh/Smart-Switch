# SMART SWITCH (B-106 SYSTEM)

A high-performance, cloud-integrated IoT solution for remote appliance control. This project bridges a modern React web dashboard with a custom ESP32-based smart switch via Firebase Realtime Database, optimized for low-latency and high-reliability operations.

## Problem Statement
In a traditional environment without smart automation, users face several challenges:
- **Manual Dependency**: Appliances must be physically toggled, which is inconvenient and time-consuming.
- **Energy Waste**: Forgetting to turn off lights or fans when leaving a room leads to significant electricity wastage.
- **Lack of Remote Monitoring**: There is no way to verify or change the state of appliances while away from home.
- **Accessibility Barriers**: Individuals with limited mobility often struggle with physical switches located in hard-to-reach areas.

The B-106 System addresses these issues by providing a centralized, secure, and globally accessible control hub.

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
- Global Control: Control your room from anywhere in the world with an internet connection.
- Real-time Feedback: The dashboard reflects the actual state of the database instantly.
- Bulletproof Connectivity:
  - NTP Sync: Automatically fetches internet time for secure SSL handshakes.
  - SSL Buffer Tuning: Optimized memory allocation to prevent crashes.
  - Auto-Recovery: Automatically reconnects to WiFi and Firebase if the signal is lost.
- Ultra-Lightweight Payload: Uses a 4-bit protocol to minimize data usage and processing overhead.

## Use Cases
- Home Automation: Control lights, fans, or AC units remotely.
- Industrial Monitoring: Remote reset of servers or network equipment.
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

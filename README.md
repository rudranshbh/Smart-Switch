# SMART SWITCH (B-106 SYSTEM)

A high-performance, cloud-integrated IoT solution for remote appliance control. This project bridges a modern React web dashboard with ESP32-based hardware via Firebase Realtime Database, optimized for low-latency and high-reliability operations.

## 🚀 Problem Statement
Traditional IoT solutions often suffer from high latency, complex setup, or unreliable connections when using secure SSL/TLS protocols on low-power microcontrollers like the ESP32. Common issues include:
- **SSL Handshake Failures**: Due to incorrect time synchronization or memory fragmentation.
- **Connection Drops**: Caused by aggressive polling or unstable network environments.
- **Complexity**: Difficulty in synchronizing state between multiple web clients and physical hardware.

**SMART SWITCH B-106** solves this by implementing a **Hybrid Sync Architecture** that combines real-time streaming with intelligent polling fallbacks.

## 🛠 Tech Stack

### Frontend (Dashboard)
- **Framework**: React 18+ with Vite
- **Styling**: Tailwind CSS (Utility-first design)
- **Animations**: Framer Motion (Smooth UI transitions)
- **Icons**: Lucide React
- **Database SDK**: Firebase JS SDK (Realtime Database)

### Backend (Cloud)
- **Database**: Firebase Realtime Database (NoSQL)
- **Security**: Test Mode Rules (Optimized for development speed)
- **Protocol**: WebSockets for real-time state propagation

### Firmware (Hardware)
- **Platform**: ESP32 (Expressif)
- **Language**: C++ (Arduino Framework)
- **Library**: `Firebase_ESP_Client` by Mobizt
- **Security**: BearSSL with NTP Time Synchronization
- **Logic**: Active-Low Relay Control

## 🏗 Architecture

The system follows a **Reactive IoT Pattern**:

1. **Web Client**: When a user toggles a switch, the React app updates a specific 4-digit binary string (e.g., `"1010"`) at the `/devices/b106_main/state` path in Firebase.
2. **Firebase RTDB**: Acts as the "Single Source of Truth." It instantly pushes the change to all connected clients via WebSockets.
3. **ESP32 Device**: 
   - **Primary**: Maintains a persistent SSL stream to the database.
   - **Secondary**: Performs a "Heartbeat Sync" every 10 seconds to ensure state consistency even if the stream drops.
   - **Execution**: Parses the binary string and triggers physical GPIO pins (26, 27, 14, 12) to switch high-voltage relays.

## ✨ Key Features
- **Global Control**: Control your room from anywhere in the world with an internet connection.
- **Real-time Feedback**: The dashboard reflects the actual state of the database instantly.
- **Bulletproof Connectivity**: 
  - **NTP Sync**: Automatically fetches internet time for secure SSL handshakes.
  - **SSL Buffer Tuning**: Optimized memory allocation to prevent crashes.
  - **Auto-Recovery**: Automatically reconnects to WiFi and Firebase if the signal is lost.
- **Ultra-Lightweight Payload**: Uses a 4-bit protocol to minimize data usage and processing overhead.

## 🏠 Use Cases
- **Home Automation**: Control lights, fans, or AC units remotely.
- **Industrial Monitoring**: Remote reset of servers or network equipment.
- **Energy Management**: Schedule or manually turn off appliances to save power.
- **Accessibility**: Providing easy-to-use interfaces for people with limited mobility.

## 🔧 Setup & Installation

### 1. Hardware Requirements
- ESP32 Development Board
- 4-Channel Relay Module (Active-Low)
- Jumper Wires

### 2. Software Requirements
- Arduino IDE with ESP32 Board Support
- Library: `Firebase ESP Client` by Mobizt (Install via Library Manager)

### 3. Configuration
1. Update your WiFi credentials in the ESP32 code:
   ```cpp
   const char* ssid = "YOUR_SSID";
   const char* password = "YOUR_PASSWORD";
   ```
2. Ensure your Firebase RTDB is in **Test Mode** or has appropriate security rules.

---
*Developed for Room B-106 System Integration.*

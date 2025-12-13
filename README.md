# 🛡️ PROJECT-NALAM
### The "Mastermind" Kiosk: Bridging Physical Identity & AI Autonomy

---

![Innovation](https://img.shields.io/badge/Innovation-Dual_State_Logic-gold)
![Hardware](https://img.shields.io/badge/Core-ESP32_Mastermind-orange)
![Mode](https://img.shields.io/badge/AI_Switch-Autonomous_Active-red)

## 💡 The Vision

In a world where security is passive and manual, **PROJECT-NALAM** introduces a new paradigm: **The Dual-State Kiosk.**

It is not just an RFID scanner. It is an intelligent edge node that lives in two worlds:
1.  **The Monitor World:** Passive, secure logging of physical identity.
2.  **The Autonomous World:** Active, AI-driven decision making triggered by a physical hardware interrupt.

## 🧠 The Architecture: "The Mastermind"

The system is built around a single, powerful concept: **The Mastermind (ESP32-S3)**.

Instead of relying on a slow, bloated OS, the Mastermind runs on bare metal. It acts as the central nervous system, fusing real-time data from two critical inputs:
* **Identity Input:** An **RC522 RFID Reader** that acts as the digital gatekeeper.
* **Control Input:** A **Physical AI Switch** that acts as the "Brain State" toggle.

## ⚡ The "AI Switch" Innovation

This is the killer feature. We replaced complex software menus with a dedicated, tactical **Hardware Toggle**.

* **State 0 (Standby):** The system acts as a secure logger. It verifies identity and reports to the iPad interface.
* **State 1 (Autonomous):** When the switch is flipped, the Kiosk enters **"God Mode."** The software UI instantly shifts to Gold, and the system takes autonomous control—granting access, logging high-priority events, and executing predefined logic without human intervention.

## 🛠️ The Tech Stack

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **The Brain** | **ESP32-S3** | The "Mastermind" controller handling sensor fusion & Wi-Fi. |
| **The Eyes** | **RC522 RFID** | High-frequency identity scanning via SPI. |
| **The Trigger** | **Tactile Switch** | Physical GPIO interrupt for instant mode switching. |
| **The Face** | **iPad (React Native)** | A real-time, adaptive interface that mirrors the hardware state. |

## 🚀 How It Redefines Interaction

1.  **Zero Latency:** Communication happens over a dedicated local Wi-Fi socket. No internet lag.
2.  **Hardware Truth:** The app's state isn't just a variable; it is physically hardwired to the switch. If the switch is ON, the app *is* Autonomous.
3.  **Seamless Handoff:** From "Identity Verified" to "Action Taken" in <200ms.

---

### 🔌 Hardware Configuration

* **ESP32-S3:** The Core.
* **GPIO 10, 11, 12, 13:** The SPI Data Highway (RFID).
* **GPIO 5:** The AI Trigger (Switch).

---

*PROJECT-NALAM: Redefining the intersection of Hardware, Security, and Autonomy.*
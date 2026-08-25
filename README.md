# Real-Time Industrial SCADA HMI & Process Telemetry Simulation

A full-stack industrial Human-Machine Interface (HMI) and Supervisory Control and Data Acquisition (SCADA) telemetry dashboard built to monitor and control simulated industrial process units in real time. 

This project bridges **Industrial Automation & Instrumentation** domain logic (P&ID tagging conventions, automated PLC safety interlocks, alarm limits) with modern **Software Architecture** (bidirectional WebSockets, event-driven Node.js backend, dynamic data visualization).

---

## 🌟 Key Features

* **Real-Time Telemetry Streaming:** Broadcasts process parameters ($LT$, $PT$, $FT$, $TT$) at $1\text{ Hz}$ using Socket.IO.
* **Automated Safety Interlocks (PLC Logic):**
  * **High-Level Interlock ($LA+ \ge 80\%$):** Automatically trips inlet pump $P\text{-}101$ and forces open outlet drain valve $V\text{-}101$ to prevent tank overflow.
  * **Dry-Burn Safety ($LT \le 15\%$):** Inhibits heater activation to prevent element burn-out.
  * **Over-Temp Cutoff ($TS+ \ge 60^\circ\text{C}$):** Automatically de-energizes heating element $HE\text{-}101$.
* **Alarm Management:** Dynamic visual status badge and red glowing card state when $TT\text{-}101$ exceeds $28.00^\circ\text{C}$, featuring an **ACK ALARM** state latch reset.
* **Real-Time Event & Audit Logging:** Timestamped audit table capturing system connections, interlock trips, actuator state changes, and alarm triggers.
* **Live Data Visualization:** Real-time temperature telemetry plotting over time using Chart.js.
* **Responsive SCADA Dark UI:** Fully responsive CSS grid/flexbox layout optimized for control room displays and mobile field devices.

---

## 🏷️ Instrumentation & Tag Mapping

| Tag ID | Equipment / Instrument Description | Signal Type | Range / Threshold |
| :--- | :--- | :--- | :--- |
| **TK-101** | Process Reservoir Tank | Vessel | $0 - 100\%$ Level |
| **LT-101** | Level Transmitter | Analog Input | $0 - 100\%$ ($LA+ = 80\%$) |
| **PT-101** | Hydrostatic Pressure Transmitter | Analog Input | $1.0 - 3.0\text{ bar}$ |
| **FT-101** | Flow Rate Transmitter | Analog Input | $0.0 - 2.5\text{ L/min}$ |
| **TT-101** | Temperature Transmitter | Analog Input | $20.0 - 70.0^\circ\text{C}$ ($AH+ = 28^\circ\text{C}$) |
| **HE-101** | Electric Tank Heater | Discrete Output | Actuator (ON / OFF) |
| **P-101** | Inlet Fluid Pump | Discrete Output | Actuator (ON / OFF) |
| **V-101** | Outlet Drain Valve | Discrete Output | Actuator (OPEN / CLOSED) |

---

## 🛠️ Tech Stack

* **Backend:** Node.js, Express.js
* **Real-Time Telemetry:** Socket.IO (WebSockets)
* **Frontend:** HTML5, CSS3 (Custom SCADA Dark Theme + `@media` Mobile Queries), Vanilla JavaScript (ES6+)
* **Data Plotting:** Chart.js

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v14 or higher) installed on your system.

### Installation

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/kelvin-arcanjo/web-scada-hmi-simulator.git](https://github.com/kelvin-arcanjo/web-scada-hmi-simulator.git)
   cd web-scada-hmi-simulator
# Sri Biotech – Smart Agriculture IoT Platform
**Client:** Hayleys Agriculture | **Location:** Kurunegala, Sri Lanka | **Target Crop:** Paddy (*Oryza sativa*)

## Overview
An end-to-end Smart Agriculture IoT monitoring and automated irrigation system developed to mitigate a 17.5% Paddy crop yield decline in Kurunegala. The platform combines ESP32 edge sensing, MQTT v5.0 over TLS 1.3 telemetry, OpenWeather API monsoon rain suppression, and a real-time React operational dashboard.

## Repository Contents
* `App.jsx` – Single-page React web dashboard (Tailwind CSS + Recharts + Lucide icons) featuring real-time telemetry cards, dual-axis analytics, weather forecast interplay, manual pump overrides, and system alert logging.
* `firmware.ino` – Embedded ESP32 C++ firmware implementing a 10-sample moving average noise filter and JSON payload serialization over MQTT Port 8883.

## Key Features
* **Real-Time Telemetry:** Tracks Soil Moisture (%), Soil pH, Salinity (dS/m), and Ambient Temperature (°C).
* **Predictive Rain Suppression:** Automatically pauses irrigation for 24 hours when > 15 mm of monsoon rainfall is forecast for Kurunegala during the vulnerable Paddy flowering stage.
* **Manual Safety Override:** Allows farm managers to immediately disengage automated logic and control water pumps with < 2.0 s latency.

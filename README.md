# RaktSetu — Advanced Donor Management Module (Member 2)

**Author:** Govind Sharma (Member 2)  
**Branch:** `feature/govind`  
**Platform:** RaktSetu Healthcare Support Platform  
**Evaluation:** Milestone / Evaluation 2  

---

## 🚀 Advanced Module Capabilities (Evaluation 2 Upgrades)

The **Donor Management Module** has been expanded from a basic directory into an emergency-ready, intelligent blood matching and donor retention platform.

### 1. 🚨 Live Emergency Broadcast SOS Banner
- Displays active critical shortages at partner hospitals (e.g., KEM Hospital Mumbai O- emergency).
- Donors can click **"⚡ I Can Donate"** to immediately respond, or coordinators can broadcast an emergency alert to matching donors.

### 2. 📡 Interactive Proximity Radar Scanner ("Uber for Donors")
- Real-time animated circular radar scanner displaying GPS-simulated nearby donors relative to the hospital/patient.
- Glowing radar blips update live with distance in kilometers (`1.8 km away · 8 min response`).
- Distance Radius filters (`Within 5 km`, `Within 10 km`, `Within 25 km`, `Any Distance`).

### 3. 🧠 Smart Blood Cross-Matching Engine
- Goes beyond exact string matches: automatically resolves compatible cross-match donors.
- Recipient `B+` automatically discovers compatible `B-`, `O+`, and `O-` donors, labeled with clear tags:
  - `Exact Match`
  - `Universal Donor (O-)`
  - `Cross-Match Compatible`

### 4. 🎖️ Gamification Tiers & Printable Certificate of Appreciation
- Automated donor recognition tiers based on donation volume:
  - 🥉 **Bronze Lifesaver** (1–2 donations)
  - 🥈 **Silver Champion** (3–4 donations)
  - 🥇 **Gold Hero** (5–9 donations)
  - 💎 **Platinum Guardian** (10+ donations)
- **One-Click Certificate Generator**: Opens a printable certificate complete with donor name, blood units saved, unique ID, gold seal, and medical director authorization.

### 5. 🩺 60-Second Medical Eligibility Screener
- Interactive 4-step health screener assessing age, weight, 90-day donation cooldown, and health status.
- Generates an official **"Green Pass: Safe to Donate"** digital clearance badge.

### 6. 📞 Immediate Contact & SOS Modal
- Direct calling (`tel:`), pre-filled WhatsApp emergency template, and high-priority SMS broadcast ping.

### 7. ⏱️ Real-time Availability Countdown Clock
- Live ticking clock (`HH:MM:SS`) that tracks the donor's on-call window and auto-expires to prevent stale emergency listings.

### 8. 📄 Data Export
- 1-click **CSV Roster Export** and printer-friendly view for hospital coordinators.

---

## 🏃 Running the Module

```bash
cd "branch-govind"
# Open index.html directly or with Live Server
```
Or view the live test server at: **http://localhost:4000**
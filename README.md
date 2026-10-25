<div align="center">

# 🏎️⚡ SKY ROADSTER INFINITY
### *3D Hypersonic Sunset Expressway & Online Multiplayer Arcade*

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)
[![Engine](https://img.shields.io/badge/Engine-Three.js_WebGL2-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org)
[![Database](https://img.shields.io/badge/Database-Supabase_PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Frontend](https://img.shields.io/badge/React_19-Vite_8-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Styles](https://img.shields.io/badge/Tailwind_CSS_v4-Neon_HUD-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Game Type](https://img.shields.io/badge/Genre-3D_Endless_Racer-FF4154?style=for-the-badge)](https://github.com)

<p align="center">
  <b>Pilot an aerodynamic electric roadster across an infinite procedural sunset expressway. Weave between multi-class traffic, engage dual vertical thrusters to jump highway blockades, wager gold coins in 60-second online multiplayer derbies, and test your hypersonic reflex limits past 5,000 meters.</b>
</p>

[🎮 Play Live Game](https://ais-dev-zk7lyjsnekml5tuhebzfkx-631325621069.asia-southeast1.run.app/) • [🏆 Global Leaderboards](#-database--backend-supabase) • [🚀 Deploy to Vercel](#-deploy-to-vercel) • [📖 Database Setup](#-supabase-database-schema)

---

</div>

## 📸 Arcade Preview

```text
 ____________________________________________________________________________________
|  [SPEED: 320 KM/H]      [DISTANCE: 4,820 M]      [COINS: 1,450 🪙]      [FPS: 60]  |
|                                                                                    |
|                                       ☁️ ☀️ ☁️                                       |
|                                 ( Glowing Sunset )                                 |
|                                                                                    |
|              🏢                                                   🏢              |
|          🏢  |   |                                             |   |  🏢          |
|      🏢      |   |        [TRUCK]                [SUV]         |   |      🏢      |
|              |   |                                             |   |              |
|              |   |                     [TEMPO]                 |   |              |
|              |   |                                             |   |              |
|              |   |               ⚡ [PLAYER ROADSTER] ⚡         |   |              |
|              |___|=============================================|___|              |
|                   [◀ STEER LEFT]      [🚀 JUMP / FLY]      [STEER RIGHT ▶]        |
|____________________________________________________________________________________|
```

---

## 🌟 Core Game Features

### 🏎️ 1. Realistic 3D Automotive Dynamics
* **Aerodynamic Electric Roadster**: Precision procedural mesh with custom carbon-fiber splitter, metallic chassis shading, curved cockpit canopy, illuminated quad-LED headlamps, and cyber-red neon tail bars.
* **Multi-Class Traffic Ecosystem**: High-variety procedural AI traffic obstacles including:
  * 🚚 **Heavy Freight Trucks & Semis** (Heavy cargo trailers, dual hazard reflectors)
  * 🚙 **Modern SUVs / XUVs** (Raised roof racks, tinted side glass)
  * 🛺 **Commercial Tempos & Vans** (Compact utility vehicles)
  * 🚗 **Highway Sedans** (Streamlined civilian commuter vehicles)
* **Dynamic Sunset Skybox**: Atmosphere that progressively transitions from golden amber dusk to deep purple twilight and cyber midnight as your distance increases.

### 🚀 2. Ground & Aerial Dual-Mode Drive
* **Ground Weaving**: High-speed lane transitions with responsive physics.
* **Vertical Flight Thrusters**: Tap `SPACE` or on-screen thrust trigger to engage dual rocket exhaust flames and soar over congested multi-lane roadblocks.
* **Nitro Warp & Shield**: Collect boost capacitors and magnetic coin prisms while racing.

### ⏱️ 3. 60-Second Real-Time Online Multiplayer Derby
* **100 Gold Coin Entry Pot**: Place a 100-coin wager before entering the online matchmaking lobby.
* **Live Rival Ghost AI & Split Bar**: Race head-to-head against online ghost roadsters with a real-time delta score bar (`+420 pts Ahead` / `-150 pts Behind`).
* **Winner Takes All**: The racer with the highest score at the 60.0-second buzzer claims the 200-coin bounty.

### 🧠 4. Hypersonic Speed Surge (>5,000m) & Reflex Latency Test
* **Hypersonic Acceleration**: Past 5,000 meters, vehicle velocity surges up to **486 km/h (135 m/s)** with road-blur speed lines and high-frequency camera shake.
* **Driver Reflex Evaluation**: Measures real-time response latency (ms) during close-call dodges and awards competitive driver ranks:
  * 🏆 **Rank S+**: < 160ms (Pro Esports Reflexes)
  * 🥇 **Rank S**: 160ms – 210ms (Elite Reaction Time)
  * 🥈 **Rank A**: 210ms – 270ms (Swift Instincts)
  * 🥉 **Rank B & C**: > 270ms (Casual Driver)

### 🏅 5. Career Mode & Star Milestones
* 5 hand-crafted career stages with increasing obstacle densities:
  * **Stage 1**: Sunset Cruise (1,000m target)
  * **Stage 2**: Golden Hour Traffic (2,500m target)
  * **Stage 3**: Rush Hour Gridlock (4,000m target)
  * **Stage 4**: Midnight Expressway (6,000m target)
  * **Stage 5**: Hyperdrive Infinity (10,000m hypersonic gauntlet)

---

## 🕹️ Controls Guide

| Action | Keyboard | Touchscreen / Mobile | Gamepad |
| :--- | :--- | :--- | :--- |
| **Steer Left** | `A` or `← Left Arrow` | Tap Left Screen Half / HUD Button | D-Pad Left / L-Stick |
| **Steer Right** | `D` or `→ Right Arrow` | Tap Right Screen Half / HUD Button | D-Pad Right / L-Stick |
| **Engage Flight** | `Spacebar` or `W` or `↑` | Tap **"JUMP"** HUD Button | Button A / X |
| **Nitro Boost** | `Shift` | Auto-triggered on capacitor pickup | Button B / R2 |
| **Pause Game** | `Escape` or `P` | Top-Right Pause Icon | Start / Menu |

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **3D Engine** | Three.js (r186) | WebGL2 scene graph, procedural geometry, custom materials, post-processing |
| **UI Framework** | React 19 + TypeScript | High-performance state management with HUD overlays |
| **Styling** | Tailwind CSS v4 | Pure utility-first styling with cyber-arcade theme |
| **Database** | Supabase (PostgreSQL) | Global Top 10 leaderboard, player coin balances, and multiplayer history |
| **Security** | Row Level Security (RLS) | Hardened anon-key policies restricting unauthorized database modifications |
| **Bundler** | Vite 8 | Ultra-fast HMR and optimized production asset chunking |
| **Deployment** | Vercel | Production edge hosting with automated SPA rewrites |

---

## 📦 Project Directory Structure

```bash
├── public/
│   ├── robots.txt              # Search engine crawler directives
│   ├── sitemap.xml             # XML sitemap for Google Search Console
│   └── favicon.ico
├── src/
│   ├── components/             # React HUD overlays, leaderboards, modals
│   │   ├── CareerModal.tsx     # 5-Stage Career challenge system
│   │   ├── GameOverModal.tsx   # Crash stats, reflex rank & rewarded retry
│   │   ├── HUD.tsx             # Real-time speedometer, coin counter & health
│   │   ├── LeaderboardModal.tsx# Global Top 10 Supabase records
│   │   └── MultiplayerModal.tsx# 60s 100-coin wager derby lobby
│   ├── game/
│   │   ├── GameEngine.ts       # Core Three.js loop, car geometries & collision
│   │   └── SoundManager.ts     # Synthesized Web Audio engine & crash effects
│   ├── services/
│   │   └── supabase.ts         # Supabase client connector with local fallbacks
│   ├── App.tsx                 # Main application state & scene container
│   ├── main.tsx                # Entry point
│   └── types.ts                # TypeScript interfaces
├── supabase_schema.sql         # Idempotent PostgreSQL schema with RLS policies
├── vercel.json                 # Vercel SPA rewrites & security headers
├── .vercelignore               # Clean deployment excludes
└── package.json
```

---

## 💾 Database & Backend (Supabase)

This game utilizes Supabase PostgreSQL with **Row Level Security (RLS)**. No private backend servers or secret keys are exposed to the client.

### Quick Setup:
1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to **SQL Editor** -> **+ New query**.
3. Open `supabase_schema.sql` from this repository, paste its contents, and click **Run**.
4. Retrieve your **Project URL** and **`anon` Public Key** from **Project Settings** -> **API**.

### Tables Created:
* `leaderboard`: Global Top 10 driver names, high scores, distance, and timestamps.
* `user_wallets`: Persistent gold coin balances across runs.
* `multiplayer_matches`: PVP sprint match history, wagers, and victory logs.

---

## 🚀 Deploy to Vercel

Deploy your own high-speed arcade instance in less than 2 minutes:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Fork or clone this repository to GitHub.
2. In Vercel, import your repository.
3. In **Project Settings** -> **Environment Variables**, add:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
4. Click **Deploy**!

---

## 💻 Local Development

```bash
# 1. Clone the repository
git clone https://github.com/your-username/sky-roadster-infinity.git
cd sky-roadster-infinity

# 2. Install dependencies
npm install

# 3. Configure environment variables (optional)
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# 4. Start local development server
npm run dev

# 5. Build for production
npm run build
```

---

## 🔍 SEO, AEO & Web Vitals
* Fully configured **OpenGraph** and **Twitter Summary Cards**.
* Embedded **Schema.org (`VideoGame` & `WebApplication`)** JSON-LD metadata for Google Knowledge Graph and AI search scrapers.
* Automated **sitemap.xml** and **robots.txt** for Google Search Console indexing.

---

## 📜 License
Distributed under the Apache-2.0 License. See `LICENSE` for more information.

<div align="center">
  <sub>Built with passion for high-speed arcade gaming. Press Start and Own the Sunset.</sub>
</div>

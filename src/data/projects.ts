/**
 * Portfolio content layer — separated from all rendering logic.
 *
 * Sources: the owner's project archive (projects.json), the CROC OS
 * firmware source (v0.5.3), and the live Team VoltEdge site
 * (https://voltedge007.pages.dev/). Nothing here is inferred or invented:
 * records without confirmed copy stay `forthcoming` and the UI renders a
 * pending state for them.
 *
 * SECURITY: firmware contains WiFi credentials and an API key — those are
 * never recorded here. Only public, generic stack facts appear below.
 */

export interface ProjectLink {
  label: string
  href: string
}

export interface ProjectContent {
  id: string
  tagline: string
  description: string
  /** Confirmed technologies only — never inferred. */
  stack: string[]
  links: ProjectLink[]
  status: 'published' | 'forthcoming'
}

const GITHUB = 'https://github.com/xCYBERx01'

export const IDENTITY_CONTENT = {
  name: 'Ahmed',
  role: 'Robotics & AI Student',
  tagline: 'Building intelligent hardware and autonomous systems.',
  description:
    'Ahmed Irfan Akrami — robotics and AI student. Mechanical Lead of Team ' +
    'VoltEdge (Team 007), Community Champions at the National Robotics ' +
    'League 2025 national finals, IIT Bombay. Builder of embedded companions, ' +
    'competition robots, and full-stack telemetry. Select a node to inspect.',
  focusAreas: ['Embedded systems', 'Competition robotics', 'IoT telemetry', 'Automation'],
} as const

export const PROJECTS: Record<string, ProjectContent> = {
  'croc-os': {
    id: 'croc-os',
    tagline: 'Interactive ESP32 desk companion with an animated OLED personality.',
    description:
      "Croc OS is an embedded desk companion built around the ESP32, designed to feel alive rather than behave like a static display project. It runs two core modes: a FACE mode where an animated character reacts to touch across 16 expressions — idle, happy, love, surprised, curious, sleepy, angry, dizzy, proud, shy, hungry and more — with blinking, eye-tracking and idle personality events; and an INFO mode that turns the 128×64 OLED into a 7-page dashboard: NTP-synced clock, live weather via OpenWeatherMap, virtual-pet happiness/hunger stats, a typewriter-reveal Word of the Day, a 25-minute Pomodoro timer, system status, and live PC telemetry (CPU/RAM/GPU streamed over serial as JSON). Two capacitive touch sensors drive a gesture engine — taps pet or feed the companion, holds trigger yawns or scolds, and a dual-hold flips between FACE and INFO modes — with gesture logic separated by mode so a navigation tap can't register as a pet interaction. State decays on a 30-second tick and inactivity past three minutes puts Croc to sleep. Evolved v0.2 → v0.5.x out of an earlier ESP32/SH1106 lyrics-display project that established the OLED rendering fundamentals.",
    stack: [
      'ESP32',
      'SH1106 128×64 OLED',
      'TTP223 touch ×2',
      'Arduino / C++',
      'Adafruit GFX + SH110X',
      'ArduinoJson',
      'OpenWeatherMap',
      'NTP',
    ],
    links: [{ label: 'GitHub', href: GITHUB }],
    status: 'published',
  },
  voltedge: {
    id: 'voltedge',
    tagline: 'EdgeBot — Community Champions, NRL 2025 national finals, IIT Bombay.',
    description:
      'Team VoltEdge (Team ID 007): six twelfth-grade engineers from Bhatkal who re-engineered the competition BaseBot into EdgeBot in a six-day sprint and won the Community Champions title at the National Robotics League 2025 national finals at IIT Bombay. EdgeBot is a 4-motor 4WD differential-tank machine (36 cm wide, 26 cm retracted / 37 cm gripper-forward) on a dual-layer acrylic + steel chassis with a custom 3D-printed shell and rear aero wing — sensor-fused with a 5-array IR line tracker, gyroscope closed-loop heading and HC-SR04 ultrasonic braking, driven over low-latency Bluetooth from a PS5 gamepad with analog PWM arm curves. As Mechanical Lead, Ahmed owned the physical machine: dual-layer chassis alignment and structural rigidity, torque balancing across all four drive motors to kill drift, arm and gripper assembly, and bracing that eliminated chassis flex at full gripper reach. The team also ran STEM outreach for 60+ students at Ali Public School, Bhatkal.',
    stack: [
      'HEXA ESP32',
      'MDD10 driver',
      '4-motor 4WD',
      '5× IR array',
      'Gyroscope',
      'HC-SR04',
      'PS5 gamepad BT',
    ],
    links: [
      { label: 'Live site', href: 'https://voltedge007.pages.dev/' },
      { label: 'GitHub', href: GITHUB },
    ],
    status: 'published',
  },
  'arm-5dof': {
    id: 'arm-5dof',
    tagline: 'Project node — manipulator hardware.',
    description: 'Full write-up forthcoming. Details will be added here from confirmed build notes.',
    stack: [],
    links: [],
    status: 'forthcoming',
  },
  interests: {
    id: 'interests',
    tagline: 'Where the work keeps pointing.',
    description:
      'Embedded companions and animated interfaces, autonomous navigation and sensor fusion, real-time telemetry pipelines, agricultural automation, and full-stack builds that put hardware on the internet.',
    stack: [],
    links: [],
    status: 'published',
  },
  contact: {
    id: 'contact',
    tagline: 'Open channels.',
    description: 'GitHub is the fastest way to reach Ahmed and follow the builds. More channels forthcoming.',
    stack: [],
    links: [{ label: 'GitHub', href: GITHUB }],
    status: 'published',
  },
  desko: {
    id: 'desko',
    tagline: 'A portfolio presented as a bootable desktop OS.',
    description:
      'Desko reimagines a personal portfolio as a desktop environment instead of a stack of webpages. It boots with a startup sequence into a dark desktop with draggable, resizable windows, a top bar and dock. A working terminal lets visitors type commands to explore projects, and one app is a live canvas ecosystem (Meadow) embedded as a window — two projects in one demo of app architecture inside a single-page OS.',
    stack: ['React', 'JavaScript', 'HTML/CSS', 'Canvas API'],
    links: [{ label: 'GitHub', href: GITHUB }],
    status: 'published',
  },
  meadow: {
    id: 'meadow',
    tagline: 'Agent-based predator-prey ecosystem simulator.',
    description:
      'Meadow simulates a predator-prey ecosystem where prey reproduce, grow and die off while predators hunt, feed, starve and die based on prey availability — the feedback loop described by Lotka-Volterra equations — producing emergent population oscillations over time. It runs standalone and as an embedded live widget inside Desko, demonstrating simulation logic and component reusability at once.',
    stack: ['JavaScript', 'Canvas rendering', 'Lotka-Volterra dynamics'],
    links: [{ label: 'GitHub', href: GITHUB }],
    status: 'published',
  },
  kharcha: {
    id: 'kharcha',
    tagline: 'Zero-friction expense tracker for UPI, cash and card.',
    description:
      'Kharcha is built on a simple observation: people skip logging small purchases because it takes too much effort. It supports UPI, cash and card transaction types, auto-categorizes spending to cut manual tagging, and visualizes the breakdown in a donut chart with JSON local persistence. The design goal throughout was fast input over feature overload — logging an expense should take seconds, not a form.',
    stack: ['JavaScript', 'JSON persistence', 'Chart visualization'],
    links: [{ label: 'GitHub', href: GITHUB }],
    status: 'published',
  },
  'sportcast': {
    id: 'sportcast',
    tagline: 'Tournament platform with live scoring and AI insights.',
    description:
      'A full-stack tournament management app covering teams, players, matches, scores and standings, with live score updates over Supabase Realtime on PostgreSQL and Gemini API integration generating AI-assisted match summaries and insights on top of the live data. Frontend, database, auth, realtime sync and an AI layer working together.',
    stack: ['Next.js', 'Supabase Auth + Realtime', 'PostgreSQL', 'Gemini API'],
    links: [{ label: 'GitHub', href: GITHUB }],
    status: 'published',
  },
  anicatch: {
    id: 'anicatch',
    tagline: 'Photograph real wildlife — AI mints the collectible card.',
    description:
      'A Pokémon GO-style Android game where the player photographs real animals and birds instead of catching fictional creatures. An AI vision pipeline identifies the species, extracts distinguishing visual features and generates a collectible digital card, persisted via Firebase — turning real-world biodiversity exploration into a gamified collection loop.',
    stack: ['Flutter', 'Firebase', 'AI species ID'],
    links: [{ label: 'GitHub', href: GITHUB }],
    status: 'published',
  },
  'field-shutter': {
    id: 'field-shutter',
    tagline: 'Weather-reactive crop canopy — shutters in under 4.2 s.',
    description:
      'Automated Field Shutter System, engineered by Ahmed as his individual VoltEdge contribution and shown in the team pit at the IIT Bombay finals. Analog rain sensing plus an anemometer watch storm thresholds; on detection a motorized linear-pulley track deploys protective shutters over crops in under 4.2 seconds — no human intervention — with failsafe manual override and battery backup. Pairs automation with resource conservation.',
    stack: ['Rain sensor', 'Anemometer', 'Linear-pulley actuation', 'Failsafe override'],
    links: [
      { label: 'Team site', href: 'https://voltedge007.pages.dev/' },
      { label: 'GitHub', href: GITHUB },
    ],
    status: 'published',
  },
  drone: {
    id: 'drone',
    tagline: 'Flown multirotor integrating propulsion, FC and radio.',
    description:
      'A hands-on aerial robotics build integrating airframe, motors + ESCs, a flight controller for stabilization, a radio control link and power management into one flight-capable platform — experience balancing mechanical, electrical and control subsystems inside the weight and power constraints of an aerial vehicle. A companion Remote Drone-Assisted Harvesting concept (optical ripeness detection, robotic snip) earned an Aspire Scientist Award within the VoltEdge program.',
    stack: ['Airframe', 'Motor/ESC propulsion', 'Flight controller', 'Radio link'],
    links: [{ label: 'GitHub', href: GITHUB }],
    status: 'published',
  },
  'moon-rover': {
    id: 'moon-rover',
    tagline: '6-wheel rover: RF, WiFi/app and autonomous line-following.',
    description:
      'A 6-wheel-drive rover in lunar-rover styling whose core challenge was multi-mode control: manual RF drive, remote WiFi/app control, and autonomous line-following — one drivetrain and firmware supporting all three without conflicting control logic — plus a small onboard OLED for live status.',
    stack: ['6× DC geared motors', 'ESP32/Arduino-class MCU', 'RF + WiFi control', 'Line sensors', 'OLED status'],
    links: [{ label: 'GitHub', href: GITHUB }],
    status: 'published',
  },
  'iot-telemetry': {
    id: 'iot-telemetry',
    tagline: 'Ground control station: 50 Hz MQTT, live PID, joystick override.',
    description:
      'Ground control station for fast robots (line-tracker / NRL class). The ESP32 polls sensors and driver state at 50 Hz, publishes lightweight JSON to Mosquitto over WiFi; a Node.js backend reformats into InfluxDB for replay while a Next.js frontend renders live PID error curves over WebSockets and publishes joystick/slider overrides back through the broker. Optimized for sub-millisecond latency, not batch logging.',
    stack: ['ESP32', 'Mosquitto MQTT', 'Node.js', 'InfluxDB', 'Next.js + Recharts'],
    links: [{ label: 'GitHub', href: GITHUB }],
    status: 'published',
  },
  'field-analyzer': {
    id: 'field-analyzer',
    tagline: 'Pandas-powered trend analytics for the automated field.',
    description:
      'Analytics backend for the Auto-Field Shutter: ESP32 field nodes read soil moisture, rainfall ticks and shutter status, cache to SD/flash, and POST batched JSON via REST. PostgreSQL stores logs by zone/date/hardware ID; a Pandas worker computes cumulative harvest, flags anomalies like moisture-drop leaks, and predicts shutter close times for a React + Chart.js report dashboard. Built for days/weeks trend analysis rather than low-latency control.',
    stack: ['ESP32 deep sleep', 'FastAPI', 'Pandas', 'PostgreSQL', 'React + Chart.js'],
    links: [{ label: 'GitHub', href: GITHUB }],
    status: 'published',
  },
  projectdirec: {
    id: 'projectdirec',
    tagline: 'Parts directory + compatibility workbench for makers.',
    description:
      'Community-driven parts directory and price comparison for ESP32s, drivers and sensors: interactive pinout diagrams, cross-vendor price/stock tracking via a scraper ingestion fleet, a Workbench builder that flags 5 V vs 3.3 V logic mismatches and I2C/SPI conflicts, user loadouts, and typo-tolerant faceted filtering. A directory and build planner, not a cart.',
    stack: ['Next.js SSR', 'Python Scrapy', 'Typesense/Algolia', 'PostgreSQL'],
    links: [{ label: 'GitHub', href: GITHUB }],
    status: 'published',
  },
}

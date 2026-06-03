# 🪞 Mirror Me | Enterprise AI Twin Portal

Mirror Me is a high-performance, secure digital workspace designed to provision digital twins, synthesize custom voice profiles, and track conversational session analytics natively. Built using a distributed decoupled architecture, the ecosystem integrates a Next.js App Router frontend with a robust Node.js/Express enterprise backend.

---

## 🛠️ System Architecture & Stack Overview

The application is structured as a mono-repository containing two primary independent workspaces:

### 1. Backend Core (`/backend`)
* **Runtime Framework:** Node.js with Express and TypeScript.
* **Database Pipeline:** MongoDB utilizing Mongoose ODM layers for transaction logging and identity mapping.
* **Security Layer:** Stateless JWT authorization headers with bcrypt-password hashing routines.
* **Microservice Engines:** Integrated pipelines connecting to AWS S3 (Media Vault), OpenAI (Transcription & Sentiment), ElevenLabs (Vocal Synthesis), and HeyGen (Avatar Video Pipelines).

### 2. Frontend Panel (`/frontend`)
* **Core Framework:** Next.js 14+ (App Router architecture) using Client/Server components.
* **Design Engine:** Tailwind CSS configured with a unified dark cyberpunk theme aesthetic.
* **Atomic Components:** Reusable UI components tracking robust accessibility criteria (`Button`, `Card`, `Input`, `Table`).
* **Visual Systems:** Real-time Web Audio API and HTML5 Canvas context engines for recording indicators (`WaveformVisualizer`).

---

## 🚀 Rapid Local Deployment Guide

### Prerequisites
Ensure your local machine has the following foundational tools installed:
* **Node.js** >= 18.0.0
* **npm** >= 9.0.0
* **MongoDB** (Running instance on local port `27017` or an active Atlas connection cluster URI)

---

### Step 1: Environment Provisioning
Initialize your tracking parameters by cloning the baseline keys. Execute this in your system terminal:

```bash
# From the absolute project root folder, copy the blueprints
cp .env.example .env

# Duplicate the variables directly into your decoupled application domains
cp .env.example backend/.env
cp .env.example frontend/.env

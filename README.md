# 🏙️ Smart Civic Issue

A full-stack civic issue reporting platform that enables citizens to report local problems, track their status, and helps administrators manage civic complaints efficiently.

The platform also includes an AI/ML microservice for issue classification, priority prediction, and duplicate issue detection.

---

## 📌 Overview

Smart Civic Issue is designed to improve the way civic problems are reported and managed.

Citizens can report issues such as:

- 🚧 Potholes
- 🗑️ Garbage accumulation
- 💡 Streetlight problems
- 💧 Water leakage
- 🚰 Sewage-related issues
- 🌳 Park-related issues
- 🏙️ Other local civic concerns

Users can submit issue details and images, track reported issues, and monitor their status.

The system includes separate interfaces and backend functionality for managing reported civic issues.

---

## ✨ Key Features

### 👤 Citizen Features

- 📝 Report civic issues
- 🖼️ Upload issue images
- 📍 Provide issue-related information
- 📊 Track submitted issues
- 🔄 Monitor issue status
- 🔐 User authentication
- 👤 User profile management
- 🔎 View issue details

### 🛡️ Admin / Officer Features

- 📋 Manage reported civic issues
- 📊 View issue dashboards
- 🔄 Update issue status
- 🗂️ Manage issue records
- 🗺️ Heatmap visualization
- 🔔 Notification functionality

### 🤖 AI/ML Features

The project includes a Python-based ML microservice that provides:

- 🏷️ **Issue Classification** — identifies the category of a reported issue from text
- 🚨 **Priority Prediction** — predicts issue urgency as low, medium, or high
- 🔍 **Duplicate Detection** — identifies potentially similar reports using semantic similarity and geographical filtering
- 🧠 **Combined Analysis** — provides AI-powered analysis through a single endpoint

---

## 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │   React Frontend     │
                    │    Vite / JSX        │
                    │      :3000            │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Node.js Backend    │
                    │   Express.js API     │
                    │      :5000            │
                    └───────┬───────┬──────┘
                            │       │
                ┌───────────┘       └────────────┐
                ▼                                ▼
       ┌─────────────────┐              ┌─────────────────┐
       │    MongoDB      │              │  Python ML      │
       │    Database     │              │  Microservice   │
       └─────────────────┘              │      :8000      │
                                        └─────────────────┘

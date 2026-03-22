# ⚡ Rate Limiter Lab

![Rate Limiter Lab Overview](https://img.shields.io/badge/Status-Active-brightgreen)
![React](https://img.shields.io/badge/Frontend-React%20%28Vite%29-61DAFB?logo=react)
![Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot-6DB33F?logo=springboot)
![Tailwind CSS](https://img.shields.io/badge/Style-Tailwind-38B2AC?logo=tailwind-css)

A full-stack, real-time visualization platform for learning, testing, and understanding modern API Rate Limiting algorithms. **Rate Limiter Lab** breaks down complex backend constraints into beautiful, interactive, and easily understandable frontend simulations.

---

## 🚀 Features

* **Five Core Algorithms**: Complete implementations and real-time visualizations for:
  - 🪣 Token Bucket
  - 🚰 Leaky Bucket
  - 🪟 Fixed Window Counter
  - 📜 Sliding Window Log
  - 📊 Sliding Window Counter
* **Interactive Dashboard**: Clean, glassmorphism-inspired UI to select algorithms and view their high-level summaries and parameters.
* **Algorithm Details Section**: In-depth, developer-focused documentation built right into the app. See how each algorithm works step-by-step, its pros & cons, and real-world industry use cases.
* **Real-time Metrics**: Live request simulation with WebSocket streams feeding dynamic charts and request logs.
* **Control Panel**: Adjust parameters (e.g., bucket capacity, window size, simulation speed) on the fly and watch the algorithm adapt.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (via Vite)
- **Styling**: Tailwind CSS v4, custom Vanilla CSS (Glassmorphism, animated gradients)
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Charting**: Recharts
- **Communication**: SockJS Client, STOMP for WebSockets, Axios

### Backend
- **Framework**: Spring Boot (Java)
- **Security**: JWT Authentication
- **Data/State**: In-memory (or configure for Redis/Mongo)
- **Concurrency**: Thread-safe algorithm implementations

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+)
- Java 17+
- Maven

### Running the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Build and run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```
   *The backend will typically start on `localhost:8080`.*

### Running the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will typically start on `localhost:5173`. Open this URL in your browser.*

---

## 📖 Educational Impact

Rate Limiter Lab is designed not just as a piece of software, but as an educational tool for system design. By reading the integrated "Algorithm Details" and simultaneously watching the simulation, developers can intimately understand the "Boundary Problem" of Fixed Windows, the memory intensity of Sliding Window Logs, and the perfect smoothness of the Leaky Bucket.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to gently prod the logic, write new algorithms, or refine the UI. 

---

## ⚖️ License

Distributed under the MIT License. See `LICENSE` for more information.

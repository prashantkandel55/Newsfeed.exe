# Xposter – Real-Time News Terminal & GenAI Thread Builder

**Xposter** is a high-performance, React-based web application designed as a professional "Terminal Newsroom." It combines real-time news headlines with a powerful AI generation pipeline to instantly draft highly-engaging, viral social media posts and 5-part threads for X (Twitter).

![Xposter Banner Preview](https://via.placeholder.com/1200x500/0c0c0f/6366f1?text=XPOSTER+.EXE)

## ⚡ Features

- **Live News Feeds**: Fetches real-time top headlines across multiple topics (Breaking, World, Tech, Politics) via the **GNews API**, alongside top stories from **Hacker News**.
- **AI-Powered Post Generation**: Select an article and click **⚡ Generate Post** to have **Groq's** Llama 3 70B model draft a hyper-viral single tweet or a complete 5-part thread.
- **Viral Framework Adherence**: The AI pipeline is tightly controlled via semantic system prompting to guarantee scroll-stopping hooks, appropriate emojis, proper line breaks, sentiment badges (🔴 #BREAKING, 🔵 #ANALYSIS), and clear calls-to-action.
- **Editorial UI/UX**: Built with an institutional-grade "Hyper-Violet" design system featuring a deep space dark theme, glassmorphism (`backdrop-blur`), and fluid micro-animations powered by **Framer Motion**.
- **Direct Transmitter**: Once a post is generated, you can instantly copy the text and click **Transmit** to open the native X compose intent window.

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS, Tailwind Merge, clsx
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Network**: Axios
- **AI/LLM**: Groq API (`llama3-70b-8192` & `llama-3.3-70b-versatile`)
- **News Sources**: GNews API & Hacker News Firebase API

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js (v18+) and npm installed.

### Installation

1. **Clone the repository** (or navigate to the project directory)
   ```bash
   cd Xposter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

> **Note:** The application uses hardcoded API keys for GNews and Groq located in `src/App.jsx`. In a production environment, you should move these to an `.env` file and strictly manage them securely.

## ⚙️ How It Works

1. **Dashboard Start**: Upon loading, Xposter fetches real-time links and imagery. All cards initialize in an `idle` state.
2. **Review & Trigger**: Find a compelling article and click **⚡ Generate Post**. The app transitions to a sleek `loading` state, exclusively sending *that* article context to Groq.
3. **Review Output**: Once successful, the card shifts into `success` state. You can toggle between `>_ POST` (Single Tweet) and `≡ THREAD` (Thread view) on the fly.
4. **Publish**: Add suggested hashtags, copy specific cells of the thread, or hit **Transmit** to automatically send it to X.

## 📝 License

This project is intended for personal and educational use. Feel free to fork and modify!

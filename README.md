# Renana Friedman - Personal Portfolio Website

🔗 **Live Website:** [renana-friedman.up.railway.app](https://renana-friedman.up.railway.app/)

Welcome to my personal portfolio website! This project showcases my professional journey, skills, and projects as a Backend Developer. It features a modern, responsive design and integrates a real-time conversational AI avatar.

## 🚀 Key Features

*   **AI Portfolio Assistant (RAG + WebRTC):** An interactive, real-time digital avatar representing me. Visitors can chat with the avatar to ask questions about my background, skills, and experience.
    *   **Retrieval-Augmented Generation (RAG):** The assistant queries a PostgreSQL database using `pgvector` semantic search over my CV and interview materials.
    *   **WebRTC Video Streaming:** Integrates with the D-ID API to stream video responses with near-zero latency, including a cost-efficient local video greeting.
*   **Projects Showcase:** A curated, balanced 2x2 grid highlighting my technical projects, such as the *Smart Expense Tracker* and *Allergen Identification* mobile app.
*   **Interactive Experience & Education Timeline:** Highlights my professional work experience (including custom WhatsApp bots verified by Meta) and my BSc in Software Engineering (JCT, GPA 90).
*   **Fully Responsive UI:** Optimized for desktop and mobile layouts with smooth CSS cross-fade transitions and modern typography.

## 💻 Tech Stack

### Frontend
*   **Core:** React (Functional Components, Custom Hooks)
*   **Build Tool:** Vite
*   **Styling:** Vanilla CSS (CSS Modules for scope safety)

### Backend (RAG Assistant)
*   **API Framework:** FastAPI (Python)
*   **AI & LLM Orchestration:** LangChain, OpenAI API (`gpt-4o-mini`, Embeddings)
*   **Database:** PostgreSQL with `pgvector` extension for vector search
*   **Video Generation:** D-ID API (WebRTC Streaming)

## 🛠️ Getting Started

To run the frontend locally:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/remanuel1/portfolio.git
    cd portfolio
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open `http://localhost:5173` in your browser.

*Note: The AI avatar assistant requires the RAG backend server to be running. See the RAG backend repository instructions for setup.*

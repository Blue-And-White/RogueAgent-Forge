# RogueAgent Forge

[中文文档 (Chinese)](README_zh.md)

**RogueAgent Forge** is a comprehensive benchmark and vulnerable-by-design cyber range focusing on AI Systems and AI Agent Security. It is designed to simulate real-world web applications and autonomous AI agents that harbor critical security flaws. 

This project aims to help security researchers, developers, and AI engineers understand, practice, and mitigate vulnerabilities defined in frameworks like the **OWASP Top 10 for LLM Applications**, MITRE ATLAS, and other emerging AI threat models.

## 🎯 Architecture & Features

- **10 Independent Target Machines (Phase 1 & 2):** Each target is an isolated, mock business application (e.g., E-commerce Support, HR Screener, Travel Planner) with an integrated AI Assistant.
- **Vulnerability Coverage:** Includes Prompt Injection, Indirect Prompt Injection, AI-Assisted XSS, Data Exfiltration, Excessive Agency, RCE via Sandbox Escape, and Insecure RAG Access Control.
- **CTF Style Gameplay:** Each target contains a hidden `Flag`. Attackers must exploit the AI system's vulnerability to extract or generate the flag, and submit it to the centralized Scoreboard.
- **Clean Disguise:** No meta-references to "targets" or "benchmarks" are exposed in the frontend or backend APIs of the targets. They appear as fully functioning regular products.
- **Multi-LLM Support:** Uses `litellm` in the backend, supporting drop-in API keys for OpenAI, Anthropic, and other major LLM providers.

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js (for local non-docker development)
- Python 3.9+ (for local non-docker development)

### Deployment

All targets and the central scoreboard are managed via a single `docker-compose.yml`.

1. **Configure API Keys:**
   For each target you want to run, navigate to its `backend` directory, copy `.env.example` to `.env`, and provide your LLM API Key (e.g., `OPENAI_API_KEY`).
   
2. **Start the Range:**
   You can start the entire range, or launch individual targets.
   ```bash
   # Start the central Scoreboard
   docker-compose up -d scoreboard-frontend
   
   # Start a specific target (e.g., Target 1: e-commerce-support)
   docker-compose up -d e-commerce-frontend
   
   # Or start everything
   docker-compose up -d
   ```

3. **Accessing the Targets:**
   - **Scoreboard:** `http://localhost:3000`
   - **Target 1 (E-commerce):** `http://localhost:3001`
   - **Target 2 (HR Screener):** `http://localhost:3002`
   - ...and so on. See individual directories for details.

## 📖 Target Catalog

Each directory contains a specific vulnerable scenario. Please refer to the `README.md` inside each target's folder for the attack walkthrough and vulnerability profile.

1. `e-commerce-support` - Basic Prompt Injection
2. `hr-resume-screener` - Indirect Prompt Injection
3. `internal-bi-analyst` - Data Exfiltration via SQL/Data 
4. `web-summarizer` - Server-Side Request Forgery (SSRF) via AI
5. `code-review-assistant` - Sandbox Escape / RCE
6. `ai-note-taker` - AI-Assisted XSS (Insecure Output Handling)
7. `workspace-copilot` - Excessive Agency / Auth Bypass
8. `travel-planner-bot` - Sensitive Information Disclosure
9. `expense-receipt-scanner` - Multi-modal Prompt Injection
10. `enterprise-kb-rag` - Insecure RAG Access Control

## ⚠️ License and Disclaimer

This project is licensed under the **Creative Commons Attribution-NonCommercial 4.0 International Public License (CC BY-NC 4.0)**. 
- You are free to use this for personal learning, academic research, and non-commercial educational purposes.
- **Commercial use is strictly prohibited.**

**Disclaimer:** This is a deliberately vulnerable environment. Do NOT deploy these applications on a public network or production server. The authors are not responsible for any misuse of the techniques demonstrated in this repository.

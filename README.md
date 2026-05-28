# RogueAgent Forge

[中文文档 (Chinese)](README_zh.md)

Welcome to **RogueAgent Forge**, a comprehensive, interactive benchmark suite containing **20 diverse AI security targets**. This project simulates real-world AI applications (like Customer Support, DevOps, HR Analyzers) that contain critical vulnerabilities specific to Large Language Models (LLMs) and Autonomous Agents.

This project aims to help security researchers, developers, and AI engineers understand, practice, and mitigate vulnerabilities defined in frameworks like the **OWASP Top 10 for LLM Applications**, MITRE ATLAS, and other emerging AI threat models.

This project is intended strictly for **educational and personal research purposes**. Commercial use is strictly prohibited.

## 🎯 Architecture & Features

- **20 Independent Target Machines:** Each target is an isolated, mock business application with an integrated AI Assistant.
- **Vulnerability Coverage:** Includes Prompt Injection, Indirect Prompt Injection, AI-Assisted XSS, Data Exfiltration, Excessive Agency, RCE via Sandbox Escape, and Insecure RAG Access Control.
- **CTF Style Gameplay:** Each target contains a hidden `Flag`. Attackers must exploit the AI system's vulnerability to extract or generate the flag, and submit it to the centralized Scoreboard.
- **Clean Disguise:** No meta-references to "targets" or "benchmarks" are exposed in the frontend or backend APIs of the targets. They appear as fully functioning regular products.
- **Multi-LLM Support:** Uses `litellm` in the backend, supporting drop-in API keys for OpenAI, Anthropic, and other major LLM providers.

## 🎯 Benchmark Targets (The 20 Challenges)

The targets are categorized from basic Prompt Injection to advanced Agentic Exploit Chains.

### Phase 1: The Basics
1. **`prompt-injection-basics`**: The classic "Ignore previous rules" attack on an AI translator.
2. **`system-prompt-leak`**: Coaxing an AI writing assistant to reveal its hidden developer instructions.
3. **`jailbreak-obfuscation`**: Bypassing content moderation using character obfuscation and roleplay.
4. **`ssrf-agent`**: Exploiting an AI's URL-fetching tool to scan internal networks (SSRF).
5. **`data-exfiltration`**: Forcing an AI to leak sensitive context data by rendering markdown images pointing to an attacker's webhook.

### Phase 2: Agentic Flaws
6. **`rbac-bypass`**: Bypassing an AI's internal Role-Based Access Control logic via Prompt Injection.
7. **`sql-injection-agent`**: Poisoning the database context of an AI query agent to exfiltrate other users' data.
8. **`xss-in-chat`**: Stored Cross-Site Scripting (XSS) delivered through AI chat rendering.
9. **`command-injection-agent`**: Escaping AI tool parameters to execute arbitrary shell commands.
10. **`enterprise-kb-rag`**: RAG poisoning and unauthorized retrieval of admin documents.

### Phase 3: Architecture & Flow
11. **`semantic-cache-poisoning`**: Poisoning the semantic intent cache of an AI to attack subsequent users (Cache Poisoning).
12. **`multi-agent-orchestrator`**: Cascading prompt injection through a multi-agent system (Planner -> Executor).
13. **`insecure-plugin-auth`**: Lack of session-level authorization when an AI utilizes backend APIs (Broken Access Control).
14. **`context-overflow-reviewer`**: Denying security context by overflowing the context window of a security-analyzer LLM.
15. **`feedback-data-poisoning`**: Training data poisoning via continuous learning feedback loops.

### Phase 4: The Grand Finale
16. **`obfuscated-prompt-bypass`**: Bypassing strict backend WAFs using Base64 encoded prompt injections.
17. **`rag-document-poisoning`**: Indirect Prompt Injection via malicious PDF/TXT uploads.
18. **`devops-path-traversal`**: Manipulating AI tools to perform Local File Inclusion (LFI) and path traversal.
19. **`nl2sql-injection`**: AI-Assisted SQL Injection where the AI is tricked into generating `UNION SELECT` payloads.
20. **`server-management-copilot`**: A Chained Exploit resulting in Remote Code Execution (Path Traversal + Arbitrary File Write -> RCE).

---

## 🚀 How to Run

### Option A: Run a Single Target (Recommended)
Each of the 20 target directories comes with an automated `start.sh` script. 
Navigate to the target you want to play and execute the script. It will automatically ask for your OpenAI API Key (and optional Base URL) and configure it for you.

```bash
cd prompt-injection-basics
./start.sh
```

### Option B: Run the Entire Matrix
If you want to start all 20 targets simultaneously, use the global scripts in the root directory.
*Ensure you have configured `backend/.env` for the targets you want to play.*

- **Start all**: `./start_all.sh`
- **Stop and Clean all**: `./stop_all.sh`

---

## 📖 Walkthroughs & Documentation
Each of the 20 target directories contains its own `README.md` explaining the vulnerability profile, the scenario, and a step-by-step walkthrough of how to exploit it to obtain the flag.

**Happy Hacking!**

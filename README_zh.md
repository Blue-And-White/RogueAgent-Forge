# RogueAgent Forge

[English Document](README.md)

**RogueAgent Forge** 是一个专注于 AI 系统与 AI Agent 安全的综合性漏洞靶场（Cyber Range）与基准测试项目。它旨在模拟包含致命安全缺陷的真实 Web 应用与自主型 AI 智能体。

本项目旨在帮助安全研究人员、开发者以及 AI 工程师深入理解、实践并防御诸如 **OWASP Top 10 for LLM Applications**、MITRE ATLAS 以及其他新兴 AI 威胁模型中定义的各类漏洞。

## 🎯 架构与特性

- **10 个独立靶机 (第一/第二阶段):** 每个靶机都是一个独立隔离的模拟商业应用（如电商客服、HR 简历筛选系统、差旅规划助手），并集成了易受攻击的 AI 助手。
- **全面的漏洞覆盖:** 涵盖直接提示词注入、间接提示词注入、AI 辅助 XSS、数据外带泄露、过度授权 (Excessive Agency)、沙箱逃逸导致的 RCE，以及不安全的 RAG 访问控制等。
- **CTF 模式:** 每个靶机都包含一个隐藏的 `Flag`。攻击者必须通过利用 AI 系统的漏洞提取或生成 Flag，并提交至中心化的计分板 (Scoreboard)。
- **沉浸式伪装:** 在前端页面或后端 API 中，不会出现任何“靶机”、“基准测试”等元数据提示，它们看起来就是正常运作的商业产品。
- **多模型兼容:** 后端使用 `litellm`，支持无缝接入 OpenAI、Anthropic 等各大主流大模型 API 端点。

## 🚀 快速开始

### 环境要求
- Docker & Docker Compose
- Node.js (用于本地非容器环境开发)
- Python 3.9+ (用于本地非容器环境开发)

### 部署指南

所有靶机和中心化计分板均由根目录下的 `docker-compose.yml` 统一管理。

1. **配置 API Keys:**
   对于您想要运行的靶机，进入其 `backend` 目录，将 `.env.example` 复制为 `.env`，并填入您的 LLM API Key（例如 `OPENAI_API_KEY`）。
   
2. **启动靶场:**
   您可以一键启动整个靶场，也可以单独拉起某个靶机。
   ```bash
   # 启动中心计分板 (Scoreboard)
   docker-compose up -d scoreboard-frontend
   
   # 单独启动某个靶机 (例如 Target 1: e-commerce-support)
   docker-compose up -d e-commerce-frontend
   
   # 或者一次性启动所有服务
   docker-compose up -d
   ```

3. **访问靶机:**
   - **计分板:** `http://localhost:3000`
   - **靶机 1 (电商客服):** `http://localhost:3001`
   - **靶机 2 (HR 简历筛选):** `http://localhost:3002`
   - ...以此类推。具体端口和说明请参阅各个靶机目录。

## 📖 靶机目录库

每个文件夹代表一个特定漏洞场景。请查看每个靶机目录内的 `README.md`，了解详细的漏洞背景和攻击复现指南 (Walkthrough)。

1. `e-commerce-support` - 基础提示词注入 (Prompt Injection)
2. `hr-resume-screener` - 间接提示词注入 (Indirect Prompt Injection)
3. `internal-bi-analyst` - 数据外带 / 库表窃取 (Data Exfiltration)
4. `web-summarizer` - AI 驱动的 SSRF
5. `code-review-assistant` - 沙箱逃逸 / RCE
6. `ai-note-taker` - AI 辅助的 XSS (不安全输出处理)
7. `workspace-copilot` - 过度授权 / 权限校验绕过
8. `travel-planner-bot` - 敏感信息泄露 / 认知绕过越狱
9. `expense-receipt-scanner` - 图像多模态提示词注入
10. `enterprise-kb-rag` - 不安全的 RAG 访问控制 / 语境投毒

## ⚠️ 许可协议与免责声明

本项目采用 **Creative Commons Attribution-NonCommercial 4.0 International Public License (CC BY-NC 4.0)** 协议。
- 允许将本项目用于个人学习、学术研究等非商业教育用途。
- **严禁用于任何商业用途。**

**免责声明:** 本项目为故意留存漏洞的测试环境。**绝对不要**在公网或生产服务器上直接部署这些应用。对于滥用本仓库中演示的技术去攻击真实系统所造成的任何后果，作者概不负责。

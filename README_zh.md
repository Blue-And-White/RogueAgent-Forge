# RogueAgent Forge

[English Document](README.md)

欢迎来到 **RogueAgent Forge**。这是一个全面、可交互的 AI Agent 安全靶场，包含 **20 个独立的安全靶机**。本项目模拟了真实的 AI 业务场景（如智能客服、AI 运维助理、HR 分析器等），并在其中复现了针对大语言模型 (LLM) 和智能体 (Agent) 的典型高危漏洞。

本项目旨在帮助安全研究人员、开发者以及 AI 工程师深入理解、实践并防御诸如 **OWASP Top 10 for LLM Applications**、MITRE ATLAS 以及其他新兴 AI 威胁模型中定义的各类漏洞。

本项目仅供 **个人学习与安全研究使用**，**严禁用于商业用途**。

## 🎯 架构与特性

- **20 个独立靶机:** 每个靶机都是一个独立隔离的模拟商业应用，并集成了易受攻击的 AI 助手。
- **全面的漏洞覆盖:** 涵盖直接提示词注入、间接提示词注入、AI 辅助 XSS、数据外带泄露、过度授权 (Excessive Agency)、沙箱逃逸导致的 RCE，以及不安全的 RAG 访问控制等。
- **CTF 模式:** 每个靶机都包含一个隐藏的 `Flag`。攻击者必须通过利用 AI 系统的漏洞提取或生成 Flag，并提交至中心化的计分板 (Scoreboard)。
- **沉浸式伪装:** 在前端页面或后端 API 中，不会出现任何“靶机”、“基准测试”等元数据提示，它们看起来就是正常运作的商业产品。
- **多模型兼容:** 后端使用 `litellm`，支持无缝接入 OpenAI、Anthropic 等各大主流大模型 API 端点。

## 🎯 靶场矩阵 (20 个挑战)

靶机难度由浅入深，覆盖从基础提示词注入到复杂 Agent 利用链。

### 阶段一：初出茅庐 (The Basics)
1. **`prompt-injection-basics`** (AI 极速翻译官): 经典的“忽略之前指令”基础提示词注入。
2. **`system-prompt-leak`** (智能文案助手): 诱导 AI 泄露其隐藏的开发者系统指令。
3. **`jailbreak-obfuscation`** (心灵导师 AI): 利用字符混淆和角色扮演绕过安全护栏机制。
4. **`ssrf-agent`** (AI 网页摘要器): 滥用 AI 的网络请求工具进行内部网络的 SSRF 探测。
5. **`data-exfiltration`** (个人日记助手): 诱导 AI 渲染带有攻击者 Webhook 的 Markdown 图片以窃取上下文敏感信息。

### 阶段二：Agent 缺陷 (Agentic Flaws)
6. **`rbac-bypass`** (企业内部网关助手): 通过注入指令越权调用受 Role-Based Access Control 保护的内部 API。
7. **`sql-injection-agent`** (智能数据库查询终端): 通过污染上下文，诱骗 AI 拼接恶意条件造成越权数据读取。
8. **`xss-in-chat`** (AI 在线客服): 通过向 AI 注入恶意 Payload，实现对话框中的存储型跨站脚本攻击 (XSS)。
9. **`command-injection-agent`** (智能网络排障终端): 逃逸 AI Tool 的参数隔离，实现底层 Shell 的命令注入执行。
10. **`enterprise-kb-rag`** (内部 RAG 知识库问答): 绕过 RAG 检索阶段的访问控制，窃取高权限绝密文档。

### 阶段三：架构与业务安全 (Architecture & Flow)
11. **`semantic-cache-poisoning`** (AI 极速问答助手): 污染 AI 语义缓存，实现针对后续访问用户的 XSS 攻击。
12. **`multi-agent-orchestrator`** (智能工厂调度中枢): 多智能体系统中的级联注入 (Planner Agent 污染导致 Executor Agent 执行危险操作)。
13. **`insecure-plugin-auth`** (AI 账号管家): 插件调用设计缺陷，导致 AI 被利用执行无鉴权的敏感越权操作。
14. **`context-overflow-reviewer`** (智能法务合同审查员): 上下文溢出攻击，用巨量无关文本将恶意指令挤出安全网关的视野。
15. **`feedback-data-poisoning`** (AI 自适应在线客服): 利用业务反馈学习机制投毒，污染 AI 系统记忆。

### 阶段四：终极利用链 (The Grand Finale)
16. **`obfuscated-prompt-bypass`** (安全代码翻译器): 极严 WAF 防护下的 Base64 编码混淆注入绕过。
17. **`rag-document-poisoning`** (企业文档分析器): RAG 间接注入，通过恶意 PDF/TXT 上传文件从侧面夺舍 AI。
18. **`devops-path-traversal`** (AI 运维诊断助手): 利用 AI 的日志读取工具造成目录穿越与任意文件读取 (LFI)。
19. **`nl2sql-injection`** (数据库自然语言查询): 自然语言转 SQL 注入，指使 AI 亲自写出 `UNION SELECT` 等恶意代码。
20. **`server-management-copilot`** (高级服务器管家): 终极漏洞链，目录穿越覆写脚本 + 预设脚本执行 = 远程命令执行 (RCE)。

---

## 🚀 如何启动

### 方案 A：一键启动单个靶机（推荐）
这 20 个靶机的目录下都内置了 `start.sh` 启动脚本。
只需进入你想体验的关卡，运行它，它会自动引导你配置 API Key，并仅启动该关卡所需的服务。

```bash
cd prompt-injection-basics
./start.sh
```

### 方案 B：启动整个靶场矩阵
如果你想一次性跑满 20 个靶机，请在项目根目录使用全局脚本。
*注意：你需要先确认已正确配置了各个靶机的 `backend/.env`。*

- **全局启动**: `./start_all.sh`
- **全局清理**: `./stop_all.sh` (停止并清理所有容器和悬空网络)

---

## 📖 靶机文档与攻略
每一个靶机的独立文件夹中都有一份 `README.md`。里面详细说明了：
- 靶机的**漏洞背景** (OWASP 对应项)。
- 靶机的**业务场景与目标 Flag**。
- 一份详细的 **通关攻略 (Attack Walkthrough)**，手把手教你如何拿到 Flag。

**祝你 Hack 得开心！**

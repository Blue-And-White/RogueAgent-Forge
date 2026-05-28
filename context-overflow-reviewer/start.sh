#!/bin/bash
# 启动脚本
echo "=== RogueAgent Forge: context-overflow-reviewer ==="

if [ -f backend/.env ]; then
    echo "检测到 backend/.env 文件已存在。"
else
    echo "未检测到配置，开始初始化配置..."
    read -p "请输入您的 LLM API KEY (如 sk-...): " api_key
    read -p "请输入您的 Base URL (如 https://api.openai.com/v1，若不需要请直接回车): " base_url

    echo "OPENAI_API_KEY=$api_key" > backend/.env
    echo "MODEL_NAME=gpt-3.5-turbo" >> backend/.env
    if [ ! -z "$base_url" ]; then
        echo "OPENAI_API_BASE=$base_url" >> backend/.env
    fi
    echo "✅ 配置已写入 backend/.env"
fi

echo "🚀 正在启动容器服务..."
docker-compose -f ../docker-compose.yml up --build -d reviewer-backend reviewer-frontend

echo "✅ 启动完成！"
echo "前端访问地址请参考根目录 docker-compose.yml 或 README.md 中对应的端口。"

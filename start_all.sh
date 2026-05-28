#!/bin/bash
# 全局一键启动脚本

echo "=== 🚀 RogueAgent Forge 全局启动 ==="

echo "检查各个靶机的配置文件..."
for dir in */; do
    if [ -d "$dir/backend" ]; then
        if [ ! -f "$dir/backend/.env" ]; then
            echo "[提示] 正在使用默认配置初始化 $dir/backend/.env"
            cp "$dir/backend/.env.example" "$dir/backend/.env"
        fi
    fi
done

echo "请确保您已经修改了对应靶机的 backend/.env 文件中的 OPENAI_API_KEY。"
read -p "按回车键继续启动所有服务，或按 Ctrl+C 取消..."

echo "正在拉起所有容器..."
docker-compose up --build -d

echo "✅ 所有靶机服务启动完成！"
echo "可以使用 docker-compose ps 查看运行状态。"

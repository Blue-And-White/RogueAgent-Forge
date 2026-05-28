#!/bin/bash
# 全局清理脚本

echo "=== 🛑 RogueAgent Forge 全局清理 ==="
echo "正在停止并删除所有容器、网络和悬空镜像..."

docker-compose down --rmi local --volumes --remove-orphans

echo "✅ 清理完成！"

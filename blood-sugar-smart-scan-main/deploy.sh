#!/bin/bash

# 确保脚本在出错时停止执行
set -e

echo "开始部署血糖智能扫描应用..."

# 1. 安装依赖
echo "安装依赖..."
pnpm install

# 2. 创建 .env 文件
echo "创建环境变量文件..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "请编辑 .env 文件，填入您的 DASHSCOPE_API_KEY"
  exit 1
fi

# 3. 构建前端
echo "构建前端应用..."
pnpm build

# 4. 创建目标目录
echo "创建部署目录..."
mkdir -p /app/blood-sugar-smart-scan

# 5. 复制文件到部署目录
echo "复制文件到部署目录..."
cp -r dist /app/blood-sugar-smart-scan/
cp server.js /app/blood-sugar-smart-scan/
cp package.json /app/blood-sugar-smart-scan/
cp .env /app/blood-sugar-smart-scan/

# 6. 安装生产环境依赖
echo "安装生产环境依赖..."
cd /app/blood-sugar-smart-scan
pnpm install --production

# 7. 配置 Nginx
echo "配置 Nginx..."
cp nginx.conf /etc/nginx/conf.d/blood-sugar-app.conf
nginx -t && systemctl reload nginx

# 8. 使用 PM2 启动应用
echo "启动应用..."
pm2 start server.js --name "blood-sugar-app" --env production

echo "部署完成！应用现在可以通过 http://118.178.253.190:5002 访问"

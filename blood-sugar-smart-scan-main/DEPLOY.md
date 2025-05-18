# 血糖智能扫描应用部署指南

本文档提供了将血糖智能扫描应用部署到阿里云服务器的详细步骤。

## 部署前准备

### 1. 服务器环境要求

- Node.js 18+
- npm 或 pnpm
- Nginx
- PM2 (用于进程管理)

### 2. 安装必要的软件

```bash
# 安装 Node.js 和 npm (如果尚未安装)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 pnpm
npm install -g pnpm

# 安装 PM2
npm install -g pm2

# 安装 Nginx (如果尚未安装)
sudo apt-get install nginx
```

## 部署方法一：手动部署

### 1. 准备项目文件

1. 将项目文件上传到服务器：

```bash
# 在本地执行
scp -r blood-sugar-smart-scan-main/ user@118.178.253.190:/tmp/
```

2. 在服务器上创建部署目录：

```bash
# 在服务器上执行
mkdir -p /app/blood-sugar-smart-scan
```

### 2. 构建和部署

1. 安装依赖并构建项目：

```bash
cd /tmp/blood-sugar-smart-scan-main
pnpm install
cp .env.example .env
# 编辑 .env 文件，填入您的 DASHSCOPE_API_KEY
nano .env
pnpm build
```

2. 复制文件到部署目录：

```bash
cp -r dist /app/blood-sugar-smart-scan/
cp server.js /app/blood-sugar-smart-scan/
cp package.json /app/blood-sugar-smart-scan/
cp .env /app/blood-sugar-smart-scan/
cd /app/blood-sugar-smart-scan
pnpm install --production
```

### 3. 配置 Nginx

1. 创建 Nginx 配置文件：

```bash
sudo cp /tmp/blood-sugar-smart-scan-main/nginx.conf /etc/nginx/conf.d/blood-sugar-app.conf
```

2. 测试并重新加载 Nginx 配置：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 4. 启动应用

使用 PM2 启动应用：

```bash
cd /app/blood-sugar-smart-scan
pm2 start server.js --name "blood-sugar-app" --env production
pm2 save
pm2 startup
```

## 部署方法二：使用 Docker

### 1. 安装 Docker 和 Docker Compose

```bash
# 安装 Docker
curl -fsSL https://get.docker.com | sh
sudo systemctl enable docker
sudo systemctl start docker

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.6/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. 准备 Docker 部署文件

1. 将项目文件上传到服务器：

```bash
# 在本地执行
scp -r blood-sugar-smart-scan-main/ user@118.178.253.190:/tmp/
```

2. 创建 .env 文件：

```bash
cd /tmp/blood-sugar-smart-scan-main
cp .env.example .env
# 编辑 .env 文件，填入您的 DASHSCOPE_API_KEY
nano .env
```

### 3. 构建和启动 Docker 容器

```bash
cd /tmp/blood-sugar-smart-scan-main
docker-compose up -d --build
```

### 4. 配置 Nginx

1. 创建 Nginx 配置文件：

```bash
sudo cp /tmp/blood-sugar-smart-scan-main/nginx.conf /etc/nginx/conf.d/blood-sugar-app.conf
```

2. 测试并重新加载 Nginx 配置：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 验证部署

部署完成后，您可以通过以下 URL 访问应用：

```
http://118.178.253.190:5002
```

## 故障排除

1. 检查应用日志：

```bash
# 如果使用 PM2
pm2 logs blood-sugar-app

# 如果使用 Docker
docker-compose logs
```

2. 检查 Nginx 日志：

```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

3. 检查应用状态：

```bash
# 如果使用 PM2
pm2 status

# 如果使用 Docker
docker-compose ps
```

## 更新应用

### 使用 PM2 更新

1. 上传新版本代码到服务器
2. 构建新版本
3. 替换部署目录中的文件
4. 重启应用：`pm2 restart blood-sugar-app`

### 使用 Docker 更新

1. 上传新版本代码到服务器
2. 重新构建并启动容器：`docker-compose up -d --build`

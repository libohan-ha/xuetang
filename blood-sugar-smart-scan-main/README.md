# 血糖智能扫描应用

这是一个基于图像识别的食物血糖指数(GI)分析应用，使用通义千问视觉语言模型(qwen-vl)进行食物识别。

## 功能

- 上传食物图片进行识别
- 获取食物名称
- 分析食物的血糖生成指数(GI)
- 估算营养成分
- 获取糖尿病或血糖管理的饮食建议

## 技术栈

- 前端: React + Vite + TypeScript + Tailwind CSS + Shadcn/UI
- 后端: Express.js
- AI能力: 通义千问视觉语言模型 (qwen-vl)

## 开发环境设置

### 环境要求

- Node.js 18+
- pnpm

### 设置步骤

1. 克隆仓库并安装依赖

```bash
git clone <仓库地址>
cd blood-sugar-smart-scan-main
pnpm install
```

2. 配置环境变量

复制环境变量示例文件并填入您的API密钥：

```bash
cp .env.example .env
```

编辑 `.env` 文件，添加您的通义千问API密钥：

```
DASHSCOPE_API_KEY=your_dashscope_api_key_here
```

3. 启动开发服务器

```bash
pnpm run dev:all
```

这将同时启动前端(8080端口)和后端(3001端口)服务。

## 使用方法

1. 打开浏览器访问 `http://localhost:8080`
2. 点击"拍照或者相册选择"按钮上传食物图片
3. 等待分析结果，查看食物GI值、营养成分和饮食建议

## 联系方式

如有问题，请联系[项目维护者]。

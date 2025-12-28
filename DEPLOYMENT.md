# 部署指南

本文档介绍如何将 Telegram Mini App 部署到生产环境。

## 前端部署

### 选项 1: Vercel（推荐）

1. 在 [Vercel](https://vercel.com) 注册账号
2. 连接你的 GitHub 仓库
3. 配置构建设置：
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. 添加环境变量：
   - `VITE_API_URL`: 你的 API 后端地址
5. 部署

### 选项 2: Netlify

1. 在 [Netlify](https://netlify.com) 注册账号
2. 连接你的 GitHub 仓库
3. 配置构建设置：
   - Build Command: `npm run build`
   - Publish Directory: `dist`
4. 添加环境变量
5. 部署

### 选项 3: GitHub Pages

```bash
# 安装 gh-pages
npm install -D gh-pages

# 添加到 package.json
"scripts": {
  "deploy": "npm run build && gh-pages -d dist"
}

# 部署
npm run deploy
```

### 选项 4: 自己的服务器

```bash
# 构建
npm run build

# 将 dist 目录上传到服务器
# 使用 nginx 或其他 web 服务器提供静态文件
```

Nginx 配置示例：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/miniapp/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 启用 gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

## Bot 后端部署

### 选项 1: Railway

1. 在 [Railway](https://railway.app) 注册账号
2. 创建新项目
3. 连接 GitHub 仓库或上传代码
4. 添加环境变量：
   - `BOT_TOKEN`: 你的 Telegram Bot Token
   - `MINI_APP_URL`: 你的 Mini App URL
5. 部署

### 选项 2: Heroku

```bash
# 安装 Heroku CLI
# 登录
heroku login

# 创建应用
heroku create your-bot-name

# 设置环境变量
heroku config:set BOT_TOKEN=your_token
heroku config:set MINI_APP_URL=your_url

# 部署
git push heroku main
```

### 选项 3: VPS (Ubuntu)

```bash
# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2
sudo npm install -g pm2

# 上传代码到服务器
# 安装依赖
npm install

# 启动 Bot
pm2 start bot-example.js --name telegram-bot

# 设置开机自启
pm2 startup
pm2 save
```

## API 后端部署

### 选项 1: Vercel Serverless Functions

创建 `api/track-open.js`:

```javascript
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // 你的逻辑
  res.json({ success: true });
}
```

### 选项 2: Railway / Heroku

与 Bot 部署类似，使用 `api-example.js` 作为入口。

### 选项 3: VPS

```bash
# 启动 API 服务器
pm2 start api-example.js --name api-server

# 使用 nginx 反向代理
```

Nginx 反向代理配置：

```nginx
server {
    listen 80;
    server_name api.your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 数据库配置

### 使用 MongoDB

```bash
# 安装 mongoose
npm install mongoose

# 连接数据库
import mongoose from 'mongoose';
mongoose.connect(process.env.MONGODB_URI);
```

### 使用 PostgreSQL

```bash
# 安装 pg
npm install pg

# 连接数据库
import pg from 'pg';
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL
});
```

### 使用 Redis（缓存）

```bash
# 安装 redis
npm install redis

# 连接 Redis
import { createClient } from 'redis';
const redis = createClient({
  url: process.env.REDIS_URL
});
```

## 环境变量

### 前端 (.env)

```bash
VITE_API_URL=https://api.your-domain.com
```

### 后端 (.env)

```bash
BOT_TOKEN=your_telegram_bot_token
MINI_APP_URL=https://miniapp.your-domain.com
PORT=3000
NODE_ENV=production

# 数据库（可选）
MONGODB_URI=mongodb://...
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
```

## SSL/HTTPS 配置

Telegram 要求 Mini App 必须使用 HTTPS。

### 使用 Let's Encrypt

```bash
# 安装 certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

## 监控和日志

### 使用 PM2 监控

```bash
# 查看日志
pm2 logs

# 查看状态
pm2 status

# 监控面板
pm2 monit
```

### 使用 Sentry（错误追踪）

```bash
npm install @sentry/node

# 在代码中初始化
import * as Sentry from '@sentry/node';
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

## 性能优化

### 前端优化

1. 启用代码分割
2. 压缩图片
3. 使用 CDN
4. 启用浏览器缓存

### 后端优化

1. 使用 Redis 缓存
2. 数据库索引优化
3. 启用 gzip 压缩
4. 使用负载均衡

## 安全建议

1. ✅ 始终验证 `initData` 签名
2. ✅ 使用 HTTPS
3. ✅ 不要在前端暴露敏感信息
4. ✅ 设置 CORS 策略
5. ✅ 限制 API 请求频率
6. ✅ 定期更新依赖

## 测试部署

在正式部署前，建议先在测试环境测试：

1. 使用 Telegram 测试服务器
2. 创建测试 Bot
3. 部署到测试域名
4. 完整测试所有功能
5. 确认无误后再部署到生产环境

## 回滚策略

```bash
# 使用 PM2
pm2 reload all

# 使用 Git
git revert HEAD
git push

# 使用 Vercel/Netlify
# 在控制台选择之前的部署版本回滚
```

## 常见问题

### Q: Mini App 无法加载？
A: 检查 HTTPS 配置，确保使用有效的 SSL 证书

### Q: initData 验证失败？
A: 确认 BOT_TOKEN 正确，检查签名算法实现

### Q: Bot 无响应？
A: 检查 webhook 或 polling 配置，查看日志

### Q: API 请求失败？
A: 检查 CORS 配置，确认 API URL 正确

## 监控指标

建议监控以下指标：

- 用户活跃度（DAU/MAU）
- 群组数量和活跃度
- API 响应时间
- 错误率
- 服务器资源使用率

## 备份策略

1. 定期备份数据库
2. 保存代码版本（Git）
3. 备份配置文件
4. 记录部署历史

## 扩展建议

当用户量增长时：

1. 使用 CDN 加速静态资源
2. 数据库读写分离
3. 使用消息队列处理异步任务
4. 横向扩展服务器
5. 使用缓存减少数据库压力

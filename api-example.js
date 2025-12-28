// 后端 API 示例 - 追踪 Mini App 在群组中的使用情况
// 需要安装: npm install express crypto

const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// 替换为你的 Bot Token
const BOT_TOKEN = 'YOUR_BOT_TOKEN';

// 模拟数据库（实际应用中使用真实数据库）
const groupUsage = new Map();
const userSessions = new Map();

// 验证 Telegram initData
function validateInitData(initData) {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');
    
    // 按字母顺序排序参数
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    // 计算签名
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(BOT_TOKEN)
      .digest();
    
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    
    return calculatedHash === hash;
  } catch (error) {
    console.error('验证失败:', error);
    return false;
  }
}

// 解析 initData
function parseInitData(initData) {
  const urlParams = new URLSearchParams(initData);
  const result = {};
  
  for (const [key, value] of urlParams.entries()) {
    if (key === 'user') {
      result.user = JSON.parse(value);
    } else if (key === 'chat') {
      result.chat = JSON.parse(value);
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

// API: 记录用户打开 Mini App
app.post('/api/track-open', (req, res) => {
  const { initData } = req.body;
  
  // 验证数据
  if (!validateInitData(initData)) {
    return res.status(401).json({ error: '无效的 initData' });
  }
  
  const data = parseInitData(initData);
  const userId = data.user?.id;
  const chatInstance = data.chat_instance;
  const chatType = data.chat_type;
  const startParam = data.start_param;
  
  console.log('📊 用户打开 Mini App:', {
    userId,
    chatInstance,
    chatType,
    startParam
  });
  
  // 记录用户会话
  userSessions.set(userId, {
    userId,
    chatInstance,
    chatType,
    startParam,
    openedAt: new Date(),
    user: data.user
  });
  
  // 如果是从群组打开的，记录群组使用情况
  if (chatInstance) {
    if (!groupUsage.has(chatInstance)) {
      groupUsage.set(chatInstance, {
        chatInstance,
        chatType,
        firstOpenedBy: userId,
        firstOpenedAt: new Date(),
        users: new Set(),
        totalOpens: 0
      });
    }
    
    const group = groupUsage.get(chatInstance);
    group.users.add(userId);
    group.totalOpens++;
    group.lastActivity = new Date();
  }
  
  res.json({
    success: true,
    session: {
      userId,
      chatInstance,
      chatType,
      isFromGroup: !!chatInstance
    }
  });
});

// API: 获取群组统计
app.get('/api/group-stats/:chatInstance', (req, res) => {
  const { chatInstance } = req.params;
  
  const group = groupUsage.get(chatInstance);
  
  if (!group) {
    return res.status(404).json({ error: '未找到该群组的数据' });
  }
  
  res.json({
    chatInstance: group.chatInstance,
    chatType: group.chatType,
    totalUsers: group.users.size,
    totalOpens: group.totalOpens,
    firstOpenedAt: group.firstOpenedAt,
    lastActivity: group.lastActivity
  });
});

// API: 获取所有群组统计
app.get('/api/all-groups', (req, res) => {
  const stats = Array.from(groupUsage.values()).map(group => ({
    chatInstance: group.chatInstance,
    chatType: group.chatType,
    totalUsers: group.users.size,
    totalOpens: group.totalOpens,
    firstOpenedAt: group.firstOpenedAt,
    lastActivity: group.lastActivity
  }));
  
  // 按活跃度排序
  stats.sort((a, b) => b.totalOpens - a.totalOpens);
  
  res.json({
    totalGroups: stats.length,
    groups: stats
  });
});

// API: 获取用户会话信息
app.get('/api/user-session/:userId', (req, res) => {
  const { userId } = req.params;
  const session = userSessions.get(parseInt(userId));
  
  if (!session) {
    return res.status(404).json({ error: '未找到用户会话' });
  }
  
  res.json(session);
});

// API: 记录用户行为
app.post('/api/track-action', (req, res) => {
  const { userId, action, data } = req.body;
  
  console.log('📝 用户行为:', {
    userId,
    action,
    data,
    timestamp: new Date()
  });
  
  // 这里可以记录到数据库
  // 例如：用户点击了什么按钮、完成了什么操作等
  
  res.json({ success: true });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    stats: {
      totalGroups: groupUsage.size,
      totalSessions: userSessions.size
    }
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 API 服务器运行在 http://localhost:${PORT}`);
  console.log('\n可用的 API 端点:');
  console.log('  POST /api/track-open - 记录用户打开 Mini App');
  console.log('  GET  /api/group-stats/:chatInstance - 获取群组统计');
  console.log('  GET  /api/all-groups - 获取所有群组统计');
  console.log('  GET  /api/user-session/:userId - 获取用户会话');
  console.log('  POST /api/track-action - 记录用户行为');
  console.log('  GET  /health - 健康检查\n');
});

// 定期清理过期会话（可选）
setInterval(() => {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24小时
  
  for (const [userId, session] of userSessions.entries()) {
    if (now - session.openedAt.getTime() > maxAge) {
      userSessions.delete(userId);
    }
  }
}, 60 * 60 * 1000); // 每小时清理一次

// API 工具函数 - 与后端通信

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * 记录用户打开 Mini App
 * @param {string} initData - Telegram initData
 * @returns {Promise<Object>}
 */
export async function trackOpen(initData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/track-open`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ initData })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('记录打开失败:', error);
    throw error;
  }
}

/**
 * 获取群组统计信息
 * @param {string} chatInstance - 群组 chat_instance
 * @returns {Promise<Object>}
 */
export async function getGroupStats(chatInstance) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/group-stats/${chatInstance}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null; // 群组未找到
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('获取群组统计失败:', error);
    throw error;
  }
}

/**
 * 获取所有群组统计
 * @returns {Promise<Object>}
 */
export async function getAllGroups() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/all-groups`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('获取所有群组统计失败:', error);
    throw error;
  }
}

/**
 * 记录用户行为
 * @param {number} userId - 用户 ID
 * @param {string} action - 行为类型
 * @param {Object} data - 附加数据
 * @returns {Promise<Object>}
 */
export async function trackAction(userId, action, data = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/track-action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, action, data })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('记录行为失败:', error);
    throw error;
  }
}

/**
 * 获取用户会话信息
 * @param {number} userId - 用户 ID
 * @returns {Promise<Object>}
 */
export async function getUserSession(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user-session/${userId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null; // 会话未找到
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('获取用户会话失败:', error);
    throw error;
  }
}

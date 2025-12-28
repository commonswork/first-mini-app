/**
 * 解析 Telegram Web App URL 参数
 * @param {string} url - 完整的 URL 或者 hash 部分
 * @returns {Object} 解析后的数据对象
 */
export function parseTelegramWebAppUrl(url = window.location.href) {
  try {
    // 提取 hash 部分（# 后面的内容）
    const hashIndex = url.indexOf('#');
    const hashString = hashIndex !== -1 ? url.substring(hashIndex + 1) : url;
    
    // 解析 URL 参数
    const params = new URLSearchParams(hashString);
    
    const result = {
      tgWebAppData: null,
      tgWebAppVersion: params.get('tgWebAppVersion'),
      tgWebAppPlatform: params.get('tgWebAppPlatform'),
      tgWebAppThemeParams: null
    };
    
    // 解析 tgWebAppData（包含用户信息等）
    const tgWebAppData = params.get('tgWebAppData');
    if (tgWebAppData) {
      result.tgWebAppData = parseTgWebAppData(tgWebAppData);
    }
    
    // 解析主题参数
    const themeParams = params.get('tgWebAppThemeParams');
    if (themeParams) {
      result.tgWebAppThemeParams = JSON.parse(decodeURIComponent(themeParams));
    }
    
    return result;
  } catch (error) {
    console.error('解析 URL 失败:', error);
    return null;
  }
}

/**
 * 解析 tgWebAppData 参数
 * @param {string} dataString - tgWebAppData 字符串
 * @returns {Object} 包含用户信息、认证信息等
 */
function parseTgWebAppData(dataString) {
  const params = new URLSearchParams(dataString);
  
  const result = {
    user: null,
    chat_instance: params.get('chat_instance'),
    chat_type: params.get('chat_type'),
    auth_date: params.get('auth_date'),
    signature: params.get('signature'),
    hash: params.get('hash')
  };
  
  // 解析用户信息（双重编码）
  const userString = params.get('user');
  if (userString) {
    try {
      // 第一次解码
      const decodedOnce = decodeURIComponent(userString);
      // 第二次解码并解析 JSON
      result.user = JSON.parse(decodedOnce);
    } catch (error) {
      console.error('解析用户信息失败:', error);
    }
  }
  
  return result;
}

/**
 * 获取用户信息的快捷方法
 * @param {string} url - 可选的 URL，默认使用当前页面 URL
 * @returns {Object|null} 用户信息对象
 */
export function getTelegramUser(url) {
  const parsed = parseTelegramWebAppUrl(url);
  return parsed?.tgWebAppData?.user || null;
}

/**
 * 获取主题参数的快捷方法
 * @param {string} url - 可选的 URL，默认使用当前页面 URL
 * @returns {Object|null} 主题参数对象
 */
export function getTelegramTheme(url) {
  const parsed = parseTelegramWebAppUrl(url);
  return parsed?.tgWebAppThemeParams || null;
}

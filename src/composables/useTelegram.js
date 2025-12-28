import { ref, onMounted } from 'vue';

export function useTelegram() {
  const tg = ref(null);
  const user = ref(null);
  const chat = ref(null);
  const initData = ref(null);
  const initDataUnsafe = ref(null);
  const themeParams = ref(null);
  const isReady = ref(false);

  onMounted(() => {
    if (window.Telegram?.WebApp) {
      tg.value = window.Telegram.WebApp;
      
      // 初始化 Web App
      tg.value.ready();
      tg.value.expand();
      
      // 获取用户信息
      user.value = tg.value.initDataUnsafe?.user || null;
      
      // 获取聊天信息（包含 chat_id）
      chat.value = tg.value.initDataUnsafe?.chat || null;
      
      // 获取原始初始化数据
      initData.value = tg.value.initData;
      initDataUnsafe.value = tg.value.initDataUnsafe;
      
      // 获取主题参数
      themeParams.value = tg.value.themeParams;
      
      isReady.value = true;
      
      console.log('Telegram Web App 初始化完成:', {
        user: user.value,
        chat: chat.value,
        initDataUnsafe: initDataUnsafe.value,
        version: tg.value.version,
        platform: tg.value.platform,
        hasSwitchInlineQuery: typeof tg.value.switchInlineQuery === 'function'
      });
    } else {
      console.warn('Telegram Web App SDK 未加载');
    }
  });

  // 显示主按钮
  const showMainButton = (text, onClick) => {
    if (tg.value) {
      tg.value.MainButton.setText(text);
      tg.value.MainButton.show();
      tg.value.MainButton.onClick(onClick);
    }
  };

  // 隐藏主按钮
  const hideMainButton = () => {
    if (tg.value) {
      tg.value.MainButton.hide();
    }
  };

  // 显示返回按钮
  const showBackButton = (onClick) => {
    if (tg.value) {
      tg.value.BackButton.show();
      tg.value.BackButton.onClick(onClick);
    }
  };

  // 隐藏返回按钮
  const hideBackButton = () => {
    if (tg.value) {
      tg.value.BackButton.hide();
    }
  };

  // 显示弹窗
  const showAlert = (message) => {
    if (tg.value) {
      tg.value.showAlert(message);
    }
  };

  // 显示确认对话框
  const showConfirm = (message, callback) => {
    if (tg.value) {
      tg.value.showConfirm(message, callback);
    }
  };

  // 关闭 Web App
  const close = () => {
    if (tg.value) {
      tg.value.close();
    }
  };

  // 发送数据给 Bot
  const sendData = (data) => {
    if (tg.value) {
      tg.value.sendData(JSON.stringify(data));
    }
  };

  // 打开链接
  const openLink = (url) => {
    if (tg.value) {
      tg.value.openLink(url);
    }
  };

  // 打开 Telegram 链接
  const openTelegramLink = (url) => {
    if (tg.value) {
      tg.value.openTelegramLink(url);
    }
  };

  // 获取有效的 chat_id（私聊时返回 user_id）
  const getEffectiveChatId = () => {
    if (chat.value) {
      return chat.value.id;
    }
    // 私聊场景下，chat_id 等于 user_id
    if (initDataUnsafe.value?.chat_type === 'private' && user.value) {
      return user.value.id;
    }
    return null;
  };

  // 分享 Mini App 到聊天（使用 inline query）
  const shareToChat = (message = '', chatTypes = ['users', 'groups', 'channels']) => {
    if (!tg.value) {
      console.error('Telegram WebApp 未初始化');
      return false;
    }
    
    try {
      console.log('调用 switchInlineQuery:', { message, chatTypes, version: tg.value.version });
      
      // 检查方法是否存在
      if (typeof tg.value.switchInlineQuery !== 'function') {
        console.warn('switchInlineQuery 方法不可用，使用备用方案');
        
        // 备用方案：使用 openTelegramLink 打开分享链接
        const botUsername = getBotUsername();
        if (botUsername) {
          const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(message)}`;
          tg.value.openLink(shareUrl);
          return true;
        } else {
          showAlert('分享功能需要 Telegram 6.7+ 版本\n\n当前版本: ' + tg.value.version + '\n请更新 Telegram 到最新版本');
          return false;
        }
      }
      
      // 调用 switchInlineQuery
      tg.value.switchInlineQuery(message, chatTypes);
      return true;
    } catch (error) {
      console.error('switchInlineQuery 调用失败:', error);
      
      // 如果是版本不支持的错误，提供备用方案
      if (error.message && error.message.includes('not supported')) {
        showAlert('此功能需要更新 Telegram\n\n当前版本: ' + tg.value.version + '\n需要版本: 6.7+\n\n请更新 Telegram 应用');
      } else {
        showAlert('分享失败: ' + error.message);
      }
      return false;
    }
  };
  
  // 获取 Bot 用户名（从 URL 或配置中）
  const getBotUsername = () => {
    // 尝试从 URL 中提取 bot username
    // 例如：https://t.me/your_bot_name/app
    const match = window.location.href.match(/t\.me\/([^\/]+)/);
    return match ? match[1] : null;
  };
  
  // 使用备用分享方案（适用于旧版本）
  const shareFallback = (message = '') => {
    if (!tg.value) {
      console.error('Telegram WebApp 未初始化');
      return false;
    }
    
    try {
      // 方案 1: 使用 Telegram 分享链接
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(message)}`;
      tg.value.openLink(shareUrl);
      return true;
    } catch (error) {
      console.error('备用分享方案失败:', error);
      showAlert('分享失败: ' + error.message);
      return false;
    }
  };

  // 获取聊天实例 ID（用于识别是从哪个群组打开的）
  const getChatInstance = () => {
    return initDataUnsafe.value?.chat_instance || null;
  };

  // 获取启动参数（从 direct link 传递的参数）
  const getStartParam = () => {
    return initDataUnsafe.value?.start_param || null;
  };

  return {
    tg,
    user,
    chat,
    initData,
    initDataUnsafe,
    themeParams,
    isReady,
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    showAlert,
    showConfirm,
    close,
    sendData,
    openLink,
    openTelegramLink,
    getEffectiveChatId,
    shareToChat,
    shareFallback,
    getChatInstance,
    getStartParam
  };
}

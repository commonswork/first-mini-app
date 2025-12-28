import { ref, onMounted } from 'vue';

export function useTelegram() {
  const tg = ref(null);
  const user = ref(null);
  const initData = ref(null);
  const initDataUnsafe = ref(null);
  const isReady = ref(false);

  onMounted(() => {
    if (window.Telegram?.WebApp) {
      tg.value = window.Telegram.WebApp;
      
      // 初始化 Web App
      tg.value.ready();
      tg.value.expand();
      
      // 获取用户信息
      user.value = tg.value.initDataUnsafe?.user || null;
      
      // 获取原始初始化数据
      initData.value = tg.value.initData;
      initDataUnsafe.value = tg.value.initDataUnsafe;
      
      isReady.value = true;
      
      console.log('Telegram Web App 初始化完成:', {
        user: user.value,
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

  // 分享 Mini App 到聊天（使用 inline query）
  const shareToChat = (message = '', chatTypes = ['users', 'groups', 'channels']) => {
    if (!tg.value) {
      console.error('Telegram WebApp 未初始化');
      return false;
    }
    
    try {
      // 检查方法是否存在
      if (typeof tg.value.switchInlineQuery !== 'function') {
        console.error('switchInlineQuery 方法不可用');
        return false;
      }
      // 调用 switchInlineQuery
      tg.value.switchInlineQuery(message, chatTypes);
      return true;
    } catch (error) {
      console.error('switchInlineQuery 调用失败:', error);
      return false;
    }
  };

  // 分享直接链接（不通过机器人）
  const shareDirectLink = (url, options = {}) => {
    if (!tg.value) {
      console.error('Telegram WebApp 未初始化');
      return false;
    }

    try {
      // 支持多种参数格式
      let text = '';
      
      if (typeof options === 'string') {
        // 如果 options 是字符串，直接作为文本
        text = options;
      } else if (typeof options === 'object') {
        // 如果 options 是对象，支持更多自定义选项
        const {
          text: customText = '',
          title = '',
          description = '',
          useMarkdown = false,
          emoji = '',
          hashtags = [],
          mentions = []
        } = options;

        // 构建富文本内容
        let content = [];
        
        if (emoji) content.push(emoji);
        if (title) {
          content.push(useMarkdown ? `*${title}*` : title);
        }
        if (description) {
          content.push(useMarkdown ? `_${description}_` : description);
        }
        if (customText) {
          content.push(customText);
        }
        if (hashtags.length > 0) {
          content.push(hashtags.map(tag => `#${tag}`).join(' '));
        }
        if (mentions.length > 0) {
          content.push(mentions.map(mention => `@${mention}`).join(' '));
        }

        text = content.filter(Boolean).join('\n\n');
      }

      // 构建分享 URL
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
      
      // 使用 openTelegramLink 打开分享界面
      tg.value.openTelegramLink(shareUrl);
      return true;
    } catch (error) {
      console.error('分享直接链接失败:', error);
      return false;
    }
  };

  // 创建预设的分享模板
  const createShareTemplate = (templateType, customData = {}) => {
    const templates = {
      simple: {
        emoji: '🚀',
        title: 'Mini App 分享',
        description: '快来体验这个超棒的应用！',
        useMarkdown: true
      },
      
      announcement: {
        emoji: '📢',
        title: '重要通知',
        description: '查看最新更新内容',
        useMarkdown: true,
        hashtags: ['MiniApp', '更新']
      },
      
      invitation: {
        emoji: '🎉',
        title: '邀请你加入',
        description: '一起来探索这个有趣的应用吧！',
        useMarkdown: true,
        hashtags: ['邀请', '体验']
      },
      
      feature: {
        emoji: '✨',
        title: '新功能上线',
        description: '发现更多精彩功能',
        useMarkdown: true,
        hashtags: ['新功能', 'Feature']
      }
    };

    const template = templates[templateType] || templates.simple;
    return { ...template, ...customData };
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
    initData,
    initDataUnsafe,
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
    shareToChat,
    shareDirectLink,
    createShareTemplate,
    getChatInstance,
    getStartParam
  };
}

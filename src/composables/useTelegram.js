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
        initDataUnsafe: initDataUnsafe.value
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
    getEffectiveChatId
  };
}

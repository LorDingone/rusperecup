// ============ ГЛАВНЫЙ МЕНЕДЖЕР ИГРЫ - ОБЪЕДИНЯЕТ ВСЕ СИСТЕМЫ ============

class GameManager {
  constructor() {
    this.gameState = {
      started: false,
      paused: false,
      currentScreen: 'login', // login, home, app
      currentApp: null
    };

    this.playerData = {
      id: null,
      name: '',
      city: 'Москва',
      balance: 50000,
      inventory: [],
      skills: {
        inspection: 0,
        negotiation: 0,
        fraud_detection: 0
      },
      stats: {
        level: 1,
        experience: 0,
        reputation: 0,
        deals_completed: 0,
        fraud_detected: 0,
        items_sold: 0,
        total_earned: 0
      },
      preferences: {
        theme: 'dark', // dark, light, amoled
        language: 'ru',
        notifications: true
      }
    };

    // Инициализируем все приложения
    this.apps = {};
    this.initializeApps();

    // Время игры
    this.gameTime = {
      currentTime: new Date(),
      daysPassed: 0,
      speedMultiplier: 1 // 1 = нормальная скорость
    };

    // Сохранения
    this.autosaveInterval = null;
  }

  // ============ ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЙ ============

  initializeApps() {
    // Проверяем наличие всех классов
    if (typeof A8itoApp !== 'undefined') {
      this.apps.a8ito = new A8itoApp();
    }

    if (typeof BankApp !== 'undefined') {
      this.apps.bank = new BankApp(this.playerData);
    }

    if (typeof MailApp !== 'undefined') {
      this.apps.mail = new MailApp(this.playerData);
    }

    if (typeof MapsApp !== 'undefined') {
      this.apps.maps = new MapsApp(this.playerData);
    }

    if (typeof InventoryApp !== 'undefined') {
      this.apps.inventory = new InventoryApp(this.playerData);
    }

    if (typeof PugiApp !== 'undefined') {
      this.apps.pugi = new PugiApp(this.playerData);
    }
  }

  // ============ ИНИЦИАЛИЗАЦИЯ ИГРЫ ============

  /**
   * Запустить новую игру
   */
  startNewGame(playerName, city) {
    this.playerData.id = this.generatePlayerId();
    this.playerData.name = playerName;
    this.playerData.city = city;
    this.playerData.balance = 50000;

    // Обновляем город во всех приложениях
    if (this.apps.maps) {
      this.apps.maps.playerCity = city;
      this.apps.maps.places = this.apps.maps.generatePlacesForCity(city);
    }

    this.gameState.started = true;
    this.gameState.currentScreen = 'home';

    // Запускаем автосохранение
    this.startAutosave();

    // Отправляем приветственное письмо
    if (this.apps.mail) {
      this.apps.mail.receiveEmail({
        from: 'welcome@a8ito.ru',
        subject: '👋 Добро пожаловать в A8ito!',
        preview: 'Спасибо что выбрали нашу платформу...',
        body: `Привет, ${playerName}!

Добро пожаловать на платформу A8ito - лучшее место для перекупов в России!

Вот что тебя ждет:
📱 А8ИТО - покупай и продавай товары
🏦 К-БАНК - управляй финансами, открывай вклады и кредиты
📧 ПОЧТА - отслеживай доставки и письма
🗺️ КАРТЫ - навигация и встречи
🌐 PUGI - покупай билеты на самолеты и поезда

Удачи в бизнесе!`,
        type: 'notification'
      });
    }

    return {
      success: true,
      message: `Игра начата! Добро пожаловать, ${playerName}!`,
      playerData: this.playerData
    };
  }

  /**
   * Загрузить сохраненную игру
   */
  loadGame(saveData) {
    this.playerData = { ...this.playerData, ...saveData.playerData };
    this.gameTime = saveData.gameTime || this.gameTime;
    
    this.gameState.started = true;
    this.gameState.currentScreen = 'home';

    // Переинициализируем приложения с загруженными данными
    this.initializeApps();

    return {
      success: true,
      message: `Игра загружена. Добро пожаловать назад, ${this.playerData.name}!`,
      playerData: this.playerData
    };
  }

  // ============ ОТКРЫТИЕ ПРИЛОЖЕНИЯ ============

  /**
   * Открыть приложение
   */
  openApp(appName) {
    if (!this.gameState.started) {
      return { success: false, error: 'Игра не начата' };
    }

    if (!this.apps[appName]) {
      return { success: false, error: `Приложение ${appName} не найдено` };
    }

    this.gameState.currentApp = appName;
    this.gameState.currentScreen = 'app';

    return {
      success: true,
      app: appName,
      appInstance: this.apps[appName],
      message: `Открыто приложение ${appName}`
    };
  }

  /**
   * Закрыть текущее приложение
   */
  closeApp() {
    this.gameState.currentApp = null;
    this.gameState.currentScreen = 'home';

    return {
      success: true,
      message: 'Приложение закрыто'
    };
  }

  // ============ УПРАВЛЕНИЕ ВРЕМЕНЕМ ============

  /**
   * Обновить игровое время
   */
  updateGameTime() {
    // Каждую секунду реального времени = 1 минута игрового времени
    const now = new Date();
    const timeDiff = (now - this.gameTime.currentTime) / 1000 * 60; // минуты
    
    this.gameTime.currentTime = now;

    // Если прошло 1440 минут (1 день)
    if (timeDiff >= 1440) {
      this.gameTime.daysPassed += Math.floor(timeDiff / 1440);
      return { newDay: true, daysPassed: this.gameTime.daysPassed };
    }

    return { newDay: false };
  }

  /**
   * Получить текущее время в игре
   */
  getCurrentGameTime() {
    return {
      hours: this.gameTime.currentTime.getHours(),
      minutes: this.gameTime.currentTime.getMinutes(),
      daysPassed: this.gameTime.daysPassed,
      formatted: this.gameTime.currentTime.toLocaleTimeString('ru-RU')
    };
  }

  // ============ СИСТЕМА ОПЫТА И УРОВНЕЙ ============

  /**
   * Добавить опыт
   */
  addExperience(amount, reason) {
    // reason: 'deal_completed', 'fraud_detected', 'purchase', 'sale', etc.
    
    this.playerData.stats.experience += amount;

    // Проверяем уровень
    const nextLevelExp = this.playerData.stats.level * 1000;
    
    if (this.playerData.stats.experience >= nextLevelExp) {
      this.playerData.stats.level++;
      this.playerData.stats.experience -= nextLevelExp;
      
      return {
        newLevel: this.playerData.stats.level,
        message: `🎉 Уровень повышен до ${this.playerData.stats.level}!`,
        reward: this.getLevelReward(this.playerData.stats.level)
      };
    }

    return {
      experience: amount,
      reason: reason,
      message: `+${amount} опыта за ${reason}`
    };
  }

  /**
   * Получить награду за уровень
   */
  getLevelReward(level) {
    const bonus = level * 5000;
    this.playerData.balance += bonus;
    
    return {
      bonus: bonus,
      message: `Получено ${bonus}₽ за уровень ${level}!`
    };
  }

  /**
   * Повышение репутации
   */
  addReputation(amount) {
    this.playerData.stats.reputation += amount;
    
    // Репутация влияет на скидки от NPC
    return {
      reputation: this.playerData.stats.reputation,
      level: Math.floor(this.playerData.stats.reputation / 100)
    };
  }

  // ============ СОБЫТИЯ И УВЕДОМЛЕНИЯ ============

  /**
   * Генерировать случайное событие
   */
  generateRandomEvent() {
    const events = [
      {
        type: 'opportunity',
        title: 'Отличный товар на Авито!',
        description: 'Видишь интересное объявление по сниженной цене',
        reward: 'access_to_deal'
      },
      {
        type: 'danger',
        title: 'Мошенник в чате!',
        description: 'Кто-то предлагает явно обманный товар',
        reward: 'fraud_warning'
      },
      {
        type: 'luck',
        title: 'Удачная сделка!',
        description: 'Случайный покупатель переплатил на 20%',
        reward: 'bonus_money:500'
      },
      {
        type: 'tax',
        title: 'Налоговая служба',
        description: 'Уплата налогов за проведенные сделки',
        penalty: 500
      }
    ];

    const randomEvent = events[Math.floor(Math.random() * events.length)];
    return randomEvent;
  }

  /**
   * Отправить уведомление
   */
  sendNotification(title, message, type = 'info', duration = 3000) {
    // type: 'info', 'success', 'warning', 'error'
    
    const notification = {
      id: this.generateId(),
      title: title,
      message: message,
      type: type,
      timestamp: new Date(),
      duration: duration
    };

    // Здесь была бы отправка UI
    console.log(`[${type.toUpperCase()}] ${title}: ${message}`);

    return notification;
  }

  // ============ СОХРАНЕНИЯ И ЗАГРУЗКИ ============

  /**
   * Сохранить игру
   */
  saveGame(slotName = 'autosave') {
    const saveData = {
      slotName: slotName,
      timestamp: new Date(),
      playerData: this.playerData,
      gameTime: this.gameTime,
      appsData: {
        inventory: this.apps.inventory?.items || [],
        bank: {
          deposits: this.apps.bank?.deposits || [],
          credits: this.apps.bank?.credits || []
        },
        mail: {
          emails: this.apps.mail?.emails || [],
          shipments: this.apps.mail?.shipments || []
        }
      }
    };

    // Сохраняем в localStorage
    localStorage.setItem(`save_${slotName}`, JSON.stringify(saveData));

    return {
      success: true,
      message: `Игра сохранена в слот "${slotName}"`,
      saveData: saveData
    };
  }

  /**
   * Загрузить игру из слота
   */
  loadSaveFile(slotName) {
    const saveData = localStorage.getItem(`save_${slotName}`);

    if (!saveData) {
      return { success: false, error: `Сохранение "${slotName}" не найдено` };
    }

    const parsedData = JSON.parse(saveData);
    return this.loadGame(parsedData);
  }

  /**
   * Получить список сохранений
   */
  getSaveFiles() {
    const saves = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('save_')) {
        const data = JSON.parse(localStorage.getItem(key));
        saves.push({
          slot: key.replace('save_', ''),
          timestamp: data.timestamp,
          playerName: data.playerData.name,
          level: data.playerData.stats.level,
          balance: data.playerData.balance
        });
      }
    }

    return saves;
  }

  /**
   * Автосохранение
   */
  startAutosave(interval = 60000) {
    // Сохраняем каждые 60 секунд
    this.autosaveInterval = setInterval(() => {
      this.saveGame('autosave');
    }, interval);
  }

  /**
   * Остановить автосохранение
   */
  stopAutosave() {
    if (this.autosaveInterval) {
      clearInterval(this.autosaveInterval);
    }
  }

  // ============ СТАТИСТИКА И ПРОГРЕСС ============

  /**
   * Получить полную статистику
   */
  getFullStats() {
    return {
      player: {
        name: this.playerData.name,
        city: this.playerData.city,
        level: this.playerData.stats.level,
        experience: this.playerData.stats.experience,
        reputation: this.playerData.stats.reputation,
        balance: this.playerData.balance
      },
      achievements: {
        dealsCompleted: this.playerData.stats.deals_completed,
        fraudDetected: this.playerData.stats.fraud_detected,
        itemsSold: this.playerData.stats.items_sold,
        totalEarned: this.playerData.stats.total_earned
      },
      skills: {
        inspection: this.playerData.skills.inspection,
        negotiation: this.playerData.skills.negotiation,
        fraudDetection: this.playerData.skills.fraud_detection
      },
      inventory: {
        items: this.apps.inventory?.items.length || 0,
        value: this.apps.inventory?.getInventoryStats().totalValue || 0
      },
      gameTime: {
        daysPassed: this.gameTime.daysPassed,
        currentTime: this.getCurrentGameTime()
      }
    };
  }

  /**
   * Получить прогресс игрока
   */
  getPlayerProgress() {
    const stats = this.getFullStats();
    const expToNextLevel = (this.playerData.stats.level * 1000) - this.playerData.stats.experience;

    return {
      level: this.playerData.stats.level,
      experience: this.playerData.stats.experience,
      expToNextLevel: expToNextLevel,
      reputation: this.playerData.stats.reputation,
      reputationLevel: Math.floor(this.playerData.stats.reputation / 100),
      balance: this.playerData.balance,
      netWorth: this.playerData.balance + (this.apps.inventory?.getInventoryStats().totalValue || 0)
    };
  }

  // ============ ДОСТИЖЕНИЯ ============

  /**
   * Проверить и разблокировать достижения
   */
  checkAchievements() {
    const achievements = [];

    // Достижение: первая сделка
    if (this.playerData.stats.deals_completed === 1) {
      achievements.push({
        id: 'first_deal',
        title: '🎯 Первая сделка',
        description: 'Выполните первую успешную сделку',
        reward: 1000
      });
    }

    // Достижение: 10 успешных сделок
    if (this.playerData.stats.deals_completed === 10) {
      achievements.push({
        id: 'ten_deals',
        title: '🔟 Опытный торговец',
        description: 'Выполните 10 успешных сделок',
        reward: 5000
      });
    }

    // Достижение: обнаружить обман
    if (this.playerData.stats.fraud_detected === 1) {
      achievements.push({
        id: 'fraud_detective',
        title: '🕵️ Детектив',
        description: 'Обнаружьте первый обман',
        reward: 2000
      });
    }

    // Достижение: накопить 100 000₽
    if (this.playerData.balance >= 100000) {
      achievements.push({
        id: 'hundred_grand',
        title: '💰 Сотня тысяч',
        description: 'Накопите 100 000₽',
        reward: 0 // Награда это уже деньги
      });
    }

    // Достижение: получить уровень 10
    if (this.playerData.stats.level === 10) {
      achievements.push({
        id: 'level_ten',
        title: '⭐ Легенда',
        description: 'Достигните уровня 10',
        reward: 10000
      });
    }

    return achievements;
  }

  // ============ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ============

  generatePlayerId() {
    return 'PLAYER-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  generateId() {
    return 'ID-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  /**
   * Завершить игру
   */
  quitGame() {
    this.stopAutosave();
    this.saveGame('autosave');
    
    this.gameState.started = false;
    this.gameState.currentScreen = 'login';

    return {
      success: true,
      message: 'Игра завершена. Спасибо за игру!'
    };
  }

  /**
   * Сбросить прогресс
   */
  resetProgress() {
    if (confirm('Вы уверены? Это удалит весь прогресс!')) {
      this.playerData = {
        id: null,
        name: '',
        city: 'Москва',
        balance: 50000,
        inventory: [],
        skills: {
          inspection: 0,
          negotiation: 0,
          fraud_detection: 0
        },
        stats: {
          level: 1,
          experience: 0,
          reputation: 0,
          deals_completed: 0,
          fraud_detected: 0,
          items_sold: 0,
          total_earned: 0
        },
        preferences: {
          theme: 'dark',
          language: 'ru',
          notifications: true
        }
      };

      this.gameState.started = false;
      this.gameState.currentScreen = 'login';

      return { success: true, message: 'Прогресс сброшен' };
    }

    return { success: false, message: 'Отменено' };
  }
}

// ============ ЭКСПОРТ И ИНИЦИАЛИЗАЦИЯ ============

// Глобальный экземпляр менеджера
window.gameManager = null;

/**
 * Инициализировать игру
 */
function initializeGame() {
  window.gameManager = new GameManager();
  console.log('✅ GameManager инициализирован');
  return window.gameManager;
}

// Автоинициализация при загрузке страницы
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeGame);
} else {
  initializeGame();
}

// ============ ЭКСПОРТ ============
window.GameManager = GameManager;

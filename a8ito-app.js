// ============ ГЛАВНОЕ ПРИЛОЖЕНИЕ А8ИТО ============
// Система обмана, проверка товара, диалоги, торг, встречи

class A8itoApp {
  constructor() {
    this.currentProduct = null;
    this.currentChat = null;
    this.chatHistory = [];
    this.playerSkills = {
      inspection: 0, // навык проверки (макс 80%)
      negotiation: 0,
      fraud_detection: 0
    };
    this.playerStats = {
      balance: 50000,
      inventory: [],
      soldItems: 0,
      fraudDetected: 0,
      successfulDeals: 0,
      reputation: 0
    };
    this.ongoingDeals = [];
    this.chatDeceptions = {}; // { chatId: { type, exposed: false } }
  }

  // ============ ИНИЦИАЛИЗАЦИЯ ЧАТА С NPC ============
  initiateChatWithNPC(productId) {
    const product = GameData.PRODUCTS[productId];
    const npcType = this.selectRandomNPCType();
    
    this.currentChat = {
      id: Math.random().toString(36).substr(2, 9),
      productId: productId,
      product: product,
      npc: npcType,
      stage: 'greeting',
      currentPrice: product.price,
      agreementPrice: null,
      deliveryMethod: null,
      selectedDate: null,
      selectedTime: null,
      messages: [],
      deception: this.generateDeception(npcType, product)
    };

    this.chatHistory.push(this.currentChat);
    
    // NPC отправляет первое сообщение (приветствие)
    this.npcGreeting();
    
    return this.currentChat;
  }

  // ============ ВЫБОР СЛУЧАЙНОГО NPC ============
  selectRandomNPCType() {
    const types = Object.keys(GameData.NPC_TYPES);
    const randomType = types[Math.floor(Math.random() * types.length)];
    return GameData.NPC_TYPES[randomType];
  }

  // ============ ГЕНЕРАЦИЯ ОБМАНА ============
  generateDeception(npcType, product) {
    // Проверяем, будет ли NPC врать
    const willDecieve = Math.random() < npcType.traits.deceptionChance;
    
    if (!willDecieve) {
      return null; // Честный продавец
    }

    // Выбираем тип обмана в зависимости от товара
    const deceptionTypes = [];
    
    if (product.category === 'earbuds' || product.category === 'phone') {
      if (product.isOriginal === false) {
        deceptionTypes.push('originalitySwitched'); // реплика под оригинал
      }
      if (product.batteryHealth) {
        deceptionTypes.push('restoredSwitched'); // восстановленный под оригинал
      }
    }
    
    if (product.hasDefects) {
      deceptionTypes.push('conditionWorse'); // скрыть дефекты
    }

    if (deceptionTypes.length === 0) return null;

    const selectedDeception = deceptionTypes[Math.floor(Math.random() * deceptionTypes.length)];
    
    return {
      type: selectedDeception,
      exposed: false,
      confidence: 0
    };
  }

  // ============ ПРИВЕТСТВИЕ NPC ============
  npcGreeting() {
    const npcType = this.currentChat.npc;
    const phrases = npcType.phrases.greeting;
    const message = phrases[Math.floor(Math.random() * phrases.length)];
    
    this.addMessage('npc', message);
    this.currentChat.stage = 'details';
  }

  // ============ ДОБАВЛЕНИЕ СООБЩЕНИЯ В ЧАТ ============
  addMessage(sender, text) {
    const message = {
      sender: sender, // 'player' или 'npc'
      text: text,
      timestamp: new Date(),
      stage: this.currentChat.stage
    };
    
    this.currentChat.messages.push(message);
    return message;
  }

  // ============ ИГРОК ЗАПРАШИВАЕТ ДЕТАЛИ ТОВАРА ============
  playerAskDetails(question) {
    this.addMessage('player', question);
    
    // NPC отвечает на вопрос о товаре
    const response = this.generateNPCResponse('details');
    this.addMessage('npc', response);
    
    this.currentChat.stage = 'negotiate';
    return response;
  }

  // ============ ГЕНЕРАЦИЯ ОТВЕТОВ NPC ============
  generateNPCResponse(stage) {
    const npcType = this.currentChat.npc;
    const phrases = npcType.phrases[stage];
    
    if (!phrases) return 'Не знаю что ответить...';
    
    let response = phrases[Math.floor(Math.random() * phrases.length)];

    // Если есть обман и NPC врет про состояние/оригинальность
    if (stage === 'details' && this.currentChat.deception) {
      const deception = this.currentChat.deception.type;
      
      if (deception === 'originalitySwitched') {
        response = 'Да, оригинал 100%, в фирменной коробке!';
      } else if (deception === 'restoredSwitched') {
        response = 'Оригинальный, не восстановленный, куп��л новый';
      } else if (deception === 'conditionWorse') {
        response = 'Состояние идеальное, ничего не указываю';
      }
    }
    
    return response;
  }

  // ============ ТОРГОВЛЯ (ПЕРЕГОВОРЫ) ============
  playerProposeBargain(proposedPrice) {
    this.addMessage('player', `Может быть за ${proposedPrice}₽?`);
    
    const npcType = this.currentChat.npc;
    const minPrice = this.currentChat.product.price * (1 - npcType.traits.bargainLimit);
    
    let response;
    
    if (proposedPrice >= minPrice) {
      // NPC согласен
      response = npcType.phrases.agree[Math.floor(Math.random() * npcType.phrases.agree.length)];
      this.currentChat.agreementPrice = proposedPrice;
      this.currentChat.currentPrice = proposedPrice;
      this.currentChat.stage = 'payment';
    } else {
      // NPC не согласен
      response = npcType.phrases.negotiate[Math.floor(Math.random() * npcType.phrases.negotiate.length)];
      this.currentChat.currentPrice = proposedPrice; // Обновляем цену для следующего раунда
    }
    
    this.addMessage('npc', response);
    return response;
  }

  // ============ ПРИНЯТИЕ ЦЕНЫ ============
  playerAcceptPrice() {
    this.addMessage('player', `Хорошо, согласен на ${this.currentChat.currentPrice}₽`);
    
    const npcType = this.currentChat.npc;
    const response = npcType.phrases.agree[Math.floor(Math.random() * npcType.phrases.agree.length)];
    
    this.addMessage('npc', response);
    this.currentChat.agreementPrice = this.currentChat.currentPrice;
    this.currentChat.stage = 'payment';
    
    return response;
  }

  // ============ ВЫБОР ДОСТАВКИ/САМОВЫВОЗА ============
  selectDeliveryMethod(method) {
    // method: 'pickup' или 'delivery'
    
    this.currentChat.deliveryMethod = method;
    
    const product = this.currentChat.product;
    const playerCity = this.getPlayerCity();
    
    if (method === 'pickup') {
      this.addMessage('player', 'Заберу сам, когда можешь?');
      
      const response = this.currentChat.npc.phrases.delivery[0];
      this.addMessage('npc', response);
      
      // Назначаем время встречи
      this.selectMeetingTime();
      
    } else if (method === 'delivery') {
      this.addMessage('player', `Оформите доставку на мой адрес`);
      
      const response = this.currentChat.npc.phrases.delivery[1];
      this.addMessage('npc', response);
      
      // Начинаем процесс доставки
      this.initiateDelivery();
    }
  }

  // ============ ВСТРЕЧА (САМОВЫВОЗ) ============
  selectMeetingTime() {
    // NPC выбирает время встречи (случайно, но не опоздает)
    const times = ['14:00', '15:30', '16:00', '17:00', '18:00', '19:30'];
    const selectedTime = times[Math.floor(Math.random() * times.length)];
    
    this.currentChat.selectedTime = selectedTime;
    
    this.addMessage('npc', `Ок, приезжай в ${selectedTime}. Я буду ждать в парке.`);
    
    return selectedTime;
  }

  // ============ ПРОВЕРКА ТОВАРА ПРИ ВСТРЕЧИ ============
  inspectProductAtMeeting(playerId) {
    const chat = this.currentChat;
    const product = chat.product;
    const deception = chat.deception;
    
    // Успешный промежуток: ±30 минут
    const meetingTime = this.parseTime(chat.selectedTime);
    const playerArrivalTime = this.parseTime(this.getPlayerArrivalTime());
    const timeDiff = Math.abs(playerArrivalTime - meetingTime);
    
    // Проверка опоздания
    if (timeDiff > 30) {
      return this.handleLateArrival();
    }

    // Процесс проверки товара
    const inspection = {
      product: product,
      deception: deception,
      findings: []
    };

    // Проверяем разные параметры в зависимости от типа товара
    if (product.category === 'earbuds' || product.category === 'phone') {
      inspection.findings.push(this.checkOriginality(product, deception));
      inspection.findings.push(this.checkCondition(product, deception));
    } else if (product.category === 'clothing') {
      inspection.findings.push(this.checkOriginality(product, deception));
      inspection.findings.push(this.checkCondition(product, deception));
    } else if (product.category === 'car') {
      inspection.findings.push(this.checkCarCondition(product, deception));
    }

    // Определяем, обнаружим ли мы обман
    let fraudDetected = false;
    if (deception) {
      const detectionChance = this.getDetectionChance();
      fraudDetected = Math.random() < detectionChance;
      
      if (fraudDetected) {
        this.playerSkills.fraud_detection += 1;
        this.playerStats.fraudDetected += 1;
        deception.exposed = true;
      }
    }

    // Повышаем навык проверки
    this.playerSkills.inspection = Math.min(this.playerSkills.inspection + 1, 80);

    return {
      fraudDetected: fraudDetected,
      findings: inspection.findings,
      finalPrice: this.calculateFinalPrice(inspection.findings, deception, fraudDetected),
      deception: deception
    };
  }

  // ============ ПРОВЕРКА ОРИГИНАЛЬНОСТИ ============
  checkOriginality(product, deception) {
    if (deception && deception.type === 'originalitySwitched') {
      // Это реплика, но выдается за оригинал
      return {
        parameter: 'Оригинальность',
        claimed: 'Оригинал',
        actual: 'Реплика',
        deceptive: true
      };
    }

    return {
      parameter: 'Оригинальность',
      claimed: product.isOriginal ? 'Оригинал' : 'Реплика',
      actual: product.isOriginal ? 'Оригинал' : 'Реплика',
      deceptive: false
    };
  }

  // ============ ПРОВЕРКА СОСТОЯНИЯ ============
  checkCondition(product, deception) {
    let actualCondition = product.condition;
    let claimedCondition = product.condition;

    if (deception && deception.type === 'conditionWorse') {
      // Состояние хуже, чем заявл��но
      const conditionLevels = ['ideal', 'good', 'fair', 'poor'];
      const currentIndex = conditionLevels.indexOf(product.condition);
      actualCondition = conditionLevels[Math.min(currentIndex + 1, 3)];
    }

    return {
      parameter: 'Состояние',
      claimed: claimedCondition,
      actual: actualCondition,
      deceptive: claimedCondition !== actualCondition,
      defects: product.defects || []
    };
  }

  // ============ ПРОВЕРКА СОСТОЯНИЯ МАШИНЫ ============
  checkCarCondition(product, deception) {
    let actualCondition = product.condition;
    
    if (deception && deception.type === 'conditionWorse') {
      const conditionLevels = ['ideal', 'good', 'fair', 'poor'];
      const currentIndex = conditionLevels.indexOf(product.condition);
      actualCondition = conditionLevels[Math.min(currentIndex + 2, 3)]; // Машины врут сильнее
    }

    return {
      parameter: 'Состояние кузова/салона',
      claimed: product.condition,
      actual: actualCondition,
      deceptive: product.condition !== actualCondition,
      mileage: product.mileage,
      defects: product.defects || []
    };
  }

  // ============ РАСЧЕТ ФИНАЛЬНОЙ ЦЕНЫ ============
  calculateFinalPrice(findings, deception, fraudDetected) {
    if (!fraudDetected || !deception) {
      return this.currentChat.agreementPrice; // Платим полную цену
    }

    let discount = 1.0;

    // Применяем скидки в зависимости от найденного обмана
    for (const finding of findings) {
      if (finding.deceptive) {
        if (finding.parameter === 'Оригинальность') {
          // Реплика вместо оригинала
          discount = 0.40; // -60%
        } else if (finding.parameter === 'Состояние' || finding.parameter === 'Состояние кузова/салона') {
          // Состояние хуже
          discount = Math.min(discount, 0.65); // -35%
        }
      }
    }

    return Math.floor(this.currentChat.product.price * discount);
  }

  // ============ ШАНС ОБНАРУЖЕНИЯ ОБМАНА ============
  getDetectionChance() {
    const baseChance = 0.15; // 15%
    const skillBonus = this.playerSkills.inspection * 0.01; // +1% за уровень
    const maxChance = 0.80; // 80% максимум
    
    return Math.min(baseChance + skillBonus, maxChance);
  }

  // ============ ОБРАБОТКА ОПОЗДАНИЯ ============
  handleLateArrival() {
    const npcType = this.currentChat.npc;
    const secondChance = Math.random() < 0.50;
    
    if (secondChance) {
      this.addMessage('npc', '😠 Где ты был?! Ладно, даю второй шанс!');
      this.currentChat.lateArrivalCount = (this.currentChat.lateArrivalCount || 0) + 1;
      
      if (this.currentChat.lateArrivalCount > 1) {
        this.addMessage('npc', 'Ну всё, я ухожу! Сделка отменена!');
        this.currentChat.cancelled = true;
        this.blockNPC(npcType);
        return { status: 'cancelled', blocked: true };
      }
      
      return { status: 'second_chance' };
    } else {
      this.addMessage('npc', 'Я не буду ждать! Сделка отменена!');
      this.currentChat.cancelled = true;
      this.blockNPC(npcType);
      return { status: 'cancelled', blocked: true };
    }
  }

  // ============ ИНИЦИАЦИЯ ДОСТАВКИ ============
  initiateDelivery() {
    const product = this.currentChat.product;
    const playerCity = this.getPlayerCity();
    
    const tariffOptions = GameData.DELIVERY_SYSTEM.tariffs;
    
    this.currentChat.stage = 'delivery';
    this.currentChat.deliveryOptions = Object.keys(tariffOptions).map(key => ({
      type: key,
      ...tariffOptions[key]
    }));
  }

  // ============ ВЫБОР ТАРИФА ДОСТАВКИ ============
  selectDeliveryTariff(tariffType) {
    const tariff = GameData.DELIVERY_SYSTEM.tariffs[tariffType];
    
    this.currentChat.selectedTariff = tariffType;
    this.currentChat.deliveryDays = tariff.days;
    this.currentChat.deliveryCost = Math.floor(this.currentChat.agreementPrice * tariff.multiplier);
    
    // Отправляем товар
    const trackNumber = this.generateTrackNumber();
    this.currentChat.trackNumber = trackNumber;
    
    this.addMessage('npc', `Отправляю ${tariff.name}. Трек номер: ${trackNumber}`);
    
    // Создаем доставку
    this.createShipment(trackNumber);
  }

  // ============ СОЗДАНИЕ ОТПРАВКИ ============
  createShipment(trackNumber) {
    const shipment = {
      id: trackNumber,
      productId: this.currentChat.productId,
      product: this.currentChat.product,
      startDate: new Date(),
      deliveryDays: this.currentChat.deliveryDays,
      status: 'in_transit',
      trackNumber: trackNumber,
      purchasePrice: this.currentChat.agreementPrice,
      expectedDelivery: new Date(Date.now() + this.currentChat.deliveryDays * 24 * 60 * 60 * 1000),
      inspectionStatus: 'pending',
      deception: this.currentChat.deception
    };

    this.playerStats.inventory.push(shipment);
    return shipment;
  }

  // ============ ПРОВЕРКА ТОВАРА ПРИ ДОСТАВКЕ ============
  inspectDeliveredProduct(shipmentId) {
    const shipment = this.playerStats.inventory.find(item => item.id === shipmentId);
    
    if (!shipment) return { error: 'Shipment not found' };

    const inspection = {
      deception: shipment.deception,
      findings: []
    };

    // Проверяем товар
    if (shipment.deception) {
      const detectionChance = 0.70; // 70% шанс обнаружить при проверке
      const detected = Math.random() < detectionChance;

      if (detected) {
        shipment.deception.exposed = true;
        
        // Возвращаем товар, возвращаем деньги, штраф продавцу
        return {
          status: 'fraud_detected',
          message: 'Обман обнаружен! Товар возвращен продавцу.',
          refund: true,
          sellerPenalty: Math.floor(shipment.purchasePrice * 0.50)
        };
      }
    }

    shipment.inspectionStatus = 'approved';
    this.playerStats.inventory.push(shipment);
    return { status: 'approved', price: shipment.purchasePrice };
  }

  // ============ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ============
  generateTrackNumber() {
    return 'A8-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  getPlayerCity() {
    // Получаем текущий город игрока
    return localStorage.getItem('playerCity') || 'Москва';
  }

  getPlayerArrivalTime() {
    // Получаем время прибытия игрока (временно - для теста)
    return '16:45'; // Пример
  }

  parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  blockNPC(npcType) {
    // Блокируем NPC на некоторое время
    const blockedNPCs = JSON.parse(localStorage.getItem('blockedNPCs') || '{}');
    blockedNPCs[npcType.name] = Date.now() + 24 * 60 * 60 * 1000; // 24 часа
    localStorage.setItem('blockedNPCs', JSON.stringify(blockedNPCs));
  }

  // ============ РЕЖИМ ПРОДАВЦА ============
  createListing(productData) {
    const listing = {
      id: Math.random().toString(36).substr(2, 9),
      ...productData,
      createdAt: new Date(),
      status: 'active',
      isOriginal: productData.isOriginal,
      condition: productData.condition,
      priceMultiplier: this.getPriceMultiplier(productData),
      suggestedPrice: this.calculateSuggestedPrice(productData),
      warnings: this.getListingWarnings(productData)
    };

    return listing;
  }

  getPriceMultiplier(productData) {
    // Если пытаемся продать реплику как оригинал
    if (!productData.isOriginal && productData.claimedAsOriginal) {
      return { risk: 'HIGH', icon: '⚠️', color: 'red' };
    }
    return { risk: 'NORMAL', icon: '✓', color: 'green' };
  }

  calculateSuggestedPrice(productData) {
    const basePrice = productData.basePrice || 0;
    
    if (!productData.isOriginal) {
      return Math.floor(basePrice * 0.40); // Реплика стоит 40%
    }
    
    if (productData.isRestored) {
      return Math.floor(basePrice * 0.65); // Восстановленное 65%
    }

    // Скидка за состояние
    const conditionMultiplier = {
      'ideal': 1.0,
      'good': 0.85,
      'fair': 0.60,
      'poor': 0.30
    };

    return Math.floor(basePrice * (conditionMultiplier[productData.condition] || 0.5));
  }

  getListingWarnings(productData) {
    const warnings = [];

    if (!productData.isOriginal && productData.claimedAsOriginal) {
      warnings.push({
        type: 'danger',
        message: 'Вы пытаетесь продать реплику как оригинал!',
        penalty: '50% штрафа если обнаружат'
      });
    }

    if (productData.condition === 'poor') {
      warnings.push({
        type: 'warning',
        message: 'Товар в плохом состоянии. Убедитесь что указали все дефекты'
      });
    }

    return warnings;
  }

  // ============ ОБРАБОТКА ПРИЕМА ПЛАТЕЖА (ПРОДАВЕЦ) ============
  handleBuyerInspection(listingId, buyerAction) {
    // buyerAction: 'accept', 'reject_with_discount', 'steal'
    
    const listing = this.findListing(listingId);
    
    if (buyerAction === 'steal') {
      const caughtChance = 0.75;
      const caught = Math.random() < caughtChance;

      if (caught) {
        // Штраф в 2x размере товара
        const penalty = listing.suggestedPrice * 2;
        this.playerStats.balance -= penalty;
        return { status: 'caught', penalty: penalty };
      } else {
        // Потеря товара
        return { status: 'item_stolen' };
      }
    }

    if (buyerAction === 'reject_with_discount') {
      // Покупатель обнаружил обман - платит меньше
      const discount = Math.floor(listing.suggestedPrice * 0.60);
      this.playerStats.balance += discount;
      return { status: 'fraud_exposed', receivedAmount: discount };
    }

    // Нормальная продажа
    this.playerStats.balance += listing.suggestedPrice;
    this.playerStats.soldItems += 1;
    return { status: 'success', receivedAmount: listing.suggestedPrice };
  }

  findListing(listingId) {
    // Поиск объявления по ID
    return {}; // Заглушка
  }
}

// ============ ЭКСПОРТ ============
window.A8itoApp = A8itoApp;

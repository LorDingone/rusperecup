// ============ СИСТЕМА ПОЧТЫ - ПИСЬМА И ДОСТАВКИ ============

class MailApp {
  constructor(playerData) {
    this.player = playerData;
    this.emails = [];
    this.shipments = [];
    this.mailArchive = [];
    this.shipmentArchive = [];
    this.unreadCount = 0;
  }

  // ============ ЭЛЕКТРОННАЯ ПОЧТА ============

  /**
   * Получить новое письмо
   */
  receiveEmail(emailData) {
    const email = {
      id: this.generateId(),
      from: emailData.from || 'no-reply@a8ito.ru',
      subject: emailData.subject,
      preview: emailData.preview || emailData.body.substring(0, 50),
      body: emailData.body,
      type: emailData.type, // 'notification', 'bank', 'spam', 'ticket'
      receivedAt: new Date(),
      read: false,
      starred: false,
      attachment: emailData.attachment || null
    };

    this.emails.push(email);
    this.unreadCount++;

    return email;
  }

  /**
   * Письмо от банка о просрочке
   */
  sendBankOverdueNotification(creditData) {
    return this.receiveEmail({
      from: 'bank@kbank.ru',
      subject: '⚠️ Просрочка платежа по кредиту',
      preview: `Вы не оплатили минимальный платеж ${creditData.minWeeklyPayment}₽...`,
      body: `Уважаемый клиент!

Мы уведомляем вас о просрочке платежа по кредиту.

Сумма кредита: ${creditData.originalAmount}₽
Минимальный платеж: ${creditData.minWeeklyPayment}₽
Штраф за просрочку: ${Math.floor(creditData.minWeeklyPayment * 0.50)}₽

Пожалуйста, внесите платеж как можно скорее.

За каждую просрочку:
- Кэшбек снижается на 50%
- Проценты на вклады снижаются на 20%
- Повышается риск быть обманутым на 5%

С уважением,
К-Банк`,
      type: 'bank'
    });
  }

  /**
   * Письмо судебного разбирательства (дефолт)
   */
  sendCourtsummons(creditData) {
    return this.receiveEmail({
      from: 'court@justice.ru',
      subject: '⚖️ СУДЕБНЫЙ ПРИКАЗ - НЕУПЛАТА КРЕДИТА',
      preview: 'На вас подали в суд за неуплату кредита...',
      body: `УВЕДОМЛЕНИЕ О СУДЕБНОМ РАЗБИРАТЕЛЬСТВЕ

По вашему кредиту №${creditData.id} задолженность составляет ${creditData.amount}₽.

Вам дано 7 дней для уплаты задолженности.
В противном случае будут применены следующие меры:
- Конфискация имущества
- Блокировка счета
- Штраф в размере 150% от суммы долга

Явитесь в суд с документами.

Дата слушания: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU')}`,
      type: 'bank'
    });
  }

  /**
   * Письмо со спамом (прикол)
   */
  sendSpamEmail() {
    const spamSubjects = [
      'Вы выиграли 1 млн рублей!!!',
      'Принц из Нигерии дарит наследство',
      'Увеличь свой доход в 10 раз!',
      'СРОЧНО! Клики мышкой = ДЕНЬГИ',
      'Кредит без документов, за 5 минут',
      'Замуж за миллионера? Узнай как!'
    ];

    const spamBodies = [
      'Поздравляем! Вы выиграли в лотерее, которую вы не проходили!',
      'Узнай один простой трюк, который ненавидят банкиры',
      'Работа на дому за 1000₽ в час. Просто скачай программу...',
      'Инвестируй в крипто, получай 300% годовых!',
      'Таблетка для похудения, о которой молчат врачи'
    ];

    return this.receiveEmail({
      from: 'noreply@spam-bot.ru',
      subject: spamSubjects[Math.floor(Math.random() * spamSubjects.length)],
      preview: spamBodies[Math.floor(Math.random() * spamBodies.length)],
      body: spamBodies[Math.floor(Math.random() * spamBodies.length)] + '\n\n[Нажми здесь]',
      type: 'spam'
    });
  }

  /**
   * Электронный билет (Aviatickets / TheTrains)
   */
  sendElectronicTicket(ticketData) {
    const ticketHTML = `
      ЭЛЕКТРОННЫЙ БИЛЕТ
      
      ${ticketData.type === 'flight' ? '✈️ АВИАБИЛЕТ' : '🚂 БИЛЕТ НА ПОЕЗД'}
      
      Маршрут: ${ticketData.from} → ${ticketData.to}
      Дата: ${new Date(ticketData.departureDate).toLocaleDateString('ru-RU')}
      Время: ${ticketData.departureTime}
      
      Пассажир: ${ticketData.passenger}
      Номер билета: ${ticketData.ticketNumber}
      Цена: ${ticketData.price}₽
      
      Место: ${ticketData.seat || 'не указано'}
      ${ticketData.type === 'flight' ? `Борт: ${ticketData.flight}` : `Вагон: ${ticketData.carriage}`}
      
      Время в пути: ${ticketData.duration}
      
      ⚠️ Билет не подлежит возврату
    `;

    return this.receiveEmail({
      from: ticketData.type === 'flight' ? 'tickets@aviabilet.ru' : 'tickets@thetrain.ru',
      subject: `🎫 Ваш ${ticketData.type === 'flight' ? 'авиа' : 'ж/д'} билет готов`,
      preview: `${ticketData.from} → ${ticketData.to} ${new Date(ticketData.departureDate).toLocaleDateString('ru-RU')}`,
      body: ticketHTML,
      type: 'ticket',
      attachment: {
        type: 'ticket',
        data: ticketData
      }
    });
  }

  /**
   * Отметить письмо как прочитанное
   */
  markEmailAsRead(emailId) {
    const email = this.emails.find(e => e.id === emailId);
    if (email && !email.read) {
      email.read = true;
      this.unreadCount--;
    }
  }

  /**
   * Удалить письмо
   */
  deleteEmail(emailId) {
    const email = this.emails.find(e => e.id === emailId);
    if (email) {
      this.mailArchive.push(email);
      this.emails = this.emails.filter(e => e.id !== emailId);
    }
  }

  /**
   * Очистить архив писем
   */
  clearEmailArchive() {
    this.mailArchive = [];
  }

  // ============ СИСТЕМА ДОСТАВКИ ============

  /**
   * Создать новую доставку (товар в пути)
   */
  createShipment(shipmentData) {
    const shipment = {
      id: shipmentData.trackNumber || this.generateTrackNumber(),
      trackNumber: shipmentData.trackNumber || this.generateTrackNumber(),
      from: shipmentData.from,
      to: shipmentData.to,
      product: shipmentData.product,
      seller: shipmentData.seller,
      buyer: this.player.name,
      purchasePrice: shipmentData.price,
      selectedTariff: shipmentData.tariff,
      deliveryCost: shipmentData.deliveryCost,
      sentAt: new Date(),
      estimatedDelivery: this.calculateDeliveryDate(shipmentData.tariff, shipmentData.from, shipmentData.to),
      actualDelivery: null,
      status: 'in_transit', // 'in_transit', 'at_pickup', 'delivered', 'returned'
      pickupPoint: this.getPickupPoint(shipmentData.to),
      inspectionPending: true,
      deception: shipmentData.deception || null,
      timerStarted: new Date(),
      daysRemaining: this.calculateDaysRemaining(shipmentData.tariff)
    };

    this.shipments.push(shipment);

    // Отправляем уведомление
    this.receiveEmail({
      from: 'tracking@delivery.ru',
      subject: `📦 Посылка отправлена (${shipment.trackNumber})`,
      preview: `Ваша посылка в пути из ${shipment.from}`,
      body: `Трек номер: ${shipment.trackNumber}
Товар: ${shipment.product.name}
Отправлено из: ${shipment.from}
Доставляется в: ${shipment.to}
Ожидаемая доставка: ${shipment.estimatedDelivery.toLocaleDateString('ru-RU')}
Пункт выдачи: ${shipment.pickupPoint}`,
      type: 'notification'
    });

    // Запускаем таймер доставки
    this.startDeliveryTimer(shipment);

    return shipment;
  }

  /**
   * Вставить трек-номер вручную
   */
  trackShipmentByNumber(trackNumber) {
    let shipment = this.shipments.find(s => s.trackNumber === trackNumber);
    
    if (!shipment) {
      return { success: false, error: 'Посылка не найдена' };
    }

    return {
      success: true,
      shipment: shipment,
      status: shipment.status,
      daysRemaining: shipment.daysRemaining
    };
  }

  /**
   * Таймер доставки (тикает даже когда игра закрыта)
   */
  startDeliveryTimer(shipment) {
    const checkInterval = setInterval(() => {
      if (shipment.status === 'delivered' || shipment.status === 'returned') {
        clearInterval(checkInterval);
        return;
      }

      const now = new Date();
      const timePassed = (now - shipment.timerStarted) / (1000 * 60 * 60 * 24);
      
      shipment.daysRemaining = Math.max(0, shipment.estimatedDelivery - now) / (1000 * 60 * 60 * 24);

      // Если время доставки истекло
      if (timePassed >= shipment.daysRemaining) {
        this.completeShipment(shipment.id);
        clearInterval(checkInterval);
      }
    }, 1000); // Проверка каждую секунду
  }

  /**
   * Завершить доставку
   */
  completeShipment(shipmentId) {
    const shipment = this.shipments.find(s => s.id === shipmentId);
    
    if (!shipment) return;

    shipment.status = 'at_pickup';
    shipment.actualDelivery = new Date();

    // Отправляем уведомление о прибытии
    this.receiveEmail({
      from: 'tracking@delivery.ru',
      subject: `✅ Ваша посылка готова к получению (${shipment.trackNumber})`,
      preview: `Посылка прибыла в пункт выдачи`,
      body: `Ваша посылка готова!

Трек номер: ${shipment.trackNumber}
Товар: ${shipment.product.name}
Пункт выдачи: ${shipment.pickupPoint}

Вы можете забрать посылку и проверить товар.`,
      type: 'notification'
    });
  }

  /**
   * Получить посылку (с опциями проверки, кражи и т.д.)
   */
  receiveShipment(shipmentId, action) {
    // action: 'inspect', 'accept', 'steal'
    
    const shipment = this.shipments.find(s => s.id === shipmentId);
    
    if (!shipment) {
      return { success: false, error: 'Посылка не найдена' };
    }

    if (shipment.status !== 'at_pickup') {
      return { success: false, error: 'Посылка еще не прибыла' };
    }

    if (action === 'inspect') {
      // Проверка товара (как при самовывозе)
      return this.inspectShipment(shipment);
    }

    if (action === 'accept') {
      // Просто принять товар без проверки
      shipment.status = 'delivered';
      this.player.balance -= shipment.purchasePrice;
      this.player.inventory.push(shipment.product);
      
      return {
        success: true,
        action: 'accepted',
        message: 'Товар принят',
        paid: shipment.purchasePrice
      };
    }

    if (action === 'steal') {
      // Попытка кражи
      const caughtChance = 0.75;
      const caught = Math.random() < caughtChance;

      if (caught) {
        // Штраф 2x от цены товара
        const penalty = shipment.purchasePrice * 2;
        this.player.balance -= penalty;
        
        return {
          success: false,
          action: 'caught',
          penalty: penalty,
          message: '🚨 Ты пойман! Штраф в 2 раза больше стоимости товара'
        };
      } else {
        // Удалась кража
        shipment.status = 'delivered';
        this.player.inventory.push(shipment.product);
        
        return {
          success: true,
          action: 'stolen',
          message: '😈 Удалось украсть! Товар в инвентаре'
        };
      }
    }
  }

  /**
   * Проверка товара при доставке
   */
  inspectShipment(shipment) {
    const deception = shipment.deception;

    if (!deception) {
      // Товар честный
      shipment.status = 'delivered';
      this.player.balance -= shipment.purchasePrice;
      this.player.inventory.push(shipment.product);

      return {
        success: true,
        fraudDetected: false,
        paid: shipment.purchasePrice,
        message: 'Товар в порядке. Спасибо за покупку!'
      };
    }

    // Есть обман - проверяем, обнаружим ли
    const detectionChance = 0.70; // 70% шанс обнаружить
    const detected = Math.random() < detectionChance;

    if (detected) {
      // Обман обнаружен
      const refundPrice = this.calculateRefundPrice(shipment.product, deception);
      
      this.player.balance -= refundPrice;
      shipment.status = 'returned';

      return {
        success: true,
        fraudDetected: true,
        paid: refundPrice,
        message: `Обман обнаружен! Вы платите ${refundPrice}₽ вместо ${shipment.purchasePrice}₽`,
        deception: deception.type
      };
    } else {
      // Обман не обнаружен, платим полную цену
      shipment.status = 'delivered';
      this.player.balance -= shipment.purchasePrice;
      this.player.inventory.push(shipment.product);

      return {
        success: true,
        fraudDetected: false,
        paid: shipment.purchasePrice,
        message: 'Товар прошел проверку!'
      };
    }
  }

  /**
   * Рассчитать цену возврата при обнаружении обмана
   */
  calculateRefundPrice(product, deception) {
    const originalPrice = product.price;

    if (deception.type === 'originalitySwitched') {
      // Реплика вместо оригинала - платим как за реплику
      return Math.floor(originalPrice * 0.40);
    } else if (deception.type === 'conditionWorse') {
      // Худшее состояние - скидка 35%
      return Math.floor(originalPrice * 0.65);
    } else if (deception.type === 'restoredSwitched') {
      // Восстановленный вместо оригинала
      return Math.floor(originalPrice * 0.60);
    }

    return originalPrice;
  }

  /**
   * Архивировать доставку
   */
  archiveShipment(shipmentId) {
    const shipment = this.shipments.find(s => s.id === shipmentId);
    if (shipment) {
      this.shipmentArchive.push(shipment);
      this.shipments = this.shipments.filter(s => s.id !== shipmentId);
    }
  }

  /**
   * Очистить архив доставок
   */
  clearShipmentArchive() {
    this.shipmentArchive = [];
  }

  // ============ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ============

  generateId() {
    return 'MAIL-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  generateTrackNumber() {
    return 'RU' + Math.random().toString().substring(2, 13);
  }

  calculateDeliveryDate(tariff, fromCity, toCity) {
    const tariffConfig = GameData.DELIVERY_SYSTEM.tariffs[tariff];
    const days = tariffConfig ? tariffConfig.days : 2;
    
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + days);
    
    return deliveryDate;
  }

  calculateDaysRemaining(tariff) {
    const tariffConfig = GameData.DELIVERY_SYSTEM.tariffs[tariff];
    return tariffConfig ? tariffConfig.days : 2;
  }

  getPickupPoint(city) {
    return GameData.DELIVERY_SYSTEM.pickupPoints[city] || 'ул. Центральная, 1';
  }

  /**
   * Получить все отправки игрока
   */
  getAllShipments() {
    return {
      inTransit: this.shipments.filter(s => s.status === 'in_transit'),
      atPickup: this.shipments.filter(s => s.status === 'at_pickup'),
      delivered: this.shipments.filter(s => s.status === 'delivered'),
      returned: this.shipments.filter(s => s.status === 'returned')
    };
  }

  /**
   * Получить статистику почты
   */
  getMailStats() {
    return {
      unread: this.unreadCount,
      total: this.emails.length,
      notifications: this.emails.filter(e => e.type === 'notification').length,
      bankNotifications: this.emails.filter(e => e.type === 'bank').length,
      spam: this.emails.filter(e => e.type === 'spam').length,
      tickets: this.emails.filter(e => e.type === 'ticket').length
    };
  }

  /**
   * Получить статистику доставок
   */
  getShipmentStats() {
    return {
      inTransit: this.shipments.filter(s => s.status === 'in_transit').length,
      atPickup: this.shipments.filter(s => s.status === 'at_pickup').length,
      delivered: this.shipments.filter(s => s.status === 'delivered').length,
      total: this.shipments.length + this.shipmentArchive.length
    };
  }
}

// ============ ЭКСПОРТ ============
window.MailApp = MailApp;

// ============ СИСТЕМА БАНКА - ВКЛАДЫ, КРЕДИТЫ, ЗАРАБОТОК ============

class BankApp {
  constructor(playerData) {
    this.player = playerData;
    this.deposits = [];
    this.credits = [];
    this.creditHistory = [];
    this.accountBalance = playerData.balance || 0;
    this.creditScore = 0;
    this.maxCreditAvailable = this.calculateMaxCredit();
    this.cashbackRate = 0.05; // 5% базовый кэшбек
    this.lastAdWatchTime = 0;
    this.adWatchCooldown = 10000; // 10 секунд между рекламами
    this.pendingLatePayments = [];
  }

  // ============ СИСТЕМА ВКЛАДОВ ============

  /**
   * Открыть новый вклад
   */
  createDeposit(amount, depositType, term) {
    // depositType: 'urgent', 'onDemand', 'accumulative'
    
    if (amount > this.accountBalance) {
      return { success: false, error: 'Недостаточно средств' };
    }

    const depositConfig = GameData.BANK_SYSTEM.deposits[depositType];
    
    if (!depositConfig) {
      return { success: false, error: 'Неизвестный тип вклада' };
    }

    // Проверяем сроки
    if (term < depositConfig.minTerm || (depositConfig.maxTerm > 0 && term > depositConfig.maxTerm)) {
      return { success: false, error: 'Неверный срок вклада' };
    }

    const deposit = {
      id: this.generateId(),
      type: depositType,
      amount: amount,
      interestRate: depositConfig.interestRate,
      term: term, // дни
      createdAt: new Date(),
      maturityDate: new Date(Date.now() + term * 24 * 60 * 60 * 1000),
      accumulatedInterest: 0,
      status: 'active',
      canWithdraw: depositConfig.canWithdraw,
      config: depositConfig
    };

    this.deposits.push(deposit);
    this.accountBalance -= amount;

    // Запускаем расчет процентов
    this.startDepositAccumulation(deposit);

    return {
      success: true,
      deposit: deposit,
      message: `Вклад открыт. Сумма: ${amount}₽, Процент: ${(depositConfig.interestRate * 100).toFixed(1)}%`
    };
  }

  /**
   * Накопление процентов по вкладу
   */
  startDepositAccumulation(deposit) {
    // Проценты капают каждые игровые сутки
    const dailyAccumulation = setInterval(() => {
      if (deposit.status !== 'active') {
        clearInterval(dailyAccumulation);
        return;
      }

      const dailyInterest = (deposit.amount * deposit.interestRate) / 365;
      deposit.accumulatedInterest += dailyInterest;

      // Проверяем, пришла ли дата закрытия вклада
      if (new Date() >= deposit.maturityDate && deposit.term > 0) {
        this.closeDeposit(deposit.id);
        clearInterval(dailyAccumulation);
      }
    }, 10000); // Каждые 10 секунд = 1 игровой день
  }

  /**
   * Закрыть вклад (получить деньги + проценты)
   */
  closeDeposit(depositId) {
    const deposit = this.deposits.find(d => d.id === depositId);
    
    if (!deposit) {
      return { success: false, error: 'Вклад не найден' };
    }

    if (deposit.status !== 'active') {
      return { success: false, error: 'Вклад уже закрыт' };
    }

    if (!deposit.canWithdraw && new Date() < deposit.maturityDate) {
      return { success: false, error: `Вклад может быть закрыт только после ${deposit.maturityDate.toLocaleDateString()}` };
    }

    const totalAmount = deposit.amount + deposit.accumulatedInterest;
    this.accountBalance += totalAmount;
    deposit.status = 'closed';
    deposit.closedAt = new Date();

    return {
      success: true,
      amount: totalAmount,
      interest: deposit.accumulatedInterest,
      message: `Вклад закрыт. Получено: ${Math.floor(totalAmount)}₽ (процентов: ${Math.floor(deposit.accumulatedInterest)}₽)`
    };
  }

  /**
   * Снять деньги со вклада "До востребования"
   */
  withdrawFromDeposit(depositId, amount) {
    const deposit = this.deposits.find(d => d.id === depositId);
    
    if (!deposit) {
      return { success: false, error: 'Вклад не найден' };
    }

    if (!deposit.canWithdraw) {
      return { success: false, error: 'Снятие со вклада невозможно до конца срока' };
    }

    const availableAmount = deposit.amount + deposit.accumulatedInterest;
    
    if (amount > availableAmount) {
      return { success: false, error: 'Невозможно снять больше чем есть' };
    }

    deposit.amount -= amount;
    this.accountBalance += amount;

    if (deposit.amount <= 0) {
      deposit.status = 'closed';
    }

    return {
      success: true,
      withdrawn: amount,
      remaining: deposit.amount,
      message: `Снято: ${amount}₽. Остаток на счете: ${this.accountBalance}₽`
    };
  }

  // ============ СИСТЕМА КРЕДИТОВ ============

  /**
   * Получить максимальный кредит на основе истории
   */
  calculateMaxCredit() {
    const baseMax = GameData.BANK_SYSTEM.creditSystem.maxWithoutHistory;
    
    // Если есть успешная кредитная история
    if (this.creditHistory.length === 0) {
      return baseMax;
    }

    // Считаем успешные кредиты
    const successfulCredits = this.creditHistory.filter(c => c.status === 'closed' && !c.defaulted).length;
    
    // За каждый успешно закрытый кредит +50,000₽
    const historyBonus = successfulCredits * 50000;
    
    return Math.min(baseMax + historyBonus, GameData.BANK_SYSTEM.creditSystem.maxWithFullHistory);
  }

  /**
   * Оформить кредит
   */
  createCredit(amount, termDays) {
    const maxCredit = this.calculateMaxCredit();
    
    if (amount > maxCredit) {
      return { 
        success: false, 
        error: `Максимальный кредит: ${maxCredit}₽. Ваша кредитная история позволяет: ${maxCredit}₽` 
      };
    }

    const credit = {
      id: this.generateId(),
      amount: amount,
      originalAmount: amount,
      interestRate: 0.10, // 10% годовых
      term: termDays,
      createdAt: new Date(),
      dueDate: new Date(Date.now() + termDays * 24 * 60 * 60 * 1000),
      status: 'active',
      paidAmount: 0,
      payments: [],
      minWeeklyPayment: Math.ceil(amount * GameData.BANK_SYSTEM.creditSystem.minWeeklyPayment),
      lastPaymentDate: new Date(),
      isOverdue: false,
      defaulted: false,
      penalties: 0
    };

    this.credits.push(credit);
    this.creditHistory.push(credit);
    this.accountBalance += amount;

    // Запускаем отслеживание просрочек
    this.monitorCreditPayment(credit);

    return {
      success: true,
      credit: credit,
      message: `Кредит одобрен. Сумма: ${amount}₽, Минимальный платеж в неделю: ${credit.minWeeklyPayment}₽`
    };
  }

  /**
   * Оплатить кредит
   */
  payCredit(creditId, amount) {
    const credit = this.credits.find(c => c.id === creditId);
    
    if (!credit) {
      return { success: false, error: 'Кредит не найден' };
    }

    if (credit.status !== 'active') {
      return { success: false, error: 'Кредит уже закрыт' };
    }

    if (amount > this.accountBalance) {
      return { success: false, error: 'Недостаточно средств' };
    }

    const payment = {
      date: new Date(),
      amount: amount,
      type: 'payment'
    };

    credit.payments.push(payment);
    credit.paidAmount += amount;
    credit.amount -= amount;
    credit.lastPaymentDate = new Date();
    credit.isOverdue = false;
    this.accountBalance -= amount;

    // Если кредит полностью погашен
    if (credit.amount <= 0) {
      credit.status = 'closed';
      this.creditScore += 10; // Бонус за погашение
    }

    return {
      success: true,
      paid: amount,
      remaining: credit.amount,
      message: `Платеж принят: ${amount}₽. Остаток: ${credit.amount}₽`
    };
  }

  /**
   * Отслеживание просрочек по кредиту
   */
  monitorCreditPayment(credit) {
    const checkInterval = setInterval(() => {
      if (credit.status !== 'active') {
        clearInterval(checkInterval);
        return;
      }

      const now = new Date();
      const daysSinceLastPayment = (now - credit.lastPaymentDate) / (1000 * 60 * 60 * 24);

      // Проверяем еженедельные платежи (каждые 7 дней)
      if (daysSinceLastPayment > 7) {
        const weeklyPaymentDue = credit.minWeeklyPayment;
        const isPaid = credit.payments.some(p => p.date > new Date(credit.lastPaymentDate.getTime() - 7 * 24 * 60 * 60 * 1000));

        if (!isPaid) {
          this.applyCreditPenalty(credit);
          credit.isOverdue = true;
        }
      }
    }, 10000); // Проверка каждые 10 секунд
  }

  /**
   * Применить штрафы за просрочку
   */
  applyCreditPenalty(credit) {
    const penalties = GameData.BANK_SYSTEM.creditSystem.penalties;

    // Уменьшаем кэшбек
    this.cashbackRate = Math.max(this.cashbackRate * (1 - penalties.cashbackReduction), 0);

    // Уменьшаем проценты на вклады
    this.deposits.forEach(deposit => {
      if (deposit.status === 'active') {
        deposit.interestRate *= (1 - penalties.depositPenalty);
      }
    });

    // Добавляем штраф к кредиту
    const lateFee = Math.floor(credit.minWeeklyPayment * penalties.lateFee);
    credit.penalties += lateFee;
    credit.amount += lateFee;

    // Добавляем в очередь уведомлений
    this.pendingLatePayments.push({
      creditId: credit.id,
      amount: credit.minWeeklyPayment,
      penalty: lateFee,
      date: new Date()
    });

    return {
      penalty: lateFee,
      cashbackReduction: penalties.cashbackReduction,
      depositPenalty: penalties.depositPenalty
    };
  }

  /**
   * Полный дефолт по кредиту (если совсем не платить)
   */
  handleCreditDefault(creditId) {
    const credit = this.credits.find(c => c.id === creditId);
    
    if (!credit) return;

    credit.defaulted = true;
    credit.status = 'defaulted';

    // Конфискация товара из инвентаря
    const confiscationResult = this.confiscateInventoryItem(credit.amount);

    return {
      status: 'defaulted',
      message: 'На вас подали в суд за неуплату кредита',
      confiscated: confiscationResult
    };
  }

  /**
   * Конфискация товара
   */
  confiscateInventoryItem(debtAmount) {
    // Найти первый доступный товар и конфисковать его
    if (this.player.inventory && this.player.inventory.length > 0) {
      const itemToConfiscate = this.player.inventory[Math.floor(Math.random() * this.player.inventory.length)];
      this.player.inventory = this.player.inventory.filter(item => item.id !== itemToConfiscate.id);
      
      return {
        confiscated: true,
        item: itemToConfiscate,
        message: `Конфискован товар: ${itemToConfiscate.name}`
      };
    }

    return {
      confiscated: false,
      message: 'У вас нет товаров для конфискации. Деньги вычтены со счета'
    };
  }

  // ============ СИСТЕМА ПРОСМОТРА РЕКЛАМЫ ============

  /**
   * Посмотреть рекламу и получить деньги
   */
  watchAd() {
    const now = Date.now();
    
    if (now - this.lastAdWatchTime < this.adWatchCooldown) {
      const secondsToWait = Math.ceil((this.adWatchCooldown - (now - this.lastAdWatchTime)) / 1000);
      return {
        success: false,
        error: `Следующую рекламу можно смотреть через ${secondsToWait} сек`
      };
    }

    this.lastAdWatchTime = now;

    // Рандомная сумма 1000-3000₽
    const reward = Math.floor(Math.random() * (3000 - 1000 + 1)) + 1000;
    this.accountBalance += reward;

    return {
      success: true,
      reward: reward,
      newBalance: this.accountBalance,
      message: `🎉 Получено ${reward}₽ за просмотр рекламы!`
    };
  }

  /**
   * Получить доступные объявления (заглушки для прикола)
   */
  getAdPlaceholders() {
    return [
      { title: 'БРЮКИ за 5₽!!!', icon: '👖', color: '#FF6B6B' },
      { title: 'Учись трейдить', icon: '📈', color: '#4ECDC4' },
      { title: 'Кредит за 5 минут', icon: '💰', color: '#FFE66D' },
      { title: 'Займ без % первый раз', icon: '📊', color: '#95E1D3' },
      { title: 'Перепродай и заработай', icon: '🚀', color: '#A8E6CF' },
      { title: 'Инвестируй в крипто', icon: '🔐', color: '#C7CEEA' }
    ];
  }

  // ============ КАРТОЧКИ ДИЗАЙНОВ ============

  /**
   * Получить доступные дизайны карты
   */
  getCardDesigns() {
    return [
      {
        id: 'midnight',
        name: 'Midnight',
        gradient: 'linear-gradient(135deg, #2b2b3a, #0a0a12)',
        description: 'Темная классика'
      },
      {
        id: 'sunset',
        name: 'Sunset',
        gradient: 'linear-gradient(135deg, #ff8a5c, #d6373a)',
        description: 'Закат'
      },
      {
        id: 'mint',
        name: 'Mint',
        gradient: 'linear-gradient(135deg, #3fe0c5, #0f8a72)',
        description: 'Свежая мята'
      },
      {
        id: 'amethyst',
        name: 'Amethyst',
        gradient: 'linear-gradient(135deg, #b06bff, #5b2a9e)',
        description: 'Аметист'
      }
    ];
  }

  /**
   * Создать виртуальную карту
   */
  createCard(designId, cardholderName) {
    const design = this.getCardDesigns().find(d => d.id === designId);
    
    if (!design) {
      return { success: false, error: 'Дизайн не найден' };
    }

    const card = {
      id: this.generateId(),
      design: designId,
      cardholderName: cardholderName,
      cardNumber: this.generateCardNumber(),
      expiryDate: this.generateExpiryDate(),
      cvv: this.generateCVV(),
      network: 'K-BANK',
      balance: this.accountBalance,
      createdAt: new Date()
    };

    return {
      success: true,
      card: card,
      message: 'Карта создана успешно!'
    };
  }

  // ============ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ============

  generateId() {
    return 'ID-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  generateCardNumber() {
    return Array(4).fill().map(() => Math.floor(Math.random() * 10000).toString().padStart(4, '0')).join(' ');
  }

  generateExpiryDate() {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 4);
    return `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
  }

  generateCVV() {
    return Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  }

  /**
   * Форматирование даты ввода (автоматически добавляет слэши)
   */
  formatDateInput(input) {
    // Удаляем все символы кроме цифр
    const cleaned = input.replace(/\D/g, '');
    
    // Форматируем как DD/MM/YYYY
    if (cleaned.length <= 2) {
      return cleaned;
    } else if (cleaned.length <= 4) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    } else {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4, 8);
    }
  }

  /**
   * Проверка валидности даты рождения
   */
  validateBirthDate(dateString) {
    const [day, month, year] = dateString.split('/').map(Number);
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 14) {
      return { valid: false, error: 'Вам должно быть минимум 14 лет' };
    }

    return { valid: true, age: age };
  }

  /**
   * Получить статистику аккаунта
   */
  getAccountStats() {
    const totalDeposits = this.deposits.reduce((sum, d) => sum + d.amount, 0);
    const totalInterest = this.deposits.reduce((sum, d) => sum + d.accumulatedInterest, 0);
    const totalDebts = this.credits.reduce((sum, c) => sum + c.amount, 0);
    const activeCreditCount = this.credits.filter(c => c.status === 'active').length;

    return {
      balance: this.accountBalance,
      deposits: {
        total: totalDeposits,
        interest: totalInterest,
        count: this.deposits.filter(d => d.status === 'active').length
      },
      credits: {
        active: activeCreditCount,
        totalDebt: totalDebts,
        creditScore: this.creditScore,
        maxAvailable: this.calculateMaxCredit(),
        successfulCredits: this.creditHistory.filter(c => c.status === 'closed' && !c.defaulted).length
      },
      cashback: {
        rate: (this.cashbackRate * 100).toFixed(1),
        isReduced: this.cashbackRate < 0.05
      }
    };
  }
}

// ============ ЭКСПОРТ ============
window.BankApp = BankApp;

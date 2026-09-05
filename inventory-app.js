// ============ СИСТЕМА ИНВЕНТАРЯ - РЮКЗАК С ТОВАРАМИ И РЕМОНТОМ ============

class InventoryApp {
  constructor(playerData) {
    this.player = playerData;
    this.items = [];
    this.repairHistory = [];
    this.selectedCategory = 'all';
    this.sortBy = 'date'; // date, price, name
  }

  // ============ ДОБАВЛЕНИЕ ТОВАРА В ИНВЕНТАРЬ ============

  /**
   * Добавить товар в инвентарь
   */
  addItem(product, sourceType = 'purchase') {
    // sourceType: 'purchase', 'delivery', 'found'
    
    const item = {
      id: this.generateId(),
      productId: product.id || null,
      name: product.name,
      category: product.category,
      price: product.price,
      purchasePrice: product.purchasePrice || product.price,
      condition: product.condition || 'good',
      isOriginal: product.isOriginal !== undefined ? product.isOriginal : true,
      isRestored: product.isRestored || false,
      image: product.image,
      addedAt: new Date(),
      sourceType: sourceType,
      
      // Состояние товара
      batteryHealth: product.batteryHealth || '100%',
      mileage: product.mileage || null,
      defects: product.defects || [],
      features: product.features || {},
      
      // Для продажи
      onSale: false,
      salePrice: null,
      soldAt: null,
      
      // Ремонт
      repairHistory: [],
      lastRepairQuality: null
    };

    this.items.push(item);
    return item;
  }

  // ============ УПРАВЛЕНИЕ КАТЕГОРИЯМИ ============

  /**
   * Получить товары по категориям
   */
  getItemsByCategory(category) {
    if (category === 'all') {
      return this.items;
    }

    return this.items.filter(item => item.category === category);
  }

  /**
   * Получить все категории
   */
  getAllCategories() {
    const categories = new Set(this.items.map(item => item.category));
    return Array.from(categories);
  }

  /**
   * Получить статистику по категориям
   */
  getCategoryStats() {
    return {
      all: this.items.length,
      earbuds: this.items.filter(i => i.category === 'earbuds').length,
      phone: this.items.filter(i => i.category === 'phone').length,
      clothing: this.items.filter(i => i.category === 'clothing').length,
      car: this.items.filter(i => i.category === 'car').length
    };
  }

  // ============ СИСТЕМА РЕМОНТА ============

  /**
   * Получить доступные варианты ремонта
   */
  getRepairOptions(itemId) {
    const item = this.items.find(i => i.id === itemId);
    
    if (!item) {
      return { success: false, error: 'Товар не найден' };
    }

    // Не все товары можно ремонтировать
    if (!['phone', 'car', 'clothing'].includes(item.category)) {
      return { success: false, error: 'Этот товар нельзя ремонтировать' };
    }

    // Если товар в идеальном состоянии, ремонт не нужен
    if (item.condition === 'ideal') {
      return { success: false, error: 'Товар в идеальном состоянии, ремонт не требуется' };
    }

    const options = {
      cheap: {
        name: 'Эконом ремонт',
        cost: Math.floor(item.purchasePrice * 0.20),
        improvementPercent: 10,
        description: 'Быстрый ремонт, минимальные улучшения',
        qualityLevel: 1
      },
      standard: {
        name: 'Стандартный ремонт',
        cost: Math.floor(item.purchasePrice * 0.50),
        improvementPercent: 25,
        description: 'Полный ремонт, хорошее качество',
        qualityLevel: 2
      },
      premium: {
        name: 'Премиум ремонт',
        cost: Math.floor(item.purchasePrice * 1.0),
        improvementPercent: 40,
        description: 'Полный ремонт как новое, максимальное качество',
        qualityLevel: 3
      }
    };

    return {
      success: true,
      item: item,
      options: options,
      currentCondition: item.condition,
      estimatedValue: this.calculateItemValue(item)
    };
  }

  /**
   * Провести ремонт
   */
  repairItem(itemId, repairType) {
    // repairType: 'cheap', 'standard', 'premium'
    
    const item = this.items.find(i => i.id === itemId);
    
    if (!item) {
      return { success: false, error: 'Товар не найден' };
    }

    const repairOptions = this.getRepairOptions(itemId);
    
    if (!repairOptions.success) {
      return repairOptions;
    }

    const option = repairOptions.options[repairType];
    
    if (!option) {
      return { success: false, error: 'Неверный тип ремонта' };
    }

    if (this.player.balance < option.cost) {
      return { success: false, error: `Недостаточно средств. Нужно ${option.cost}₽` };
    }

    // Проводим ремонт
    this.player.balance -= option.cost;

    // Обновляем состояние товара
    const conditionLevels = ['poor', 'fair', 'good', 'ideal'];
    const currentLevel = conditionLevels.indexOf(item.condition);
    const newLevel = Math.min(currentLevel + Math.floor(option.improvementPercent / 10), 3);
    item.condition = conditionLevels[newLevel];

    // Добавляем в историю ремонтов
    const repair = {
      id: this.generateId(),
      date: new Date(),
      type: repairType,
      cost: option.cost,
      previousCondition: conditionLevels[currentLevel],
      newCondition: item.condition,
      qualityLevel: option.qualityLevel,
      improvement: option.improvementPercent
    };

    item.repairHistory.push(repair);
    item.lastRepairQuality = option.qualityLevel;
    this.repairHistory.push(repair);

    // Пересчитываем стоимость товара
    const newValue = this.calculateItemValue(item);

    return {
      success: true,
      repair: repair,
      item: item,
      newValue: newValue,
      message: `Товар отремонтирован! Новое состояние: ${item.condition}. Новая стоимость: ${newValue}₽`,
      cost: option.cost
    };
  }

  /**
   * Рассчитать стоимость товара
   */
  calculateItemValue(item) {
    let value = item.purchasePrice;

    // Скидка за состояние
    const conditionMultiplier = {
      'ideal': 1.0,
      'good': 0.85,
      'fair': 0.60,
      'poor': 0.30
    };

    value *= conditionMultiplier[item.condition] || 0.5;

    // Скидка за реплику
    if (!item.isOriginal) {
      value *= 0.40;
    }

    // Скидка за восстановленный
    if (item.isRestored) {
      value *= 0.65;
    }

    // Бонус за ремонт
    if (item.lastRepairQuality) {
      value *= (1 + item.lastRepairQuality * 0.15); // +15% за каждый уровень ремонта
    }

    return Math.floor(value);
  }

  // ============ ПРОДАЖА ТОВАРА ============

  /**
   * Выставить товар на продажу
   */
  listItemForSale(itemId, salePrice) {
    const item = this.items.find(i => i.id === itemId);
    
    if (!item) {
      return { success: false, error: 'Товар не найден' };
    }

    if (item.onSale) {
      return { success: false, error: 'Товар уже выставлен на продажу' };
    }

    item.onSale = true;
    item.salePrice = salePrice;

    return {
      success: true,
      item: item,
      message: `Товар выставлен на продажу за ${salePrice}₽`,
      estimatedValue: this.calculateItemValue(item)
    };
  }

  /**
   * Отметить товар как проданный
   */
  markAsSold(itemId, actualPrice) {
    const item = this.items.find(i => i.id === itemId);
    
    if (!item) {
      return { success: false, error: 'Товар не найден' };
    }

    item.onSale = false;
    item.soldAt = new Date();
    
    // Добавляем деньги от продажи
    this.player.balance += actualPrice;

    return {
      success: true,
      item: item,
      received: actualPrice,
      message: `Товар продан за ${actualPrice}₽!`
    };
  }

  /**
   * Отменить продажу
   */
  cancelSale(itemId) {
    const item = this.items.find(i => i.id === itemId);
    
    if (!item) {
      return { success: false, error: 'Товар не найден' };
    }

    item.onSale = false;
    item.salePrice = null;

    return {
      success: true,
      item: item,
      message: 'Продажа отменена'
    };
  }

  // ============ УДАЛЕНИЕ ТОВАРА ============

  /**
   * Удалить товар из инвентаря
   */
  removeItem(itemId) {
    const item = this.items.find(i => i.id === itemId);
    
    if (!item) {
      return { success: false, error: 'Товар не найден' };
    }

    if (item.onSale) {
      return { success: false, error: 'Сначала отмените продажу товара' };
    }

    this.items = this.items.filter(i => i.id !== itemId);

    return {
      success: true,
      message: 'Товар удален из инвентаря'
    };
  }

  // ============ СОРТИРОВКА И ФИЛЬТРАЦИЯ ============

  /**
   * Отсортировать товары
   */
  sortItems(sortType = 'date') {
    // sortType: 'date', 'price', 'name', 'condition'
    
    const sorted = [...this.items];

    switch (sortType) {
      case 'date':
        sorted.sort((a, b) => b.addedAt - a.addedAt);
        break;
      case 'price':
        sorted.sort((a, b) => b.purchasePrice - a.purchasePrice);
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
        break;
      case 'condition':
        const conditionOrder = { 'ideal': 0, 'good': 1, 'fair': 2, 'poor': 3 };
        sorted.sort((a, b) => conditionOrder[a.condition] - conditionOrder[b.condition]);
        break;
    }

    return sorted;
  }

  /**
   * Поиск товара
   */
  searchItems(query) {
    const lowerQuery = query.toLowerCase();
    return this.items.filter(item => 
      item.name.toLowerCase().includes(lowerQuery) ||
      item.category.toLowerCase().includes(lowerQuery)
    );
  }

  // ============ СТАТИСТИКА ============

  /**
   * Получить общую статистику инвентаря
   */
  getInventoryStats() {
    const totalItems = this.items.length;
    const totalValue = this.items.reduce((sum, item) => sum + this.calculateItemValue(item), 0);
    const itemsOnSale = this.items.filter(i => i.onSale).length;
    const repairedItems = this.items.filter(i => i.repairHistory.length > 0).length;

    const conditionBreakdown = {
      ideal: this.items.filter(i => i.condition === 'ideal').length,
      good: this.items.filter(i => i.condition === 'good').length,
      fair: this.items.filter(i => i.condition === 'fair').length,
      poor: this.items.filter(i => i.condition === 'poor').length
    };

    const categoryBreakdown = {};
    this.getAllCategories().forEach(cat => {
      categoryBreakdown[cat] = this.items.filter(i => i.category === cat).length;
    });

    return {
      totalItems: totalItems,
      totalValue: totalValue,
      itemsOnSale: itemsOnSale,
      repairedItems: repairedItems,
      conditionBreakdown: conditionBreakdown,
      categoryBreakdown: categoryBreakdown,
      repairHistory: this.repairHistory.length
    };
  }

  /**
   * Получить дорогие товары
   */
  getExpensiveItems(limit = 5) {
    return this.items
      .sort((a, b) => this.calculateItemValue(b) - this.calculateItemValue(a))
      .slice(0, limit);
  }

  /**
   * Получить товары нуждающиеся в ремонте
   */
  getItemsNeedingRepair() {
    return this.items.filter(item => 
      item.condition !== 'ideal' && 
      ['phone', 'car', 'clothing'].includes(item.category)
    );
  }

  /**
   * Получить товары готовые к продаже
   */
  getItemsReadyForSale() {
    return this.items.filter(item => 
      !item.onSale && 
      item.condition !== 'poor' &&
      this.calculateItemValue(item) > 0
    );
  }

  // ============ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ============

  generateId() {
    return 'INV-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  /**
   * Получить иконку категории
   */
  getCategoryIcon(category) {
    const icons = {
      'earbuds': '🎧',
      'phone': '📱',
      'clothing': '👕',
      'car': '🚗',
      'watch': '⌚',
      'camera': '📷',
      'laptop': '💻'
    };
    return icons[category] || '📦';
  }

  /**
   * Получить цвет категории
   */
  getCategoryColor(category) {
    const colors = {
      'earbuds': '#3498DB',
      'phone': '#E74C3C',
      'clothing': '#2ECC71',
      'car': '#F39C12',
      'watch': '#9B59B6',
      'camera': '#1ABC9C',
      'laptop': '#34495E'
    };
    return colors[category] || '#95A5A6';
  }

  /**
   * Формат состояния на русском
   */
  formatCondition(condition) {
    const formats = {
      'ideal': 'Идеальное',
      'good': 'Хорошее',
      'fair': 'Среднее',
      'poor': 'Плохое'
    };
    return formats[condition] || condition;
  }

  /**
   * Получить описание дефектов
   */
  getDefectsDescription(item) {
    if (!item.defects || item.defects.length === 0) {
      return 'Без дефектов';
    }
    return item.defects.join(', ');
  }

  /**
   * Экспортировать инвентарь в JSON
   */
  exportToJSON() {
    return {
      exportedAt: new Date(),
      totalItems: this.items.length,
      items: this.items,
      stats: this.getInventoryStats()
    };
  }

  /**
   * Импортировать инвентарь из JSON
   */
  importFromJSON(jsonData) {
    if (!jsonData.items || !Array.isArray(jsonData.items)) {
      return { success: false, error: 'Неверный формат JSON' };
    }

    jsonData.items.forEach(itemData => {
      this.addItem(itemData, 'import');
    });

    return {
      success: true,
      message: `Импортировано ${jsonData.items.length} товаров`
    };
  }
}

// ============ ЭКСПОРТ ============
window.InventoryApp = InventoryApp;

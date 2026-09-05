// ============ СИСТЕМА КАРТ - МЕСТА, ТАКСИ, ВСТРЕЧИ ============

class MapsApp {
  constructor(playerData) {
    this.player = playerData;
    this.playerCity = playerData.city || 'Москва';
    this.playerLocation = this.getPlayerCurrentLocation();
    this.places = this.generatePlacesForCity(this.playerCity);
    this.activeTaxiRide = null;
    this.meetingPoints = [];
    this.selectedTariff = null;
  }

  // ============ МЕСТА В ГОРОДЕ ============

  /**
   * Генерировать места для города
   */
  generatePlacesForCity(city) {
    const cityPlaces = {
      'Москва': [
        { id: 1, name: 'Парк Горького', emoji: '🌳', description: 'Красивый парк в центре', distance: 2.5, icon: '🏞️', color: '#2ECC71' },
        { id: 2, name: 'ГУМ', emoji: '🏬', description: 'Торговый центр', distance: 5.0, icon: '🛍️', color: '#E74C3C' },
        { id: 3, name: 'Третьяковская галерея', emoji: '🎨', description: 'Музей искусств', distance: 4.2, icon: '🖼️', color: '#9B59B6' },
        { id: 4, name: 'Кремль', emoji: '🏰', description: 'Историческое место', distance: 1.8, icon: '🏛️', color: '#F39C12' },
        { id: 5, name: 'Большой театр', emoji: '🎭', description: 'Оперный театр', distance: 3.1, icon: '🎪', color: '#3498DB' },
        { id: 6, name: 'ТЦ Афимолл', emoji: '🏪', description: 'Крупный молл', distance: 8.5, icon: '🛒', color: '#E67E22' },
        { id: 7, name: 'Парк Разумовского', emoji: '🎡', description: 'Парк развлечений', distance: 12.0, icon: '🎠', color: '#C0392B' },
        { id: 8, name: 'Московский зоопарк', emoji: '🦁', description: 'Зоопарк', distance: 6.3, icon: '🦒', color: '#16A085' }
      ],
      'Санкт-Петербург': [
        { id: 1, name: 'Дворцовая площадь', emoji: '🏰', description: 'Центральная площадь', distance: 3.0, icon: '🏛️', color: '#2980B9' },
        { id: 2, name: 'Невский проспект', emoji: '🛍️', description: 'Главная улица', distance: 2.2, icon: '🚶', color: '#E74C3C' },
        { id: 3, name: 'Эрмитаж', emoji: '🎨', description: 'Музей мирового уровня', distance: 4.1, icon: '🖼️', color: '#8E44AD' },
        { id: 4, name: 'Петропавловская крепость', emoji: '🏰', description: 'Историческая крепость', distance: 5.5, icon: '⚔️', color: '#C0392B' },
        { id: 5, name: 'Парк Александра Невского', emoji: '🌳', description: 'Большой парк', distance: 7.8, icon: '🌲', color: '#27AE60' },
        { id: 6, name: 'Казанский собор', emoji: '⛪', description: 'Красивый собор', distance: 2.9, icon: '✨', color: '#F39C12' },
        { id: 7, name: 'Ленэкспо', emoji: '🎪', description: 'Выставочный центр', distance: 9.2, icon: '🎭', color: '#16A085' }
      ],
      'Екатеринбург': [
        { id: 1, name: 'Главный вокзал', emoji: '🚂', description: 'Знаменитый вокзал', distance: 4.0, icon: '🚃', color: '#2C3E50' },
        { id: 2, name: 'Парк им. Маяковского', emoji: '🌳', description: 'Центральный парк', distance: 3.5, icon: '🎡', color: '#27AE60' },
        { id: 3, name: 'ТЦ Гринвич', emoji: '🏬', description: 'Торговый центр', distance: 6.1, icon: '🛍️', color: '#E74C3C' },
        { id: 4, name: 'Храм на Крови', emoji: '⛪', description: 'Исторический храм', distance: 2.8, icon: '✨', color: '#F39C12' },
        { id: 5, name: 'Музей изобразительных искусств', emoji: '🎨', description: 'Галерея', distance: 5.2, icon: '🖼️', color: '#9B59B6' }
      ],
      'Новосибирск': [
        { id: 1, name: 'Оперный театр', emoji: '🎭', description: 'Знаменитый театр', distance: 3.2, icon: '🎪', color: '#8E44AD' },
        { id: 2, name: 'Парк Фрунзе', emoji: '🌳', description: 'Огромный парк', distance: 5.0, icon: '🌲', color: '#27AE60' },
        { id: 3, name: 'ТЦ Аура', emoji: '🏪', description: 'Молл', distance: 7.5, icon: '🛒', color: '#E67E22' },
        { id: 4, name: 'Зоопарк', emoji: '🦁', description: 'Известный зоопарк', distance: 6.8, icon: '🦒', color: '#16A085' }
      ]
    };

    const defaultPlaces = cityPlaces[city] || cityPlaces['Москва'];
    
    // Сортируем по расстоянию
    return defaultPlaces.sort((a, b) => a.distance - b.distance);
  }

  /**
   * Получить текущее местоположение игрока
   */
  getPlayerCurrentLocation() {
    return {
      city: this.playerCity,
      lat: 55.7558,
      lng: 37.6173,
      name: 'Ваше текущее местоположение'
    };
  }

  /**
   * Перейти в другой город
   */
  travelToCity(newCity) {
    this.playerCity = newCity;
    this.playerLocation = this.getPlayerCurrentLocation();
    this.places = this.generatePlacesForCity(newCity);
    this.player.city = newCity;

    return {
      success: true,
      city: newCity,
      places: this.places,
      message: `Вы приехали в ${newCity}`
    };
  }

  // ============ ПЕШЕХОДНАЯ НАВИГАЦИЯ ============

  /**
   * Пойти пешком до места
   */
  walkToPlace(placeId) {
    const place = this.places.find(p => p.id === placeId);
    
    if (!place) {
      return { success: false, error: 'Место не найдено' };
    }

    // Время = расстояние * время на км (примерно)
    // 2.5 км = 30 минут, 5 км = 60 минут
    const walkingTime = Math.ceil(place.distance * 12); // минут

    return {
      success: true,
      place: place,
      walkingTime: walkingTime,
      message: `Вы начали пешком идти до ${place.name}. Время в пути: ${walkingTime} минут`,
      animation: 'walking'
    };
  }

  /**
   * Прибыть на место (пешком)
   */
  arriveAtPlaceByWalking(placeId) {
    const place = this.places.find(p => p.id === placeId);
    
    if (!place) {
      return { success: false, error: 'Место не найдено' };
    }

    return {
      success: true,
      place: place,
      arrived: true,
      message: `Вы пришли до ${place.name}!`,
      animation: 'fade_out'
    };
  }

  // ============ ТАКСИ ============

  /**
   * Заказать такси
   */
  orderTaxi(placeId, tariffType) {
    const place = this.places.find(p => p.id === placeId);
    
    if (!place) {
      return { success: false, error: 'Место не найдено' };
    }

    if (!GameData.DELIVERY_SYSTEM.tariffs[tariffType]) {
      return { success: false, error: 'Неверный тариф' };
    }

    const tariff = GameData.DELIVERY_SYSTEM.tariffs[tariffType];
    const baseTaxiCost = place.distance * 30; // 30₽ за км
    const taxiCost = Math.floor(baseTaxiCost * tariff.multiplier);
    const driveTime = Math.ceil(place.distance * 3); // 3 минуты на км

    const driver = this.generateDriver(tariffType);

    this.activeTaxiRide = {
      id: this.generateId(),
      place: place,
      driver: driver,
      tariff: tariffType,
      cost: taxiCost,
      driveTime: driveTime,
      status: 'waiting_for_driver', // waiting_for_driver, driver_arriving, arrived, ride_complete
      createdAt: new Date(),
      pickupTime: new Date(Date.now() + driveTime * 60 * 1000),
      distance: place.distance
    };

    return {
      success: true,
      ride: this.activeTaxiRide,
      driver: driver,
      cost: taxiCost,
      eta: driveTime,
      message: `Такси заказано! Водитель ${driver.name} (${driver.car.brand} ${driver.car.model}) едет к вам`
    };
  }

  /**
   * Генерировать водителя такси
   */
  generateDriver(tariffType) {
    const firstNames = ['Иван', 'Сергей', 'Петр', 'Алексей', 'Владимир', 'Николай', 'Дмитрий'];
    const lastNames = ['Смирнов', 'Иванов', 'Попов', 'Сидоров', 'Петров', 'Козлов'];
    
    const cars = {
      economy: [
        { brand: 'Lada', model: 'Priora', color: 'Белый' },
        { brand: 'Hyundai', model: 'Solaris', color: 'Черный' },
        { brand: 'Volkswagen', model: 'Polo', color: 'Белый' }
      ],
      standard: [
        { brand: 'Toyota', model: 'Camry', color: 'Серебристый' },
        { brand: 'Mercedes', model: 'C-Class', color: 'Черный' },
        { brand: 'BMW', model: '320', color: 'Белый' }
      ],
      express: [
        { brand: 'BMW', model: '750', color: 'Черный' },
        { brand: 'Mercedes', model: 'S-Class', color: 'Серебристый' },
        { brand: 'Audi', model: 'A8', color: 'Черный' }
      ]
    };

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const carList = cars[tariffType] || cars.economy;
    const car = carList[Math.floor(Math.random() * carList.length)];
    const rating = (Math.random() * 0.5 + 4.5).toFixed(1); // 4.5-5.0

    return {
      name: firstName + ' ' + lastName,
      car: car,
      licensePlate: this.generateLicensePlate(),
      rating: rating,
      reviews: Math.floor(Math.random() * 500) + 50
    };
  }

  /**
   * Прибытие такси
   */
  taxiArrived() {
    if (!this.activeTaxiRide) {
      return { success: false, error: 'Такси не заказано' };
    }

    this.activeTaxiRide.status = 'arrived';

    return {
      success: true,
      message: `Такси прибыло!`,
      driver: this.activeTaxiRide.driver,
      placeDetails: {
        name: this.activeTaxiRide.place.name,
        distance: this.activeTaxiRide.distance,
        cost: this.activeTaxiRide.cost
      }
    };
  }

  /**
   * Завершить поездку на такси
   */
  completeTaxiRide() {
    if (!this.activeTaxiRide) {
      return { success: false, error: 'Такси не заказано' };
    }

    const ride = this.activeTaxiRide;
    ride.status = 'ride_complete';

    // Списываем деньги
    this.player.balance -= ride.cost;

    const feedback = {
      driver: ride.driver,
      cost: ride.cost,
      rating: ride.driver.rating,
      completed: true
    };

    this.activeTaxiRide = null;

    return {
      success: true,
      message: `Вы прибыли до ${ride.place.name}! Спасибо за поездку!`,
      cost: ride.cost,
      driver: feedback.driver,
      placeDetails: ride.place
    };
  }

  /**
   * Оценить водителя
   */
  rateTaxiDriver(rating, comment) {
    // Рейтинг влияет на репутацию водителя
    return {
      success: true,
      rating: rating,
      message: `Спасибо за оценку! Вы оценили водителя на ${rating}/5`
    };
  }

  // ============ ВСТРЕЧИ И СДЕЛКИ ============

  /**
   * Создать точку встречи
   */
  createMeetingPoint(placeId, date, time) {
    const place = this.places.find(p => p.id === placeId);
    
    if (!place) {
      return { success: false, error: 'Место не найдено' };
    }

    const meetingPoint = {
      id: this.generateId(),
      place: place,
      date: date,
      time: time,
      createdAt: new Date(),
      status: 'scheduled', // scheduled, buyer_arrived, seller_arrived, completed, cancelled
      buyerArrived: false,
      sellerArrived: false,
      arrivalWindow: { start: '±30 min' },
      meetingType: 'deal' // deal, pickup, etc
    };

    this.meetingPoints.push(meetingPoint);

    return {
      success: true,
      meeting: meetingPoint,
      message: `Встреча назначена на ${date} в ${time} в ${place.name}`
    };
  }

  /**
   * Проверить время прибытия
   */
  checkArrivalTime(meetingId, playerArrivalTime) {
    const meeting = this.meetingPoints.find(m => m.id === meetingId);
    
    if (!meeting) {
      return { success: false, error: 'Встреча не найдена' };
    }

    const meetingTime = this.parseTime(meeting.time);
    const playerTime = this.parseTime(playerArrivalTime);
    const timeDiff = Math.abs(playerTime - meetingTime);

    if (timeDiff > 30) {
      return {
        success: false,
        onTime: false,
        timeDiff: timeDiff,
        message: 'Вы опоздали на встречу!',
        consequence: 'danger'
      };
    }

    meeting.buyerArrived = true;
    return {
      success: true,
      onTime: true,
      message: 'Вы прибыли вовремя!',
      meeting: meeting
    };
  }

  /**
   * Навигация до встречи
   */
  navigateToMeeting(meetingId) {
    const meeting = this.meetingPoints.find(m => m.id === meetingId);
    
    if (!meeting) {
      return { success: false, error: 'Встреча не найдена' };
    }

    return {
      success: true,
      destination: meeting.place,
      place: {
        name: meeting.place.name,
        description: meeting.place.description,
        coordinates: { lat: 55.7558, lng: 37.6173 },
        meetingTime: meeting.time
      },
      navigation: {
        mode: 'walking', // или 'taxi'
        time: Math.ceil(meeting.place.distance * 12) + ' минут',
        distance: meeting.place.distance + ' км'
      }
    };
  }

  // ============ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ============

  generateId() {
    return 'PLACE-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  generateLicensePlate() {
    const letters = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
    const plate = letters[Math.floor(Math.random() * letters.length)] +
                  String(Math.floor(Math.random() * 999)).padStart(3, '0') +
                  letters[Math.floor(Math.random() * letters.length)] +
                  letters[Math.floor(Math.random() * letters.length)] +
                  String(Math.floor(Math.random() * 99)).padStart(2, '0');
    return plate;
  }

  parseTime(timeStr) {
    // Парсим "14:30" в минуты
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Получить информацию о тарифах такси
   */
  getTaxiTariffs() {
    const tariffs = GameData.DELIVERY_SYSTEM.tariffs;
    
    return Object.keys(tariffs).map(key => ({
      type: key,
      name: tariffs[key].name,
      multiplier: tariffs[key].multiplier,
      time: tariffs[key].days // переиспользуем, на самом деле это описание скорости
    }));
  }

  /**
   * Получи��ь все места в текущем городе
   */
  getPlacesInCurrentCity() {
    return this.places.map(place => ({
      id: place.id,
      name: place.name,
      description: place.description,
      distance: place.distance,
      icon: place.icon,
      color: place.color,
      walkingTime: Math.ceil(place.distance * 12),
      taxiTime: Math.ceil(place.distance * 3)
    }));
  }

  /**
   * Получить статистику карт
   */
  getMapsStats() {
    return {
      currentCity: this.playerCity,
      placesCount: this.places.length,
      activeTaxiRide: this.activeTaxiRide ? true : false,
      meetingsScheduled: this.meetingPoints.filter(m => m.status === 'scheduled').length,
      completedMeetings: this.meetingPoints.filter(m => m.status === 'completed').length
    };
  }
}

// ============ ЭКСПОРТ ============
window.MapsApp = MapsApp;

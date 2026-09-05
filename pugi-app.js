// ============ ПРИЛОЖЕНИЕ PUGI - ПОИСКОВИК БИЛЕТОВ (AVIABILET & THETRAIN) ============

class PugiApp {
  constructor(playerData) {
    this.player = playerData;
    this.searchHistory = [];
    this.bookings = [];
    this.currentSearch = null;
    this.cities = this.getAllCities();
  }

  // ============ ДАННЫЕ ГОРОДОВ ============

  getAllCities() {
    return [
      'Москва',
      'Санкт-Петербург',
      'Екатеринбург',
      'Новосибирск',
      'Казань',
      'Сочи',
      'Омск',
      'Челябинск',
      'Уфа',
      'Ростов-на-Дону'
    ];
  }

  // ============ AVIABILET - АВИАБИЛЕТЫ ============

  /**
   * Поиск авиабилетов
   */
  searchFlights(fromCity, toCity, departureDate, passengers = 1) {
    if (!this.cities.includes(fromCity) || !this.cities.includes(toCity)) {
      return { success: false, error: 'Город не найден' };
    }

    if (fromCity === toCity) {
      return { success: false, error: 'Города отправления и прибытия совпадают' };
    }

    // Рассчитываем расстояние между городами (упрощенно)
    const distance = this.calculateDistance(fromCity, toCity);
    
    // Генерируем рейсы
    const flights = this.generateFlights(fromCity, toCity, distance, departureDate);

    this.currentSearch = {
      type: 'flights',
      fromCity: fromCity,
      toCity: toCity,
      departureDate: departureDate,
      passengers: passengers,
      results: flights,
      timestamp: new Date()
    };

    this.searchHistory.push(this.currentSearch);

    return {
      success: true,
      results: flights,
      count: flights.length,
      message: `Найдено ${flights.length} рейсов из ${fromCity} в ${toCity}`
    };
  }

  /**
   * Генерировать рейсы
   */
  generateFlights(fromCity, toCity, distance, departureDate) {
    const flights = [];
    const airlines = [
      { name: 'Aeroflot', code: 'SU', logo: '✈️' },
      { name: 'S7 Airlines', code: 'S7', logo: '✈️' },
      { name: 'Ural Airlines', code: 'U6', logo: '✈️' },
      { name: 'Wizz Air', code: 'W6', logo: '✈️' }
    ];

    // Примерно 1 час на каждые 2000 км
    const flightDuration = Math.ceil(distance / 2000 * 60);
    
    // Базовая цена: расстояние * 10₽/км
    const basePrice = Math.floor(distance * 10);

    for (let i = 0; i < 5; i++) {
      const airline = airlines[i % airlines.length];
      const departureTime = `${String(6 + i * 2).padStart(2, '0')}:${String(i * 10).padStart(2, '0')}`;
      const arrivalHours = Math.floor(flightDuration / 60);
      const arrivalMinutes = flightDuration % 60;
      const arrivalTime = `${String((6 + i * 2 + arrivalHours) % 24).padStart(2, '0')}:${String(arrivalMinutes).padStart(2, '0')}`;

      // Цена зависит от времени (ночные дешевле)
      let priceMultiplier = 1.0;
      if (parseInt(departureTime) >= 22 || parseInt(departureTime) < 6) {
        priceMultiplier = 0.70; // Ночной - дешевле
      } else if (parseInt(departureTime) >= 7 && parseInt(departureTime) < 9) {
        priceMultiplier = 1.30; // Утро - дороже
      } else if (parseInt(departureTime) >= 17 && parseInt(departureTime) < 19) {
        priceMultiplier = 1.25; // Вечер - дороже
      }

      const price = Math.floor(basePrice * priceMultiplier);

      flights.push({
        id: `FL-${airline.code}-${i}`,
        airline: airline.name,
        code: airline.code,
        logo: airline.logo,
        from: fromCity,
        to: toCity,
        departure: departureTime,
        arrival: arrivalTime,
        duration: flightDuration, // минуты
        durationFormatted: `${arrivalHours}ч ${arrivalMinutes}м`,
        date: departureDate,
        seat: '12A', // Заглушка
        carriage: null,
        aircraft: ['Boeing 737', 'Airbus A320', 'Sukhoi Superjet'][Math.floor(Math.random() * 3)],
        price: price,
        availableSeats: Math.floor(Math.random() * 50) + 20,
        stops: i % 3 === 0 ? 1 : 0, // Каждый 3-й с пересадкой
        stopInfo: i % 3 === 0 ? `1 пересадка (${Math.floor(Math.random() * 180) + 60} мин)` : 'Прямой',
        baggage: 'Включен 1 чемодан',
        meals: i % 2 === 0 ? 'Питание включено' : 'Питание не включено'
      });
    }

    return flights;
  }

  /**
   * Забронировать авиабилет
   */
  bookFlight(flightId, passengerName, passengers = 1) {
    const flight = this.currentSearch.results.find(f => f.id === flightId);

    if (!flight) {
      return { success: false, error: 'Рейс не найден' };
    }

    const totalPrice = flight.price * passengers;

    if (this.player.balance < totalPrice) {
      return { success: false, error: `Недостаточно средств. Нужно ${totalPrice}₽, а у вас ${this.player.balance}₽` };
    }

    const booking = {
      id: this.generateTicketNumber(),
      type: 'flight',
      flight: flight,
      passenger: passengerName,
      passengers: passengers,
      price: totalPrice,
      purchasedAt: new Date(),
      status: 'confirmed',
      seat: flight.seat
    };

    this.bookings.push(booking);
    this.player.balance -= totalPrice;

    // Отправляем электронный билет в почту
    if (window.MailApp) {
      const mailApp = new window.MailApp(this.player);
      mailApp.sendElectronicTicket({
        type: 'flight',
        from: flight.from,
        to: flight.to,
        departureDate: flight.date,
        departureTime: flight.departure,
        passenger: passengerName,
        ticketNumber: booking.id,
        price: totalPrice,
        seat: flight.seat,
        flight: flight.code,
        duration: flight.durationFormatted
      });
    }

    return {
      success: true,
      booking: booking,
      ticketNumber: booking.id,
      message: `Билет успешно куплен! Номер билета: ${booking.id}`
    };
  }

  // ============ THETRAIN - ЖЕЛЕЗНОДОРОЖНЫЕ БИЛЕТЫ ============

  /**
   * Поиск поездов
   */
  searchTrains(fromCity, toCity, departureDate, passengers = 1) {
    if (!this.cities.includes(fromCity) || !this.cities.includes(toCity)) {
      return { success: false, error: 'Город не найден' };
    }

    if (fromCity === toCity) {
      return { success: false, error: 'Города отправления и прибытия совпадают' };
    }

    const distance = this.calculateDistance(fromCity, toCity);
    const trains = this.generateTrains(fromCity, toCity, distance, departureDate);

    this.currentSearch = {
      type: 'trains',
      fromCity: fromCity,
      toCity: toCity,
      departureDate: departureDate,
      passengers: passengers,
      results: trains,
      timestamp: new Date()
    };

    this.searchHistory.push(this.currentSearch);

    return {
      success: true,
      results: trains,
      count: trains.length,
      message: `Найдено ${trains.length} поездов из ${fromCity} в ${toCity}`
    };
  }

  /**
   * Генерировать поезда
   */
  generateTrains(fromCity, toCity, distance, departureDate) {
    const trains = [];
    
    // Поезд едет примерно 60 км/ч в среднем
    const travelTime = Math.ceil(distance / 60 * 60); // минуты
    
    // Базовая цена: 3₽/км
    const basePrice = Math.floor(distance * 3);

    const trainNames = [
      { name: 'Сапсан', number: '101', type: 'скоростной', speed: 'fast' },
      { name: 'Ласточка', number: '150', type: 'региональный', speed: 'medium' },
      { name: 'Аллегро', number: '200', type: 'скоростной', speed: 'fast' },
      { name: 'Волна', number: '250', type: 'комфортный', speed: 'slow' },
      { name: 'Жемчужина', number: '301', type: 'премиум', speed: 'slow' }
    ];

    for (let i = 0; i < 5; i++) {
      const train = trainNames[i];
      const departureTime = `${String(6 + i * 3).padStart(2, '0')}:${String(i * 12).padStart(2, '0')}`;
      
      let durationMultiplier = 1;
      if (train.speed === 'fast') durationMultiplier = 0.7;
      if (train.speed === 'slow') durationMultiplier = 1.3;

      const tripDuration = Math.ceil(travelTime * durationMultiplier);
      const arrivalHours = Math.floor(tripDuration / 60);
      const arrivalMinutes = tripDuration % 60;
      const arrivalTime = `${String((6 + i * 3 + arrivalHours) % 24).padStart(2, '0')}:${String(arrivalMinutes).padStart(2, '0')}`;

      let priceMultiplier = 1.0;
      if (train.speed === 'fast') priceMultiplier = 1.5; // Скоростные дороже
      if (train.type === 'премиум') priceMultiplier = 2.0; // Премиум еще дороже
      if (parseInt(departureTime) >= 22 || parseInt(departureTime) < 6) priceMultiplier *= 0.80; // Ночью дешевле

      const price = Math.floor(basePrice * priceMultiplier);

      trains.push({
        id: `TR-${train.number}`,
        name: train.name,
        number: train.number,
        type: train.type,
        from: fromCity,
        to: toCity,
        departure: departureTime,
        arrival: arrivalTime,
        duration: tripDuration,
        durationFormatted: `${arrivalHours}ч ${arrivalMinutes}м`,
        date: departureDate,
        seat: `${Math.floor(Math.random() * 50) + 1}`,
        carriage: Math.floor(Math.random() * 10) + 1,
        price: price,
        availableSeats: Math.floor(Math.random() * 80) + 40,
        compartment: ['Плацкарт', 'Купе', 'СВ (люкс)'][Math.floor(Math.random() * 3)],
        bedding: 'Комплект постельного белья включен',
        meals: train.type === 'премиум' ? 'Питание включено' : 'Ресторан в поезде'
      });
    }

    return trains;
  }

  /**
   * Забронировать билет на поезд
   */
  bookTrain(trainId, passengerName, passengers = 1) {
    const train = this.currentSearch.results.find(t => t.id === trainId);

    if (!train) {
      return { success: false, error: 'Поезд не найден' };
    }

    const totalPrice = train.price * passengers;

    if (this.player.balance < totalPrice) {
      return { success: false, error: `Недостаточно средств. Нужно ${totalPrice}₽` };
    }

    const booking = {
      id: this.generateTicketNumber(),
      type: 'train',
      train: train,
      passenger: passengerName,
      passengers: passengers,
      price: totalPrice,
      purchasedAt: new Date(),
      status: 'confirmed',
      seat: train.seat,
      carriage: train.carriage
    };

    this.bookings.push(booking);
    this.player.balance -= totalPrice;

    // Отправляем электронный билет в почту
    if (window.MailApp) {
      const mailApp = new window.MailApp(this.player);
      mailApp.sendElectronicTicket({
        type: 'train',
        from: train.from,
        to: train.to,
        departureDate: train.date,
        departureTime: train.departure,
        passenger: passengerName,
        ticketNumber: booking.id,
        price: totalPrice,
        seat: train.seat,
        carriage: train.carriage,
        trainName: train.name,
        trainNumber: train.number,
        duration: train.durationFormatted
      });
    }

    return {
      success: true,
      booking: booking,
      ticketNumber: booking.id,
      message: `Билет успешно куплен! Номер билета: ${booking.id}`
    };
  }

  // ============ ПУТЕШЕСТВИЕ В ДРУГОЙ ГОРОД ============

  /**
   * Начать путешествие
   */
  travelToCity(ticketId, destinationCity) {
    const booking = this.bookings.find(b => b.id === ticketId);

    if (!booking) {
      return { success: false, error: 'Билет не найден' };
    }

    const destination = booking.type === 'flight' 
      ? booking.flight.to 
      : booking.train.to;

    if (destination !== destinationCity) {
      return { success: false, error: 'Пункт назна��ения билета не совпадает' };
    }

    // Определяем время путешествия
    const travelDuration = booking.type === 'flight' 
      ? booking.flight.duration 
      : booking.train.duration;

    // Переводим минуты в игровые дни (примерно)
    const gameplayDays = Math.ceil(travelDuration / 60 / 10);

    const travel = {
      id: this.generateId(),
      ticketId: ticketId,
      from: this.player.city,
      to: destinationCity,
      type: booking.type,
      startedAt: new Date(),
      duration: travelDuration,
      gameplayDays: gameplayDays,
      status: 'in_progress',
      estimatedArrival: new Date(Date.now() + gameplayDays * 24 * 60 * 60 * 1000)
    };

    // Запускаем таймер путешествия
    this.startTravelTimer(travel);

    return {
      success: true,
      travel: travel,
      message: `Путешествие начало! Вы в ${booking.type === 'flight' ? 'самолете' : 'поезде'} до ${destinationCity}`,
      duration: `${Math.floor(travelDuration / 60)}ч ${travelDuration % 60}м`,
      arrivalTime: travel.estimatedArrival.toLocaleTimeString('ru-RU')
    };
  }

  /**
   * Таймер путешествия
   */
  startTravelTimer(travel) {
    const travelInterval = setInterval(() => {
      if (travel.status === 'completed') {
        clearInterval(travelInterval);
        return;
      }

      const now = new Date();
      const remaining = travel.estimatedArrival - now;

      if (remaining <= 0) {
        this.completeTravelJourney(travel);
        clearInterval(travelInterval);
      }
    }, 1000);
  }

  /**
   * Завершить путешествие
   */
  completeTravelJourney(travel) {
    travel.status = 'completed';
    
    // Обновляем город игрока (нужно использовать MapsApp)
    if (window.MapsApp) {
      const mapsApp = new window.MapsApp(this.player);
      mapsApp.travelToCity(travel.to);
    } else {
      this.player.city = travel.to;
    }

    return {
      success: true,
      message: `Вы прибыли в ${travel.to}!`,
      newCity: travel.to
    };
  }

  // ============ ИЗБРАННОЕ И ИСТОРИЯ ============

  /**
   * Получить популярные маршруты
   */
  getPopularRoutes() {
    return [
      { from: 'Москва', to: 'Санкт-Петербург', avgPrice: 2500 },
      { from: 'Москва', to: 'Екатеринбург', avgPrice: 8000 },
      { from: 'Москва', to: 'Сочи', avgPrice: 5500 },
      { from: 'Санкт-Петербург', to: 'Москва', avgPrice: 2500 },
      { from: 'Екатеринбург', to: 'Новосибирск', avgPrice: 4000 }
    ];
  }

  /**
   * Получить историю поиска
   */
  getSearchHistory() {
    return this.searchHistory.slice(-10); // Последние 10 поисков
  }

  /**
   * Получить все брони
   */
  getBookings() {
    return this.bookings;
  }

  // ============ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ============

  generateTicketNumber() {
    return 'TK' + Math.random().toString().substring(2, 12).toUpperCase();
  }

  generateId() {
    return 'TRV-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  calculateDistance(fromCity, toCity) {
    // Упрощенная таблица расстояний между городами (примерные значения в км)
    const distances = {
      'Москва-Санкт-Петербург': 700,
      'Москва-Екатеринбург': 1800,
      'Москва-Новосибирск': 3300,
      'Москва-Казань': 800,
      'Москва-Сочи': 1600,
      'Москва-Омск': 2600,
      'Москва-Челябинск': 1800,
      'Москва-Уфа': 1200,
      'Москва-Ростов-на-Дону': 1400,
      'Санкт-Петербург-Екатеринбург': 2200,
      'Екатеринбург-Новосибирск': 2300,
      'Новосибирск-Омск': 700
    };

    const key1 = `${fromCity}-${toCity}`;
    const key2 = `${toCity}-${fromCity}`;

    return distances[key1] || distances[key2] || Math.floor(Math.random() * 3000) + 1000;
  }

  /**
   * Получить статистику
   */
  getStats() {
    const completedBookings = this.bookings.filter(b => b.status === 'completed').length;
    const totalSpent = this.bookings.reduce((sum, b) => sum + b.price, 0);

    return {
      totalBookings: this.bookings.length,
      completedBookings: completedBookings,
      totalSpent: totalSpent,
      searchHistory: this.searchHistory.length,
      favoriteRoute: this.searchHistory.length > 0 
        ? this.searchHistory[0] 
        : null
    };
  }
}

// ============ ЭКСПОРТ ============
window.PugiApp = PugiApp;

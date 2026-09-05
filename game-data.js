// ============ ТОВАРЫ С УНИКАЛЬНЫМИ ОПИСАНИЯМИ ============

const PRODUCTS = {
  // НАУШНИКИ
  'airpods-pro': {
    id: 'airpods-pro',
    name: 'AirPods Pro',
    category: 'earbuds',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
    description: `Оригинальные AirPods Pro в идеальном состоянии. Купил в апреле, пользовался очень аккуратно. 
      Активное шумоподавление работает отлично, батарея держит полный день без проблем. Чехол чистый, наушники как новые. 
      Причина продажи - подарили более дорогую модель. Только серьёзные предложения, торговаться не буду.`,
    condition: 'ideal', // ideal, good, fair, poor
    isOriginal: true,
    hasDefects: false,
    features: {
      noiseCancel: true,
      wireless: true,
      batteryLife: '6h'
    }
  },

  'xiaomi-buds': {
    id: 'xiaomi-buds',
    name: 'Xiaomi Buds 3T',
    category: 'earbuds',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=300',
    description: `Отличные беспроводные наушники за приличную цену. Купил полгода назад, практически не использовал. 
      Звук чистый, басс сбалансирован. На ушах удобно сидят, не выпадают даже при активных движениях. 
      В комплекте оригинальный кейс и все провода. Небольшая царапина на одном наушнике, но не заметна при ношении.`,
    condition: 'good',
    isOriginal: true,
    hasDefects: true,
    defects: ['Царапина на корпусе'],
    features: {
      noiseCancel: false,
      wireless: true,
      batteryLife: '8h'
    }
  },

  'airpods-fake': {
    id: 'airpods-fake',
    name: 'AirPods Pro',
    category: 'earbuds',
    price: 800,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
    description: `Хорошие копии AirPods Pro. Звук неплохой, шумоподавление работает. 
      Батарея держит примерно столько же. Микрофон хороший для звонков. За эту цену отличный вариант!`,
    condition: 'good',
    isOriginal: false,
    hasDefects: false,
    features: {
      noiseCancel: true,
      wireless: true,
      batteryLife: '5h'
    }
  },

  // ТЕЛЕФОНЫ
  'iphone-14': {
    id: 'iphone-14',
    name: 'iPhone 14',
    category: 'phone',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1592286927505-1def25115558?w=300',
    description: `iPhone 14 оригинальный, не восстановленный. Куплен в официальном магазине Apple год назад. 
      Экран без повреждений, задняя панель идеальна. Батарея на 95%. Все функции работают без сбоев. 
      Телефон всегда в защитной кейсе и на стекле. Причина продажи - перешёл на Pro max.`,
    condition: 'ideal',
    isOriginal: true,
    isRestored: false,
    batteryHealth: '95%',
    hasDefects: false
  },

  'iphone-12-restored': {
    id: 'iphone-12-restored',
    name: 'iPhone 12',
    category: 'phone',
    price: 25000,
    image: 'https://images.unsplash.com/photo-1592286927505-1def25115558?w=300',
    description: `iPhone 12 восстановленный (из сервиса Apple). Состояние хорошее, экран в отличном виде. 
      Батарея новая, заменена при восстановлении. Все технические тесты пройдены. Гарантия 6 месяцев.`,
    condition: 'good',
    isOriginal: true,
    isRestored: true,
    batteryHealth: '100%',
    hasDefects: false
  },

  'samsung-a50': {
    id: 'samsung-a50',
    name: 'Samsung Galaxy A50',
    category: 'phone',
    price: 12000,
    image: 'https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=300',
    description: `Samsung Galaxy A50, пользовался 2 года, но очень аккуратно. Экран работает отлично, матрица не битая. 
      На корпусе есть потёртости, видны следы использования, но функционально всё норм. 
      Батарея сдала немного, держит примерно 70% от нового. Нужен телефон более свежий, поэтому продаю.`,
    condition: 'fair',
    isOriginal: true,
    isRestored: false,
    batteryHealth: '70%',
    hasDefects: true,
    defects: ['Потёртости на корпусе', 'Батарея 70%']
  },

  // ОДЕЖДА
  'nike-jacket': {
    id: 'nike-jacket',
    name: 'Nike Windrunner Jacket',
    category: 'clothing',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=300',
    description: `Оригинальная Nike Windrunner красно-синяя. Куплена в официальном магазине. 
      Носила редко, по особым случаям. Ткань не потеряла цвет, молнии работают идеально. 
      Размер M, подходит на стройную фигуру. Продаю потому что из гардероба не достаю.`,
    condition: 'ideal',
    isOriginal: true,
    size: 'M',
    hasDefects: false
  },

  'adidas-hoodie-fake': {
    id: 'adidas-hoodie-fake',
    name: 'Adidas Hoodie',
    category: 'clothing',
    price: 800,
    image: 'https://images.unsplash.com/photo-1556821552-5f5e0c4fa5d0?w=300',
    description: `Хорошая копия Adidas толстовки. Ткань качественная, удобная. Вышивка аккуратная. 
      Размер L, отлично подходит. На груди небольшая стрика (видно только при близком рассмотрении).`,
    condition: 'good',
    isOriginal: false,
    size: 'L',
    hasDefects: true,
    defects: ['Стрика на груди']
  },

  // МАШИНЫ
  'toyota-camry': {
    id: 'toyota-camry',
    name: 'Toyota Camry 2015',
    category: 'car',
    price: 750000,
    image: 'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=300',
    description: `Toyota Camry 2015 год, седан, 2.5 литра. Состояние: хорошее. 
      Накоплено 120 000 км. Машина вся в работе, периодически проходит ТО. Небольшие потёртости на кузове, 
      но ржавчины нет. Внутри салон чистый, кожа без трещин. Все стёкла целые, зеркала рабочие.
      Причина продажи - купил новую, эту не нужна.`,
    condition: 'good',
    mileage: 120000,
    year: 2015,
    engine: '2.5L',
    hasDefects: true,
    defects: ['Потёртости на кузове', 'Небольшие косметические царапины']
  },

  'lada-vesta': {
    id: 'lada-vesta',
    name: 'Lada Vesta',
    category: 'car',
    price: 450000,
    image: 'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=300',
    description: `Лада Веста, 2018 год выпуска. Состояние: удовлетворительное. Ездил бережно, но следы есть. 
      На кузове видны небольшие вмятины (не краска). Салон потёртый, но чистый. 
      Под капотом всё рабочее, проблем нет. Машина ездит, но требует внимания к мелочам.`,
    condition: 'fair',
    mileage: 85000,
    year: 2018,
    engine: '1.6L',
    hasDefects: true,
    defects: ['Вмятины на кузове', 'Потёртый салон', 'Требует ремонта']
  }
};

// ============ NPC ТИПЫ С ХАРАКТЕРИСТИКАМИ ============

const NPC_TYPES = {
  'normal': {
    name: 'Обычный продавец',
    emoji: '👤',
    traits: {
      bargainLimit: 0.25, // до -25%
      deceptionChance: 0.30, // 30% шанс соврать
      responseSpeed: 'normal',
      friendliness: 'neutral'
    },
    phrases: {
      greeting: [
        'Привет, ещё есть?',
        'Да, всё ещё продаётся',
        'Ага, есть. Интересует?',
        'Пока есть, только что смотрели'
      ],
      details: [
        'Состояние действительно хорошее',
        'Оригинал 100%, купил официально',
        'Всё работает как надо',
        'Без дефектов, честное слово'
      ],
      negotiate: [
        'Ну, может быть на немного меньше',
        'Минимум на 500 рублей меньше',
        'Можешь предложить цену'
      ],
      agree: [
        'Ок, согласен',
        'Хорошо, продам',
        'Устраивает, когда приезжаешь?'
      ],
      delivery: [
        'Могу отправить, без проблем',
        'Доставлю, когда сможешь приехать?'
      ]
    }
  },

  'babushka': {
    name: 'Бабушка',
    emoji: '👵',
    traits: {
      bargainLimit: 0.50, // до -50%
      deceptionChance: 0.15, // 15% шанс соврать
      responseSpeed: 'slow',
      friendliness: 'warm'
    },
    phrases: {
      greeting: [
        'Здравствуй, внучек! Да, ещё есть',
        'Ох, привет, сынок! Смотрю, смотрю',
        'Милый, вещь хорошая, очень хорошая'
      ],
      details: [
        'Всё как новое, практически не трогала',
        'Дочка купила, говорит качественно',
        'Кажется, оригинал, но я в этом не очень...',
        'Состояние хорошее, я аккуратная была'
      ],
      negotiate: [
        'Внучек, может быть подешевле? На пенсии живу...',
        'Сынок, может скидку дашь? Срочно нужны деньги',
        'Милый, ну может на тысячку дешевле?'
      ],
      agree: [
        'Спасибо, сынок, уж так помогаешь',
        'Ладно, внучек, продам тебе'
      ],
      delivery: [
        'Я не очень с этим, но могу отправить',
        'Сы��ок, ты мне помоги как отправить это'
      ]
    }
  },

  'girl': {
    name: 'Девушка',
    emoji: '👩',
    traits: {
      bargainLimit: 0.30, // до -30%
      deceptionChance: 0.25, // 25% шанс соврать
      responseSpeed: 'normal',
      friendliness: 'polite'
    },
    phrases: {
      greeting: [
        'Привет! Да, товар в наличии)',
        'Хей! Интересует? Могу показать фото',
        'Да-да, ещё есть, всё свежее'
      ],
      details: [
        'Покупала в проверенном месте, оригинал)',
        'Состояние прикольное, ухожу с бережностью',
        'Всё рабочее, проверяла вчера',
        'Никаких проблем, честно'
      ],
      negotiate: [
        'Может немного скидку? 🤔',
        'Ну, можно поуступить',
        'Давай на 15-20% ниже?'
      ],
      agree: [
        'Ок, согласна!',
        'Уговорила) Давай встречаться',
        'Хорошо, идёт!'
      ],
      delivery: [
        'Могу отправить, тебе удобнее какая доставка?',
        'Без проблем, отправлю завтра'
      ]
    }
  },

  'magnet': {
    name: 'Мага',
    emoji: '🧔',
    traits: {
      bargainLimit: 0.15, // до -15%
      deceptionChance: 0.50, // 50% шанс соврать
      responseSpeed: 'quick',
      friendliness: 'rude'
    },
    phrases: {
      greeting: [
        'Ооо, пришёл! Да, есть ещё',
        'Что там? Товар свежий, не кипешь',
        'Привет, давай быстрее'
      ],
      details: [
        'Оригинал 100%, подтверждаю',
        'Состояние? Идеальное, че ещё...',
        'Не совай, всё работает отлично',
        'Ну, мне сказали что оригинал'
      ],
      negotiate: [
        'Куда так низко! На 1к сойдёмся, больше не буду',
        'Лё брат, цена не спускается, это тебе Авиту',
        'Ну ладно, 200 рублей максимум'
      ],
      agree: [
        'Ну вот, умный решил)))',
        'Ок, договорились',
        'Дай денег, поехали'
      ],
      delivery: [
        'Могу отправить, но без проблем',
        'Доставка? Хорошо, кидай адрес'
      ]
    }
  },

  'student': {
    name: 'Студент',
    emoji: '🎓',
    traits: {
      bargainLimit: 0.35, // до -35%
      deceptionChance: 0.20, // 20% шанс соврать
      responseSpeed: 'normal',
      friendliness: 'casual'
    },
    phrases: {
      greeting: [
        'Эй! Да, вещь в наличии',
        'Привет, смотрю учёбу. Товар свежий',
        'Ага, всё ещё есть, не продал'
      ],
      details: [
        'Купил в онлайн-магазине, оригинал',
        'Ну, мне казалось что оригинал',
        'Вроде оригинальное, я не проверял'
      ],
      negotiate: [
        'Учусь, денег мало... может дешевле?',
        'Очень нужны деньги на учёбу',
        'На немного потянешь цену вниз?'
      ],
      agree: [
        'Спасибо, чел! Помогаешь',
        'Ок, договорились!',
        'Супер, когда встречаемся?'
      ],
      delivery: [
        'Могу отправить почтой',
        'Доставку сделаю, без проблем'
      ]
    }
  }
};

// ============ ДИАЛОГОВЫЕ ЦЕПОЧКИ ============

const DIALOGUE_STAGES = {
  greeting: {
    stage: 'greeting',
    description: 'Приветствие и проверка доступности',
    npcInitiates: true
  },
  details: {
    stage: 'details',
    description: 'Уточнение деталей товара',
    npcResponds: true
  },
  negotiate: {
    stage: 'negotiate',
    description: 'Торговля ценой',
    playerChoice: true
  },
  payment: {
    stage: 'payment',
    description: 'Выбор доставки/самовывоза',
    npcInitiates: true
  },
  meeting: {
    stage: 'meeting',
    description: 'Встреча (если самовывоз)',
    time: null,
    location: null
  }
};

// ============ СИСТЕМА ПРОВЕРКИ И ОБМАНА ============

const INSPECTION_SYSTEM = {
  deceptionRoll: () => Math.random() < 0.15, // 15% на первый шанс
  
  skillBonus: (currentSkill) => {
    // Каждый уровень навыка добавляет +1% к шансу обнаружения
    return 0.15 + (currentSkill * 0.01); // макс 80%
  },

  deceptions: {
    originalitySwitched: {
      name: 'Продал реплику под видом оригинала',
      priceMultiplier: 0.40, // скидка до цены реплики
      severity: 'high'
    },
    conditionWorse: {
      name: 'Скрыл дефекты состояния',
      severity: 'medium',
      penalties: {
        minor: 0.15, // -15% за небольшие дефекты
        major: 0.35  // -35% за серьёзные
      }
    },
    restoredSwitched: {
      name: 'Продал восстановленный под видом оригинального',
      priceMultiplier: 0.60,
      severity: 'high'
    }
  }
};

// ============ ЭКОНОМИКА ВКЛАДОВ И КРЕДИТОВ ============

const BANK_SYSTEM = {
  deposits: {
    urgent: {
      name: 'Срочный вклад',
      minTerm: 30, // дней
      maxTerm: 365,
      interestRate: 0.12, // 12% годовых
      canWithdraw: false,
      description: 'Высокие проценты, но нельзя снимать до конца срока'
    },
    onDemand: {
      name: 'Вклад до востребования',
      minTerm: 0,
      maxTerm: 0,
      interestRate: 0.03, // 3% годовых
      canWithdraw: true,
      description: 'Низкие проценты, но можно снимать в любой момент'
    },
    accumulative: {
      name: 'Накопительный вклад',
      minTerm: 60,
      maxTerm: 180,
      interestRate: 0.08, // 8% годовых
      canWithdraw: false,
      description: 'Средние проценты, снимаешь в конце срока'
    }
  },

  creditSystem: {
    minStartAmount: 10000,
    maxWithoutHistory: 50000,
    maxWithFullHistory: 500000,
    repaymentPeriod: 7, // игровых дней
    minWeeklyPayment: 0.20, // 20% от суммы в неделю,
    
    penalties: {
      lateFee: 0.50, // 50% штрафа от минимального платежа
      cashbackReduction: 0.50, // -50% кэшбека
      depositPenalty: 0.20, // -20% процентов на вклады
      deceptionDetectionBonus: 0.05, // +5% шанс поймать на вранье
      selfDeceptionPenalty: 0.05 // -5% на обнаружение обмана самому
    }
  }
};

// ============ ПОЧТОВАЯ СИСТЕМА ============

const DELIVERY_SYSTEM = {
  durations: {
    sameCity: 1, // 1 игровой день
    nearCity: 2, // 2 дня (до 500км)
    farCity: 3, // 3 дня (свыше 500км)
  },

  tariffs: {
    economy: { name: 'Эконом', multiplier: 1.0, days: 3 },
    standard: { name: 'Стандарт', multiplier: 1.5, days: 2 },
    express: { name: 'Экспресс', multiplier: 2.5, days: 1 }
  },

  pickupPoints: {
    'Москва': 'Пл. Революции, 2а',
    'Санкт-Петербург': 'Невский пр., 30',
    'Екатеринбург': 'ул. Малышева, 51',
    'Новосибирск': 'ул. Красный пр., 37',
    'Казань': 'ул. Баумана, 1',
    'Сочи': 'ул. Ленина, 99',
    'Омск': 'ул. Масленникова, 42',
    'Челябинск': 'пр. Ленина, 68',
    'Уфа': 'пр. Салавата Юлаева, 50',
    'Ростов-на-Дону': 'пр. Чехова, 60'
  }
};

// ============ ЭКСПОРТ ============

window.GameData = {
  PRODUCTS,
  NPC_TYPES,
  DIALOGUE_STAGES,
  INSPECTION_SYSTEM,
  BANK_SYSTEM,
  DELIVERY_SYSTEM
};

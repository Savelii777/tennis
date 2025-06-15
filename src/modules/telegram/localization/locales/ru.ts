export const ruLocale = {
  // Команды и кнопки
  commands: {
    start: 'Добро пожаловать!',
    menu: 'Главное меню',
    profile: 'Профиль',
    play: 'Играть',
    tournaments: 'Турниры',
    trainings: 'Тренировки',
    stories: 'Stories',
    cases: 'Кейсы',
    invite: 'Пригласить друга',
    aiCoach: 'AI-Coach',
    recordMatch: 'Записать результат'
  },
  
  // Профиль
  profile: {
    title: '👤 **Ваш профиль**',
    name: 'Имя: {firstName} {lastName}',
    username: 'Username: @{username}',
    id: 'ID: {telegramId}',
    city: 'Город: {city}',
    statistics: '📊 **Статистика:**',
    matches: '🎾 Матчей сыграно: {count}',
    wins: '🏆 Побед: {count}',
    losses: '😔 Поражений: {count}',
    winRate: '📈 Процент побед: {rate}%',
    rating: '🏅 Рейтинг: {points} очков',
    balls: '🎾 Мячей: {count}',
    notSpecified: 'не указан',
    setupProfile: '🔄 Настроить профиль',
    editProfile: '✏️ Изменить профиль',
    achievements: '🏆 Достижения',
    fillProfileWarning: '⚠️ Для получения статистики заполните профиль.'
  },
  
  // Игры и заявки
  game: {
    title: '🎾 **Поиск игры**',
    subtitle: 'Найдите партнера для игры или создайте заявку!',
    findGame: '🔍 Найти игру',
    createRequest: '➕ Создать заявку',
    myRequests: '📋 Мои заявки',
    activeRequests: '💫 Активные заявки',
    noActiveRequests: '😔 Пока нет активных заявок.',
    createRequestSuggestion: 'Создайте свою заявку, чтобы другие игроки могли к вам присоединиться!',
    requestCreated: '✅ **Заявка создана!**',
    requestSteps: {
      step1: '**Шаг 1 из 4**\n\nКогда планируете играть?\nВведите дату и время в формате: DD.MM.YYYY HH:MM\n\nПример: 25.12.2024 18:00',
      step2: '**Шаг 2 из 4**\n\nГде планируете играть?\nУкажите корт, адрес или название места.',
      step3: '**Шаг 3 из 4**\n\nКакой уровень игроков ищете?',
      step4: '**Шаг 4 из 4**\n\nДобавьте описание (необязательно):\nНапример: "Ищу партнера для игры в выходные"'
    },
    levels: {
      beginner: '🟢 Новичок',
      amateur: '🔵 Любитель', 
      confident: '🟡 Уверенный',
      tournament: '🟠 Турнирный',
      semiPro: '🔴 Профи',
      any: '⚪ Любой уровень'
    },
    dateTime: '📅 **Время:** {dateTime}',
    location: '📍 **Место:** {location}',
    level: '🎯 **Уровень:** {level}',
    description: '📝 **Описание:** {description}',
    players: '👥 {current}/{max}',
    respond: 'Откликнуться',
    responsesSent: '✅ **Отклик отправлен!**',
    responseInfo: 'Создатель заявки получит уведомление о вашем желании присоединиться.\n\nОжидайте подтверждения!'
  },
  
  // Турниры
  tournaments: {
    title: '🏆 **Турниры**',
    subtitle: 'Участвуйте в турнирах и соревнуйтесь с другими игроками!',
    active: 'Активные турниры',
    create: 'Создать турнир',
    my: 'Мои турниры',
    history: 'История участия',
    noActive: '😔 Пока нет активных турниров.\n\nСоздайте свой турнир!',
    details: 'Подробнее',
    startDate: '📅 Начало: {date}',
    regEndDate: '📝 Регистрация до: {date}',
    participants: '👥 {current}/{max}',
    entryFee: '💰 Взнос: {fee} мячей',
    refresh: '🔄 Обновить',
    createSteps: {
      name: 'Введите название турнира:',
      description: 'Введите описание турнира:'
    },
    created: '✅ Описание сохранено. Турнир будет создан!'
  },
  
  // Тренировки
  trainings: {
    title: '🏃‍♂️ **Тренировки**',
    subtitle: 'Найдите тренера или проведите групповую тренировку!',
    find: '🔍 Найти тренировку',
    create: '➕ Создать тренировку',
    my: '📋 Мои тренировки',
    becomeTrainer: '👨‍🏫 Стать тренером'
  },
  
  // Stories
  stories: {
    title: '📱 **Stories**',
    subtitle: 'Делитесь фото и видео с ваших матчей!',
    upload: '📤 Загрузить Story',
    my: '📋 Мои Stories',
    popular: '🔥 Популярные',
    recent: '🕐 Недавние',
    createSteps: {
      description: 'Введите описание для вашей Story:'
    },
    created: '✅ Story создана!'
  },
  
  // Кейсы
  cases: {
    title: '🎁 **Кейсы**',
    subtitle: 'Открывайте кейсы и получайте награды!',
    balance: '💰 Ваш баланс: {count} мячей',
    noCases: '😔 Пока нет доступных кейсов.\n\nСледите за обновлениями!',
    price: '💰 Цена: {price} мячей',
    canOpen: '🎁',
    locked: '🔒',
    history: '📊 История открытий',
    opening: '🎉 **Поздравляем!**',
    won: 'Вы выиграли: **{item}**',
    spent: '💰 Потрачено мячей: {amount}',
    openMore: '🎁 Открыть еще',
    backToCases: 'Назад к кейсам',
    notEnoughBalls: '❌ **Недостаточно мячей**\n\nДля открытия этого кейса нужно больше мячей.\n\nИграйте в матчи и турниры, чтобы заработать их!'
  },
  
  // AI Coach
  aiCoach: {
    title: '🤖 **AI-Coach**',
    subtitle: 'Ваш персональный помощник для улучшения игры в теннис!',
    chooseTopic: 'Выберите, чем я могу помочь:',
    techniqueTip: '💡 Совет по технике',
    trainingPlan: '🏃‍♂️ План тренировки',
    gameAnalysis: '📊 Анализ игры',
    goalSetting: '🎯 Постановка целей'
  },
  
  // Запись матчей
  matches: {
    title: '📝 **Запись результата матча**',
    chooseType: 'Выберите тип матча:',
    singles: '🎾 Одиночный матч',
    doubles: '👥 Парный матч',
    enterOpponent: 'Введите имя соперника:',
    enterScore: 'Введите счет матча (например: 6-4, 6-2):'
  },
  
  // Приглашения
  invite: {
    title: '🔗 **Ваша ссылка для приглашения друзей:**',
    link: '`{link}`',
    shareInfo: '👥 Поделитесь ссылкой с друзьями, и они смогут быстро присоединиться к нашему сообществу!',
    benefits: '🏆 За каждого приглашенного друга вы получите достижения и бонусы!',
    shareButton: '📲 Поделиться в Telegram',
    stats: '📊 Моя статистика',
    welcome: '🎉 Добро пожаловать, {name}!\n\nВы перешли по пригласительной ссылке!\n\n🎾 Теперь вы можете найти партнеров для игры в теннис!',
    statsTitle: '📊 **Статистика приглашений**',
    totalInvited: '👥 **Всего приглашено:** {count}',
    activePlayers: '⚡ **Активных игроков:** {count}',
    today: '📅 **За сегодня:** {count}',
    week: '📅 **За неделю:** {count}',
    month: '📅 **За месяц:** {count}',
    achievements: '🏆 **Достижения:** {count}',
    bonusPoints: '💎 **Бонусные очки:** {count}',
    comingSoon: '🚀 **Скоро функция будет полностью активна!**'
  },
  
  // Общие сообщения
  common: {
    back: '⬅️ Назад',
    refresh: '🔄 Обновить',
    cancel: '❌ Отмена',
    save: '💾 Сохранить',
    edit: '✏️ Изменить',
    delete: '🗑️ Удалить',
    confirm: '✅ Подтвердить',
    skip: '⏭️ Пропустить',
    next: '➡️ Далее',
    loading: '⏳ Загрузка...',
    success: '✅ Успешно!',
    saved: '✅ Сохранено!',
    created: '✅ Создано!',
    updated: '✅ Обновлено!',
    deleted: '✅ Удалено!',
    error: '❌ Ошибка',
    userNotFound: '❌ Пользователь не найден',
    tryAgain: 'Попробуйте позже',
    invalidFormat: '❌ Неверный формат',
    pastDate: '❌ Нельзя указывать прошедшую дату. Выберите будущее время.',
    unknownCommand: 'Неизвестная команда. Используйте /menu для просмотра доступных команд.',
    processingError: '❌ Произошла ошибка. Попробуйте начать сначала.',
    mainMenu: '📋 Главное меню:',
    chooseAction: 'Выберите действие:',
    welcomeBack: '👋 С возвращением, {name}!\n\nВыберите действие:',
    registered: '🎾 Добро пожаловать в Tennis Bot, {name}!\n\nВы успешно зарегистрированы!',
    unknownText: 'Вы написали: "{text}"\n\nИспользуйте команды:\n• /start - начать\n• /menu - показать меню\n• /debug - отладка\n\nИли выберите действие из меню ниже:'
  },
  
  // Настройка профиля
  profileSetup: {
    firstName: 'Введите ваше имя:',
    lastName: 'Введите вашу фамилию:',
    city: 'В каком городе вы играете?',
    court: 'Какой корт предпочитаете?',
    completed: '✅ **Профиль настроен!**\n\nТеперь вы можете пользоваться всеми функциями бота.',
    steps: {
      name: '✅ Имя: **{name}**',
      lastName: '✅ Фамилия: **{lastName}**',
      city: '✅ Город: **{city}**'
    }
  },
  
  // Отладка
  debug: {
    title: '🐛 **Debug Info:**',
    userId: 'User ID: {id}',
    chatId: 'Chat ID: {id}',
    updateType: 'Update: {type}',
    text: 'Text: {text}',
    state: 'State: {state}'
  }
};
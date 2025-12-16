import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ru' | 'ee';

interface Translations {
  [key: string]: {
    en: string;
    ru: string;
    ee: string;
  };
}

const translations: Translations = {
  // Navbar
  'nav.login': { en: 'Log in', ru: 'Войти', ee: 'Logi sisse' },
  'nav.register': { en: 'Register', ru: 'Регистрация', ee: 'Registreeri' },
  'nav.dashboard': { en: 'Dashboard', ru: 'Панель управления', ee: 'Töölaud' },
  'nav.logout': { en: 'Log out', ru: 'Выйти', ee: 'Logi välja' },
  'nav.credits': { en: 'Credits', ru: 'Кредиты', ee: 'Krediidid' },
  'nav.topUp': { en: 'Top up', ru: 'Пополнить', ee: 'Laadi' },
  
  // Landing page
  'landing.tagline': { en: 'The future of niche marketplaces', ru: 'Будущее нишевых маркетплейсов', ee: 'Nišiturgude tulevik' },
  'landing.title1': { en: 'Create your own', ru: 'Создайте свой', ee: 'Loo oma' },
  'landing.title2': { en: ' service marketplace', ru: ' сервисный маркетплейс', ee: ' teenuste turg' },
  'landing.description': { en: 'Agora lets you build and manage custom marketplaces for any service industry. Connect customers with producers in your niche.', ru: 'Agora позволяет создавать и управлять маркетплейсами для любой сферы услуг. Соединяйте клиентов с исполнителями в вашей нише.', ee: 'Agora võimaldab luua ja hallata kohandatud turge mis tahes teenindussektori jaoks.' },
  'landing.getStarted': { en: 'Get started', ru: 'Начать', ee: 'Alusta' },
  'landing.yourMarketplace': { en: 'Your Marketplace', ru: 'Ваш маркетплейс', ee: 'Sinu turg' },
  'landing.yourMarketplaceDesc': { en: 'Create a branded marketplace for any service niche - plumbers, tutors, freelancers, or anything else.', ru: 'Создайте брендированный маркетплейс для любой ниши — сантехники, репетиторы, фрилансеры.', ee: 'Loo bränditud turg mis tahes teenindusniši jaoks.' },
  'landing.manageUsers': { en: 'Manage Users', ru: 'Управление пользователями', ee: 'Halda kasutajaid' },
  'landing.manageUsersDesc': { en: 'Approve producers, track customers, and manage all participants in your marketplace ecosystem.', ru: 'Одобряйте исполнителей, отслеживайте клиентов и управляйте участниками.', ee: 'Kinnita tootjad, jälgi kliente ja halda kõiki osalejaid.' },
  'landing.connectGrow': { en: 'Connect & Grow', ru: 'Связывайте и развивайте', ee: 'Ühenda ja kasva' },
  'landing.connectGrowDesc': { en: 'Match customers with the right producers. Watch your marketplace thrive with real-time job management.', ru: 'Соединяйте клиентов с подходящими исполнителями. Наблюдайте за ростом вашего маркетплейса.', ee: 'Ühenda kliendid õigete tootjatega.' },
  
  // Dashboard
  'dashboard.welcome': { en: 'Welcome back', ru: 'С возвращением', ee: 'Tere tulemast tagasi' },
  'dashboard.subtitle': { en: 'Manage your marketplaces and discover new ones', ru: 'Управляйте своими маркетплейсами и открывайте новые', ee: 'Halda oma turge ja avasta uusi' },
  'dashboard.favorites': { en: 'Favorites', ru: 'Избранное', ee: 'Lemmikud' },
  'dashboard.noFavorites': { en: 'No favorite marketplaces yet. Create one to get started!', ru: 'Пока нет избранных маркетплейсов. Создайте свой первый!', ee: 'Lemmikturge veel pole. Loo üks alustamiseks!' },
  'dashboard.createMarketplace': { en: 'Create a new marketplace', ru: 'Создать новый маркетплейс', ee: 'Loo uus turg' },
  'dashboard.createMarketplaceDesc': { en: 'Start your own niche marketplace and connect customers with producers', ru: 'Создайте свой нишевый маркетплейс и соединяйте клиентов с исполнителями', ee: 'Alusta oma nišiturgu ja ühenda kliendid tootjatega' },
  'dashboard.createBtn': { en: 'Create marketplace', ru: 'Создать маркетплейс', ee: 'Loo turg' },
  
  // Marketplace page
  'marketplace.backToDashboard': { en: 'Dashboard', ru: 'Панель', ee: 'Töölaud' },
  'marketplace.demoView': { en: 'Demo view:', ru: 'Демо вид:', ee: 'Demo vaade:' },
  'marketplace.notFound': { en: 'Marketplace not found', ru: 'Маркетплейс не найден', ee: 'Turgu ei leitud' },
  'marketplace.notFoundDesc': { en: "The marketplace doesn't exist.", ru: 'Этот маркетплейс не существует.', ee: 'Seda turgu ei eksisteeri.' },
  'marketplace.createJob': { en: 'Create a job', ru: 'Создать заказ', ee: 'Loo töö' },
  'marketplace.registerProducer': { en: 'Register as a producer', ru: 'Стать исполнителем', ee: 'Registreeru tootjaks' },
  'marketplace.switchToCustomer': { en: 'Switch to Customer view to create a job', ru: 'Переключитесь на вид Клиента для создания заказа', ee: 'Lülitu kliendi vaatele töö loomiseks' },
  
  // Map placeholder
  'map.title': { en: 'Map of', ru: 'Карта', ee: 'Kaart:' },
  'map.subtitle': { en: 'Shows customers and producers in your area', ru: 'Показывает клиентов и исполнителей в вашем районе', ee: 'Näitab kliente ja tootjaid sinu piirkonnas' },
  'map.legend': { en: 'Legend', ru: 'Легенда', ee: 'Legend' },
  'map.customer': { en: 'Customer', ru: 'Клиент', ee: 'Klient' },
  'map.producerOnline': { en: 'Producer (Online)', ru: 'Исполнитель (В сети)', ee: 'Tootja (Võrgus)' },
  'map.producerWorking': { en: 'Producer (Working)', ru: 'Исполнитель (Работает)', ee: 'Tootja (Töötab)' },
  'map.producerOffline': { en: 'Producer (Offline)', ru: 'Исполнитель (Не в сети)', ee: 'Tootja (Võrgust väljas)' },
  
  // Role switcher
  'role.admin': { en: 'Admin', ru: 'Админ', ee: 'Admin' },
  'role.producer': { en: 'Producer', ru: 'Исполнитель', ee: 'Tootja' },
  'role.customer': { en: 'Customer', ru: 'Клиент', ee: 'Klient' },
  
  // Admin panel
  'admin.producerManagement': { en: 'Producer Management', ru: 'Управление исполнителями', ee: 'Tootjate haldamine' },
  'admin.pending': { en: 'Pending', ru: 'Ожидают', ee: 'Ootel' },
  'admin.approved': { en: 'Approved', ru: 'Одобрены', ee: 'Kinnitatud' },
  'admin.rejected': { en: 'Rejected', ru: 'Отклонены', ee: 'Tagasi lükatud' },
  'admin.noPending': { en: 'No pending producers', ru: 'Нет ожидающих исполнителей', ee: 'Ootel tootjaid pole' },
  'admin.noApproved': { en: 'No approved producers', ru: 'Нет одобренных исполнителей', ee: 'Kinnitatud tootjaid pole' },
  'admin.noRejected': { en: 'No rejected producers', ru: 'Нет отклоненных исполнителей', ee: 'Tagasi lükatud tootjaid pole' },
  'admin.allUsers': { en: 'All Users', ru: 'Все пользователи', ee: 'Kõik kasutajad' },
  'admin.name': { en: 'Name', ru: 'Имя', ee: 'Nimi' },
  'admin.role': { en: 'Role', ru: 'Роль', ee: 'Roll' },
  'admin.stats': { en: 'Stats', ru: 'Статистика', ee: 'Statistika' },
  'admin.jobsCompleted': { en: 'jobs completed', ru: 'заказов выполнено', ee: 'tööd tehtud' },
  'admin.jobsCreated': { en: 'jobs created', ru: 'заказов создано', ee: 'tööd loodud' },
  'admin.userProfile': { en: 'User Profile', ru: 'Профиль пользователя', ee: 'Kasutaja profiil' },
  'admin.joined': { en: 'Joined', ru: 'Присоединился', ee: 'Liitus' },
  'admin.rating': { en: 'Rating', ru: 'Рейтинг', ee: 'Hinnang' },
  'admin.addCredits': { en: 'Add Credits', ru: 'Добавить кредиты', ee: 'Lisa krediite' },
  'admin.creditsToAdd': { en: 'Credits to add', ru: 'Кредитов к добавлению', ee: 'Lisatavad krediidid' },
  'admin.add': { en: 'Add', ru: 'Добавить', ee: 'Lisa' },
  'admin.balance': { en: 'Balance', ru: 'Баланс', ee: 'Saldo' },
  
  // Producer dashboard
  'producer.yourStatus': { en: 'Your Status', ru: 'Ваш статус', ee: 'Sinu staatus' },
  'producer.nearbyJobs': { en: 'Nearby Jobs', ru: 'Заказы рядом', ee: 'Lähedal olevad tööd' },
  'producer.noJobs': { en: 'No available jobs nearby', ru: 'Нет доступных заказов поблизости', ee: 'Läheduses pole saadaval töid' },
  'producer.yourProfile': { en: 'Your Profile', ru: 'Ваш профиль', ee: 'Sinu profiil' },
  'producer.completed': { en: 'completed', ru: 'выполнено', ee: 'tehtud' },
  'producer.earnings': { en: 'Earnings', ru: 'Заработок', ee: 'Teenistus' },
  'producer.takeJob': { en: 'Take job', ru: 'Взять заказ', ee: 'Võta töö' },
  'producer.activeJob': { en: 'Active job', ru: 'Акивный заказ', ee: 'Aktiivne tellimus' },
  'producer.jobDetails': {  en: 'Job details',  ru: 'Детали заказа',  ee: 'Töö üksikasjad' },
  'producer.completeJob': { en: 'Complete job', ru: 'Завершить заказ', ee: 'Lõpeta töö' },
  'producer.noJobSelected': { en: 'No job selected', ru: 'Заказ не выбран',  ee: 'Tööd pole valitud' },
  
  // Customer dashboard
  'customer.createJob': { en: 'Create a Job', ru: 'Создать заказ', ee: 'Loo töö' },
  'customer.newJob': { en: 'New job', ru: 'Новый заказ', ee: 'Uus töö' },
  'customer.title': { en: 'Title', ru: 'Название', ee: 'Pealkiri' },
  'customer.description': { en: 'Description', ru: 'Описание', ee: 'Kirjeldus' },
  'customer.address': { en: 'Address', ru: 'Адрес', ee: 'Aadress' },
  'customer.preferredTime': { en: 'Preferred Time', ru: 'Предпочтительное время', ee: 'Eelistatud aeg' },
  'customer.postJob': { en: 'Post job', ru: 'Опубликовать заказ', ee: 'Postita töö' },
  'customer.yourJobs': { en: 'Your Jobs', ru: 'Ваши заказы', ee: 'Sinu tööd' },
  'customer.noJobs': { en: "You haven't created any jobs yet", ru: 'Вы ещё не создали заказов', ee: 'Sa pole veel ühtegi tööd loonud' },
  'customer.availableProducers': { en: 'Available Producers', ru: 'Доступные исполнители', ee: 'Saadaval tootjad' },
  'customer.noProducers': { en: 'No producers available', ru: 'Нет доступных исполнителей', ee: 'Tootjad pole saadaval' },
  'customer.jobDetails': { en: 'Job Details', ru: 'Детали заказа', ee: 'Töö üksikasjad' },
  'customer.price': { en: 'Price', ru: 'Цена', ee: 'Hind' },
  'customer.pay': { en: 'Pay', ru: 'Оплатить', ee: 'Maksa' },
  'customer.paid': { en: 'Paid', ru: 'Оплачено', ee: 'Makstud' },
  'customer.insufficientCredits': { en: 'Insufficient credits', ru: 'Недостаточно кредитов', ee: 'Ebapiisavad krediidid' },
  
  // Status
  'status.offline': { en: 'Offline', ru: 'Не в сети', ee: 'Võrgust väljas' },
  'status.online': { en: 'Online', ru: 'В сети', ee: 'Võrgus' },
  'status.working': { en: 'Working', ru: 'Работает', ee: 'Töötab' },
  
  // Job status
  'jobStatus.open': { en: 'Open', ru: 'Открыт', ee: 'Avatud' },
  'jobStatus.taken': { en: 'Taken', ru: 'Взят', ee: 'Võetud' },
  'jobStatus.completed': { en: 'Completed', ru: 'Завершён', ee: 'Lõpetatud' },
  
  // Common
  'common.approve': { en: 'Approve', ru: 'Одобрить', ee: 'Kinnita' },
  'common.reject': { en: 'Reject', ru: 'Отклонить', ee: 'Lükka tagasi' },
  'common.viewProfile': { en: 'View profile', ru: 'Посмотреть профиль', ee: 'Vaata profiili' },
  'common.viewDetails': { en: 'View details', ru: 'Подробнее', ee: 'Vaata üksikasju' },
  'common.credits': { en: 'credits', ru: 'кредитов', ee: 'krediiti' },
  'common.jobs': { en: 'jobs', ru: 'заказов', ee: 'tööd' },
  'common.backToDashboard': { en: 'Back to Dashboard', ru: 'Назад к панели', ee: 'Tagasi töölauale' },
  
  // Auth modal
  'auth.loginTitle': { en: 'Welcome back', ru: 'С возвращением', ee: 'Tere tulemast tagasi' },
  'auth.loginSubtitle': { en: 'Enter your credentials to access your account', ru: 'Введите данные для входа в аккаунт', ee: 'Sisesta oma andmed kontole sisenemiseks' },
  'auth.registerTitle': { en: 'Create an account', ru: 'Создать аккаунт', ee: 'Loo konto' },
  'auth.registerSubtitle': { en: 'Fill in your details to get started', ru: 'Заполните данные для начала работы', ee: 'Täida andmed alustamiseks' },
  'auth.name': { en: 'Name', ru: 'Имя', ee: 'Nimi' },
  'auth.namePlaceholder': { en: 'Your name', ru: 'Ваше имя', ee: 'Sinu nimi' },
  'auth.email': { en: 'Email', ru: 'Email', ee: 'E-post' },
  'auth.password': { en: 'Password', ru: 'Пароль', ee: 'Parool' },
  'auth.signIn': { en: 'Log in', ru: 'Войти', ee: 'Logi sisse' },
  'auth.signUp': { en: 'Create account', ru: 'Создать аккаунт', ee: 'Loo konto' },
  'auth.noAccount': { en: "Don't have an account?", ru: 'Нет аккаунта?', ee: 'Pole kontot?' },
  'auth.hasAccount': { en: 'Already have an account?', ru: 'Уже есть аккаунт?', ee: 'On juba konto?' },
  
  // Create marketplace modal
  'createMarketplace.title': { en: 'Create a new marketplace', ru: 'Создать новый маркетплейс', ee: 'Loo uus turg' },
  'createMarketplace.subtitle': { en: 'Set up your own niche marketplace on Agora', ru: 'Настройте свой нишевый маркетплейс на Agora', ee: 'Seadista oma nišiturg Agoras' },
  'createMarketplace.name': { en: 'Marketplace Name', ru: 'Название маркетплейса', ee: 'Turu nimi' },
  'createMarketplace.namePlaceholder': { en: 'e.g., Plumbers', ru: 'напр., Сантехники', ee: 'nt Torumehed' },
  'createMarketplace.slug': { en: 'URL Slug', ru: 'URL-адрес', ee: 'URL-lühend' },
  'createMarketplace.city': { en: 'City', ru: 'Город', ee: 'Linn' },
  'createMarketplace.cityPlaceholder': { en: 'e.g., Tallinn', ru: 'напр., Таллинн', ee: 'nt Tallinn' },
  'createMarketplace.submit': { en: 'Create marketplace', ru: 'Создать маркетплейс', ee: 'Loo turg' },
  
  // Register producer modal
  'registerProducer.title': { en: 'Register as a Producer', ru: 'Регистрация исполнителя', ee: 'Registreeru tootjaks' },
  'registerProducer.subtitle': { en: 'Tell us about yourself and your services', ru: 'Расскажите о себе и своих услугах', ee: 'Räägi meile endast ja oma teenustest' },
  'registerProducer.about': { en: 'About you', ru: 'О вас', ee: 'Sinust' },
  'registerProducer.aboutPlaceholder': { en: 'Describe your experience, skills, and what services you offer...', ru: 'Опишите свой опыт, навыки и услуги...', ee: 'Kirjelda oma kogemust, oskusi ja pakutavaid teenuseid...' },
  'registerProducer.submit': { en: 'Submit application', ru: 'Подать заявку', ee: 'Esita taotlus' },
  
  // Toast messages
  'toast.jobCreated': { en: 'Job created! Producers in your area will see it.', ru: 'Заказ создан! Исполнители в вашем районе увидят его.', ee: 'Töö loodud! Sinu piirkonna tootjad näevad seda.' },
  'toast.jobTaken': { en: 'Job taken! Your status has been set to Working.', ru: 'Заказ взят! Ваш статус изменён на "Работает".', ee: 'Töö võetud! Sinu staatus on seatud tööle.' },
  'toast.statusUpdated': { en: 'Status updated to', ru: 'Статус обновлён на', ee: 'Staatus uuendatud' },
  'toast.creditsAdded': { en: 'credits added successfully', ru: 'кредитов успешно добавлено', ee: 'krediiti edukalt lisatud' },
  'toast.paymentSuccess': { en: 'Payment successful!', ru: 'Оплата успешна!', ee: 'Makse õnnestus!' },
  'toast.topUpSuccess': { en: 'Balance topped up!', ru: 'Баланс пополнен!', ee: 'Saldo laetud!' },
  'toast.producerRegistered': { en: 'Registration submitted! An admin will review your application.', ru: 'Заявка отправлена! Администратор рассмотрит вашу заявку.', ee: 'Registreerimine esitatud! Admin vaatab su taotluse üle.' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('agora_language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('agora_language', language);
  }, [language]);

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language] || translation.en || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

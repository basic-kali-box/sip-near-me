import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    // Enhanced error logging for debugging
    console.error('useLanguage hook called outside of LanguageProvider context');
    console.error('Current location:', window.location.href);

    if (process.env.NODE_ENV === 'development') {
      console.error('Make sure your component is wrapped with LanguageProvider');
    }

    throw new Error('useLanguage must be used within a LanguageProvider. Check that your component is properly wrapped with LanguageProvider.');
  }
  return context;
}

// Translation keys and values
const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.sellers': 'Sellers',
    'nav.orders': 'Orders',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.help': 'Help',
    'nav.signIn': 'Sign In',
    'nav.signUp': 'Sign Up',
    'nav.becomeSeller': 'Become a Seller',
    'nav.addListing': 'Add Listing',
    'nav.sellerDashboard': 'Seller Dashboard',
    
    // Common
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.view': 'View',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.close': 'Close',
    'common.open': 'Open',
    'common.available': 'Available',
    'common.unavailable': 'Unavailable',
    'common.hidden': 'Hidden',
    'common.price': 'Price',
    'common.description': 'Description',
    'common.category': 'Category',
    'common.location': 'Location',
    'common.phone': 'Phone',
    'common.email': 'Email',
    'common.name': 'Name',
    'common.address': 'Address',
    'common.hours': 'Hours',
    'common.rating': 'Rating',
    'common.reviews': 'Reviews',
    
    // Search and filters
    'search.placeholder': 'Search drinks, categories, sellers...',
    'search.noResults': 'No items found',
    'search.noResultsDesc': 'Try adjusting your search or check back later for new items.',
    
    // Seller Dashboard
    'dashboard.welcome': 'Hey, {name}!',
    'dashboard.todayIs': 'Today is {date}.',
    'dashboard.analytics': 'Analytics',
    'dashboard.menu': 'Menu',
    'dashboard.searchMenu': 'Search your menu...',
    'dashboard.noItems': 'No items found.',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.noActivity': 'No recent activity to show.',
    
    // Item details
    'item.orderViaWhatsApp': 'Order via WhatsApp',
    'item.call': 'Call',
    'item.viewLocation': 'Location',
    'item.viewShop': 'View Shop',
    'item.sellerInfo': 'Seller Information',
    'item.orderNow': 'Order Now',
    'item.moreFrom': 'More from {sellerName}',
    'item.moreFromDesc': 'Discover other delicious items from this seller',
    'item.viewDetails': 'View Details',
    
    // Seller page
    'seller.menu': 'Menu',
    'seller.items': '{count} items',
    'seller.noMenu': 'No menu items available',
    'seller.contactWhatsApp': 'Contact via WhatsApp',
    
    // Authentication
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.dontHaveAccount': "Don't have an account?",
    'auth.alreadyHaveAccount': 'Already have an account?',
    'auth.signInWithGoogle': 'Sign in with Google',
    'auth.signUpWithGoogle': 'Sign up with Google',
    'auth.acceptTerms': 'I accept the Terms of Service and Privacy Policy',
    'auth.userType': 'I am a',
    'auth.buyer': 'Buyer',
    'auth.seller': 'Seller',
    
    // Profile
    'profile.complete': 'Complete Profile',
    'profile.businessName': 'Business Name',
    'profile.businessAddress': 'Business Address',
    'profile.businessHours': 'Business Hours',
    'profile.specialty': 'Specialty',
    'profile.coffee': 'Coffee',
    'profile.matcha': 'Matcha',
    'profile.both': 'Both',
    
    // Settings
    'settings.language': 'Language',
    'settings.english': 'English',
    'settings.arabic': 'العربية',
    'settings.notifications': 'Notifications',
    'settings.appearance': 'Appearance',
    'settings.privacy': 'Privacy',
    
    // Messages
    'message.welcomeBack': 'Welcome back!',
    'message.signInSuccess': 'Signed in as {userType}.',
    'message.profileComplete': 'Profile completed successfully!',
    'message.welcomeSeller': 'Welcome to BrewNear as a seller! Your profile has been set up.',
    'message.welcomeBuyer': 'Welcome to BrewNear! Your profile has been set up.',
    'message.linkCopied': 'Link copied',
    'message.linkCopiedDesc': 'Item link copied to clipboard',
    'message.addedToFavorites': 'Added to favorites',
    'message.removedFromFavorites': 'Removed from favorites',
    'message.itemAddedToFavorites': 'Item added to your favorites',
    'message.itemRemovedFromFavorites': 'Item removed from your favorites',
    'message.openingWhatsApp': 'Opening WhatsApp',
    'message.contactingSeller': 'Contacting {sellerName} about {itemName}',
  },
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.sellers': 'البائعون',
    'nav.orders': 'الطلبات',
    'nav.profile': 'الملف الشخصي',
    'nav.settings': 'الإعدادات',
    'nav.help': 'المساعدة',
    'nav.signIn': 'تسجيل الدخول',
    'nav.signUp': 'إنشاء حساب',
    'nav.becomeSeller': 'كن بائعاً',
    'nav.addListing': 'إضافة منتج',
    'nav.sellerDashboard': 'لوحة البائع',
    
    // Common
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.loading': 'جاري التحميل...',
    'common.error': 'خطأ',
    'common.success': 'نجح',
    'common.cancel': 'إلغاء',
    'common.save': 'حفظ',
    'common.edit': 'تعديل',
    'common.delete': 'حذف',
    'common.view': 'عرض',
    'common.back': 'رجوع',
    'common.next': 'التالي',
    'common.previous': 'السابق',
    'common.close': 'إغلاق',
    'common.open': 'فتح',
    'common.available': 'متوفر',
    'common.unavailable': 'غير متوفر',
    'common.hidden': 'مخفي',
    'common.price': 'السعر',
    'common.description': 'الوصف',
    'common.category': 'الفئة',
    'common.location': 'الموقع',
    'common.phone': 'الهاتف',
    'common.email': 'البريد الإلكتروني',
    'common.name': 'الاسم',
    'common.address': 'العنوان',
    'common.hours': 'ساعات العمل',
    'common.rating': 'التقييم',
    'common.reviews': 'المراجعات',
    
    // Search and filters
    'search.placeholder': 'ابحث عن المشروبات والفئات والبائعين...',
    'search.noResults': 'لم يتم العثور على عناصر',
    'search.noResultsDesc': 'حاول تعديل البحث أو تحقق لاحقاً من العناصر الجديدة.',
    
    // Seller Dashboard
    'dashboard.welcome': 'مرحباً، {name}!',
    'dashboard.todayIs': 'اليوم هو {date}.',
    'dashboard.analytics': 'التحليلات',
    'dashboard.menu': 'القائمة',
    'dashboard.searchMenu': 'ابحث في قائمتك...',
    'dashboard.noItems': 'لم يتم العثور على عناصر.',
    'dashboard.recentActivity': 'النشاط الأخير',
    'dashboard.noActivity': 'لا يوجد نشاط حديث للعرض.',
    
    // Item details
    'item.orderViaWhatsApp': 'اطلب عبر واتساب',
    'item.call': 'اتصال',
    'item.viewLocation': 'الموقع',
    'item.viewShop': 'عرض المتجر',
    'item.sellerInfo': 'معلومات البائع',
    'item.orderNow': 'اطلب الآن',
    'item.moreFrom': 'المزيد من {sellerName}',
    'item.moreFromDesc': 'اكتشف عناصر لذيذة أخرى من هذا البائع',
    'item.viewDetails': 'عرض التفاصيل',
    
    // Seller page
    'seller.menu': 'القائمة',
    'seller.items': '{count} عنصر',
    'seller.noMenu': 'لا توجد عناصر قائمة متاحة',
    'seller.contactWhatsApp': 'تواصل عبر واتساب',
    
    // Authentication
    'auth.signIn': 'تسجيل الدخول',
    'auth.signUp': 'إنشاء حساب',
    'auth.email': 'البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    'auth.confirmPassword': 'تأكيد كلمة المرور',
    'auth.forgotPassword': 'نسيت كلمة المرور؟',
    'auth.dontHaveAccount': 'ليس لديك حساب؟',
    'auth.alreadyHaveAccount': 'لديك حساب بالفعل؟',
    'auth.signInWithGoogle': 'تسجيل الدخول بجوجل',
    'auth.signUpWithGoogle': 'إنشاء حساب بجوجل',
    'auth.acceptTerms': 'أوافق على شروط الخدمة وسياسة الخصوصية',
    'auth.userType': 'أنا',
    'auth.buyer': 'مشتري',
    'auth.seller': 'بائع',
    
    // Profile
    'profile.complete': 'إكمال الملف الشخصي',
    'profile.businessName': 'اسم النشاط التجاري',
    'profile.businessAddress': 'عنوان النشاط التجاري',
    'profile.businessHours': 'ساعات العمل',
    'profile.specialty': 'التخصص',
    'profile.coffee': 'قهوة',
    'profile.matcha': 'ماتشا',
    'profile.both': 'كلاهما',
    
    // Settings
    'settings.language': 'اللغة',
    'settings.english': 'English',
    'settings.arabic': 'العربية',
    'settings.notifications': 'الإشعارات',
    'settings.appearance': 'المظهر',
    'settings.privacy': 'الخصوصية',
    
    // Messages
    'message.welcomeBack': 'مرحباً بعودتك!',
    'message.signInSuccess': 'تم تسجيل الدخول كـ {userType}.',
    'message.profileComplete': 'تم إكمال الملف الشخصي بنجاح!',
    'message.welcomeSeller': 'مرحباً بك في Sip Near Me كبائع! تم إعداد ملفك الشخصي.',
    'message.welcomeBuyer': 'مرحباً بك في Sip Near Me! تم إعداد ملفك الشخصي.',
    'message.linkCopied': 'تم نسخ الرابط',
    'message.linkCopiedDesc': 'تم نسخ رابط العنصر إلى الحافظة',
    'message.addedToFavorites': 'تمت الإضافة إلى المفضلة',
    'message.removedFromFavorites': 'تمت الإزالة من المفضلة',
    'message.itemAddedToFavorites': 'تمت إضافة العنصر إلى مفضلتك',
    'message.itemRemovedFromFavorites': 'تمت إزالة العنصر من مفضلتك',
    'message.openingWhatsApp': 'فتح واتساب',
    'message.contactingSeller': 'التواصل مع {sellerName} حول {itemName}',
  }
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('language');
    return (stored as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    
    // Update document direction and lang attribute
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  const t = (key: string, params?: Record<string, string>) => {
    let translation = translations[language][key as keyof typeof translations[typeof language]] || key;
    
    // Replace parameters in translation
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(`{${param}}`, value);
      });
    }
    
    return translation;
  };

  const isRTL = language === 'ar';

  useEffect(() => {
    // Set initial document direction and lang
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

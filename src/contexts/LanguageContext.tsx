import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'fr';

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
    'filter.title': 'Filters',
    'filter.clearAll': 'Clear All',
    'filter.sortBy': 'Sort By',
    'filter.categories': 'Categories',
    'filter.specialties': 'Seller Specialties',
    'filter.priceRange': 'Price Range',
    'filter.sort.newest': 'Newest First',
    'filter.sort.priceLow': 'Price: Low to High',
    'filter.sort.priceHigh': 'Price: High to Low',
    'filter.sort.rating': 'Highest Rated',
    'filter.specialty.coffee': '☕ Coffee',
    'filter.specialty.matcha': '🍵 Matcha',
    'filter.specialty.both': '🌟 Both Coffee & Matcha',
    
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
    'message.welcomeSeller': 'Welcome to Machroub as a seller! Your profile has been set up.',
    'message.welcomeBuyer': 'Welcome to Machroub! Your profile has been set up.',
    'message.linkCopied': 'Link copied',
    'message.linkCopiedDesc': 'Item link copied to clipboard',
    'message.addedToFavorites': 'Added to favorites',
    'message.removedFromFavorites': 'Removed from favorites',
    'message.itemAddedToFavorites': 'Item added to your favorites',
    'message.itemRemovedFromFavorites': 'Item removed from your favorites',
    'message.openingWhatsApp': 'Opening WhatsApp',
    'message.contactingSeller': 'Contacting {sellerName} about {itemName}',
  },
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.sellers': 'Vendeurs',
    'nav.orders': 'Commandes',
    'nav.profile': 'Profil',
    'nav.settings': 'Paramètres',
    'nav.help': 'Aide',
    'nav.signIn': 'Se connecter',
    'nav.signUp': 'S\'inscrire',
    'nav.becomeSeller': 'Devenir vendeur',
    'nav.addListing': 'Ajouter une annonce',
    'nav.sellerDashboard': 'Tableau de bord vendeur',

    // Common
    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.cancel': 'Annuler',
    'common.save': 'Enregistrer',
    'common.edit': 'Modifier',
    'common.delete': 'Supprimer',
    'common.view': 'Voir',
    'common.back': 'Retour',
    'common.next': 'Suivant',
    'common.previous': 'Précédent',
    'common.close': 'Fermer',
    'common.open': 'Ouvrir',
    'common.available': 'Disponible',
    'common.unavailable': 'Indisponible',
    'common.hidden': 'Masqué',
    'common.price': 'Prix',
    'common.description': 'Description',
    'common.category': 'Catégorie',
    'common.location': 'Localisation',
    'common.phone': 'Téléphone',
    'common.email': 'Email',
    'common.name': 'Nom',
    'common.address': 'Adresse',
    'common.hours': 'Horaires',
    'common.rating': 'Note',
    'common.reviews': 'Avis',

    // Search and filters
    'search.placeholder': 'Rechercher des boissons, catégories, vendeurs...',
    'search.noResults': 'Aucun élément trouvé',
    'search.noResultsDesc': 'Essayez d\'ajuster votre recherche ou revenez plus tard pour de nouveaux éléments.',
    'filter.title': 'Filtres',
    'filter.clearAll': 'Tout effacer',
    'filter.sortBy': 'Trier par',
    'filter.categories': 'Catégories',
    'filter.specialties': 'Spécialités du vendeur',
    'filter.priceRange': 'Gamme de prix',
    'filter.sort.newest': 'Plus récent d\'abord',
    'filter.sort.priceLow': 'Prix : du plus bas au plus élevé',
    'filter.sort.priceHigh': 'Prix : du plus élevé au plus bas',
    'filter.sort.rating': 'Mieux noté',
    'filter.specialty.coffee': '☕ Café',
    'filter.specialty.matcha': '🍵 Matcha',
    'filter.specialty.both': '🌟 Café et Matcha',

    // Seller Dashboard
    'dashboard.welcome': 'Salut, {name} !',
    'dashboard.todayIs': 'Nous sommes le {date}.',
    'dashboard.analytics': 'Analyses',
    'dashboard.menu': 'Menu',
    'dashboard.searchMenu': 'Rechercher dans votre menu...',
    'dashboard.noItems': 'Aucun élément trouvé.',
    'dashboard.recentActivity': 'Activité récente',
    'dashboard.noActivity': 'Aucune activité récente à afficher.',

    // Item details
    'item.orderViaWhatsApp': 'Commander via WhatsApp',
    'item.call': 'Appeler',
    'item.viewLocation': 'Localisation',
    'item.viewShop': 'Voir la boutique',
    'item.sellerInfo': 'Informations du vendeur',
    'item.orderNow': 'Commander maintenant',
    'item.moreFrom': 'Plus de {sellerName}',
    'item.moreFromDesc': 'Découvrez d\'autres délicieux articles de ce vendeur',
    'item.viewDetails': 'Voir les détails',

    // Seller page
    'seller.menu': 'Menu',
    'seller.items': '{count} articles',
    'seller.noMenu': 'Aucun article de menu disponible',
    'seller.contactWhatsApp': 'Contacter via WhatsApp',

    // Authentication
    'auth.signIn': 'Se connecter',
    'auth.signUp': 'S\'inscrire',
    'auth.email': 'Email',
    'auth.password': 'Mot de passe',
    'auth.confirmPassword': 'Confirmer le mot de passe',
    'auth.forgotPassword': 'Mot de passe oublié ?',
    'auth.dontHaveAccount': 'Vous n\'avez pas de compte ?',
    'auth.alreadyHaveAccount': 'Vous avez déjà un compte ?',
    'auth.signInWithGoogle': 'Se connecter avec Google',
    'auth.signUpWithGoogle': 'S\'inscrire avec Google',
    'auth.acceptTerms': 'J\'accepte les Conditions d\'utilisation et la Politique de confidentialité',
    'auth.userType': 'Je suis un',
    'auth.buyer': 'Acheteur',
    'auth.seller': 'Vendeur',

    // Profile
    'profile.complete': 'Compléter le profil',
    'profile.businessName': 'Nom de l\'entreprise',
    'profile.businessAddress': 'Adresse de l\'entreprise',
    'profile.businessHours': 'Heures d\'ouverture',
    'profile.specialty': 'Spécialité',
    'profile.coffee': 'Café',
    'profile.matcha': 'Matcha',
    'profile.both': 'Les deux',

    // Settings
    'settings.language': 'Langue',
    'settings.english': 'English',
    'settings.french': 'Français',
    'settings.notifications': 'Notifications',
    'settings.appearance': 'Apparence',
    'settings.privacy': 'Confidentialité',

    // Messages
    'message.welcomeBack': 'Bon retour !',
    'message.signInSuccess': 'Connecté en tant que {userType}.',
    'message.profileComplete': 'Profil complété avec succès !',
    'message.welcomeSeller': 'Bienvenue sur Machroub en tant que vendeur ! Votre profil a été configuré.',
    'message.welcomeBuyer': 'Bienvenue sur Machroub ! Votre profil a été configuré.',
    'message.linkCopied': 'Lien copié',
    'message.linkCopiedDesc': 'Lien de l\'article copié dans le presse-papiers',
    'message.addedToFavorites': 'Ajouté aux favoris',
    'message.removedFromFavorites': 'Retiré des favoris',
    'message.itemAddedToFavorites': 'Article ajouté à vos favoris',
    'message.itemRemovedFromFavorites': 'Article retiré de vos favoris',
    'message.openingWhatsApp': 'Ouverture de WhatsApp',
    'message.contactingSeller': 'Contact avec {sellerName} à propos de {itemName}',
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

    // Update document lang attribute (no RTL needed for French)
    document.documentElement.dir = 'ltr';
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

  const isRTL = false; // French is LTR like English

  useEffect(() => {
    // Set initial document direction and lang (always LTR for English/French)
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

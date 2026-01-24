// Multilingual support utility
import { supabase } from "@/integrations/supabase/client";

export type Language = 'en' | 'sw';

export interface Translation {
  [key: string]: {
    [lang in Language]: string;
  };
}

// Static translations for common UI elements
export const translations: Translation = {
  // Navigation
  home: { en: "Home", sw: "Nyumbani" },
  dashboard: { en: "Dashboard", sw: "Dashibodi" },
  order: { en: "Order", sw: "Oda" },
  track: { en: "Track", sw: "Fuatilia" },
  youth_hub: { en: "Youth Hub", sw: "Kituo cha Vijana" },
  support: { en: "Support", sw: "Usaidizi" },
  feedback: { en: "Feedback", sw: "Maoni" },
  safety: { en: "Safety", sw: "Usalama" },
  
  // Support Hub
  support_hub_title: { en: "Support Hub", sw: "Kituo cha Usaidizi" },
  create_ticket: { en: "Create Support Ticket", sw: "Unda Tiketi ya Usaidizi" },
  my_tickets: { en: "My Tickets", sw: "Tiketi Zangu" },
  live_chat: { en: "Live Chat", sw: "Mazungumzo ya Moja kwa Moja" },
  help_center: { en: "Help Center", sw: "Kituo cha Msaada" },
  
  // Feedback
  submit_feedback: { en: "Submit Feedback", sw: "Tuma Maoni" },
  rate_experience: { en: "Rate Your Experience", sw: "Kadiria Uzoefu Wako" },
  feedback_dashboard: { en: "Feedback Dashboard", sw: "Dashibodi ya Maoni" },
  
  // Ticket statuses
  status_open: { en: "Open", sw: "Wazi" },
  status_in_progress: { en: "In Progress", sw: "Inaendelea" },
  status_resolved: { en: "Resolved", sw: "Imetatuliwa" },
  status_closed: { en: "Closed", sw: "Imefungwa" },
  
  // Categories
  category_order_issue: { en: "Order Issue", sw: "Tatizo la Oda" },
  category_payment: { en: "Payment", sw: "Malipo" },
  category_delivery: { en: "Delivery", sw: "Utoaji" },
  category_technical: { en: "Technical", sw: "Kiufundi" },
  category_safety: { en: "Safety", sw: "Usalama" },
  category_general: { en: "General", sw: "Jumla" },
  category_feedback: { en: "Feedback", sw: "Maoni" },
  
  // Priority levels
  priority_low: { en: "Low", sw: "Ya Chini" },
  priority_medium: { en: "Medium", sw: "Ya Kati" },
  priority_high: { en: "High", sw: "Ya Juu" },
  priority_urgent: { en: "Urgent", sw: "Ya Haraka" },
  
  // Common actions
  submit: { en: "Submit", sw: "Tuma" },
  cancel: { en: "Cancel", sw: "Ghairi" },
  save: { en: "Save", sw: "Hifadhi" },
  delete: { en: "Delete", sw: "Futa" },
  edit: { en: "Edit", sw: "Hariri" },
  search: { en: "Search", sw: "Tafuta" },
  
  // Messages
  success: { en: "Success", sw: "Mafanikio" },
  error: { en: "Error", sw: "Hitilafu" },
  loading: { en: "Loading...", sw: "Inapakia..." },
  
  // Support chat
  chat_welcome: { 
    en: "Hello! How can I help you today?", 
    sw: "Habari! Ninawezaje kukusaidia leo?" 
  },
  chat_placeholder: { 
    en: "Type your message...", 
    sw: "Andika ujumbe wako..." 
  },
  
  // Feedback
  feedback_thank_you: {
    en: "Thank you for your feedback!",
    sw: "Asante kwa maoni yako!"
  },
  feedback_rate_experience: {
    en: "How would you rate your experience?",
    sw: "Ungeikadiria vipi uzoefu wako?"
  }
};

// Get translation by key and language
export const t = (key: string, lang: Language = 'en'): string => {
  const translation = translations[key];
  if (!translation) {
    console.warn(`Translation key not found: ${key}`);
    return key;
  }
  return translation[lang] || translation.en || key;
};

// Fetch dynamic translations from database
export const fetchContentTranslation = async (
  contentType: string,
  contentKey: string,
  language: Language = 'en'
): Promise<string | null> => {
  try {
    const { data, error } = await (supabase
      .from('content_translations') as any)
      .select('translated_text')
      .eq('content_type', contentType)
      .eq('content_key', contentKey)
      .eq('language', language)
      .maybeSingle();

    if (error) throw error;
    return data?.translated_text || null;
  } catch (error) {
    console.error('Error fetching translation:', error);
    return null;
  }
};

// Save content translation to database
export const saveContentTranslation = async (
  contentType: string,
  contentKey: string,
  language: Language,
  translatedText: string
): Promise<boolean> => {
  try {
    const { error } = await (supabase
      .from('content_translations') as any)
      .upsert({
        content_type: contentType,
        content_key: contentKey,
        language: language,
        translated_text: translatedText
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving translation:', error);
    return false;
  }
};

// Language detector based on browser settings
export const detectLanguage = (): Language => {
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('sw')) return 'sw';
  return 'en';
};

// Language storage in localStorage
const LANGUAGE_KEY = 'app_language';

export const saveLanguagePreference = (lang: Language): void => {
  localStorage.setItem(LANGUAGE_KEY, lang);
};

export const getLanguagePreference = (): Language => {
  const saved = localStorage.getItem(LANGUAGE_KEY) as Language;
  return saved || detectLanguage();
};

// Format date based on language
export const formatDate = (date: Date | string, lang: Language): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  const locale = lang === 'sw' ? 'sw-KE' : 'en-US';
  return new Intl.DateTimeFormat(locale, options).format(d);
};

// Format time based on language
export const formatTime = (date: Date | string, lang: Language): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit'
  };
  
  const locale = lang === 'sw' ? 'sw-KE' : 'en-US';
  return new Intl.DateTimeFormat(locale, options).format(d);
};

// Format currency based on language
export const formatCurrency = (amount: number, lang: Language): string => {
  const locale = lang === 'sw' ? 'sw-KE' : 'en-KE';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'KES'
  }).format(amount);
};

export default {
  t,
  translations,
  fetchContentTranslation,
  saveContentTranslation,
  detectLanguage,
  saveLanguagePreference,
  getLanguagePreference,
  formatDate,
  formatTime,
  formatCurrency
};

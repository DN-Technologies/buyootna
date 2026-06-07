export type Language = 'ar' | 'en';

export interface NavItem {
  id: string;
  label: {
    ar: string;
    en: string;
  };
}

export interface ApplicationCard {
  id: string;
  name: {
    ar: string;
    en: string;
  };
  category: {
    ar: string;
    en: string;
  };
  description: {
    ar: string;
    en: string;
  };
  features: {
    ar: string[];
    en: string[];
  };
  image: string;
  badge: {
    ar: string;
    en: string;
  };
  stats: {
    label: { ar: string; en: string };
    value: string;
  }[];
  link: string;
}

export interface ServiceItem {
  id: string;
  title: {
    ar: string;
    en: string;
  };
  description: {
    ar: string;
    en: string;
  };
  iconName: string;
}

export interface StatItem {
  id: string;
  value: string;
  label: {
    ar: string;
    en: string;
  };
  description: {
    ar: string;
    en: string;
  };
}

export interface ContactForm {
  name: string;
  email: string;
  phone: string;
  message: string;
}

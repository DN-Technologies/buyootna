import apiClient from '@/shared/api/api';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export const faqService = {
  getFAQs: async (): Promise<FAQItem[]> => {
    const response = await apiClient.get<FAQItem[]>('/faq');
    return response.data;
  },
};

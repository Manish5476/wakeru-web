import { fetchClient } from './client';

export const masterApi = {
  getCategories: () => fetchClient('/master/categories'),
  getBusinessCategories: () => fetchClient('/master/business-categories'),
  getAmenities: (category?: string) => fetchClient('/master/amenities', { params: { category } }),
  getDestinations: () => fetchClient('/master/destinations')
};

export const servicesApi = {
  getServiceTypes: (category: string) => fetchClient('/services/types', { params: { category } })
};

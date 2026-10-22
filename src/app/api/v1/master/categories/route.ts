import { jsonSuccess } from '@/server/response';

const CATEGORIES = [
  { id: 'cat_stay', slug: 'stay', name: 'Stays & Luxury Villas', icon: '🏨', sortOrder: 1, isActive: true },
  { id: 'cat_dining', slug: 'dining', name: 'Dining, Beach Clubs & Lounges', icon: '🍽️', sortOrder: 2, isActive: true },
  { id: 'cat_adventure', slug: 'adventure', name: 'Scuba, Water Sports & Treks', icon: '🏄', sortOrder: 3, isActive: true },
  { id: 'cat_nightlife', slug: 'nightlife', name: 'Sunset Bars & Nightlife', icon: '🍹', sortOrder: 4, isActive: true },
  { id: 'cat_culture', slug: 'culture', name: 'Heritage, Art & Wellness', icon: '🧘', sortOrder: 5, isActive: true },
];

export async function GET() {
  return jsonSuccess({ categories: CATEGORIES, data: CATEGORIES });
}

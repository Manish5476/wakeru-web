import { NextRequest } from 'next/server';
import { jsonSuccess } from '@/server/response';
import { db } from '@/server/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const query = (searchParams.get('q') || '').toLowerCase().trim();
  const city = (searchParams.get('city') || '').toLowerCase().trim();

  let results = db.businesses.filter(b => b.status === 'active' && b.verificationStatus === 'VERIFIED');

  if (category && category !== 'ALL') {
    results = results.filter(b => b.category.toUpperCase() === category.toUpperCase());
  }

  if (city) {
    results = results.filter(b => b.city?.toLowerCase().includes(city));
  }

  if (query) {
    results = results.filter(
      b =>
        b.businessName.toLowerCase().includes(query) ||
        b.description?.toLowerCase().includes(query) ||
        b.city?.toLowerCase().includes(query)
    );
  }

  return jsonSuccess({
    businesses: results,
    total: results.length,
  });
}

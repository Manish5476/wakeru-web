import { jsonSuccess } from '@/server/response';

const AMENITIES = [
  { id: 'am_pool', code: 'POOL', name: 'Private Plunge / Infinity Pool', icon: '🏊' },
  { id: 'am_wifi', code: 'WIFI', name: 'High-Speed 5G Wi-Fi', icon: '⚡' },
  { id: 'am_chef', code: 'CHEF', name: 'Private In-House Chef Service', icon: '👨‍🍳' },
  { id: 'am_ac', code: 'AC', name: 'Central Air Conditioning', icon: '❄️' },
  { id: 'am_beach', code: 'BEACH', name: 'Direct Oceanfront Access', icon: '🌊' },
  { id: 'am_parking', code: 'PARKING', name: 'Complimentary Valet Parking', icon: '🚗' },
  { id: 'am_key', code: 'SMART_KEY', name: 'Keyless IoT Smart Lock Entry', icon: '🔑' },
];

export async function GET() {
  return jsonSuccess({ amenities: AMENITIES, data: AMENITIES });
}

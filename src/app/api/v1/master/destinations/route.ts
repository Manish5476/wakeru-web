import { jsonSuccess } from '@/server/response';

const DESTINATIONS = [
  { id: 'dest_goa', code: 'GOA', name: 'Goa', state: 'Goa', country: 'India', coordinates: { lat: 15.5807, lng: 73.7433 } },
  { id: 'dest_manali', code: 'MANALI', name: 'Manali & Kasol', state: 'Himachal Pradesh', country: 'India', coordinates: { lat: 32.2396, lng: 77.1887 } },
  { id: 'dest_jaipur', code: 'JAIPUR', name: 'Jaipur & Udaipur', state: 'Rajasthan', country: 'India', coordinates: { lat: 26.9124, lng: 75.7873 } },
  { id: 'dest_pondi', code: 'PONDI', name: 'Pondicherry', state: 'Puducherry', country: 'India', coordinates: { lat: 11.9416, lng: 79.8083 } },
  { id: 'dest_munnar', code: 'MUNNAR', name: 'Munnar & Wayanad', state: 'Kerala', country: 'India', coordinates: { lat: 10.0889, lng: 77.0595 } },
];

export async function GET() {
  return jsonSuccess({ destinations: DESTINATIONS, data: DESTINATIONS });
}

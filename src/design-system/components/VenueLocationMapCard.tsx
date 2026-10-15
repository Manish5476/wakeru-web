'use client';

import React, { useState, useMemo } from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';

export interface VenueLocationMapCardProps {
  venueName: string;
  category?: string;
  address?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
  phone?: string;
  cardTitle?: string;
  isConfirmedBooking?: boolean;
  bookingRef?: string;
  rating?: number;
  reviewCount?: number;
}

export function VenueLocationMapCard({
  venueName,
  category = 'venue',
  address,
  city,
  country,
  latitude,
  longitude,
  googleMapsUrl,
  phone,
  cardTitle = 'Location & Arrival Map',
  isConfirmedBooking = false,
  bookingRef,
  rating,
  reviewCount,
}: VenueLocationMapCardProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const hasCoords =
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    (latitude !== 0 || longitude !== 0);

  const lat = hasCoords ? latitude! : 15.2993;
  const lng = hasCoords ? longitude! : 74.124;

  const categoryEmoji = useMemo(() => {
    const cat = (category || '').toLowerCase();
    if (
      cat.includes('stay') ||
      cat.includes('hotel') ||
      cat.includes('resort') ||
      cat.includes('homestay') ||
      cat.includes('villa') ||
      cat.includes('hostel')
    ) {
      return '🏨';
    }
    if (
      cat.includes('dine') ||
      cat.includes('food') ||
      cat.includes('restaurant') ||
      cat.includes('cafe') ||
      cat.includes('bakery')
    ) {
      return '🍽️';
    }
    if (
      cat.includes('rent') ||
      cat.includes('car') ||
      cat.includes('bike') ||
      cat.includes('taxi') ||
      cat.includes('cab')
    ) {
      return '🚗';
    }
    if (
      cat.includes('tour') ||
      cat.includes('activity') ||
      cat.includes('trek') ||
      cat.includes('adventure') ||
      cat.includes('guide')
    ) {
      return '🎒';
    }
    return '📍';
  }, [category]);

  const categoryColor = useMemo(() => {
    const cat = (category || '').toLowerCase();
    if (
      cat.includes('stay') ||
      cat.includes('hotel') ||
      cat.includes('resort') ||
      cat.includes('villa')
    ) {
      return '#10B981'; // Emerald
    }
    if (
      cat.includes('dine') ||
      cat.includes('food') ||
      cat.includes('restaurant') ||
      cat.includes('cafe')
    ) {
      return '#F59E0B'; // Amber
    }
    if (
      cat.includes('rent') ||
      cat.includes('car') ||
      cat.includes('bike') ||
      cat.includes('taxi')
    ) {
      return '#3B82F6'; // Blue
    }
    if (
      cat.includes('tour') ||
      cat.includes('activity') ||
      cat.includes('trek')
    ) {
      return '#8B5CF6'; // Purple
    }
    return '#10B981';
  }, [category]);

  const categoryLabel = useMemo(() => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('stay') || cat.includes('hotel')) return 'Hotel & Stay';
    if (cat.includes('resort')) return 'Resort & Spa';
    if (cat.includes('homestay')) return 'Authentic Homestay';
    if (cat.includes('dine') || cat.includes('restaurant'))
      return 'Dining & Culinary';
    if (cat.includes('cafe')) return 'Cafe & Bistro';
    if (cat.includes('rent') || cat.includes('car') || cat.includes('bike'))
      return 'Mobility & Rental';
    if (cat.includes('tour') || cat.includes('activity'))
      return 'Tour & Experience';
    return category || 'Verified Venue';
  }, [category]);

  const formattedLocation = useMemo(() => {
    if (address && address.trim()) return address.trim();
    const parts = [city, country].filter(Boolean);
    return parts.length > 0
      ? parts.join(', ')
      : 'Location details available upon booking confirmation';
  }, [address, city, country]);

  const handleCopy = (text: string, label: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2500);
    }
  };

  const directionsUrl = useMemo(() => {
    if (googleMapsUrl) return googleMapsUrl;
    if (hasCoords) {
      return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${venueName}, ${formattedLocation}`,
    )}`;
  }, [googleMapsUrl, hasCoords, lat, lng, venueName, formattedLocation]);

  // Generate self-contained Leaflet HTML for web iframe
  const generateLeafletHtml = (zoomLevel = 15, isModal = false) => {
    const safeTitle = venueName.replace(/"/g, '&quot;');
    const safeAddress = formattedLocation.replace(/"/g, '&quot;');
    const ratingStr = rating ? `★ ${rating.toFixed(1)}` : '';
    const bookingBadge = bookingRef
      ? `<div style="margin-top:6px;background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.3);border-radius:6px;padding:3px 8px;font-size:10px;font-weight:700;color:#6366F1;display:flex;justify-content:space-between;"><span>Confirmed Booking</span><span style="font-family:monospace;font-weight:800;">#${bookingRef}</span></div>`
      : '';

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #map { width: 100%; height: 100%; background: #0F172A; font-family: system-ui, -apple-system, sans-serif; overflow: hidden; }
    .venue-pin-wrapper { background: none !important; border: none !important; cursor: pointer; }
    .venue-pin-container { display: flex; flex-direction: column; align-items: center; position: relative; transition: all 0.25s ease; }
    .venue-pin-container:hover { transform: translateY(-4px) scale(1.06); }
    .venue-pin-card {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(15, 23, 42, 0.94);
      backdrop-filter: blur(16px);
      border: 1.5px solid rgba(255, 255, 255, 0.2);
      padding: 5px 12px 5px 6px;
      border-radius: 999px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.4), 0 3px 8px rgba(0,0,0,0.2);
      max-width: 220px;
    }
    .venue-pin-icon-wrap {
      width: 30px; height: 30px; border-radius: 50%;
      background: linear-gradient(135deg, ${categoryColor}, ${categoryColor}DD);
      display: flex; align-items: center; justify-content: center;
      font-size: 15px; flex-shrink: 0;
      box-shadow: 0 3px 10px ${categoryColor}66;
    }
    .venue-pin-text { display: flex; flex-direction: column; min-width: 0; overflow: hidden; }
    .venue-pin-title {
      font-size: 12px; font-weight: 800; color: #FFFFFF;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .venue-pin-sub { font-size: 10px; font-weight: 700; color: #F59E0B; margin-top: -1px; }
    .venue-pin-beak {
      width: 0; height: 0;
      border-left: 6px solid transparent; border-right: 6px solid transparent;
      border-top: 7px solid rgba(15, 23, 42, 0.94);
      margin-top: -1px;
    }
    .venue-pin-pulse {
      position: absolute; bottom: -3px; width: 14px; height: 5px;
      background: ${categoryColor}55; border-radius: 50%;
      animation: pulse 2s ease-in-out infinite alternate;
    }
    @keyframes pulse { 0% { transform: scale(0.8); opacity: 0.3; } 100% { transform: scale(1.6); opacity: 0.8; } }
    .leaflet-popup-content-wrapper {
      background: rgba(15, 23, 42, 0.96) !important;
      color: #F8FAFC !important;
      border-radius: 18px !important;
      border: 1.5px solid rgba(255, 255, 255, 0.18) !important;
      padding: 2px !important;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5) !important;
    }
    .leaflet-popup-content { margin: 10px 12px !important; line-height: 1.4 !important; }
    .leaflet-popup-tip { background: #0F172A !important; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      zoomControl: ${isModal ? 'true' : 'false'},
      attributionControl: false
    }).setView([${lat}, ${lng}], ${zoomLevel});

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(map);

    var html = '<div class="venue-pin-container">' +
      '<div class="venue-pin-card">' +
        '<div class="venue-pin-icon-wrap">${categoryEmoji}</div>' +
        '<div class="venue-pin-text">' +
          '<span class="venue-pin-title">${safeTitle}</span>' +
          '${ratingStr ? `<span class="venue-pin-sub">${ratingStr} • Verified</span>` : ''}' +
        '</div>' +
      '</div>' +
      '<div class="venue-pin-beak"></div>' +
      '<div class="venue-pin-pulse"></div>' +
    '</div>';

    var icon = L.divIcon({
      className: 'venue-pin-wrapper',
      html: html,
      iconSize: [180, 64],
      iconAnchor: [90, 58]
    });

    var marker = L.marker([${lat}, ${lng}], { icon: icon }).addTo(map);

    var popupHtml = '<div style="min-width:220px;max-width:280px;padding:4px 2px;">' +
      '<div style="display:flex;align-items:center;gap:10px;">' +
        '<div style="width:36px;height:36px;border-radius:10px;background:${categoryColor}25;border:1px solid ${categoryColor}40;display:flex;align-items:center;justify-content:center;font-size:18px;">${categoryEmoji}</div>' +
        '<div style="flex:1;min-width:0;">' +
          '<div style="font-size:13px;font-weight:800;color:#FFFFFF;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${safeTitle}</div>' +
          '<div style="font-size:11px;font-weight:700;color:#F59E0B;margin-top:2px;">${ratingStr || 'Verified Venue ✓'}</div>' +
        '</div>' +
      '</div>' +
      '<div style="font-size:11px;color:#CBD5E1;margin-top:8px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.08);line-height:1.4;">📍 ${safeAddress}</div>' +
      '${bookingBadge}' +
      '<div style="margin-top:10px;">' +
        '<a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" style="display:flex;align-items:center;justify-content:center;gap:4px;background:${categoryColor};color:#FFFFFF;text-decoration:none;font-size:11px;font-weight:800;padding:6px 10px;border-radius:8px;">' +
          '<span>Get Directions ↗</span>' +
        '</a>' +
      '</div>' +
    '</div>';

    marker.bindPopup(popupHtml, { offset: [0, -42], closeButton: false });
  </script>
</body>
</html>`;
  };

  return (
    <div className="w-full my-4">
      {/* Header with Title & Verification Badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl border shadow-sm"
            style={{
              backgroundColor: `${categoryColor}18`,
              borderColor: `${categoryColor}35`,
            }}
          >
            {categoryEmoji}
          </div>
          <div>
            <h3 className="font-bold text-base text-[var(--color-wakeru-text-primary)]">
              {cardTitle}
            </h3>
            <p className="text-xs text-[var(--color-wakeru-text-secondary)]">
              {categoryLabel}
              {city ? ` • ${city}` : ''}
              {country ? `, ${country}` : ''}
            </p>
          </div>
        </div>

        {isConfirmedBooking ? (
          <Badge variant="verified">✓ Confirmed Destination</Badge>
        ) : hasCoords ? (
          <Badge variant="default">GPS Verified</Badge>
        ) : null}
      </div>

      {/* Main Luxury Glass Card Container */}
      <Card className="overflow-hidden border border-[var(--color-wakeru-border)] shadow-md rounded-2xl bg-[var(--color-wakeru-surface)]">
        {/* Live Interactive Map Box */}
        <div className="relative w-full h-56 bg-slate-900 overflow-hidden">
          {hasCoords ? (
            <iframe
              srcDoc={generateLeafletHtml(15, false)}
              className="w-full h-full border-0 pointer-events-auto"
              title={`${venueName} Location Map`}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--color-wakeru-surface-muted)] p-6 text-center">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-2"
                style={{ backgroundColor: `${categoryColor}20` }}
              >
                <span className="text-2xl">📍</span>
              </div>
              <p className="font-bold text-sm text-[var(--color-wakeru-text-primary)]">
                {venueName}
              </p>
              <p className="text-xs text-[var(--color-wakeru-text-secondary)] mt-1 max-w-sm">
                {formattedLocation}
              </p>
            </div>
          )}

          {/* Top-Right Floating Controls (Glass Pill) */}
          {hasCoords && (
            <button
              onClick={() => setIsFullscreen(true)}
              className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-slate-900/85 backdrop-blur-md border border-white/20 shadow-lg hover:bg-slate-900 transition-all cursor-pointer z-10"
            >
              <span>🔍</span>
              <span>Explore Map</span>
            </button>
          )}

          {/* Bottom Floating Bar on the Map */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-white/15 shadow-md z-10">
            <div className="flex items-center gap-2 min-w-0 mr-2">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0 animate-pulse"
                style={{ backgroundColor: categoryColor }}
              />
              <span className="text-xs font-bold text-white truncate">
                {venueName}
              </span>
            </div>

            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold text-white shadow-sm transition-all hover:brightness-110 flex-shrink-0"
              style={{ backgroundColor: categoryColor }}
            >
              <span>🧭 Directions</span>
            </a>
          </div>
        </div>

        {/* Card Details & Actions Footer */}
        <div className="p-4 space-y-3 bg-[var(--color-wakeru-surface-elevated)] border-t border-[var(--color-wakeru-border)]">
          {/* Address & Coordinates */}
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ backgroundColor: `${categoryColor}18` }}
            >
              <span className="text-sm">📍</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-[var(--color-wakeru-text-primary)] leading-snug">
                {formattedLocation}
              </p>

              {/* Coordinates Pill */}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {hasCoords && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium text-[var(--color-wakeru-text-secondary)] bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border)]">
                    🎯 {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
                  </span>
                )}

                <button
                  onClick={() =>
                    handleCopy(
                      hasCoords
                        ? `${lat.toFixed(5)}, ${lng.toFixed(5)}`
                        : formattedLocation,
                      'coords',
                    )
                  }
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold text-[var(--color-wakeru-text-secondary)] hover:text-[var(--color-wakeru-text-primary)] bg-[var(--color-wakeru-surface-muted)] border border-[var(--color-wakeru-border)] cursor-pointer transition-colors"
                >
                  <span>📋 {copied === 'coords' ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2 pt-2 border-t border-[var(--color-wakeru-border)]">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold text-white shadow-sm transition-all hover:brightness-110"
              style={{ backgroundColor: categoryColor }}
            >
              <span>🧭 Turn-by-Turn Directions</span>
            </a>

            {hasCoords && (
              <button
                onClick={() => setIsFullscreen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-[var(--color-wakeru-border)] bg-[var(--color-wakeru-surface-muted)] text-[var(--color-wakeru-text-primary)] hover:bg-[var(--color-wakeru-border)] transition-colors cursor-pointer"
                title="Explore Fullscreen Map"
              >
                🔍 Explore
              </button>
            )}

            {phone && (
              <a
                href={`tel:${phone.replace(/\s+/g, '')}`}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-[var(--color-wakeru-border)] bg-[var(--color-wakeru-surface-muted)] text-[var(--color-wakeru-text-primary)] hover:bg-[var(--color-wakeru-border)] transition-colors"
                title="Call Venue"
              >
                📞 Call
              </a>
            )}
          </div>

          {/* Confirmed Booking Reference Banner */}
          {bookingRef && (
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-500">
              <span className="flex items-center gap-1.5">
                <span>🛡️</span>
                <span>Confirmed Check-in Pass</span>
              </span>
              <span className="font-mono">#{bookingRef}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Fullscreen Interactive Map Modal with Floating Bottom Luxury Sheet */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 animate-fadeIn">
          {/* Top Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-900/95 backdrop-blur-md border-b border-white/10 z-20">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                ← Back
              </button>
              <div>
                <h2 className="font-bold text-lg text-white">{venueName}</h2>
                <p className="text-xs text-slate-400">
                  {categoryLabel} • {city || country || 'Neighborhood Map'}
                </p>
              </div>
            </div>

            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all hover:brightness-110"
              style={{ backgroundColor: categoryColor }}
            >
              <span>🧭 Navigate</span>
            </a>
          </div>

          {/* Fullscreen Map Viewport */}
          <div className="relative flex-1 w-full h-full">
            <iframe
              srcDoc={generateLeafletHtml(16, true)}
              className="w-full h-full border-0"
              title={`${venueName} Fullscreen Map`}
            />

            {/* Floating Bottom Luxury Sheet Card (Airbnb / Apple Maps Style) */}
            <div className="absolute bottom-8 left-6 right-6 max-w-xl mx-auto rounded-3xl p-6 bg-slate-900/95 backdrop-blur-xl border border-white/20 shadow-2xl z-20 space-y-4">
              {/* Drag Handle */}
              <div className="w-10 h-1 rounded-full bg-white/30 mx-auto" />

              {/* Tag Row */}
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border"
                  style={{
                    backgroundColor: `${categoryColor}20`,
                    borderColor: `${categoryColor}40`,
                    color: categoryColor,
                  }}
                >
                  <span>{categoryEmoji}</span>
                  <span>{categoryLabel}</span>
                </span>

                {rating ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-400">
                    ★ {rating.toFixed(1)} {reviewCount ? `(${reviewCount})` : ''}
                  </span>
                ) : null}

                {isConfirmedBooking ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-400">
                    ✓ Confirmed Arrival
                  </span>
                ) : null}
              </div>

              {/* Venue Name */}
              <h3 className="font-extrabold text-xl text-white">{venueName}</h3>

              {/* Address */}
              <div className="flex items-center justify-between gap-3 text-xs text-slate-300">
                <p className="leading-snug">📍 {formattedLocation}</p>
                <button
                  onClick={() => handleCopy(formattedLocation, 'fullAddress')}
                  className="px-2.5 py-1 rounded-lg bg-white/10 text-white font-semibold hover:bg-white/20 cursor-pointer flex-shrink-0"
                >
                  {copied === 'fullAddress' ? 'Copied!' : 'Copy'}
                </button>
              </div>

              {/* Booking Pass Banner */}
              {bookingRef && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-xs font-bold text-indigo-400">
                  <span>🛡️</span>
                  <span>Guaranteed Arrival • Booking Ref #{bookingRef}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-sm font-extrabold text-white shadow-lg transition-all hover:brightness-110"
                  style={{ backgroundColor: categoryColor }}
                >
                  <span>🧭 Start Navigation</span>
                </a>

                {phone && (
                  <a
                    href={`tel:${phone.replace(/\s+/g, '')}`}
                    className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-2xl text-sm font-bold border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-colors"
                  >
                    <span>📞 Call</span>
                  </a>
                )}

                <button
                  onClick={() =>
                    handleCopy(
                      `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
                      'fullCoords',
                    )
                  }
                  className="flex items-center justify-center gap-1.5 py-3 px-4 rounded-2xl text-sm font-bold border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <span>🎯 {copied === 'fullCoords' ? 'Copied' : 'GPS'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

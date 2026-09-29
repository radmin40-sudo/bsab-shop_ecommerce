import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Check, Crosshair, Loader2, MapPin, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface SelectedLocation {
    line1: string;
    city: string;
    province: string;
    postal_code: string;
    formatted: string;
    lat: number;
    lng: number;
}

interface MapPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialAddress?: {
        line1?: string;
        city?: string;
        province?: string;
        postal_code?: string;
    };
    onSelectLocation: (location: SelectedLocation) => void;
}

// Custom modern green pin icon using HTML/SVG to avoid bundler image asset issues
const createCustomPinIcon = () =>
    L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
            <div style="position:relative; width:40px; height:48px; transform:translate(-20px, -48px);">
                <div style="width:38px; height:38px; background:#078b48; border-radius:50% 50% 50% 0; transform:rotate(-45deg); display:flex; align-items:center; justify-content:center; box-shadow:0 8px 20px rgba(7,139,72,0.45); border:3px solid #ffffff;">
                    <div style="width:14px; height:14px; background:#ffffff; border-radius:50%; transform:rotate(45deg);"></div>
                </div>
                <div style="position:absolute; bottom:0; left:12px; width:16px; height:6px; background:rgba(0,0,0,0.25); border-radius:50%; filter:blur(2px);"></div>
            </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
    });

export default function MapPickerModal({ isOpen, onClose, initialAddress, onSelectLocation }: MapPickerModalProps) {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<SelectedLocation>({
        line1: initialAddress?.line1 || '',
        city: initialAddress?.city || '',
        province: initialAddress?.province || '',
        postal_code: initialAddress?.postal_code || '',
        formatted: [initialAddress?.line1, initialAddress?.city, initialAddress?.province, initialAddress?.postal_code]
            .filter(Boolean)
            .join(', ') || 'Philippines',
        lat: 14.5995,
        lng: 120.9842,
    });

    // Reverse geocode lat/lng to address parts via OpenStreetMap Nominatim
    async function reverseGeocode(lat: number, lng: number) {
        setIsReverseGeocoding(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
                {
                    headers: {
                        'Accept-Language': 'en',
                    },
                }
            );
            if (!response.ok) throw new Error('Geocoding failed');
            const data = await response.json();
            const addr = data.address || {};

            const streetNumber = addr.house_number || '';
            const road = addr.road || addr.street || addr.pedestrian || addr.suburb || addr.neighbourhood || '';
            const line1 = [streetNumber, road].filter(Boolean).join(' ') || data.name || '';
            const city = addr.city || addr.town || addr.municipality || addr.village || addr.county || '';
            const province = addr.province || addr.state || addr.region || '';
            const postal_code = addr.postcode || '';

            const formatted = data.display_name || [line1, city, province, postal_code].filter(Boolean).join(', ');

            setSelectedLocation({
                line1,
                city,
                province,
                postal_code,
                formatted,
                lat,
                lng,
            });
        } catch {
            setSelectedLocation((prev) => ({
                ...prev,
                lat,
                lng,
                formatted: `Location (${lat.toFixed(5)}, ${lng.toFixed(5)})`,
            }));
        } finally {
            setIsReverseGeocoding(false);
        }
    }

    // Search place via Nominatim
    async function handleSearch(e?: React.FormEvent) {
        if (e) e.preventDefault();
        const trimmed = searchQuery.trim();
        if (!trimmed) return;

        setIsSearching(true);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed)}&countrycodes=ph&limit=5&addressdetails=1`,
                {
                    headers: { 'Accept-Language': 'en' },
                }
            );
            if (!res.ok) throw new Error('Search failed');
            const results = await res.json();
            setSearchResults(results);

            if (results && results.length > 0) {
                const first = results[0];
                const lat = parseFloat(first.lat);
                const lon = parseFloat(first.lon);
                moveToCoordinates(lat, lon, 16);
            }
        } catch {
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }

    function moveToCoordinates(lat: number, lng: number, zoomLevel = 16) {
        if (!mapInstanceRef.current) return;
        mapInstanceRef.current.setView([lat, lng], zoomLevel);
        if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
        }
        reverseGeocode(lat, lng);
    }

    // Geolocation: Find user current location
    function locateUser() {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                moveToCoordinates(latitude, longitude, 17);
            },
            () => {
                alert('Could not access your location. Please ensure location permissions are allowed.');
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }

    // Initialize map on modal open
    useEffect(() => {
        if (!isOpen) {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
            return;
        }

        // Delay slightly so DOM is measured properly
        const timer = setTimeout(() => {
            if (!mapContainerRef.current || mapInstanceRef.current) return;

            const initialLat = 14.5995;
            const initialLng = 120.9842;

            const map = L.map(mapContainerRef.current, {
                center: [initialLat, initialLng],
                zoom: 13,
                zoomControl: false,
            });

            L.control.zoom({ position: 'bottomright' }).addTo(map);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19,
            }).addTo(map);

            const pinIcon = createCustomPinIcon();
            const marker = L.marker([initialLat, initialLng], {
                icon: pinIcon,
                draggable: true,
            }).addTo(map);

            marker.on('dragend', () => {
                const latlng = marker.getLatLng();
                reverseGeocode(latlng.lat, latlng.lng);
            });

            map.on('click', (e: L.LeafletMouseEvent) => {
                marker.setLatLng(e.latlng);
                reverseGeocode(e.latlng.lat, e.latlng.lng);
            });

            mapInstanceRef.current = map;
            markerRef.current = marker;

            // If initial address exists, search and locate it
            const addressString = [initialAddress?.line1, initialAddress?.city, initialAddress?.province]
                .filter(Boolean)
                .join(', ');

            if (addressString) {
                fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressString)}&countrycodes=ph&limit=1`,
                    { headers: { 'Accept-Language': 'en' } }
                )
                    .then((r) => r.json())
                    .then((results) => {
                        if (results && results.length > 0) {
                            const lat = parseFloat(results[0].lat);
                            const lon = parseFloat(results[0].lon);
                            moveToCoordinates(lat, lon, 15);
                        } else {
                            reverseGeocode(initialLat, initialLng);
                        }
                    })
                    .catch(() => {
                        reverseGeocode(initialLat, initialLng);
                    });
            } else {
                reverseGeocode(initialLat, initialLng);
            }
        }, 150);

        return () => {
            clearTimeout(timer);
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-[#0f281b]/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Dialog */}
            <div className="relative flex flex-col w-full max-w-3xl h-[88vh] max-h-[750px] overflow-hidden rounded-2xl border border-[#d9eee0] bg-white shadow-[0_20px_50px_rgba(10,50,28,0.25)] animate-in fade-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-[#e5efe7] bg-[#f9fcf9] px-4 py-3 sm:px-6">
                    <div className="flex items-center gap-2.5">
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-[#ddf7e4] text-[#087b3f]">
                            <MapPin size={18} />
                        </span>
                        <div>
                            <h2 className="text-sm font-bold text-[#14482d] sm:text-[15px]">Pick Address on Map</h2>
                            <p className="text-[10px] text-[#6b8c78] sm:text-[11px]">Click or drag the marker to your precise delivery location</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="grid h-8 w-8 place-items-center rounded-full text-[#6b8c78] hover:bg-[#edf6f0] hover:text-[#14482d] transition"
                        aria-label="Close map picker"
                    >
                        <X size={17} />
                    </button>
                </div>

                {/* Search Bar & Quick Action */}
                <div className="relative z-10 border-b border-[#e7f1e9] bg-white p-3 sm:px-6 sm:py-2.5">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative flex-1">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#799986]" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search city, barangay, street, or landmark in Philippines..."
                                className="w-full rounded-full border border-[#d7e8dc] bg-[#f8fbf9] pl-9 pr-8 py-2 text-xs text-[#17462c] outline-none transition placeholder:text-[#88a594] focus:border-[#078b48] focus:bg-white focus:ring-2 focus:ring-[#d8f4e2]"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSearchResults([]);
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#799986] hover:text-[#17462c]"
                                >
                                    <X size={13} />
                                </button>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={isSearching}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#078b48] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#056d39] disabled:opacity-60"
                        >
                            {isSearching ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
                            <span className="hidden sm:inline">Search</span>
                        </button>
                        <button
                            type="button"
                            onClick={locateUser}
                            title="Use my current GPS location"
                            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#cbe4d3] bg-[#f2faf4] px-3 py-2 text-xs font-semibold text-[#087b3f] hover:bg-[#e4f6ea] transition"
                        >
                            <Crosshair size={14} />
                            <span className="hidden md:inline">Locate Me</span>
                        </button>
                    </form>

                    {/* Search Suggestions dropdown */}
                    {searchResults.length > 0 && (
                        <div className="absolute left-4 right-4 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-xl border border-[#d7e8dc] bg-white p-1 shadow-lg sm:left-6 sm:right-6">
                            {searchResults.map((item, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                        const lat = parseFloat(item.lat);
                                        const lon = parseFloat(item.lon);
                                        moveToCoordinates(lat, lon, 16);
                                        setSearchResults([]);
                                        setSearchQuery(item.display_name.split(',')[0]);
                                    }}
                                    className="flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left text-xs text-[#24583b] hover:bg-[#f0fbf3] transition"
                                >
                                    <MapPin size={13} className="mt-0.5 shrink-0 text-[#078b48]" />
                                    <span className="truncate">{item.display_name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Map Area */}
                <div className="relative flex-1 bg-[#eaf4ed]">
                    <div ref={mapContainerRef} className="h-full w-full" />

                    {/* Geocoding indicator pill */}
                    {isReverseGeocoding && (
                        <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 z-10 flex items-center gap-2 rounded-full border border-[#078b48]/30 bg-white/95 px-3.5 py-1.5 shadow-md backdrop-blur-sm">
                            <Loader2 size={13} className="animate-spin text-[#078b48]" />
                            <span className="text-[11px] font-semibold text-[#078b48]">Locating address...</span>
                        </div>
                    )}

                    {/* Hint badge */}
                    <div className="pointer-events-none absolute bottom-3 left-3 z-10 hidden sm:flex items-center gap-1.5 rounded-lg border border-[#cbe4d3]/70 bg-white/90 px-2.5 py-1 shadow-sm backdrop-blur-sm text-[10px] text-[#4f735e]">
                        <MapPin size={11} className="text-[#078b48]" />
                        <span>Tip: Drag marker or click anywhere to adjust location</span>
                    </div>
                </div>

                {/* Footer / Selected Address Preview */}
                <div className="border-t border-[#e5efe7] bg-[#f9fcf9] p-3 sm:p-4 md:px-6">
                    <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                        <div className="min-w-0">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-[#6b8c78]">
                                Selected Location
                            </span>
                            <p className="mt-0.5 truncate text-xs font-bold text-[#14482d] sm:text-sm">
                                {selectedLocation.line1 || selectedLocation.city || 'No specific street detected'}
                            </p>
                            <p className="truncate text-[11px] text-[#567a65]">
                                {[selectedLocation.city, selectedLocation.province, selectedLocation.postal_code]
                                    .filter(Boolean)
                                    .join(', ') || selectedLocation.formatted}
                            </p>
                        </div>
                        <div className="flex items-center justify-end gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-full border border-[#d2e5d7] bg-white px-4 py-2 text-xs font-semibold text-[#5a7c68] hover:bg-[#f3f9f4] transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    onSelectLocation(selectedLocation);
                                    onClose();
                                }}
                                className="inline-flex items-center gap-1.5 rounded-full bg-[#078b48] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#056d39] transition focus-visible:outline-2 focus-visible:outline-[#078b48]"
                            >
                                <Check size={14} strokeWidth={2.5} />
                                <span>Confirm Address</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

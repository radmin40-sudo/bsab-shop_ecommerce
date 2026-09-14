import InputError from '@/components/input-error';
import { PortalLayout } from '@/components/portal-layout';
import { type SharedData } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Check, ImagePlus, LocateFixed, MapPin, Phone, UserRound } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function CustomerProfile() {
    const { auth, address, avatarUrl } = usePage<
        SharedData & {
            address?: { full_name: string; phone: string; line1: string; city: string; province: string; postal_code: string };
            avatarUrl?: string | null;
        }
    >().props;
    const { data, setData, post, processing, recentlySuccessful, errors } = useForm({
        _method: 'patch',
        name: auth.user?.name ?? '',
        email: auth.user?.email ?? '',
        phone: (auth.user?.phone as string | undefined) ?? '',
        avatar: null as File | null,
        address: {
            full_name: address?.full_name ?? auth.user?.name ?? '',
            phone: address?.phone ?? (auth.user?.phone as string | undefined) ?? '',
            line1: address?.line1 ?? '',
            city: address?.city ?? '',
            province: address?.province ?? '',
            postal_code: address?.postal_code ?? '',
        },
    });
    const mapRef = useRef<HTMLDivElement | null>(null);
    const mapInstance = useRef<any>(null);
    const markerInstance = useRef<any>(null);
    const [locationStatus, setLocationStatus] = useState('');

    useEffect(() => {
        if (data.address.phone !== data.phone) setData('address', { ...data.address, phone: data.phone });
    }, [data.phone]);

    useEffect(() => {
        if (!mapRef.current) return;

        const initializeMap = async () => {
            if (!(window as any).L) {
                const css = document.createElement('link');
                css.rel = 'stylesheet';
                css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                document.head.appendChild(css);

                await new Promise<void>((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
                    script.onload = () => resolve();
                    script.onerror = () => reject(new Error('Leaflet failed to load'));
                    document.body.appendChild(script);
                });
            }

            if (mapInstance.current || !(window as any).L || !mapRef.current) return;

            const L = (window as any).L;
            const map = L.map(mapRef.current, { scrollWheelZoom: true }).setView([14.5995, 120.9842], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
            }).addTo(map);

            const marker = L.marker([14.5995, 120.9842], { draggable: true }).addTo(map);
            mapInstance.current = map;
            markerInstance.current = marker;

            marker.on('dragend', (event: any) => {
                const { lat, lng } = event.target.getLatLng();
                geocodeLocation(lat, lng, 'Marker moved to a new location.');
            });

            map.on('click', (event: any) => {
                marker.setLatLng(event.latlng);
                geocodeLocation(event.latlng.lat, event.latlng.lng, 'Location picked from the map.');
            });
        };

        initializeMap().catch(() => {
            setLocationStatus('Map could not be loaded. You can still enter the address manually.');
        });

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
            if (markerInstance.current) {
                markerInstance.current = null;
            }
        };
    }, []);

    function geocodeLocation(lat: number, lon: number, successMessage: string) {
        fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Unable to resolve location');
                }
                return response.json();
            })
            .then((result) => {
                const displayName = result.display_name || '';
                const parts = displayName
                    .split(',')
                    .map((part: string) => part.trim())
                    .filter(Boolean);
                const road =
                    parts.find((part: string) => /\d/.test(part) && /street|road|ave|avenue|blvd|boulevard|lane|drive|way|st\.|street/i.test(part)) ||
                    parts[0] ||
                    '';
                const city = parts.find((part: string) => /city|municipality|town|village|barangay|subdivision/i.test(part)) || '';
                const province = parts.find((part: string) => /province|state|region/i.test(part)) || '';
                const postalCode = parts.find((part: string) => /^\d{4,5}$/.test(part)) || '';

                setData('address', {
                    ...data.address,
                    line1: road || data.address.line1 || 'Selected location',
                    city: city || data.address.city || '',
                    province: province || data.address.province || '',
                    postal_code: postalCode || data.address.postal_code || '',
                });

                if (mapInstance.current && markerInstance.current) {
                    mapInstance.current.setView([lat, lon], Math.max(mapInstance.current.getZoom(), 15));
                    markerInstance.current.setLatLng([lat, lon]);
                }

                setLocationStatus(successMessage);
            })
            .catch(() => {
                if (mapInstance.current && markerInstance.current) {
                    mapInstance.current.setView([lat, lon], Math.max(mapInstance.current.getZoom(), 15));
                    markerInstance.current.setLatLng([lat, lon]);
                }
                setLocationStatus('The map location was updated, but the address could not be resolved automatically.');
            });
    }

    function useCurrentLocation() {
        if (!navigator.geolocation) {
            setLocationStatus('Your browser does not support location detection.');
            return;
        }

        setLocationStatus('Getting your location...');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                geocodeLocation(latitude, longitude, 'Location picked and address filled automatically.');
                if (mapInstance.current && markerInstance.current) {
                    mapInstance.current.setView([latitude, longitude], 15);
                    markerInstance.current.setLatLng([latitude, longitude]);
                }
            },
            () => {
                setLocationStatus('Location permission was denied. You can still select a location on the map manually.');
            },
            { enableHighAccuracy: true, timeout: 20000 },
        );
    }

    function submit(event: React.FormEvent) {
        event.preventDefault();
        post(route('profile.update'), { forceFormData: true });
    }

    return (
        <>
            <Head title="Your profile" />
            <PortalLayout role="customer" title="Your profile" eyebrow="Account settings">
                <div className="overflow-hidden rounded-3xl border border-[#def0e2] bg-white shadow-[0_12px_35px_rgba(22,59,36,0.08)]">
                    <div className="relative overflow-hidden bg-[#163b24] px-6 py-8 text-white sm:px-10 sm:py-10">
                        <div className="absolute -right-12 -bottom-20 h-56 w-56 rounded-full border-28 border-[#2c9350]/30" />
                        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
                            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[28px] border-4 border-white/20 bg-[#e6f7eb] text-[#2c7a3b] shadow-xl">
                                {data.avatar ? (
                                    <img src={URL.createObjectURL(data.avatar)} alt="Profile preview" className="h-full w-full object-cover" />
                                ) : avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt="Profile"
                                        className="h-full w-full object-cover"
                                        onError={(event) => {
                                            event.currentTarget.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <UserRound size={36} />
                                )}
                            </div>
                            <div>
                                <p className="text-xs font-bold tracking-[0.18em] text-[#9ee0a3] uppercase">Account settings</p>
                                <h2 className="font-display mt-2 text-3xl font-bold">Make it yours.</h2>
                                <p className="mt-2 max-w-lg text-sm text-[#cce8d1]">
                                    Keep your contact details and delivery address ready for a smoother checkout.
                                </p>
                            </div>
                        </div>
                    </div>
                    <form onSubmit={submit} className="p-6 sm:p-10">
                        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
                            <div>
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9f6ea] text-[#2c7a3b]">
                                        <UserRound size={19} />
                                    </div>
                                    <div>
                                        <h3 className="font-display text-xl font-bold">Personal information</h3>
                                        <p className="text-sm text-[#8b8a96]">How we identify and contact you.</p>
                                    </div>
                                </div>
                                <div className="space-y-5">
                                    <label className="block text-sm font-semibold">
                                        Full name
                                        <input
                                            placeholder="e.g. Juan Dela Cruz"
                                            value={data.name}
                                            onChange={(event) => setData('name', event.target.value)}
                                            className="mt-2 w-full rounded-xl border border-[#dfe9e1] bg-[#fbfefb] px-4 py-3 text-sm outline-none placeholder:text-[#a4b2a7] focus:border-[#3fa34d] focus:ring-4 focus:ring-[#e3f3e4]"
                                        />
                                        <InputError message={errors.name} className="mt-2" />
                                    </label>
                                    <label className="block text-sm font-semibold">
                                        Email address
                                        <input
                                            type="email"
                                            placeholder="you@example.com"
                                            value={data.email}
                                            onChange={(event) => setData('email', event.target.value)}
                                            className="mt-2 w-full rounded-xl border border-[#dfe9e1] bg-[#fbfefb] px-4 py-3 text-sm outline-none placeholder:text-[#a4b2a7] focus:border-[#3fa34d] focus:ring-4 focus:ring-[#e3f3e4]"
                                        />
                                        <InputError message={errors.email} className="mt-2" />
                                    </label>
                                    <label className="block text-sm font-semibold">
                                        <span className="flex items-center gap-2">
                                            <Phone size={15} className="text-[#3fa34d]" />
                                            Phone number
                                        </span>
                                        <input
                                            placeholder="e.g. 0917 123 4567"
                                            value={data.phone}
                                            onChange={(event) => setData('phone', event.target.value)}
                                            className="mt-2 w-full rounded-xl border border-[#dfe9e1] bg-[#fbfefb] px-4 py-3 text-sm outline-none placeholder:text-[#a4b2a7] focus:border-[#3fa34d] focus:ring-4 focus:ring-[#e3f3e4]"
                                        />
                                        <InputError message={errors.phone} className="mt-2" />
                                    </label>
                                </div>
                            </div>
                            <div>
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff3d6] text-[#946a0c]">
                                        <MapPin size={19} />
                                    </div>
                                    <div>
                                        <h3 className="font-display text-xl font-bold">Delivery address</h3>
                                        <p className="text-sm text-[#8b8a96]">This address will be used at checkout.</p>
                                    </div>
                                </div>
                                <div className="mb-5 rounded-2xl border border-[#dfe9e1] bg-[#f8fbf9] p-4">
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-bold text-[#163b24]">Pick location</p>
                                            <p className="text-xs text-[#647568]">
                                                Use your current place or tap and drag on the map to set the delivery point.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={useCurrentLocation}
                                            className="inline-flex items-center gap-2 rounded-full bg-[#1f7a42] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#185f35]"
                                        >
                                            <LocateFixed size={14} /> Use my location
                                        </button>
                                    </div>
                                    {locationStatus && <p className="mb-3 text-xs font-medium text-[#2d6a4f]">{locationStatus}</p>}
                                    <div ref={mapRef} className="h-64 w-full overflow-hidden rounded-2xl border border-[#dfe9e1]" />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    {(['full_name', 'line1', 'city', 'province', 'postal_code'] as const).map((field) => (
                                        <label key={field} className="block text-sm font-semibold">
                                            {field === 'line1'
                                                ? 'Street address'
                                                : field === 'full_name'
                                                  ? 'Recipient name'
                                                  : field === 'postal_code'
                                                    ? 'Postal code'
                                                    : field.replace('_', ' ')}
                                            <input
                                                required
                                                placeholder={
                                                    {
                                                        full_name: 'Name on the delivery',
                                                        line1: 'House number and street',
                                                        city: 'City or municipality',
                                                        province: 'Province',
                                                        postal_code: 'e.g. 1000',
                                                    }[field]
                                                }
                                                value={data.address[field]}
                                                onChange={(event) => setData('address', { ...data.address, [field]: event.target.value })}
                                                className="mt-2 w-full rounded-xl border border-[#dfe9e1] bg-[#fbfefb] px-4 py-3 text-sm outline-none placeholder:text-[#a4b2a7] focus:border-[#3fa34d] focus:ring-4 focus:ring-[#e3f3e4]"
                                            />
                                            <InputError message={errors[`address.${field}`]} className="mt-2" />
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="mt-10 flex flex-col gap-4 border-t border-[#edf2ed] pt-6 sm:flex-row sm:items-center">
                            <label className="flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-[#cdebcf] bg-[#f5fcf7] px-4 py-3 text-sm font-semibold text-[#2c7a3b] transition hover:border-[#3fa34d]">
                                <ImagePlus size={17} /> Change profile image
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    className="hidden"
                                    onChange={(event) => setData('avatar', event.target.files?.[0] ?? null)}
                                />
                            </label>
                            <InputError message={errors.avatar} />
                            <button
                                disabled={processing}
                                className="rounded-[14px] bg-[#1b1a20] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#2c7a3b] disabled:opacity-50 sm:ml-auto"
                            >
                                {processing ? 'Saving...' : 'Save profile'}
                            </button>
                            {recentlySuccessful && (
                                <span className="flex items-center gap-1.5 text-sm font-semibold text-[#2c7a3b]">
                                    <Check size={16} /> Saved
                                </span>
                            )}
                        </div>
                    </form>
                </div>
            </PortalLayout>
        </>
    );
}

import { Download, Plus, Share, Smartphone, X } from 'lucide-react';
import { useEffect, useState } from 'react';

type InstallPromptEvent = Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const dismissedKey = 'bsabshop-pwa-install-dismissed';

function isIOSDevice() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export default function PWAInstallPrompt() {
    const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
    const [showIOS, setShowIOS] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);
    const [dismissed, setDismissed] = useState(true);
    const [installed, setInstalled] = useState(false);

    useEffect(() => {
        const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
        const wasDismissed = window.localStorage.getItem(dismissedKey) === 'true';
        setInstalled(standalone);
        setDismissed(wasDismissed);
        if (!standalone && !wasDismissed && isIOSDevice()) setShowIOS(true);

        function handleBeforeInstall(event: Event) {
            event.preventDefault();
            setInstallEvent(event as InstallPromptEvent);
        }

        function handleInstalled() {
            setInstalled(true);
            setInstallEvent(null);
            setShowIOS(false);
            setShowInstructions(false);
        }

        function handleInstallRequest() {
            if (installed) return;

            setDismissed(false);
            if (installEvent) {
                setShowIOS(false);
                setShowInstructions(false);
                void install(installEvent);
            } else if (isIOSDevice()) {
                setShowIOS(true);
                setShowInstructions(false);
            } else {
                setShowIOS(false);
                setShowInstructions(true);
            }
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);
        window.addEventListener('appinstalled', handleInstalled);
        window.addEventListener('bsabshop:request-install', handleInstallRequest);
        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
            window.removeEventListener('appinstalled', handleInstalled);
            window.removeEventListener('bsabshop:request-install', handleInstallRequest);
        };
    }, [installEvent, installed]);

    function dismiss() {
        window.localStorage.setItem(dismissedKey, 'true');
        setDismissed(true);
        setInstallEvent(null);
        setShowIOS(false);
        setShowInstructions(false);
    }

    async function install(event = installEvent) {
        if (!event) {
            setShowIOS(isIOSDevice());
            setShowInstructions(!isIOSDevice());
            return;
        }

        await event.prompt();
        const choice = await event.userChoice;
        setInstallEvent(null);
        if (choice.outcome === 'dismissed') dismiss();
        else setInstalled(true);
    }

    if (dismissed || installed || (!installEvent && !showIOS && !showInstructions)) return null;

    return (
        <aside className="fixed right-3 bottom-[calc(76px+env(safe-area-inset-bottom))] z-50 w-[min(390px,calc(100vw-24px))] rounded-xl border border-[#d7e8dc] bg-white p-4 text-[#173b2a] shadow-[0_12px_34px_rgba(23,59,42,0.18)] md:right-5 md:bottom-5" aria-label="Install BSAB-SHOP">
            <button type="button" onClick={dismiss} aria-label="Dismiss install prompt" className="absolute top-3 right-3 grid h-8 w-8 place-items-center rounded-full text-[#647568] hover:bg-[#f5fcf7]"><X size={17} /></button>
            <div className="flex items-start gap-3 pr-7">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e8f4e8] text-[#1f7a42]"><Smartphone size={21} /></span>
                <div>
                    <h2 className="text-sm font-bold">Install BSAB-SHOP</h2>
                    <p className="mt-1 text-xs leading-5 text-[#647568]">Keep the marketplace close from your home screen.</p>
                </div>
            </div>
            {showIOS ? (
                <div className="mt-3 rounded-lg bg-[#f5faf5] p-3 text-xs leading-5 text-[#496554]">
                    <p>To add BSAB-SHOP to your Home Screen:</p>
                    <p className="mt-1 flex items-center gap-1.5"><Share size={14} className="shrink-0 text-[#1f7a42]" />Tap Share, then choose <strong>Add to Home Screen</strong>.</p>
                    <p className="mt-1 flex items-center gap-1.5"><Plus size={14} className="shrink-0 text-[#1f7a42]" />Confirm by tapping Add.</p>
                </div>
            ) : showInstructions ? (
                <div className="mt-3 rounded-lg bg-[#f5faf5] p-3 text-xs leading-5 text-[#496554]">
                    <p>To install BSAB-SHOP, open your browser menu and choose <strong>Install app</strong> or <strong>Add to Home Screen</strong>.</p>
                </div>
            ) : (
                <button type="button" onClick={install} className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#1f7a42] px-4 text-xs font-bold text-white transition hover:bg-[#186a3a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f7a42]"><Download size={15} />Install BSAB-SHOP</button>
            )}
        </aside>
    );
}
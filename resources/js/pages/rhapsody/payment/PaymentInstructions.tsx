import { Copy, QrCode, Timer } from 'lucide-react';
import { studioImages } from '@/lib/rhapsody-data';

export function PaymentInstructions() {
    return (
        <section className="grid gap-5 xl:grid-cols-[360px_1fr]">
            <QrisPanel />

            <div className="grid gap-5">
                <PaymentTimerCard />
                <VirtualAccountCard />
                <CashAtStudioCard />
            </div>
        </section>
    );
}

function QrisPanel() {
    return (
        <div className="rounded-lg border border-border bg-primary p-7 text-primary-foreground">
            <div className="mx-auto grid aspect-square max-w-[260px] place-items-center rounded-sm border-8 border-primary-foreground bg-primary">
                <QrCode className="size-40 stroke-[1.5]" />
            </div>
            <p className="mt-5 text-center text-sm font-bold tracking-[0.18em] uppercase">
                Scan QRIS
            </p>
        </div>
    );
}

function PaymentTimerCard() {
    return (
        <article className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-start gap-4">
                <Timer className="size-7 text-white" />
                <div>
                    <p className="font-['Montserrat'] text-2xl font-bold text-white">
                        14:59
                    </p>
                    <p className="text-sm font-semibold text-muted-foreground">
                        Selesaikan pembayaran sebelum waktu habis.
                    </p>
                </div>
            </div>
        </article>
    );
}

function VirtualAccountCard() {
    return (
        <article className="rounded-lg border border-border bg-card p-5">
            <p className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">
                Virtual Account
            </p>
            <div className="mt-3 flex items-center gap-3">
                <p className="min-w-0 flex-1 font-mono text-2xl font-bold text-white">
                    8808 9928 3421
                </p>
                <button
                    type="button"
                    aria-label="Copy virtual account"
                    className="grid size-11 place-items-center rounded-md border border-border text-white"
                >
                    <Copy className="size-5" />
                </button>
            </div>
        </article>
    );
}

function CashAtStudioCard() {
    return (
        <article className="relative overflow-hidden rounded-lg border border-border bg-card p-5">
            <img
                src={studioImages.engineer}
                alt="Audio engineer"
                className="absolute inset-y-0 right-0 hidden h-full w-44 object-cover opacity-40 grayscale md:block"
            />
            <div className="relative max-w-sm">
                <p className="font-['Montserrat'] text-xl font-bold text-white">
                    Cash at Studio
                </p>
                <p className="mt-2 text-sm font-semibold text-muted-foreground">
                    Head to Rhapsody Studio reception within 15 minutes.
                </p>
            </div>
        </article>
    );
}

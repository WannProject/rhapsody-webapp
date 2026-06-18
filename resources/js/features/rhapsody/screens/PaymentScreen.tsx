import { Copy, QrCode, ShieldCheck, Timer } from 'lucide-react';
import { SectionHeader } from '@/features/rhapsody/components/SectionHeader';
import { SummaryCard } from '@/features/rhapsody/components/SummaryCard';
import {
    bookingSummary,
    paymentMethods,
    studioImages,
} from '@/features/rhapsody/data/rhapsody-data';
import type { RhapsodyView } from '@/features/rhapsody/types';

type PaymentScreenProps = {
    onViewChange: (view: RhapsodyView) => void;
};

export function PaymentScreen({ onViewChange }: PaymentScreenProps) {
    return (
        <div className="mx-auto grid max-w-6xl gap-8">
            <SectionHeader
                eyebrow="Payment Gateway"
                title="Pembayaran"
                action="Transaksi Terenkripsi"
            />

            <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
                <div className="grid gap-6">
                    <div className="rounded-lg border border-[#353535] bg-[#1b1b1b] p-5 md:p-6">
                        <p className="text-sm font-semibold text-[#8e9192]">
                            Total Pembayaran
                        </p>
                        <p className="mt-2 font-['Montserrat'] text-[44px] leading-none font-extrabold text-white">
                            Rp 300.000
                        </p>
                        <p className="mt-3 text-[#c4c7c8]">
                            Studio A - 2 jam - Sabtu, 22 Juni 2026
                        </p>
                    </div>

                    <section className="grid gap-4">
                        <h3 className="text-xs font-bold tracking-[0.22em] text-[#8e9192] uppercase">
                            Pilih Metode Pembayaran
                        </h3>
                        <div className="grid gap-3 md:grid-cols-3">
                            {paymentMethods.map((method, index) => {
                                const Icon = method.icon;

                                return (
                                    <button
                                        key={method.name}
                                        type="button"
                                        className={[
                                            'min-h-[156px] rounded-md border p-4 text-left transition',
                                            index === 0
                                                ? 'border-white bg-white text-[#131313]'
                                                : 'border-[#353535] bg-[#1b1b1b] text-white hover:border-white/70',
                                        ].join(' ')}
                                    >
                                        <Icon className="size-8" />
                                        <p className="mt-5 font-['Montserrat'] text-lg font-bold">
                                            {method.name}
                                        </p>
                                        <p
                                            className={[
                                                'mt-2 text-sm leading-relaxed font-semibold',
                                                index === 0
                                                    ? 'text-[#454747]'
                                                    : 'text-[#8e9192]',
                                            ].join(' ')}
                                        >
                                            {method.description}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    <section className="grid gap-5 xl:grid-cols-[360px_1fr]">
                        <div className="rounded-lg border border-[#353535] bg-white p-7 text-[#131313]">
                            <div className="mx-auto grid aspect-square max-w-[260px] place-items-center rounded-sm border-8 border-[#131313] bg-white">
                                <QrCode className="size-40 stroke-[1.5]" />
                            </div>
                            <p className="mt-5 text-center text-sm font-bold tracking-[0.18em] uppercase">
                                Scan QRIS
                            </p>
                        </div>

                        <div className="grid gap-5">
                            <article className="rounded-lg border border-[#353535] bg-[#1b1b1b] p-5">
                                <div className="flex items-start gap-4">
                                    <Timer className="size-7 text-white" />
                                    <div>
                                        <p className="font-['Montserrat'] text-2xl font-bold text-white">
                                            14:59
                                        </p>
                                        <p className="text-sm font-semibold text-[#c4c7c8]">
                                            Selesaikan pembayaran sebelum waktu
                                            habis.
                                        </p>
                                    </div>
                                </div>
                            </article>

                            <article className="rounded-lg border border-[#353535] bg-[#1b1b1b] p-5">
                                <p className="text-xs font-bold tracking-[0.2em] text-[#8e9192] uppercase">
                                    Virtual Account
                                </p>
                                <div className="mt-3 flex items-center gap-3">
                                    <p className="min-w-0 flex-1 font-mono text-2xl font-bold text-white">
                                        8808 9928 3421
                                    </p>
                                    <button
                                        type="button"
                                        aria-label="Copy virtual account"
                                        className="grid size-11 place-items-center rounded-md border border-[#444748] text-white"
                                    >
                                        <Copy className="size-5" />
                                    </button>
                                </div>
                            </article>

                            <article className="relative overflow-hidden rounded-lg border border-[#353535] bg-[#1b1b1b] p-5">
                                <img
                                    src={studioImages.engineer}
                                    alt="Audio engineer"
                                    className="absolute inset-y-0 right-0 hidden h-full w-44 object-cover opacity-40 grayscale md:block"
                                />
                                <div className="relative max-w-sm">
                                    <p className="font-['Montserrat'] text-xl font-bold text-white">
                                        Cash at Studio
                                    </p>
                                    <p className="mt-2 text-sm font-semibold text-[#c4c7c8]">
                                        Head to Rhapsody Studio reception within
                                        15 minutes.
                                    </p>
                                </div>
                            </article>
                        </div>
                    </section>
                </div>

                <aside className="grid gap-5 self-start lg:sticky lg:top-28">
                    <SummaryCard items={bookingSummary} />
                    <div className="rounded-lg border border-[#353535] bg-[#1b1b1b] p-5">
                        <div className="flex items-center gap-3 text-white">
                            <ShieldCheck className="size-6" />
                            <span className="font-bold">
                                Transaksi Terenkripsi & Aman
                            </span>
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-[#8e9192]">
                            Jika pembayaran belum terdeteksi setelah 5 menit,
                            hubungi support dengan ID RHAP-99283-XP.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => onViewChange('success')}
                        className="min-h-[56px] rounded-md bg-white px-5 text-base font-extrabold tracking-wide text-[#131313] transition hover:bg-[#e5e2e1]"
                    >
                        Konfirmasi Pembayaran
                    </button>
                </aside>
            </section>
        </div>
    );
}

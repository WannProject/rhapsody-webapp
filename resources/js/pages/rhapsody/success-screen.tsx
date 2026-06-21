import {
    CalendarCheck2,
    Download,
    Home,
    QrCode,
    Share2,
    TicketCheck,
} from 'lucide-react';
import { SectionHeader } from '@/components/rhapsody/section-header';
import { SummaryCard } from '@/components/rhapsody/summary-card';
import { bookingSummary } from '@/lib/rhapsody-data';
import type { RhapsodyView } from '@/types/rhapsody';

type SuccessScreenProps = {
    onViewChange: (view: RhapsodyView) => void;
};

export function SuccessScreen({ onViewChange }: SuccessScreenProps) {
    return (
        <div className="mx-auto grid max-w-5xl gap-8">
            <SectionHeader
                eyebrow="Booking Confirmed"
                title="Transaksi Berhasil"
                action="Invoice #4210"
            />

            <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
                <article className="rounded-lg border border-border bg-card p-6 md:p-8">
                    <div className="mx-auto grid size-24 place-items-center rounded-full border border-primary bg-primary text-primary-foreground">
                        <TicketCheck className="size-12" />
                    </div>
                    <div className="mx-auto mt-7 max-w-xl text-center">
                        <h2 className="font-['Montserrat'] text-[38px] leading-tight font-extrabold text-white">
                            Booking Anda sudah aktif
                        </h2>
                        <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
                            Bukti transaksi dan QR check-in telah dibuat untuk
                            sesi Studio A.
                        </p>
                    </div>

                    <div className="mx-auto mt-8 grid aspect-square max-w-[184px] place-items-center rounded-md bg-primary text-primary-foreground">
                        <QrCode className="size-32 stroke-[1.5]" />
                    </div>

                    <div className="mt-8 grid gap-3 md:grid-cols-2">
                        <button
                            type="button"
                            className="flex min-h-[56px] items-center justify-center gap-2 rounded-md bg-primary px-5 font-extrabold text-primary-foreground"
                        >
                            <Download className="size-5" />
                            Simpan Bukti Transaksi
                        </button>
                        <button
                            type="button"
                            className="flex min-h-[56px] items-center justify-center gap-2 rounded-md border border-primary px-5 font-extrabold text-white"
                        >
                            <Share2 className="size-5" />
                            Bagikan
                        </button>
                    </div>
                </article>

                <aside className="grid gap-5 self-start">
                    <SummaryCard
                        items={[
                            ['No. Booking', 'RHP-4210-A'],
                            ['Waktu Booking', '11:00 - 13:00'],
                            ...bookingSummary.slice(0, 2),
                        ]}
                    />
                    <button
                        type="button"
                        onClick={() => onViewChange('schedule')}
                        className="flex min-h-[56px] items-center justify-center gap-2 rounded-md border border-border bg-card px-5 font-bold text-white transition hover:border-primary"
                    >
                        <CalendarCheck2 className="size-5" />
                        Lihat Jadwal
                    </button>
                    <button
                        type="button"
                        onClick={() => onViewChange('home')}
                        className="flex min-h-[56px] items-center justify-center gap-2 rounded-md bg-primary px-5 font-extrabold text-primary-foreground"
                    >
                        <Home className="size-5" />
                        Kembali ke Home
                    </button>
                </aside>
            </section>
        </div>
    );
}

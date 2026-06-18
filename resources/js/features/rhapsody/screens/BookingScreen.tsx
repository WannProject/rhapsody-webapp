import {
    CalendarDays,
    Check,
    ChevronDown,
    Clock3,
    Music,
    SlidersHorizontal,
} from 'lucide-react';
import { SectionHeader } from '@/features/rhapsody/components/SectionHeader';
import { SummaryCard } from '@/features/rhapsody/components/SummaryCard';
import {
    bookingSummary,
    instruments,
    priorityCriteria,
    studioImages,
} from '@/features/rhapsody/data/rhapsody-data';
import type { RhapsodyView } from '@/features/rhapsody/types';

type BookingScreenProps = {
    onViewChange: (view: RhapsodyView) => void;
};

export function BookingScreen({ onViewChange }: BookingScreenProps) {
    return (
        <div className="mx-auto grid max-w-6xl gap-8">
            <SectionHeader
                eyebrow="Studio Booking"
                title="Formulir Booking"
                action="Step 2 dari 4"
            />

            <section className="grid gap-6 lg:grid-cols-[1fr_390px]">
                <div className="grid gap-6">
                    <article className="relative min-h-[340px] overflow-hidden rounded-lg border border-[#353535] bg-[#1b1b1b]">
                        <img
                            src={studioImages.console}
                            alt="Studio recording console"
                            className="absolute inset-0 h-full w-full object-cover brightness-75 contrast-125 grayscale"
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.88))]" />
                        <div className="relative flex min-h-[340px] flex-col justify-end p-5 md:p-7">
                            <span className="mb-3 w-fit rounded-full bg-white px-3 py-1 text-[11px] font-extrabold text-[#131313] uppercase">
                                Selected Studio
                            </span>
                            <h3 className="font-['Montserrat'] text-3xl font-bold text-white">
                                Studio Alpha - Pro
                            </h3>
                            <p className="mt-2 max-w-xl text-[#c4c7c8]">
                                Ruang recording premium dengan acoustic panel,
                                grand piano, dan console siap produksi.
                            </p>
                        </div>
                    </article>

                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="grid gap-2">
                            <span className="text-xs font-bold tracking-[0.2em] text-[#8e9192] uppercase">
                                Tanggal
                            </span>
                            <span className="flex items-center gap-3 rounded-md border border-[#353535] bg-[#1b1b1b] px-4 py-4 text-white">
                                <CalendarDays className="size-5 text-[#c4c7c8]" />
                                Sabtu, 22 Juni 2026
                                <ChevronDown className="ml-auto size-5 text-[#8e9192]" />
                            </span>
                        </label>
                        <label className="grid gap-2">
                            <span className="text-xs font-bold tracking-[0.2em] text-[#8e9192] uppercase">
                                Waktu
                            </span>
                            <span className="flex items-center gap-3 rounded-md border border-[#353535] bg-[#1b1b1b] px-4 py-4 text-white">
                                <Clock3 className="size-5 text-[#c4c7c8]" />
                                11:00 - 13:00
                                <ChevronDown className="ml-auto size-5 text-[#8e9192]" />
                            </span>
                        </label>
                    </div>

                    <section className="grid gap-4">
                        <SectionHeader
                            eyebrow="Instrument Setup"
                            title="Pilih Alat Musik"
                        />
                        <div className="grid gap-3 md:grid-cols-2">
                            {instruments.map((instrument) => (
                                <button
                                    key={instrument.name}
                                    type="button"
                                    className={[
                                        'flex min-h-[96px] items-center gap-4 rounded-md border p-4 text-left transition',
                                        instrument.selected
                                            ? 'border-white bg-white text-[#131313]'
                                            : 'border-[#353535] bg-[#1b1b1b] text-white hover:border-white/70',
                                    ].join(' ')}
                                >
                                    <span
                                        className={[
                                            'grid size-11 shrink-0 place-items-center rounded-sm border',
                                            instrument.selected
                                                ? 'border-[#131313] bg-[#131313] text-white'
                                                : 'border-[#444748] text-[#c4c7c8]',
                                        ].join(' ')}
                                    >
                                        {instrument.selected ? (
                                            <Check className="size-5" />
                                        ) : (
                                            <Music className="size-5" />
                                        )}
                                    </span>
                                    <span>
                                        <span className="block font-['Montserrat'] text-lg font-bold">
                                            {instrument.name}
                                        </span>
                                        <span
                                            className={[
                                                'mt-1 block text-sm font-semibold',
                                                instrument.selected
                                                    ? 'text-[#454747]'
                                                    : 'text-[#8e9192]',
                                            ].join(' ')}
                                        >
                                            {instrument.detail}
                                        </span>
                                    </span>
                                </button>
                            ))}
                        </div>
                        <label className="grid gap-2">
                            <span className="text-xs font-bold tracking-[0.2em] text-[#8e9192] uppercase">
                                Tambahan Alat Lainnya
                            </span>
                            <textarea
                                className="min-h-[112px] rounded-md border border-[#353535] bg-[#1b1b1b] px-4 py-3 text-white transition outline-none placeholder:text-[#656464] focus:border-white"
                                placeholder="Tulis kebutuhan tambahan..."
                            />
                        </label>
                    </section>
                </div>

                <aside className="grid gap-5 self-start lg:sticky lg:top-28">
                    <SummaryCard items={bookingSummary} />
                    <div className="rounded-lg border border-[#353535] bg-[#1b1b1b] p-5">
                        <div className="mb-5 flex items-center gap-3">
                            <SlidersHorizontal className="size-5 text-white" />
                            <h3 className="font-['Montserrat'] text-xl font-bold text-white">
                                Sesuaikan Kriteria Prioritas
                            </h3>
                        </div>
                        <div className="grid gap-4">
                            {priorityCriteria.map((criterion) => (
                                <div key={criterion.label}>
                                    <div className="mb-2 flex justify-between text-sm font-semibold">
                                        <span className="text-[#c4c7c8]">
                                            {criterion.label}
                                        </span>
                                        <span className="text-white">
                                            {criterion.value}%
                                        </span>
                                    </div>
                                    <div className="h-2 rounded-full bg-[#353535]">
                                        <div
                                            className="h-full rounded-full bg-white"
                                            style={{
                                                width: `${criterion.value}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => onViewChange('payment')}
                        className="min-h-[56px] rounded-md bg-white px-5 text-base font-extrabold tracking-wide text-[#131313] transition hover:bg-[#e5e2e1]"
                    >
                        Lanjut ke Pembayaran
                    </button>
                </aside>
            </section>
        </div>
    );
}

import { Check, Music } from 'lucide-react';
import { SectionHeader } from '@/features/rhapsody/components/SectionHeader';
import { instruments } from '@/features/rhapsody/data/rhapsody-data';
import type { Instrument } from '@/features/rhapsody/types';

export function InstrumentSelector() {
    return (
        <section className="grid gap-4">
            <SectionHeader
                eyebrow="Instrument Setup"
                title="Pilih Alat Musik"
            />
            <div className="grid gap-3 md:grid-cols-2">
                {instruments.map((instrument) => (
                    <InstrumentOption
                        key={instrument.name}
                        instrument={instrument}
                    />
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
    );
}

type InstrumentOptionProps = {
    instrument: Instrument;
};

function InstrumentOption({ instrument }: InstrumentOptionProps) {
    return (
        <button
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
    );
}

import { Check, Music } from 'lucide-react';
import { SectionHeader } from '@/components/rhapsody/section-header';
import { instruments } from '@/lib/rhapsody-data';
import type { Instrument } from '@/types/rhapsody';

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
                <span className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase">
                    Tambahan Alat Lainnya
                </span>
                <textarea
                    className="min-h-[112px] rounded-md border border-border bg-card px-4 py-3 text-white transition outline-none placeholder:text-muted-foreground/50 focus:border-primary"
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
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-white hover:border-primary/70',
            ].join(' ')}
        >
            <span
                className={[
                    'grid size-11 shrink-0 place-items-center rounded-sm border',
                    instrument.selected
                        ? 'border-primary-foreground bg-background text-white'
                        : 'border-border text-muted-foreground',
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
                            ? 'text-muted-foreground/60'
                            : 'text-muted-foreground',
                    ].join(' ')}
                >
                    {instrument.detail}
                </span>
            </span>
        </button>
    );
}

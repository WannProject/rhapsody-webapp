import { ArrowRight, Clock3, SlidersHorizontal } from 'lucide-react';
import { SectionHeader } from '@/components/rhapsody/section-header';
import { scheduleSlots, studios } from '@/lib/rhapsody-data';
import type { RhapsodyView } from '@/types/rhapsody';

type ScheduleScreenProps = {
    onViewChange: (view: RhapsodyView) => void;
};

export function ScheduleScreen({ onViewChange }: ScheduleScreenProps) {
    return (
        <div className="mx-auto grid max-w-6xl gap-8">
            <SectionHeader
                eyebrow="Studio Schedule"
                title="Jadwal Studio"
                action="22 Juni 2026"
            />

            <section className="overflow-hidden rounded-lg border border-border bg-background">
                <div className="grid grid-cols-3 border-b border-border">
                    {studios.map((studio, index) => (
                        <button
                            key={studio.id}
                            type="button"
                            className={[
                                'py-4 text-xs font-extrabold tracking-[0.2em] uppercase transition',
                                index === 0
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-white',
                            ].join(' ')}
                        >
                            {studio.name}
                        </button>
                    ))}
                </div>

                <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
                    {scheduleSlots.map((slot) => {
                        const isBooked = slot.status === 'booked';
                        const isPromo = slot.status === 'promo';

                        return (
                            <button
                                key={slot.time}
                                type="button"
                                disabled={isBooked}
                                onClick={() => onViewChange('booking')}
                                className={[
                                    'group min-h-[132px] rounded-md border p-4 text-left transition',
                                    isBooked
                                        ? 'cursor-not-allowed border-border bg-background opacity-55'
                                        : 'border-border bg-card hover:border-primary',
                                    isPromo ? 'ring-1 ring-white/40' : '',
                                ].join(' ')}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="font-['Montserrat'] text-3xl font-bold text-white">
                                            {slot.time}
                                        </p>
                                        <p className="mt-2 text-sm font-bold tracking-[0.16em] text-muted-foreground uppercase">
                                            {slot.label}
                                        </p>
                                    </div>
                                    <Clock3 className="size-6 text-muted-foreground group-hover:text-white" />
                                </div>
                                <div className="mt-5 flex items-end justify-between gap-3">
                                    <p className="font-semibold text-white">
                                        {slot.price}
                                    </p>
                                    {!isBooked && (
                                        <ArrowRight className="size-5 text-muted-foreground" />
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </section>

            <section className="grid gap-4 rounded-lg border border-border bg-card p-5 md:grid-cols-[auto_1fr_auto] md:items-center">
                <span className="grid size-14 place-items-center rounded-sm bg-primary text-primary-foreground">
                    <SlidersHorizontal className="size-7" />
                </span>
                <div>
                    <h3 className="font-['Montserrat'] text-2xl font-bold text-white">
                        Harga Promo Aktif
                    </h3>
                    <p className="mt-1 text-muted-foreground">
                        Slot 11:00 dan 19:00 mendapat harga khusus untuk
                        optimasi okupansi studio.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => onViewChange('booking')}
                    className="rounded-md bg-primary px-5 py-3 text-sm font-extrabold tracking-wide text-primary-foreground"
                >
                    Booking Slot
                </button>
            </section>
        </div>
    );
}

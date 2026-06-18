import { ArrowRight, Clock3, SlidersHorizontal } from 'lucide-react';
import { SectionHeader } from '@/features/rhapsody/components/SectionHeader';
import { scheduleSlots, studios } from '@/features/rhapsody/data/rhapsody-data';
import type { RhapsodyView } from '@/features/rhapsody/types';

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

            <section className="overflow-hidden rounded-lg border border-[#353535] bg-[#131313]">
                <div className="grid grid-cols-3 border-b border-[#353535]">
                    {studios.map((studio, index) => (
                        <button
                            key={studio.id}
                            type="button"
                            className={[
                                'py-4 text-xs font-extrabold tracking-[0.2em] uppercase transition',
                                index === 0
                                    ? 'bg-white text-[#131313]'
                                    : 'text-[#c4c7c8] hover:text-white',
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
                                        ? 'cursor-not-allowed border-[#2a2a2a] bg-[#101010] opacity-55'
                                        : 'border-[#353535] bg-[#1b1b1b] hover:border-white',
                                    isPromo ? 'ring-1 ring-white/40' : '',
                                ].join(' ')}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="font-['Montserrat'] text-3xl font-bold text-white">
                                            {slot.time}
                                        </p>
                                        <p className="mt-2 text-sm font-bold tracking-[0.16em] text-[#c4c7c8] uppercase">
                                            {slot.label}
                                        </p>
                                    </div>
                                    <Clock3 className="size-6 text-[#8e9192] group-hover:text-white" />
                                </div>
                                <div className="mt-5 flex items-end justify-between gap-3">
                                    <p className="font-semibold text-white">
                                        {slot.price}
                                    </p>
                                    {!isBooked && (
                                        <ArrowRight className="size-5 text-[#c4c7c8]" />
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </section>

            <section className="grid gap-4 rounded-lg border border-[#353535] bg-[#1b1b1b] p-5 md:grid-cols-[auto_1fr_auto] md:items-center">
                <span className="grid size-14 place-items-center rounded-sm bg-white text-[#131313]">
                    <SlidersHorizontal className="size-7" />
                </span>
                <div>
                    <h3 className="font-['Montserrat'] text-2xl font-bold text-white">
                        Harga Promo Aktif
                    </h3>
                    <p className="mt-1 text-[#c4c7c8]">
                        Slot 11:00 dan 19:00 mendapat harga khusus untuk
                        optimasi okupansi studio.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => onViewChange('booking')}
                    className="rounded-md bg-white px-5 py-3 text-sm font-extrabold tracking-wide text-[#131313]"
                >
                    Booking Slot
                </button>
            </section>
        </div>
    );
}

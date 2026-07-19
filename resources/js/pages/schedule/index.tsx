import { Head, usePage } from '@inertiajs/react';
import { ArrowRight, Clock3, SlidersHorizontal } from 'lucide-react';
import RhapsodyLayout from '@/layouts/rhapsody-layout';

type ScheduleProps = {
    selectedDate: string;
    studio: {
        name: string;
        opensAt: string;
        closesAt: string;
        slotDurationMinutes: number;
        hourlyRate: number;
    };
    scheduleSlots: Array<{
        time: string;
        endsAt: string;
        available: boolean;
        price: string;
        statusLabel: string;
        booking?: { customerName: string };
    }>;
    paymentMethods: Array<{
        id: number;
        type: string;
        name: string;
        instructions: string | null;
        isActive: boolean;
    }>;
};

export default function SchedulePage() {
    const { selectedDate, studio, scheduleSlots } =
        usePage<ScheduleProps>().props;

    return (
        <>
            <Head title="RHAPSODY | Schedule" />
            <RhapsodyLayout>
                <div className="mx-auto grid max-w-6xl gap-8">
                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-xs font-bold tracking-[0.22em] text-muted-foreground uppercase">
                                Studio Schedule
                            </p>
                            <h1 className="font-display text-[40px] leading-[1.05] font-extrabold text-primary md:text-[48px]">
                                Jadwal Studio
                            </h1>
                            <p className="mt-2 text-muted-foreground">
                                {studio.name} · {studio.opensAt} -{' '}
                                {studio.closesAt}
                            </p>
                        </div>
                        <div className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-primary">
                            {selectedDate}
                        </div>
                    </div>

                    <section className="overflow-hidden rounded-lg border border-border">
                        <div className="grid grid-cols-1 border-b border-border">
                            <div className="bg-primary px-5 py-4 text-xs font-extrabold tracking-[0.2em] text-primary-foreground uppercase">
                                {studio.name} · {selectedDate}
                            </div>
                        </div>
                        <div className="grid gap-3 p-4 md:grid-cols-3 xl:grid-cols-4">
                            {scheduleSlots.map((slot) => {
                                const isBooked = !slot.available;

                                return (
                                    <div
                                        key={slot.time}
                                        className={[
                                            'group min-h-[120px] rounded-md border p-4 text-left transition',
                                            isBooked
                                                ? 'cursor-not-allowed border-border bg-background opacity-55'
                                                : 'border-border bg-card hover:border-primary',
                                        ].join(' ')}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="font-display text-2xl font-bold text-primary">
                                                    {slot.time}
                                                </p>
                                                <p className="mt-1 text-xs font-bold tracking-[0.16em] text-muted-foreground uppercase">
                                                    {slot.statusLabel}
                                                </p>
                                            </div>
                                            <Clock3 className="size-5 text-muted-foreground" />
                                        </div>
                                        <div className="mt-4 flex items-end justify-between gap-3">
                                            <p className="text-sm font-semibold text-primary">
                                                {isBooked
                                                    ? slot.booking?.customerName
                                                    : slot.price}
                                            </p>
                                            {!isBooked && (
                                                <ArrowRight className="size-4 text-muted-foreground" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <div className="grid gap-4 rounded-lg border border-border bg-card p-5 md:grid-cols-[auto_1fr_auto] md:items-center">
                        <span className="grid size-14 place-items-center rounded-sm bg-primary text-primary-foreground">
                            <SlidersHorizontal className="size-7" />
                        </span>
                        <div>
                            <h3 className="font-display text-xl font-bold text-primary">
                                Info Studio
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Durasi per slot: {studio.slotDurationMinutes}{' '}
                                menit · Rp{' '}
                                {studio.hourlyRate.toLocaleString('id-ID')} /
                                jam
                            </p>
                        </div>
                        <a
                            href="/bookings"
                            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-extrabold tracking-wide text-primary-foreground transition hover:opacity-90"
                        >
                            Booking Sekarang
                            <ArrowRight className="size-4" />
                        </a>
                    </div>
                </div>
            </RhapsodyLayout>
        </>
    );
}

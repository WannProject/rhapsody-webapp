import { router } from '@inertiajs/react';
import type { ScheduleSlot, Studio } from '@/pages/dashboard/types';

type ScheduleBoardProps = {
    selectedDate: string;
    studio: Studio;
    scheduleSlots: ScheduleSlot[];
};

export function ScheduleBoard({
    selectedDate,
    studio,
    scheduleSlots,
}: ScheduleBoardProps) {
    return (
        <section className="rounded-lg border bg-card p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Jadwal Studio</h2>
                    <p className="text-sm text-muted-foreground">
                        {studio.name} buka {studio.opensAt} - {studio.closesAt}
                    </p>
                </div>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(event) =>
                        router.get(
                            window.location.pathname,
                            { date: event.target.value },
                            { preserveScroll: true },
                        )
                    }
                    className="h-10 rounded-md border bg-background px-3 text-sm"
                />
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {scheduleSlots.map((slot) => (
                    <div
                        key={slot.time}
                        className={[
                            'rounded-md border p-4',
                            slot.available
                                ? 'border-green-200 bg-green-50 dark:border-green-900/60 dark:bg-green-950/20'
                                : 'border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/20',
                        ].join(' ')}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-2xl font-bold">
                                    {slot.time} - {slot.endsAt}
                                </p>
                                <p className="mt-1 text-sm font-medium text-muted-foreground">
                                    {slot.available
                                        ? slot.price
                                        : slot.booking?.customerName}
                                </p>
                            </div>
                            <span className="rounded-md border bg-background px-2 py-1 text-xs font-semibold">
                                {slot.label}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

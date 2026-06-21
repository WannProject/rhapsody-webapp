import {
    ArrowRight,
    CalendarCheck2,
    CalendarDays,
    PlusCircle,
} from 'lucide-react';
import { SectionHeader } from '@/components/rhapsody/section-header';
import { StudioCard } from '@/components/rhapsody/studio-card';
import { activityFeed, studios } from '@/lib/rhapsody-data';
import type { RhapsodyView } from '@/types/rhapsody';

type HomeScreenProps = {
    onViewChange: (view: RhapsodyView) => void;
};

export function HomeScreen({ onViewChange }: HomeScreenProps) {
    return (
        <div className="mx-auto grid max-w-6xl gap-10">
            <section className="grid gap-6 md:grid-cols-[1.05fr_0.95fr] md:items-end">
                <div>
                    <h1 className="font-display text-[40px] leading-[1.05] font-extrabold tracking-tight text-primary md:text-[56px]">
                        Halo, Musisi!
                    </h1>
                    <p className="mt-3 text-xl text-muted-foreground/80">
                        Siap menciptakan mahakarya hari ini?
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => onViewChange('schedule')}
                    className="flex min-h-[132px] items-center gap-5 rounded-lg border border-border bg-card p-5 text-left transition hover:border-primary/60"
                >
                    <span className="grid size-16 shrink-0 place-items-center rounded-sm bg-primary text-primary-foreground">
                        <CalendarCheck2 className="size-8" />
                    </span>
                    <span className="min-w-0 flex-1">
                        <span className="block text-xs font-bold tracking-[0.22em] text-muted-foreground uppercase">
                            Booking Terdekat
                        </span>
                        <span className="mt-2 block font-display text-2xl leading-snug font-bold text-primary">
                            Studio A, Besok 14:00 - 16:00
                        </span>
                    </span>
                    <ArrowRight className="size-6 shrink-0 text-muted-foreground" />
                </button>
            </section>

            <section className="grid grid-cols-2 gap-5">
                <button
                    type="button"
                    onClick={() => onViewChange('booking')}
                    className="flex min-h-[124px] flex-col items-center justify-center gap-4 rounded-md bg-primary px-4 text-primary-foreground transition hover:opacity-90 active:scale-95"
                >
                    <PlusCircle className="size-9" />
                    <span className="text-base font-extrabold tracking-wide">
                        Booking Sekarang
                    </span>
                </button>
                <button
                    type="button"
                    onClick={() => onViewChange('schedule')}
                    className="flex min-h-[124px] flex-col items-center justify-center gap-4 rounded-md border border-primary px-4 text-primary transition hover:bg-card active:scale-95"
                >
                    <CalendarDays className="size-9" />
                    <span className="text-base font-extrabold tracking-wide">
                        Lihat Jadwal
                    </span>
                </button>
            </section>

            <section className="grid gap-5">
                <SectionHeader title="Studio Kami" action="Lihat Semua" />
                <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
                    <StudioCard studio={studios[0]} featured />
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-1">
                        {studios.slice(1).map((studio) => (
                            <StudioCard key={studio.id} studio={studio} />
                        ))}
                    </div>
                </div>
            </section>

            <section className="grid gap-5">
                <SectionHeader title="Aktivitas Terkini" />
                <div className="rounded-lg border border-border">
                    {activityFeed.map((activity, index) => {
                        const Icon = activity.icon;

                        return (
                            <div
                                key={activity.title}
                                className={[
                                    'flex items-center gap-4 px-1 py-5 md:px-5',
                                    index > 0
                                        ? 'border-t border-border'
                                        : '',
                                ].join(' ')}
                            >
                                <Icon className="size-7 shrink-0 text-muted-foreground" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-lg font-semibold text-primary">
                                        {activity.title}
                                    </p>
                                    <p className="font-semibold text-muted-foreground">
                                        {activity.detail}
                                    </p>
                                </div>
                                <p className="text-sm font-bold whitespace-nowrap text-muted-foreground">
                                    {activity.time}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}

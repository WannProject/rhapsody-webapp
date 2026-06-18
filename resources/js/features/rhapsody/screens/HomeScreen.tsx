import {
    ArrowRight,
    CalendarCheck2,
    CalendarDays,
    PlusCircle,
} from 'lucide-react';
import { SectionHeader } from '@/features/rhapsody/components/SectionHeader';
import { StudioCard } from '@/features/rhapsody/components/StudioCard';
import { activityFeed, studios } from '@/features/rhapsody/data/rhapsody-data';
import type { RhapsodyView } from '@/features/rhapsody/types';

type HomeScreenProps = {
    onViewChange: (view: RhapsodyView) => void;
};

export function HomeScreen({ onViewChange }: HomeScreenProps) {
    return (
        <div className="mx-auto grid max-w-6xl gap-10">
            <section className="grid gap-6 md:grid-cols-[1.05fr_0.95fr] md:items-end">
                <div>
                    <h1 className="font-['Montserrat'] text-[40px] leading-[1.05] font-extrabold tracking-tight text-white md:text-[56px]">
                        Halo, Musisi!
                    </h1>
                    <p className="mt-3 text-xl text-[#a7a7a7]">
                        Siap menciptakan mahakarya hari ini?
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => onViewChange('schedule')}
                    className="flex min-h-[132px] items-center gap-5 rounded-lg border border-[#353535] bg-[#1b1b1b] p-5 text-left transition hover:border-white/60"
                >
                    <span className="grid size-16 shrink-0 place-items-center rounded-sm bg-white text-[#313030]">
                        <CalendarCheck2 className="size-8" />
                    </span>
                    <span className="min-w-0 flex-1">
                        <span className="block text-xs font-bold tracking-[0.22em] text-[#c4c7c8] uppercase">
                            Booking Terdekat
                        </span>
                        <span className="mt-2 block font-['Montserrat'] text-2xl leading-snug font-bold text-white">
                            Studio A, Besok 14:00 - 16:00
                        </span>
                    </span>
                    <ArrowRight className="size-6 shrink-0 text-[#c4c7c8]" />
                </button>
            </section>

            <section className="grid grid-cols-2 gap-5">
                <button
                    type="button"
                    onClick={() => onViewChange('booking')}
                    className="flex min-h-[124px] flex-col items-center justify-center gap-4 rounded-md bg-white px-4 text-[#313030] transition hover:bg-[#e5e2e1]"
                >
                    <PlusCircle className="size-9" />
                    <span className="text-base font-extrabold tracking-wide">
                        Booking Sekarang
                    </span>
                </button>
                <button
                    type="button"
                    onClick={() => onViewChange('schedule')}
                    className="flex min-h-[124px] flex-col items-center justify-center gap-4 rounded-md border border-white px-4 text-white transition hover:bg-white hover:text-[#313030]"
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
                <div className="rounded-lg border border-[#2a2a2a]">
                    {activityFeed.map((activity, index) => {
                        const Icon = activity.icon;

                        return (
                            <div
                                key={activity.title}
                                className={[
                                    'flex items-center gap-4 px-1 py-5 md:px-5',
                                    index > 0
                                        ? 'border-t border-[#2a2a2a]'
                                        : '',
                                ].join(' ')}
                            >
                                <Icon className="size-7 shrink-0 text-[#c4c7c8]" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-lg font-semibold text-white">
                                        {activity.title}
                                    </p>
                                    <p className="font-semibold text-[#c4c7c8]">
                                        {activity.detail}
                                    </p>
                                </div>
                                <p className="text-sm font-bold whitespace-nowrap text-[#c4c7c8]">
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

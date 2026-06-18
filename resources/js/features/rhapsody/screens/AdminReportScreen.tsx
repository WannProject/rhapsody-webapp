import {
    ArrowUpRight,
    CalendarClock,
    Gauge,
    SlidersHorizontal,
    Users,
} from 'lucide-react';
import { MetricCard } from '@/features/rhapsody/components/MetricCard';
import { SectionHeader } from '@/features/rhapsody/components/SectionHeader';
import { priorityCriteria } from '@/features/rhapsody/data/rhapsody-data';
import type { RhapsodyView } from '@/features/rhapsody/types';

type AdminReportScreenProps = {
    onViewChange: (view: RhapsodyView) => void;
};

export function AdminReportScreen({ onViewChange }: AdminReportScreenProps) {
    return (
        <div className="mx-auto grid max-w-6xl gap-8">
            <SectionHeader
                eyebrow="Admin Simulation Report"
                title="Laporan Simulasi"
                action="5.000 Request"
            />

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                    label="Permintaan Booking"
                    value="5,000"
                    detail="Simulasi aktif"
                />
                <MetricCard
                    label="Studio Capacity"
                    value="12"
                    detail="All tiers"
                />
                <MetricCard
                    label="Success Rate"
                    value="91%"
                    detail="Prioritized booking"
                />
                <MetricCard
                    label="Promo Impact"
                    value="+18%"
                    detail="Slot occupancy"
                />
            </section>

            <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
                <article className="rounded-lg border border-[#353535] bg-[#1b1b1b] p-5 md:p-6">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold tracking-[0.22em] text-[#8e9192] uppercase">
                                Allocation Curve
                            </p>
                            <h3 className="mt-2 font-['Montserrat'] text-2xl font-bold text-white">
                                Kapasitas dan Prioritas
                            </h3>
                        </div>
                        <Gauge className="size-8 text-white" />
                    </div>

                    <div className="mt-8 grid h-[320px] grid-cols-12 items-end gap-2 border-b border-l border-[#353535] px-3 pb-3">
                        {[44, 58, 50, 74, 66, 82, 70, 88, 62, 78, 92, 84].map(
                            (value, index) => (
                                <div
                                    key={`${value}-${index}`}
                                    className="rounded-t-sm bg-white/90"
                                    style={{ height: `${value}%` }}
                                />
                            ),
                        )}
                    </div>
                </article>

                <aside className="grid gap-5 self-start">
                    <article className="rounded-lg border border-[#353535] bg-[#1b1b1b] p-5">
                        <p className="text-[10px] font-bold tracking-[0.2em] text-[#8e9192] uppercase">
                            Variabel Prioritas
                        </p>
                        <p className="mt-2 text-lg font-bold text-white">
                            Studio Tier, User Loyalty, Duration
                        </p>
                        <div className="mt-5 grid gap-4">
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
                    </article>

                    <button
                        type="button"
                        onClick={() => onViewChange('schedule')}
                        className="flex min-h-[78px] items-center gap-4 rounded-md border border-[#353535] bg-[#1b1b1b] px-5 text-left text-white transition hover:border-white"
                    >
                        <CalendarClock className="size-7" />
                        <span className="flex-1">
                            <span className="block font-bold">
                                Kelola Studio
                            </span>
                            <span className="text-sm text-[#8e9192]">
                                Pantau schedule dan kapasitas.
                            </span>
                        </span>
                        <ArrowUpRight className="size-5" />
                    </button>

                    <button
                        type="button"
                        onClick={() => onViewChange('booking')}
                        className="flex min-h-[78px] items-center gap-4 rounded-md bg-white px-5 text-left text-[#131313] transition hover:bg-[#e5e2e1]"
                    >
                        <SlidersHorizontal className="size-7" />
                        <span className="flex-1">
                            <span className="block font-extrabold">
                                Sesuaikan Kriteria Prioritas
                            </span>
                            <span className="text-sm font-semibold text-[#454747]">
                                Update bobot antrian booking.
                            </span>
                        </span>
                        <Users className="size-5" />
                    </button>
                </aside>
            </section>
        </div>
    );
}

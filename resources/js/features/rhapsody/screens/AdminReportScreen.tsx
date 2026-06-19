import {
    ArrowUpRight,
    CalendarClock,
    SlidersHorizontal,
    Users,
} from 'lucide-react';
import { MetricCard } from '@/features/rhapsody/components/MetricCard';
import { SectionHeader } from '@/features/rhapsody/components/SectionHeader';
import { AdminActionButton } from '@/features/rhapsody/screens/admin/AdminActionButton';
import { AdminPriorityCard } from '@/features/rhapsody/screens/admin/AdminPriorityCard';
import { AllocationCurveCard } from '@/features/rhapsody/screens/admin/AllocationCurveCard';
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
                <AllocationCurveCard />

                <aside className="grid gap-5 self-start">
                    <AdminPriorityCard />
                    <AdminActionButton
                        title="Kelola Studio"
                        description="Pantau schedule dan kapasitas."
                        view="schedule"
                        leadingIcon={CalendarClock}
                        trailingIcon={ArrowUpRight}
                        variant="dark"
                        onViewChange={onViewChange}
                    />
                    <AdminActionButton
                        title="Sesuaikan Kriteria Prioritas"
                        description="Update bobot antrian booking."
                        view="booking"
                        leadingIcon={SlidersHorizontal}
                        trailingIcon={Users}
                        variant="light"
                        onViewChange={onViewChange}
                    />
                </aside>
            </section>
        </div>
    );
}

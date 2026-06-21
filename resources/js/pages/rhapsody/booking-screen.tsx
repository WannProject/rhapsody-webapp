import { SectionHeader } from '@/components/rhapsody/section-header';
import { SummaryCard } from '@/components/rhapsody/summary-card';
import { bookingSummary } from '@/lib/rhapsody-data';
import { BookingFields } from '@/pages/rhapsody/booking/BookingFields';
import { InstrumentSelector } from '@/pages/rhapsody/booking/InstrumentSelector';
import { PriorityCriteriaCard } from '@/pages/rhapsody/booking/PriorityCriteriaCard';
import { SelectedStudioPanel } from '@/pages/rhapsody/booking/SelectedStudioPanel';
import type { RhapsodyView } from '@/types/rhapsody';

type BookingScreenProps = {
    onViewChange: (view: RhapsodyView) => void;
};

export function BookingScreen({ onViewChange }: BookingScreenProps) {
    return (
        <div className="mx-auto grid max-w-6xl gap-8">
            <SectionHeader
                eyebrow="Studio Booking"
                title="Formulir Booking"
                action="Step 2 dari 4"
            />

            <section className="grid gap-6 lg:grid-cols-[1fr_390px]">
                <div className="grid gap-6">
                    <SelectedStudioPanel />
                    <BookingFields />
                    <InstrumentSelector />
                </div>

                <aside className="grid gap-5 self-start lg:sticky lg:top-28">
                    <SummaryCard items={bookingSummary} />
                    <PriorityCriteriaCard />
                    <button
                        type="button"
                        onClick={() => onViewChange('payment')}
                        className="min-h-[56px] rounded-md bg-primary px-5 text-base font-extrabold tracking-wide text-primary-foreground transition hover:bg-secondary"
                    >
                        Lanjut ke Pembayaran
                    </button>
                </aside>
            </section>
        </div>
    );
}

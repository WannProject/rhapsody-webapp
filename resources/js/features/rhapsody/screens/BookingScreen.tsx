import { SectionHeader } from '@/features/rhapsody/components/SectionHeader';
import { SummaryCard } from '@/features/rhapsody/components/SummaryCard';
import { bookingSummary } from '@/features/rhapsody/data/rhapsody-data';
import { BookingFields } from '@/features/rhapsody/screens/booking/BookingFields';
import { InstrumentSelector } from '@/features/rhapsody/screens/booking/InstrumentSelector';
import { PriorityCriteriaCard } from '@/features/rhapsody/screens/booking/PriorityCriteriaCard';
import { SelectedStudioPanel } from '@/features/rhapsody/screens/booking/SelectedStudioPanel';
import type { RhapsodyView } from '@/features/rhapsody/types';

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
                        className="min-h-[56px] rounded-md bg-white px-5 text-base font-extrabold tracking-wide text-[#131313] transition hover:bg-[#e5e2e1]"
                    >
                        Lanjut ke Pembayaran
                    </button>
                </aside>
            </section>
        </div>
    );
}

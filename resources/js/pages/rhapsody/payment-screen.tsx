import { SectionHeader } from '@/components/rhapsody/section-header';
import { SummaryCard } from '@/components/rhapsody/summary-card';
import { bookingSummary } from '@/lib/rhapsody-data';
import { PaymentInstructions } from '@/pages/rhapsody/payment/PaymentInstructions';
import { PaymentMethodSelector } from '@/pages/rhapsody/payment/PaymentMethodSelector';
import { PaymentTotalCard } from '@/pages/rhapsody/payment/PaymentTotalCard';
import { SecurityNotice } from '@/pages/rhapsody/payment/SecurityNotice';
import type { RhapsodyView } from '@/types/rhapsody';

type PaymentScreenProps = {
    onViewChange: (view: RhapsodyView) => void;
};

export function PaymentScreen({ onViewChange }: PaymentScreenProps) {
    return (
        <div className="mx-auto grid max-w-6xl gap-8">
            <SectionHeader
                eyebrow="Payment Gateway"
                title="Pembayaran"
                action="Transaksi Terenkripsi"
            />

            <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
                <div className="grid gap-6">
                    <PaymentTotalCard />
                    <PaymentMethodSelector />
                    <PaymentInstructions />
                </div>

                <aside className="grid gap-5 self-start lg:sticky lg:top-28">
                    <SummaryCard items={bookingSummary} />
                    <SecurityNotice />
                    <button
                        type="button"
                        onClick={() => onViewChange('success')}
                        className="min-h-[56px] rounded-md bg-primary px-5 text-base font-extrabold tracking-wide text-primary-foreground transition hover:bg-secondary"
                    >
                        Konfirmasi Pembayaran
                    </button>
                </aside>
            </section>
        </div>
    );
}

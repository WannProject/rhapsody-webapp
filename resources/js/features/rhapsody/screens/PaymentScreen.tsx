import { SectionHeader } from '@/features/rhapsody/components/SectionHeader';
import { SummaryCard } from '@/features/rhapsody/components/SummaryCard';
import { bookingSummary } from '@/features/rhapsody/data/rhapsody-data';
import { PaymentInstructions } from '@/features/rhapsody/screens/payment/PaymentInstructions';
import { PaymentMethodSelector } from '@/features/rhapsody/screens/payment/PaymentMethodSelector';
import { PaymentTotalCard } from '@/features/rhapsody/screens/payment/PaymentTotalCard';
import { SecurityNotice } from '@/features/rhapsody/screens/payment/SecurityNotice';
import type { RhapsodyView } from '@/features/rhapsody/types';

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
                        className="min-h-[56px] rounded-md bg-white px-5 text-base font-extrabold tracking-wide text-[#131313] transition hover:bg-[#e5e2e1]"
                    >
                        Konfirmasi Pembayaran
                    </button>
                </aside>
            </section>
        </div>
    );
}

import { Head } from '@inertiajs/react';
import RhapsodyLayout from '@/layouts/rhapsody-layout';
import { PaymentScreen } from '@/pages/rhapsody/payment-screen';

export default function PaymentPage() {
    return (
        <>
            <Head title="RHAPSODY | Payment" />
            <RhapsodyLayout>
                <PaymentScreen onViewChange={() => {}} />
            </RhapsodyLayout>
        </>
    );
}

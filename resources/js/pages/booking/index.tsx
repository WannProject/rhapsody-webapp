import { Head } from '@inertiajs/react';
import RhapsodyLayout from '@/layouts/rhapsody-layout';
import { BookingScreen } from '@/pages/rhapsody/booking-screen';

export default function BookingPage() {
    return (
        <>
            <Head title="RHAPSODY | Booking" />
            <RhapsodyLayout>
                <BookingScreen onViewChange={() => {}} />
            </RhapsodyLayout>
        </>
    );
}

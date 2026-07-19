import { Head, usePage } from '@inertiajs/react';
import RhapsodyLayout from '@/layouts/rhapsody-layout';
import { HomeScreen } from '@/pages/rhapsody/home-screen';
import type { Auth } from '@/types';

type WelcomeProps = {
    studio?: {
        name: string;
        opensAt: string;
        closesAt: string;
        slotDurationMinutes: number;
        hourlyRate: number;
    };
    scheduleSlots?: Array<{
        time: string;
        endsAt: string;
        available: boolean;
        price: string;
        statusLabel?: string;
    }>;
    bookings?: Array<{
        code: string;
        customerName: string;
        bookingDate: string;
        startsAt: string;
        endsAt: string;
        totalPrice: number;
        status: string;
        statusLabel: string;
        paymentStatus: string;
        paymentStatusLabel: string;
        notes: string | null;
    }>;
    stats?: {
        totalBookings: number;
        pendingBookings: number;
        confirmedBookings: number;
        paidBookings: number;
    };
    auth: Auth;
};

export default function Welcome() {
    const props = usePage<WelcomeProps>().props;

    return (
        <>
            <Head title="RHAPSODY | Music Booking System" />
            <RhapsodyLayout>
                <HomeScreen serverProps={props} />
            </RhapsodyLayout>
        </>
    );
}

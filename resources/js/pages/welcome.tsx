import { Head, usePage } from '@inertiajs/react';
import RhapsodyLayout from '@/layouts/rhapsody-layout';
import { HomeScreen } from '@/pages/rhapsody/home-screen';
import type { Auth } from '@/types';

type WelcomeProps = {
    selectedDate?: string;
    studio?: { name: string; opensAt: string; closesAt: string; slotDurationMinutes: number; hourlyRate: number };
    scheduleSlots?: Array<{
        time: string; endsAt: string; available: boolean;
        price: string; label: string;
        booking?: { customerName: string };
    }>;
    paymentMethods?: Array<{
        id: number; type: string; typeLabel: string;
        name: string; instructions: string | null;
        isActive: boolean; sortOrder: number;
    }>;
    bookings?: Array<{
        code: string; customerName: string; customerEmail: string;
        customerPhone: string | null; bookingDate: string;
        startsAt: string; endsAt: string; totalPrice: number;
        status: string; statusLabel: string;
        paymentStatus: string; paymentStatusLabel: string;
        paymentMethodId: number | null; paymentMethodName: string | null;
        notes: string | null;
    }>;
    stats?: { totalBookings: number; pendingBookings: number; confirmedBookings: number; paidBookings: number };
    isAuthenticated?: boolean;
    userRole?: string;
    auth: Auth;
};

export default function Welcome() {
    const props = usePage<WelcomeProps>().props;

    return (
        <>
            <Head title="RHAPSODY | Music Booking System" />
            <RhapsodyLayout>
                <HomeScreen
                    onViewChange={() => {}}
                    serverProps={props}
                />
            </RhapsodyLayout>
        </>
    );
}

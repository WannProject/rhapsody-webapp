import { Head, usePage } from '@inertiajs/react';
import { BookingForm } from '@/pages/dashboard/booking-form';
import { BookingList } from '@/pages/dashboard/booking-list';
import { PaymentMethodManager } from '@/pages/dashboard/payment-method-manager';
import { ScheduleBoard } from '@/pages/dashboard/schedule-board';
import type {
    Booking,
    DashboardStats,
    PaymentMethod,
    ScheduleSlot,
    Studio,
    UserRole,
} from '@/pages/dashboard/types';
import type { Auth } from '@/types';

type DashboardProps = {
    auth: Auth;
    selectedDate: string;
    userRole: UserRole;
    studio: Studio;
    scheduleSlots: ScheduleSlot[];
    paymentMethods: PaymentMethod[];
    bookings: Booking[];
    stats: DashboardStats;
};

export default function Dashboard() {
    const {
        auth,
        selectedDate,
        userRole,
        studio,
        scheduleSlots,
        paymentMethods,
        bookings,
        stats,
    } = usePage<DashboardProps>().props;
    const isAdmin = userRole === 'admin';

    return (
        <>
            <Head title="RHAPSODY | Dashboard" />

            <main className="min-h-screen bg-background px-5 py-8 text-foreground md:px-8">
                <div className="mx-auto grid max-w-7xl gap-6">
                    <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-muted-foreground">
                                {isAdmin ? 'Admin Studio' : 'Pelanggan'}
                            </p>
                            <h1 className="text-3xl font-bold">
                                Rhapsody Studio Booking
                            </h1>
                            <p className="mt-1 text-muted-foreground">
                                Booking ruangan studio rekaman, pembayaran, dan
                                notifikasi WhatsApp.
                            </p>
                        </div>
                    </header>

                    {isAdmin ? <StatsGrid stats={stats} /> : null}

                    <ScheduleBoard
                        selectedDate={selectedDate}
                        studio={studio}
                        scheduleSlots={scheduleSlots}
                    />

                    {!isAdmin ? (
                        <BookingForm
                            auth={auth}
                            selectedDate={selectedDate}
                            scheduleSlots={scheduleSlots}
                            paymentMethods={paymentMethods}
                        />
                    ) : null}

                    <BookingList
                        bookings={bookings}
                        paymentMethods={paymentMethods}
                        userRole={userRole}
                    />

                    {isAdmin ? (
                        <PaymentMethodManager paymentMethods={paymentMethods} />
                    ) : null}
                </div>
            </main>
        </>
    );
}

function StatsGrid({ stats }: { stats: DashboardStats }) {
    const items = [
        ['Total Booking', stats.totalBookings],
        ['Menunggu', stats.pendingBookings],
        ['Terkonfirmasi', stats.confirmedBookings],
        ['Lunas', stats.paidBookings],
    ];

    return (
        <section className="grid gap-3 md:grid-cols-4">
            {items.map(([label, value]) => (
                <div key={label} className="rounded-lg border bg-card p-4">
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="mt-2 text-2xl font-bold">{value}</p>
                </div>
            ))}
        </section>
    );
}

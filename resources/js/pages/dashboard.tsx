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
                <div className="mx-auto grid max-w-7xl gap-10">
                    <header className="grid gap-3">
                        <p className="text-xs font-bold tracking-[0.22em] text-muted-foreground uppercase">
                            {isAdmin ? 'Admin Studio' : 'Pelanggan'}
                        </p>
                        <h1 className="font-display text-[40px] leading-[1.05] font-extrabold tracking-tight text-primary md:text-[48px]">
                            Halo, {auth.user.name?.split(' ')[0] ?? 'Musisi'}!
                        </h1>
                        <p className="text-lg text-muted-foreground/80">
                            {isAdmin
                                ? 'Kelola booking, jadwal, dan metode pembayaran studio.'
                                : 'Booking ruangan studio rekaman, pembayaran, dan notifikasi WhatsApp.'}
                        </p>
                    </header>

                    {isAdmin ? <StatsGrid stats={stats} /> : null}

                    <section className="grid gap-10">
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
                            <PaymentMethodManager
                                paymentMethods={paymentMethods}
                            />
                        ) : null}
                    </section>
                </div>
            </main>
        </>
    );
}

function StatsGrid({ stats }: { stats: DashboardStats }) {
    const items = [
        { label: 'Total Booking', value: stats.totalBookings },
        { label: 'Menunggu', value: stats.pendingBookings },
        { label: 'Terkonfirmasi', value: stats.confirmedBookings },
        { label: 'Lunas', value: stats.paidBookings },
    ];

    return (
        <section className="grid gap-3 md:grid-cols-4">
            {items.map(({ label, value }) => (
                <div
                    key={label}
                    className="rounded-lg border border-border bg-card p-5"
                >
                    <p className="text-xs font-bold tracking-[0.22em] text-muted-foreground uppercase">
                        {label}
                    </p>
                    <p className="mt-3 font-display text-[32px] leading-none font-bold text-primary">
                        {value}
                    </p>
                </div>
            ))}
        </section>
    );
}

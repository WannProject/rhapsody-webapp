import { Head, Link } from '@inertiajs/react';
import { CalendarDays, CheckCircle2, Clock, CreditCard, TrendingUp, XCircle } from 'lucide-react';
import RhapsodyLayout from '@/layouts/rhapsody-layout';
import type { LucideIcon } from 'lucide-react';

type Stats = {
    totalBookings: number;
    pendingBookings: number;
    confirmedBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    paidBookings: number;
    pendingPayments: number;
    failedPayments: number;
};

type Revenue = {
    today: number;
    thisMonth: number;
    allTime: number;
};

type RecentBooking = {
    code: string;
    customerName: string;
    bandName: string | null;
    bookingDate: string;
    startsAt: string;
    endsAt: string;
    totalPrice: number;
    status: string;
    statusLabel: string;
    paymentStatus: string;
    paymentStatusLabel: string;
    paymentMethodName: string | null;
};

type DayBucket = { date: string; total: number };

type TopPaymentMethod = {
    name: string;
    typeLabel: string;
    paidBookings: number;
};

type Props = {
    studio: { name: string; hourlyRate: number };
    stats: Stats;
    revenue: Revenue;
    recentBookings: RecentBooking[];
    bookingsLast14Days: DayBucket[];
    topPaymentMethods: TopPaymentMethod[];
    activeEquipmentCount: number;
    activePaymentMethodCount: number;
};

const formatRp = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;
const formatDate = (date: string) => {
    const parsed = new Date(`${date}T00:00:00`);
    const formatter = new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });

    return formatter.format(parsed);
};
const formatShortDate = (date: string) => {
    const parsed = new Date(`${date}T00:00:00`);
    return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short' }).format(parsed);
};

const statusTone = (status: string) => {
    if (['confirmed', 'completed', 'paid'].includes(status)) {
        return 'bg-green-100 text-green-800';
    }
    if (['pending', 'pending_payment'].includes(status)) {
        return 'bg-amber-100 text-amber-800';
    }
    if (['cancelled', 'expired', 'failed', 'refunded'].includes(status)) {
        return 'bg-rose-100 text-rose-800';
    }

    return 'bg-muted text-muted-foreground';
};

export default function ReportsPage(props: Props) {
    const {
        stats,
        revenue,
        recentBookings,
        bookingsLast14Days,
        topPaymentMethods,
        activeEquipmentCount,
        activePaymentMethodCount,
        studio,
    } = props;

    const maxDaily = Math.max(1, ...bookingsLast14Days.map((d) => d.total));

    return (
        <>
            <Head title="RHAPSODY | Laporan" />
            <RhapsodyLayout>
                <div className="mx-auto grid max-w-7xl gap-10">
                    <header className="grid gap-3">
                        <p className="text-xs font-bold tracking-[0.22em] text-muted-foreground uppercase">
                            {studio.name} · Admin Studio
                        </p>
                        <h1 className="font-display text-[40px] leading-[1.05] font-extrabold tracking-tight text-primary md:text-[48px]">
                            Laporan
                        </h1>
                        <p className="max-w-3xl text-lg text-muted-foreground/80">
                            Ringkasan booking, status pembayaran, dan revenue studio
                            berdasarkan data terkini.
                        </p>
                    </header>

                    <section className="grid gap-3 md:grid-cols-3">
                        <RevenueCard
                            label="Revenue Hari Ini"
                            value={formatRp(revenue.today)}
                            icon={TrendingUp}
                        />
                        <RevenueCard
                            label="Revenue Bulan Ini"
                            value={formatRp(revenue.thisMonth)}
                            icon={CalendarDays}
                        />
                        <RevenueCard
                            label="Revenue Total"
                            value={formatRp(revenue.allTime)}
                            icon={CreditCard}
                        />
                    </section>

                    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <StatCard label="Total Booking" value={stats.totalBookings} icon={CalendarDays} />
                        <StatCard label="Menunggu" value={stats.pendingBookings} icon={Clock} />
                        <StatCard label="Terkonfirmasi" value={stats.confirmedBookings} icon={CheckCircle2} />
                        <StatCard label="Selesai" value={stats.completedBookings} icon={CheckCircle2} />
                        <StatCard label="Lunas" value={stats.paidBookings} icon={CreditCard} />
                        <StatCard label="Pembayaran Pending" value={stats.pendingPayments} icon={Clock} />
                        <StatCard label="Pembayaran Gagal" value={stats.failedPayments} icon={XCircle} />
                        <StatCard label="Dibatalkan/Kadaluarsa" value={stats.cancelledBookings} icon={XCircle} />
                    </section>

                    <section className="grid gap-5 rounded-lg border border-border bg-card p-5">
                        <div>
                            <h2 className="font-display text-2xl font-bold text-primary">
                                Booking 14 Hari Terakhir
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Jumlah booking per tanggal berdasarkan tanggal booking.
                            </p>
                        </div>
                        <div className="grid gap-2 md:grid-cols-14">
                            {bookingsLast14Days.map((bucket) => {
                                const heightPct = Math.round(
                                    (bucket.total / maxDaily) * 100,
                                );

                                return (
                                    <div
                                        key={bucket.date}
                                        className="grid justify-items-center gap-2"
                                    >
                                        <div className="flex h-40 w-full items-end justify-center rounded-md bg-muted/40 p-1">
                                            <div
                                                className="w-full rounded-t-md bg-primary transition-all"
                                                style={{
                                                    height: `${Math.max(heightPct, bucket.total > 0 ? 8 : 0)}%`,
                                                }}
                                                title={`${bucket.total} booking`}
                                            />
                                        </div>
                                        <span className="text-[10px] font-semibold tracking-wide text-muted-foreground">
                                            {formatShortDate(bucket.date)}
                                        </span>
                                        <span className="text-xs font-bold text-primary">
                                            {bucket.total}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
                        <section className="grid gap-4 rounded-lg border border-border bg-card p-5">
                            <div>
                                <h2 className="font-display text-2xl font-bold text-primary">
                                    Booking Terbaru
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    10 booking paling baru di seluruh sistem.
                                </p>
                            </div>

                            {recentBookings.length === 0 ? (
                                <p className="rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground">
                                    Belum ada booking.
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-border text-left text-[10px] font-bold tracking-[0.18em] text-muted-foreground uppercase">
                                                <th className="px-2 py-2">Kode</th>
                                                <th className="px-2 py-2">Customer</th>
                                                <th className="px-2 py-2">Jadwal</th>
                                                <th className="px-2 py-2 text-right">Total</th>
                                                <th className="px-2 py-2">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentBookings.map((booking) => (
                                                <tr
                                                    key={booking.code}
                                                    className="border-b border-border last:border-0"
                                                >
                                                    <td className="px-2 py-3">
                                                        <Link
                                                            href={`/bookings/${booking.code}`}
                                                            className="font-semibold text-primary hover:underline"
                                                        >
                                                            {booking.code}
                                                        </Link>
                                                    </td>
                                                    <td className="px-2 py-3">
                                                        <p className="font-semibold text-foreground">
                                                            {booking.bandName ?? booking.customerName}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {booking.paymentMethodName ?? '-'}
                                                        </p>
                                                    </td>
                                                    <td className="px-2 py-3 text-muted-foreground">
                                                        <p>{formatDate(booking.bookingDate)}</p>
                                                        <p className="text-xs">
                                                            {booking.startsAt} - {booking.endsAt}
                                                        </p>
                                                    </td>
                                                    <td className="px-2 py-3 text-right font-semibold text-foreground">
                                                        {formatRp(booking.totalPrice)}
                                                    </td>
                                                    <td className="px-2 py-3">
                                                        <div className="flex flex-col gap-1">
                                                            <span
                                                                className={`inline-flex w-fit rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${statusTone(booking.status)}`}
                                                            >
                                                                {booking.statusLabel}
                                                            </span>
                                                            <span
                                                                className={`inline-flex w-fit rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${statusTone(booking.paymentStatus)}`}
                                                            >
                                                                {booking.paymentStatusLabel}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>

                        <aside className="grid content-start gap-5">
                            <section className="grid gap-3 rounded-lg border border-border bg-card p-5">
                                <div>
                                    <h2 className="font-display text-xl font-bold text-primary">
                                        Metode Pembayaran
                                    </h2>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {activePaymentMethodCount} metode aktif · {studio.hourlyRate ? formatRp(studio.hourlyRate) : '-'} / jam
                                    </p>
                                </div>
                                {topPaymentMethods.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        Belum ada transaksi lunas.
                                    </p>
                                ) : (
                                    <ul className="grid gap-2">
                                        {topPaymentMethods.map((method) => (
                                            <li
                                                key={method.name}
                                                className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/30 px-3 py-2"
                                            >
                                                <div>
                                                    <p className="text-sm font-semibold text-primary">
                                                        {method.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {method.typeLabel}
                                                    </p>
                                                </div>
                                                <p className="text-sm font-bold text-primary">
                                                    {method.paidBookings} lunas
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </section>

                            <section className="grid gap-3 rounded-lg border border-border bg-card p-5">
                                <h2 className="font-display text-xl font-bold text-primary">
                                    Aset Studio
                                </h2>
                                <dl className="grid gap-3 text-sm">
                                    <div className="flex items-center justify-between">
                                        <dt className="text-muted-foreground">Alat aktif</dt>
                                        <dd className="font-bold text-primary">
                                            {activeEquipmentCount}
                                        </dd>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <dt className="text-muted-foreground">Harga per jam</dt>
                                        <dd className="font-bold text-primary">
                                            {formatRp(studio.hourlyRate)}
                                        </dd>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <dt className="text-muted-foreground">Total booking</dt>
                                        <dd className="font-bold text-primary">
                                            {stats.totalBookings}
                                        </dd>
                                    </div>
                                </dl>
                            </section>
                        </aside>
                    </div>
                </div>
            </RhapsodyLayout>
        </>
    );
}

function StatCard({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: number;
    icon: LucideIcon;
}) {
    return (
        <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between">
                <p className="text-xs font-bold tracking-[0.22em] text-muted-foreground uppercase">
                    {label}
                </p>
                <Icon className="size-4 text-muted-foreground" />
            </div>
            <p className="mt-3 font-display text-[32px] leading-none font-bold text-primary">
                {value}
            </p>
        </div>
    );
}

function RevenueCard({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: string;
    icon: LucideIcon;
}) {
    return (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-5">
            <div className="flex items-center justify-between">
                <p className="text-xs font-bold tracking-[0.22em] text-primary uppercase">
                    {label}
                </p>
                <Icon className="size-4 text-primary" />
            </div>
            <p className="mt-3 font-display text-3xl leading-none font-extrabold text-primary">
                {value}
            </p>
        </div>
    );
}

import { Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Bell,
    Building2,
    CalendarCheck2,
    CalendarDays,
    Clock3,
    CreditCard,
    Gauge,
    MapPin,
    Mic2,
    Music2,
    PackageCheck,
    Percent,
    ReceiptText,
    Settings2,
    ShieldCheck,
    Sparkles,
    Users,
    Wallet,
    WalletCards,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { studioImages } from '@/lib/rhapsody-data';
import { register } from '@/routes';
import type { Auth } from '@/types';

type BookingSummary = {
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
};

type AdminRecentBooking = {
    code: string;
    customerName: string;
    customerEmail: string;
    bookingDate: string;
    startsAt: string;
    endsAt: string;
    totalPrice: number;
    statusLabel: string;
    paymentStatusLabel: string;
    paymentMethodName: string | null;
};

type AdminStats = {
    totalBookings: number;
    pendingBookings: number;
    confirmedBookings: number;
    paidBookings: number;
    totalClients: number;
    verifiedClients: number;
    pendingClients: number;
    activeEquipments: number;
    activeFeeRules: number;
    activePaymentMethods: number;
    failedNotifications: number;
    pendingWithdrawalsCount: number;
    availableBalance: number;
    pendingWithdrawalsAmount: number;
    totalPlatformFee: number;
    recentBookings: AdminRecentBooking[];
};

type HomeScreenProps = {
    serverProps?: {
        selectedDate?: string;
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
        bookings?: BookingSummary[];
        stats?: {
            totalBookings: number;
            pendingBookings: number;
            confirmedBookings: number;
            paidBookings: number;
        };
        adminStats?: AdminStats;
        auth: Auth;
    };
};

const promos = [
    {
        title: 'Full Band Session',
        copy: 'Ruang latihan siap untuk format band lengkap dengan drum, amp, keyboard, dan mic vokal.',
    },
    {
        title: 'Payment Link Otomatis',
        copy: 'Setiap booking menahan slot sementara dan diarahkan ke pembayaran online.',
    },
    {
        title: 'Jadwal Transparan',
        copy: 'Slot tersedia, tertahan, booked, dan blocked terlihat jelas sebelum customer login.',
    },
];

const facilities = [
    ['Drum akustik', 'Ready untuk latihan reguler dan rehearsal panggung.'],
    [
        'Keyboard dan piano',
        'Tersedia untuk aransemen, tracking, dan latihan vokal.',
    ],
    [
        'Gitar, bass, dan mic',
        'Pilihan alat studio serta catatan alat pribadi customer.',
    ],
];

const formatRupiah = (value: number) =>
    `Rp ${value.toLocaleString('id-ID')}`;

export function HomeScreen({ serverProps }: HomeScreenProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const user = auth.user;
    const studio = serverProps?.studio;
    const bookings = serverProps?.bookings ?? [];
    const scheduleSlots = serverProps?.scheduleSlots ?? [];
    const upcomingBooking = bookings.find(
        (booking) =>
            booking.status === 'pending_payment' ||
            booking.status === 'confirmed',
    );
    const availableToday = scheduleSlots.filter((slot) => slot.available);
    const hourlyRate = studio?.hourlyRate ?? 150000;
    const studioName = studio?.name ?? 'Rhapsody Studio';

    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
    const isSuperAdmin = user?.role === 'super_admin';

    if (isAdmin) {
        return (
            <SuperAdminDashboard
                studio={studio}
                scheduleSlots={scheduleSlots}
                adminStats={serverProps?.adminStats}
                isSuperAdmin={isSuperAdmin}
            />
        );
    }

    return (
        <div className="mx-auto grid max-w-7xl gap-10">
            <section className="relative min-h-[520px] overflow-hidden rounded-lg bg-primary text-primary-foreground dark:bg-card dark:text-card-foreground">
                <img
                    src={studioImages.engineer}
                    alt=""
                    className="absolute inset-0 size-full object-cover opacity-45 dark:opacity-28"
                />
                <div className="absolute inset-0 bg-primary/70 dark:bg-background/88" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary/20 dark:to-background/70" />
                <div className="relative grid min-h-[520px] content-between gap-8 p-6 md:p-10">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="rounded-md">
                            {studio?.opensAt ?? '09:00'} -{' '}
                            {studio?.closesAt ?? '21:00'}
                        </Badge>
                        <Badge
                            variant="outline"
                            className="rounded-md border-white/30 text-white dark:border-border dark:bg-card/80 dark:text-card-foreground"
                        >
                            Rp {hourlyRate.toLocaleString('id-ID')} / jam
                        </Badge>
                    </div>

                    <div className="max-w-3xl">
                        <p className="text-xs font-bold tracking-[0.24em] text-white/75 uppercase dark:text-muted-foreground">
                            Studio Musik dan Rehearsal
                        </p>
                        <h1 className="mt-4 font-display text-[42px] leading-[1.05] font-extrabold text-white md:text-[64px] dark:text-primary">
                            {studioName}
                        </h1>
                        <p className="mt-5 max-w-2xl text-lg leading-8 text-white/82 md:text-xl dark:text-muted-foreground">
                            Booking studio, cek jadwal, pilih alat, dan bayar
                            dari satu alur yang rapi untuk customer dan
                            superadmin.
                        </p>
                        <div className="mt-7 grid max-w-md grid-cols-2 gap-2 sm:gap-3">
                            <Button
                                size="lg"
                                variant="secondary"
                                className="w-full px-3 text-xs sm:text-sm"
                                asChild
                            >
                                <Link
                                    href={
                                        user
                                            ? '/bookings#booking-form'
                                            : register()
                                    }
                                >
                                    <span className="truncate">
                                        {user ? 'Booking Sekarang' : 'Register'}
                                    </span>
                                    <ArrowRight className="size-4 shrink-0" />
                                </Link>
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="w-full border-white/35 bg-white/10 px-3 text-xs text-white hover:bg-white/20 hover:text-white sm:text-sm dark:border-border dark:bg-card/70 dark:text-card-foreground dark:hover:bg-muted"
                                asChild
                            >
                                <Link href="/schedule">
                                    <CalendarDays className="size-4 shrink-0" />
                                    <span className="truncate">
                                        Lihat Jadwal
                                    </span>
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        {[
                            ['Slot Tersedia', availableToday.length],
                            ['Durasi Slot', studio?.slotDurationMinutes ?? 120],
                            [
                                'Booking Aktif',
                                serverProps?.stats?.confirmedBookings ?? 0,
                            ],
                        ].map(([label, value]) => (
                            <div
                                key={label}
                                className="min-w-0 rounded-lg border border-white/20 bg-white/10 p-2.5 backdrop-blur sm:p-4 dark:border-border dark:bg-card/85"
                            >
                                <p className="truncate text-[9px] font-bold tracking-[0.12em] text-white/70 uppercase sm:text-xs sm:tracking-[0.18em] dark:text-muted-foreground">
                                    {label}
                                </p>
                                <p className="mt-1 font-display text-xl leading-none font-bold text-white sm:mt-2 sm:text-3xl dark:text-primary">
                                    {value}
                                    {label === 'Durasi Slot' ? 'm' : ''}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {user && (
                <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle className="font-display text-2xl">
                                {upcomingBooking
                                    ? 'Booking Terdekat'
                                    : 'Belum Ada Booking Aktif'}
                            </CardTitle>
                            <CardDescription>
                                {upcomingBooking
                                    ? 'Pantau jadwal dan status pembayaran pesanan terbaru.'
                                    : 'Pilih slot kosong dan tahan jadwal sebelum lanjut pembayaran.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-[auto_1fr] items-center gap-3 md:grid-cols-[auto_1fr_auto] md:gap-4">
                            <span className="grid size-11 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground sm:size-14">
                                <CalendarCheck2 className="size-5 sm:size-7" />
                            </span>
                            <div className="min-w-0">
                                <p className="font-display text-base leading-snug font-bold text-primary sm:text-xl">
                                    {upcomingBooking
                                        ? `${upcomingBooking.bookingDate}, ${upcomingBooking.startsAt} - ${upcomingBooking.endsAt}`
                                        : 'Pilih jadwal latihan berikutnya'}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {upcomingBooking
                                        ? `${upcomingBooking.code} · ${upcomingBooking.statusLabel} · ${upcomingBooking.paymentStatusLabel}`
                                        : 'Slot hari ini dan status ketersediaan bisa dicek sebelum booking.'}
                                </p>
                            </div>
                            <Button className="col-span-2 md:col-span-1" asChild>
                                <Link
                                    href={
                                        upcomingBooking
                                            ? '/orders'
                                            : '/bookings#booking-form'
                                    }
                                >
                                    {upcomingBooking ? 'Detail' : 'Booking'}
                                    <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle className="font-display text-2xl">
                                Ringkasan Akun
                            </CardTitle>
                            <CardDescription>
                                Aktivitas booking dan pembayaran akun ini.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-3">
                            {[
                                [
                                    'Total',
                                    serverProps?.stats?.totalBookings ?? 0,
                                ],
                                [
                                    'Menunggu',
                                    serverProps?.stats?.pendingBookings ?? 0,
                                ],
                                [
                                    'Terkonfirmasi',
                                    serverProps?.stats?.confirmedBookings ?? 0,
                                ],
                                [
                                    'Lunas',
                                    serverProps?.stats?.paidBookings ?? 0,
                                ],
                            ].map(([label, value]) => (
                                <div
                                    key={label}
                                    className="rounded-lg border border-border bg-muted/40 p-4"
                                >
                                    <p className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">
                                        {label}
                                    </p>
                                    <p className="mt-2 font-display text-2xl font-bold text-primary">
                                        {value}
                                    </p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </section>
            )}

            <section className="grid gap-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-xs font-bold tracking-[0.22em] text-muted-foreground uppercase">
                            Promo dan Alur
                        </p>
                        <h2 className="mt-2 font-display text-3xl font-bold text-primary">
                            Booking studio tanpa bolak-balik admin
                        </h2>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/schedule">Cek Slot Hari Ini</Link>
                    </Button>
                </div>

                <div className="flex snap-x gap-4 overflow-x-auto pb-2">
                    {promos.map((promo, index) => {
                        const Icon = [Sparkles, WalletCards, Clock3][index];

                        return (
                            <Card
                                key={promo.title}
                                className="min-w-[280px] snap-start rounded-lg md:min-w-[360px] xl:min-w-[calc((100%_-_2rem)/3)]"
                            >
                                <CardHeader>
                                    <span className="grid size-10 place-items-center rounded-md bg-primary text-primary-foreground">
                                        <Icon className="size-5" />
                                    </span>
                                    <CardTitle className="text-lg">
                                        {promo.title}
                                    </CardTitle>
                                    <CardDescription>
                                        {promo.copy}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        );
                    })}
                </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="grid gap-4">
                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle className="font-display text-2xl">
                                Harga Studio
                            </CardTitle>
                            <CardDescription>
                                Harga dasar tersimpan sebagai snapshot pada tiap
                                booking.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-end justify-between gap-4">
                            <div>
                                <p className="font-display text-4xl font-bold text-primary">
                                    Rp {hourlyRate.toLocaleString('id-ID')}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    per jam, minimum{' '}
                                    {studio?.slotDurationMinutes ?? 120} menit
                                </p>
                            </div>
                            <Badge variant="outline">IDR</Badge>
                        </CardContent>
                    </Card>

                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle className="font-display text-2xl">
                                Lokasi dan Kontak
                            </CardTitle>
                            <CardDescription>
                                Datang sesuai jadwal booking yang sudah
                                terkonfirmasi.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3 text-sm text-muted-foreground">
                            <p className="flex items-center gap-2">
                                <MapPin className="size-4" />
                                Detail lokasi tersedia di halaman studio.
                            </p>
                            <p className="flex items-center gap-2">
                                <ShieldCheck className="size-4" />
                                Konfirmasi pembayaran mengikuti webhook Xendit.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="rounded-lg">
                    <CardHeader>
                        <CardTitle className="font-display text-2xl">
                            Fasilitas
                        </CardTitle>
                        <CardDescription>
                            Pilihan alat bisa ditambahkan saat customer membuat
                            booking.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                        {facilities.map(([title, copy], index) => {
                            const Icon = [Music2, Mic2, ReceiptText][index];

                            return (
                                <div
                                    key={title}
                                    className="grid gap-3 rounded-lg border border-border bg-muted/30 p-4 md:grid-cols-[auto_1fr] md:items-center"
                                >
                                    <span className="grid size-10 place-items-center rounded-md bg-primary text-primary-foreground">
                                        <Icon className="size-5" />
                                    </span>
                                    <div>
                                        <p className="font-semibold text-primary">
                                            {title}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {copy}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}

function SuperAdminDashboard({
    studio,
    scheduleSlots,
    adminStats,
    isSuperAdmin,
}: {
    studio: NonNullable<HomeScreenProps['serverProps']>['studio'];
    scheduleSlots: NonNullable<HomeScreenProps['serverProps']>['scheduleSlots'];
    adminStats?: AdminStats;
    isSuperAdmin: boolean;
}) {
    const stats = adminStats ?? {
        totalBookings: 0,
        pendingBookings: 0,
        confirmedBookings: 0,
        paidBookings: 0,
        totalClients: 0,
        verifiedClients: 0,
        pendingClients: 0,
        activeEquipments: 0,
        activeFeeRules: 0,
        activePaymentMethods: 0,
        failedNotifications: 0,
        pendingWithdrawalsCount: 0,
        availableBalance: 0,
        pendingWithdrawalsAmount: 0,
        totalPlatformFee: 0,
        recentBookings: [],
    };
    const availableToday = (scheduleSlots ?? []).filter(
        (slot) => slot.available,
    ).length;
    const studioName = studio?.name ?? 'Rhapsody Studio';

    const metricCards = [
        {
            label: 'Pesanan',
            value: stats.totalBookings,
            helper: `${stats.confirmedBookings} terkonfirmasi`,
            icon: ReceiptText,
        },
        isSuperAdmin && {
            label: 'Client',
            value: stats.totalClients,
            helper: `${stats.verifiedClients} verified`,
            icon: Users,
        },
        isSuperAdmin && {
            label: 'Saldo Platform',
            value: formatRupiah(stats.availableBalance),
            helper: `${formatRupiah(stats.pendingWithdrawalsAmount)} pending`,
            icon: Wallet,
        },
        isSuperAdmin && {
            label: 'Fee Masuk',
            value: formatRupiah(stats.totalPlatformFee),
            helper: `${stats.activeFeeRules} rule aktif`,
            icon: Percent,
        },
        !isSuperAdmin && {
            label: 'Lunas',
            value: stats.paidBookings,
            helper: 'Pembayaran sukses',
            icon: CreditCard,
        },
        !isSuperAdmin && {
            label: 'Alat Aktif',
            value: stats.activeEquipments,
            helper: `${stats.activePaymentMethods} metode bayar`,
            icon: PackageCheck,
        },
        !isSuperAdmin && {
            label: 'Notifikasi Gagal',
            value: stats.failedNotifications,
            helper: 'Perlu tindak lanjut',
            icon: Bell,
        },
    ].filter(Boolean) as {
        label: string;
        value: string | number;
        helper: string;
        icon: LucideIcon;
    }[];

    const setupCards = [
        {
            label: 'Harga Studio',
            value: formatRupiah(studio?.hourlyRate ?? 150000),
            helper: `Durasi slot ${studio?.slotDurationMinutes ?? 120} menit`,
            icon: Settings2,
        },
        {
            label: 'Alat Aktif',
            value: stats.activeEquipments,
            helper: 'Tersedia di form booking',
            icon: PackageCheck,
        },
        {
            label: 'Metode Bayar',
            value: stats.activePaymentMethods,
            helper: 'Aktif untuk customer',
            icon: CreditCard,
        },
        {
            label: 'Slot Hari Ini',
            value: availableToday,
            helper: `${studio?.opensAt ?? '09:00'} - ${studio?.closesAt ?? '21:00'}`,
            icon: CalendarDays,
        },
    ];

    const actionCards = [
        {
            title: 'Kelola Pesanan',
            copy: 'Review booking, status pembayaran, metode bayar, dan catatan admin.',
            href: '/orders',
            icon: ReceiptText,
            superAdminOnly: false,
        },
        {
            title: 'Data Studio & Harga',
            copy: 'Ubah profil studio, jam operasional, harga per jam, dan inventori alat.',
            href: '/admin/studio-data',
            icon: Settings2,
            superAdminOnly: false,
        },
        isSuperAdmin
            ? {
                  title: 'Client Merchant',
                  copy: 'Kelola client, status verifikasi, dan sub-account Xendit.',
                  href: '/admin/clients',
                  icon: Building2,
                  superAdminOnly: true,
              }
            : null,
        {
            title: 'Jadwal & Blokir Slot',
            copy: 'Lihat slot harian dan tutup jadwal saat libur atau maintenance.',
            href: '/bookings#slot-blocks',
            icon: CalendarDays,
            superAdminOnly: false,
        },
        {
            title: 'Metode Pembayaran',
            copy: 'Tambah, urutkan, aktifkan, atau nonaktifkan cara bayar customer.',
            href: '/orders#payment-methods',
            icon: CreditCard,
            superAdminOnly: false,
        },
        isSuperAdmin
            ? {
                  title: 'Fee Platform',
                  copy: 'Atur rule potongan platform untuk transaksi dan split pembayaran.',
                  href: '/admin/platform-fees',
                  icon: Percent,
                  superAdminOnly: true,
              }
            : null,
        isSuperAdmin
            ? {
                  title: 'Wallet Platform',
                  copy: 'Pantau ledger, saldo, withdrawal, dan export riwayat dana.',
                  href: '/admin/platform-wallet',
                  icon: Wallet,
                  superAdminOnly: true,
              }
            : null,
        {
            title: 'Audit Notifikasi',
            copy: 'Cek status pengiriman WhatsApp/notifikasi dan error yang gagal.',
            href: '/admin/notification-logs',
            icon: Bell,
            superAdminOnly: false,
        },
        {
            title: 'Laporan & Revenue',
            copy: 'Ringkasan booking, status pembayaran, dan revenue studio.',
            href: '/reports',
            icon: Gauge,
            superAdminOnly: false,
        },
    ].filter(Boolean) as {
        title: string;
        copy: string;
        href: string;
        icon: LucideIcon;
        superAdminOnly: boolean;
    }[];

    return (
        <div className="mx-auto grid max-w-7xl gap-6">
            <section className="grid gap-5 rounded-lg border border-border bg-card p-5 md:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                        <p className="text-xs font-bold tracking-[0.22em] text-muted-foreground uppercase">
                            {isSuperAdmin ? 'Super Admin Dashboard' : 'Admin Dashboard'}
                        </p>
                        <h1 className="mt-2 font-display text-3xl leading-tight font-extrabold text-primary md:text-5xl">
                            Operasional {studioName}
                        </h1>
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
                            Pantau pesanan, harga, dan operasional studio dari satu
                            halaman kerja.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
                        <Button className="w-full sm:w-auto" asChild>
                            <Link href="/orders">
                                <ReceiptText className="size-4" />
                                Pesanan
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full sm:w-auto"
                            asChild
                        >
                            <Link href="/admin/studio-data">
                                <Settings2 className="size-4" />
                                Data Studio
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                    {metricCards.map((metric) => (
                        <AdminMetricCard key={metric.label} {...metric} />
                    ))}
                </div>
            </section>

            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {setupCards.map((metric) => (
                    <AdminMetricCard key={metric.label} {...metric} compact />
                ))}
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                <div className="grid gap-4">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold tracking-[0.22em] text-muted-foreground uppercase">
                                Modul Admin
                            </p>
                            <h2 className="mt-1 font-display text-2xl font-bold text-primary">
                                Akses cepat
                            </h2>
                        </div>
                        {isSuperAdmin && (
                            <Badge variant="outline" className="rounded-md">
                                {stats.pendingClients} client pending
                            </Badge>
                        )}
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        {actionCards.map(({ superAdminOnly: _, ...action }) => (
                            <AdminActionCard key={action.href} {...action} />
                        ))}
                    </div>
                </div>

                <div className="grid gap-4">
                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 font-display text-2xl">
                                <Gauge className="size-5" />
                                Status Penting
                            </CardTitle>
                            <CardDescription>
                                Area yang perlu dicek rutin.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            <StatusRow
                                label="Pesanan menunggu"
                                value={stats.pendingBookings}
                                tone={
                                    stats.pendingBookings > 0
                                        ? 'warning'
                                        : 'default'
                                }
                            />
                            {isSuperAdmin && (
                                <StatusRow
                                    label="Withdrawal pending"
                                    value={stats.pendingWithdrawalsCount}
                                    tone={
                                        stats.pendingWithdrawalsCount > 0
                                            ? 'warning'
                                            : 'default'
                                    }
                                />
                            )}
                            <StatusRow
                                label="Notifikasi gagal"
                                value={stats.failedNotifications}
                                tone={
                                    stats.failedNotifications > 0
                                        ? 'danger'
                                        : 'default'
                                }
                            />
                            <StatusRow
                                label="Pembayaran lunas"
                                value={stats.paidBookings}
                                tone="success"
                            />
                        </CardContent>
                    </Card>

                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle className="font-display text-2xl">
                                Pesanan Terbaru
                            </CardTitle>
                            <CardDescription>
                                Lima booking terakhir dari seluruh customer.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-3">
                            {stats.recentBookings.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                                    Belum ada pesanan.
                                </div>
                            ) : (
                                stats.recentBookings.map((booking) => (
                                    <div
                                        key={booking.code}
                                        className="grid gap-2 rounded-lg border border-border bg-muted/30 p-3"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="truncate font-semibold text-primary">
                                                    {booking.code} -{' '}
                                                    {booking.customerName}
                                                </p>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {booking.bookingDate},{' '}
                                                    {booking.startsAt} -{' '}
                                                    {booking.endsAt}
                                                </p>
                                            </div>
                                            <p className="shrink-0 text-sm font-bold">
                                                {formatRupiah(
                                                    booking.totalPrice,
                                                )}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge
                                                variant="secondary"
                                                className="rounded-md"
                                            >
                                                {booking.statusLabel}
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className="rounded-md"
                                            >
                                                {booking.paymentStatusLabel}
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            )}
                            <Button variant="outline" asChild>
                                <Link href="/orders">
                                    Lihat Semua Pesanan
                                    <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    );
}

function AdminMetricCard({
    label,
    value,
    helper,
    icon: Icon,
    compact = false,
}: {
    label: string;
    value: string | number;
    helper: string;
    icon: LucideIcon;
    compact?: boolean;
}) {
    return (
        <Card className="rounded-lg">
            <CardContent className={compact ? 'p-4' : 'p-4 md:p-5'}>
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="truncate text-[11px] font-bold tracking-[0.16em] text-muted-foreground uppercase">
                            {label}
                        </p>
                        <p
                            className={[
                                'mt-2 font-display font-extrabold text-primary',
                                compact
                                    ? 'text-2xl md:text-3xl'
                                    : 'text-2xl md:text-4xl',
                            ].join(' ')}
                        >
                            {value}
                        </p>
                    </div>
                    <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
                        <Icon className="size-4" />
                    </span>
                </div>
                <p className="mt-3 truncate text-xs text-muted-foreground">
                    {helper}
                </p>
            </CardContent>
        </Card>
    );
}

function AdminActionCard({
    title,
    copy,
    href,
    icon: Icon,
}: {
    title: string;
    copy: string;
    href: string;
    icon: LucideIcon;
}) {
    return (
        <Card className="rounded-lg">
            <CardHeader>
                <span className="grid size-10 place-items-center rounded-md bg-primary text-primary-foreground">
                    <Icon className="size-5" />
                </span>
                <CardTitle className="text-lg">{title}</CardTitle>
                <CardDescription>{copy}</CardDescription>
            </CardHeader>
            <CardContent>
                <Button variant="outline" className="w-full" asChild>
                    <Link href={href}>
                        Buka
                        <ArrowRight className="size-4" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}

function StatusRow({
    label,
    value,
    tone,
}: {
    label: string;
    value: number;
    tone: 'default' | 'warning' | 'danger' | 'success';
}) {
    const toneClass = {
        default: 'bg-muted text-muted-foreground',
        warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
        danger: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
        success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    }[tone];

    return (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
            <span className="min-w-0 text-sm font-medium text-muted-foreground">
                {label}
            </span>
            <span
                className={`shrink-0 rounded-md px-2.5 py-1 text-sm font-bold ${toneClass}`}
            >
                {value}
            </span>
        </div>
    );
}

import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    Clock,
    CreditCard,
    Guitar,
    ReceiptText,
    UserRound,
} from 'lucide-react';
import RhapsodyLayout from '@/layouts/rhapsody-layout';

type Equipment = {
    id: number;
    name: string;
    category: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
};

type Booking = {
    code: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string | null;
    bandName: string | null;
    contactName: string | null;
    whatsappNumber: string | null;
    bookingDate: string;
    startsAt: string;
    endsAt: string;
    durationMinutes: number;
    basePrice: number;
    additionalPrice: number;
    totalPrice: number;
    status: string;
    statusLabel: string;
    isActive: boolean;
    isTerminal: boolean;
    paymentStatus: string;
    paymentStatusLabel: string;
    paymentMethodId: number | null;
    paymentMethodName: string | null;
    notes: string | null;
    customerEquipmentNotes: string | null;
    adminNotes: string | null;
    paymentLinkUrl: string | null;
    createdAt: string | null;
    equipments: Equipment[];
};

type Props = {
    booking: Booking;
    isAdmin: boolean;
};

const formatRp = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;

const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;

    if (hours && rest) return `${hours} jam ${rest} menit`;
    if (hours) return `${hours} jam`;

    return `${rest} menit`;
};

export default function BookingDetail({ booking, isAdmin }: Props) {
    return (
        <>
            <Head title={`RHAPSODY | ${booking.code}`} />
            <RhapsodyLayout>
                <div className="mx-auto grid max-w-6xl gap-6">
                    <header className="grid gap-4">
                        <Link
                            href="/bookings"
                            className="inline-flex w-fit items-center gap-2 text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase hover:text-primary"
                        >
                            <ArrowLeft className="size-4" />
                            Kembali
                        </Link>
                        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                            <div>
                                <p className="text-xs font-bold tracking-[0.22em] text-muted-foreground uppercase">
                                    Info Pesanan
                                </p>
                                <h1 className="mt-2 font-display text-3xl font-extrabold text-primary md:text-4xl">
                                    {booking.code}
                                </h1>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Badge tone="primary">
                                    {booking.statusLabel}
                                </Badge>
                                <Badge tone="muted">
                                    {booking.paymentStatusLabel}
                                </Badge>
                                <Badge tone="dark">
                                    {formatRp(booking.totalPrice)}
                                </Badge>
                            </div>
                        </div>
                    </header>

                    {booking.paymentLinkUrl &&
                        booking.paymentStatus !== 'paid' && (
                            <section className="flex flex-col gap-3 rounded-lg border border-green-600/30 bg-green-600/10 p-5 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <p className="font-display text-xl font-bold text-green-800">
                                        Pembayaran belum selesai
                                    </p>
                                    <p className="mt-1 text-sm text-green-900/80">
                                        Gunakan link pembayaran ini sebelum
                                        invoice kedaluwarsa.
                                    </p>
                                </div>
                                <a
                                    href={booking.paymentLinkUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 rounded-md bg-green-700 px-5 py-3 text-sm font-bold text-white transition hover:opacity-90"
                                >
                                    <CreditCard className="size-4" />
                                    Bayar Sekarang
                                </a>
                            </section>
                        )}

                    <div className="grid gap-4 lg:grid-cols-3">
                        <DetailSection
                            icon={UserRound}
                            title="Data Customer"
                            rows={[
                                ['Nama Band', booking.bandName ?? '-'],
                                [
                                    'Nama Pemesan',
                                    booking.contactName ?? booking.customerName,
                                ],
                                [
                                    'WhatsApp',
                                    booking.whatsappNumber ??
                                        booking.customerPhone ??
                                        '-',
                                ],
                                ['Email', booking.customerEmail],
                            ]}
                        />
                        <DetailSection
                            icon={CalendarDays}
                            title="Jadwal"
                            rows={[
                                ['Tanggal', booking.bookingDate],
                                [
                                    'Jam',
                                    `${booking.startsAt} - ${booking.endsAt}`,
                                ],
                                [
                                    'Durasi',
                                    formatDuration(booking.durationMinutes),
                                ],
                                ['Dibuat', booking.createdAt ?? '-'],
                            ]}
                        />
                        <DetailSection
                            icon={ReceiptText}
                            title="Status"
                            rows={[
                                ['Booking', booking.statusLabel],
                                ['Pembayaran', booking.paymentStatusLabel],
                                [
                                    'Metode',
                                    booking.paymentMethodName ??
                                        'Belum dipilih',
                                ],
                                [
                                    'Tipe',
                                    booking.isTerminal ? 'Riwayat' : 'Aktif',
                                ],
                            ]}
                        />
                    </div>

                    <section className="grid gap-4 rounded-lg border border-border bg-card p-5">
                        <div className="flex items-center gap-3">
                            <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
                                <Guitar className="size-5" />
                            </span>
                            <div>
                                <h2 className="font-display text-xl font-bold text-primary">
                                    Daftar Alat
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Alat studio dan alat tambahan customer.
                                </p>
                            </div>
                        </div>

                        {booking.equipments.length > 0 ? (
                            <div className="grid gap-2">
                                {booking.equipments.map((equipment) => (
                                    <div
                                        key={equipment.id}
                                        className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                                    >
                                        <div>
                                            <p className="text-sm font-semibold text-primary">
                                                {equipment.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {equipment.quantity} x{' '}
                                                {formatRp(equipment.unitPrice)}
                                            </p>
                                        </div>
                                        <p className="text-sm font-bold text-primary">
                                            {formatRp(equipment.subtotal)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
                                Tidak ada alat studio yang dipilih.
                            </p>
                        )}

                        <InfoBlock
                            label="Alat tambahan sendiri"
                            value={
                                booking.customerEquipmentNotes ?? 'Tidak ada'
                            }
                        />
                    </section>

                    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
                        <section className="grid gap-4 rounded-lg border border-border bg-card p-5">
                            <div className="flex items-center gap-3">
                                <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
                                    <Clock className="size-5" />
                                </span>
                                <h2 className="font-display text-xl font-bold text-primary">
                                    Catatan
                                </h2>
                            </div>
                            <InfoBlock
                                label="Catatan customer"
                                value={booking.notes ?? 'Tidak ada'}
                            />
                            {(isAdmin || booking.adminNotes) && (
                                <InfoBlock
                                    label="Catatan admin"
                                    value={booking.adminNotes ?? 'Tidak ada'}
                                />
                            )}
                        </section>

                        <section className="grid content-start gap-3 rounded-lg border border-border bg-card p-5">
                            <div className="flex items-center gap-3">
                                <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
                                    <CreditCard className="size-5" />
                                </span>
                                <h2 className="font-display text-xl font-bold text-primary">
                                    Ringkasan Harga
                                </h2>
                            </div>
                            <PriceRow
                                label="Sewa Studio"
                                value={formatRp(booking.basePrice)}
                            />
                            <PriceRow
                                label="Tambahan Alat"
                                value={formatRp(booking.additionalPrice)}
                            />
                            <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
                                <p className="font-display text-lg font-bold text-primary">
                                    Total
                                </p>
                                <p className="font-display text-lg font-bold text-primary">
                                    {formatRp(booking.totalPrice)}
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </RhapsodyLayout>
        </>
    );
}

function DetailSection({
    icon: Icon,
    title,
    rows,
}: {
    icon: typeof UserRound;
    title: string;
    rows: Array<[string, string]>;
}) {
    return (
        <section className="grid content-start gap-4 rounded-lg border border-border bg-card p-5">
            <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <Icon className="size-5" />
                </span>
                <h2 className="font-display text-xl font-bold text-primary">
                    {title}
                </h2>
            </div>
            <div className="grid gap-3">
                {rows.map(([label, value]) => (
                    <Detail key={label} label={label} value={value} />
                ))}
            </div>
        </section>
    );
}

function Detail({ label, value }: { label: string; value: string }) {
    return (
        <div className="grid gap-1">
            <p className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">
                {label}
            </p>
            <p className="text-sm break-words text-foreground">{value}</p>
        </div>
    );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
    return (
        <div className="grid gap-1 rounded-md border border-border bg-muted/30 p-3">
            <p className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">
                {label}
            </p>
            <p className="text-sm break-words text-foreground">{value}</p>
        </div>
    );
}

function PriceRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-4 text-sm">
            <p className="text-muted-foreground">{label}</p>
            <p className="font-semibold text-foreground">{value}</p>
        </div>
    );
}

function Badge({
    children,
    tone,
}: {
    children: React.ReactNode;
    tone: 'primary' | 'muted' | 'dark';
}) {
    const toneClass = {
        primary: 'bg-primary text-primary-foreground',
        muted: 'border border-border bg-muted text-muted-foreground',
        dark: 'border border-border bg-card text-foreground',
    }[tone];

    return (
        <span
            className={`rounded-full px-3 py-1 text-[10px] font-bold tracking-wider uppercase ${toneClass}`}
        >
            {children}
        </span>
    );
}

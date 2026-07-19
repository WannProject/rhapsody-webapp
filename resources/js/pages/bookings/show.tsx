import { Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
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

const formatRp = (value: number) =>
    'Rp ' + value.toLocaleString('id-ID');

const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h && m) return `${h} jam ${m} menit`;
    if (h) return `${h} jam`;
    return `${m} menit`;
};

export default function BookingDetail({ booking, isAdmin }: Props) {
    return (
        <>
            <Head title={`Booking ${booking.code}`} />
            <RhapsodyLayout>
                <div className="mx-auto grid max-w-5xl gap-6">
                    <header className="flex flex-col gap-3">
                        <Link
                            href="/bookings"
                            className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase hover:text-primary"
                        >
                            ← Kembali ke daftar booking
                        </Link>
                        <p className="text-xs font-bold tracking-[0.22em] text-muted-foreground uppercase">
                            Detail Pesanan
                        </p>
                        <h1 className="font-display text-3xl font-extrabold text-primary md:text-4xl">
                            {booking.code}
                        </h1>
                        <div className="flex flex-wrap gap-2">
                            <Badge tone="primary">{booking.statusLabel}</Badge>
                            <Badge tone="muted">{booking.paymentStatusLabel}</Badge>
                            <Badge tone="dark">{formatRp(booking.totalPrice)}</Badge>
                            {booking.paymentLinkUrl && booking.paymentStatus !== 'paid' && (
                                <a
                                    href={booking.paymentLinkUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center rounded-md bg-green-600 px-4 py-1.5 text-[10px] font-bold tracking-wider text-white uppercase hover:opacity-90"
                                >
                                    Bayar Sekarang
                                </a>
                            )}
                        </div>
                    </header>

                    <section className="grid gap-3 rounded-lg border border-border bg-card p-5 md:grid-cols-2">
        <Detail label="Tanggal Booking" value={booking.bookingDate} />
        <Detail
            label="Jam"
            value={`${booking.startsAt} - ${booking.endsAt}`}
        />
        <Detail
            label="Durasi"
            value={formatDuration(booking.durationMinutes)}
        />
        <Detail
            label="Metode Pembayaran"
            value={booking.paymentMethodName ?? '-'}
        />
        <Detail label="Nama Band" value={booking.bandName ?? '-'} />
        <Detail label="Nama Pemesan" value={booking.contactName ?? booking.customerName} />
        <Detail label="WhatsApp" value={booking.whatsappNumber ?? booking.customerPhone ?? '-'} />
        <Detail label="Email" value={booking.customerEmail} />
        <Detail label="Dibuat" value={booking.createdAt ?? '-'} />
      </section>

                    {booking.equipments.length > 0 && (
                        <section className="grid gap-3 rounded-lg border border-border bg-card p-5">
                            <h2 className="font-display text-xl font-bold text-primary">
                                Alat Studio
                            </h2>
                            <div className="grid gap-2">
                                {booking.equipments.map((eq) => (
                                    <div
                                        key={eq.id}
                                        className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                                    >
                                        <div>
                                            <p className="text-sm font-semibold text-primary">
                                                {eq.name}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground">
                                                {eq.quantity} × {formatRp(eq.unitPrice)}
                                            </p>
                                        </div>
                                        <p className="text-sm font-bold text-primary">
                                            {formatRp(eq.subtotal)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {booking.customerEquipmentNotes && (
                        <section className="grid gap-2 rounded-lg border border-border bg-card p-5">
                            <h2 className="font-display text-xl font-bold text-primary">
                                Alat Tambahan Customer
                            </h2>
                            <p className="text-sm text-foreground/90">
                                {booking.customerEquipmentNotes}
                            </p>
                        </section>
                    )}

                    {booking.notes && (
                        <section className="grid gap-2 rounded-lg border border-border bg-card p-5">
                            <h2 className="font-display text-xl font-bold text-primary">
                                Catatan
                            </h2>
                            <p className="text-sm text-foreground/90">{booking.notes}</p>
                        </section>
                    )}

                    {booking.adminNotes && isAdmin && (
                        <section className="grid gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-5">
                            <h2 className="font-display text-xl font-bold text-amber-700">
                                Catatan Admin
                            </h2>
                            <p className="text-sm text-amber-900/90">{booking.adminNotes}</p>
                        </section>
                    )}

                    <section className="grid gap-2 rounded-lg border border-border bg-card p-5">
                        <h2 className="font-display text-xl font-bold text-primary">
                            Ringkasan Harga
                        </h2>
                        <Row label="Sewa Studio" value={formatRp(booking.basePrice)} />
                        <Row
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
            </RhapsodyLayout>
        </>
    );
}

function Detail({ label, value }: { label: string; value: string }) {
    return (
        <div className="grid gap-1">
            <p className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">
                {label}
            </p>
            <p className="text-sm text-foreground">{value}</p>
        </div>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between text-sm">
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

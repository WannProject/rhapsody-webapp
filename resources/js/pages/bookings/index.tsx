import { Form, Head, usePage } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import RhapsodyLayout from '@/layouts/rhapsody-layout';
import type { Auth } from '@/types';

type Slot = {
    time: string;
    endsAt: string;
    available: boolean;
    price: string;
    label: string;
};
type BookingEquipment = {
    id: number;
    name: string;
    category: string;
    quantity: number;
    unitPrice: number;
};
type BookingItem = {
    code: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string | null;
    bookingDate: string;
    startsAt: string;
    endsAt: string;
    basePrice: number;
    additionalPrice: number;
    totalPrice: number;
    status: string;
    statusLabel: string;
    paymentStatus: string;
    paymentStatusLabel: string;
    paymentMethodId: number | null;
    paymentMethodName: string | null;
    notes: string | null;
    customerEquipmentNotes: string | null;
    adminNotes: string | null;
    paymentLinkUrl: string | null;
    equipments: BookingEquipment[];
};
type EquipmentOption = {
    id: number;
    name: string;
    category: string;
    stock: number;
    additionalPrice: number;
    isMicrophone: boolean;
};
type PaymentMethodItem = {
    id: number;
    type: string;
    typeLabel: string;
    name: string;
    instructions: string | null;
    isActive: boolean;
    sortOrder: number;
};
type Stats = {
    totalBookings: number;
    pendingBookings: number;
    confirmedBookings: number;
    paidBookings: number;
};

type Props = {
    auth: Auth;
    isAdmin: boolean;
    selectedDate: string;
    userRole: string;
    studio: {
        name: string;
        opensAt: string;
        closesAt: string;
        slotDurationMinutes: number;
        hourlyRate: number;
    };
    scheduleSlots: Slot[];
    equipments: EquipmentOption[];
    paymentMethods: PaymentMethodItem[];
    allPaymentMethods: PaymentMethodItem[];
    bookings: BookingItem[];
    stats: Stats;
};

const bookingStatuses = [
    ['pending', 'Menunggu'],
    ['confirmed', 'Terkonfirmasi'],
    ['cancelled', 'Dibatalkan'],
    ['completed', 'Selesai'],
    ['expired', 'Kedaluwarsa'],
    ['refunded', 'Refunded'],
];
const paymentStatuses = [
    ['unpaid', 'Belum Dibayar'],
    ['pending_confirmation', 'Menunggu Konfirmasi'],
    ['paid', 'Lunas'],
    ['failed', 'Gagal'],
    ['expired', 'Kedaluwarsa'],
    ['cancelled', 'Dibatalkan'],
    ['refunded', 'Refunded'],
];
const methodTypes = [
    ['qris', 'QRIS'],
    ['virtual_account', 'Virtual Account'],
    ['bank_transfer', 'Transfer Bank'],
    ['cash', 'Tunai'],
];

export default function BookingsPage() {
    const props = usePage<Props>().props;
    const {
        isAdmin,
        stats,
        bookings,
        scheduleSlots,
        paymentMethods,
        allPaymentMethods,
        selectedDate,
        auth,
        equipments,
    } = props;
    const availableSlots = scheduleSlots.filter((s) => s.available);

    return (
        <>
            <Head title="RHAPSODY | Bookings" />
            <RhapsodyLayout>
                <div className="mx-auto grid max-w-7xl gap-10">
                    <header className="grid gap-3">
                        <p className="text-xs font-bold tracking-[0.22em] text-muted-foreground uppercase">
                            {isAdmin ? 'Admin Studio' : 'Pelanggan'}
                        </p>
                        <h1 className="font-display text-[40px] leading-[1.05] font-extrabold tracking-tight text-primary md:text-[48px]">
                            Bookings
                        </h1>
                        <p className="text-lg text-muted-foreground/80">
                            {isAdmin
                                ? 'Kelola semua booking, status, dan metode pembayaran.'
                                : 'Buat booking baru dan pantau status booking Anda.'}
                        </p>
                    </header>

                    {/* Stats Grid */}
                    <section className="grid gap-3 md:grid-cols-4">
                        {[
                            ['Total Booking', stats.totalBookings],
                            ['Menunggu', stats.pendingBookings],
                            ['Terkonfirmasi', stats.confirmedBookings],
                            ['Lunas', stats.paidBookings],
                        ].map(([label, value]) => (
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

                    {/* Booking Form (Customer) */}
                    {!isAdmin && (
                        <section className="grid gap-5">
                            <div>
                                <h2 className="font-display text-2xl font-bold text-primary">
                                    Buat Booking
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Pilih tanggal, jam kosong, dan metode
                                    pembayaran.
                                </p>
                            </div>
                            <Form
                                action="/bookings"
                                method="post"
                                className="grid gap-4 rounded-lg border border-border bg-card p-5 md:grid-cols-2"
                                resetOnSuccess={['notes', 'customer_equipment_notes']}
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor="booking_date"
                                                className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase"
                                            >
                                                Tanggal
                                            </Label>
                                            <Input
                                                id="booking_date"
                                                name="booking_date"
                                                type="date"
                                                defaultValue={selectedDate}
                                                required
                                            />
                                            <InputError
                                                message={errors.booking_date}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">
                                                Jam
                                            </Label>
                                            <Select name="starts_at" required>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih jam kosong" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableSlots.map((s) => (
                                                        <SelectItem
                                                            key={s.time}
                                                            value={s.time}
                                                        >
                                                            {s.time} -{' '}
                                                            {s.endsAt} (
                                                            {s.price})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError
                                                message={errors.starts_at}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">
                                                Metode Bayar
                                            </Label>
                                            <Select
                                                name="payment_method_id"
                                                required
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih metode" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {paymentMethods.map((m) => (
                                                        <SelectItem
                                                            key={m.id}
                                                            value={String(m.id)}
                                                        >
                                                            {m.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError
                                                message={
                                                    errors.payment_method_id
                                                }
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor="customer_phone"
                                                className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase"
                                            >
                                                WhatsApp
                                            </Label>
                                            <Input
                                                id="customer_phone"
                                                name="customer_phone"
                                                type="tel"
                                                defaultValue={
                                                    (auth.user.whatsapp_number as
                                                        | string
                                                        | null) ??
                                                    auth.user.phone ??
                                                    ''
                                                }
                                                placeholder="62812xxxxxxx"
                                            />
                                            <InputError
                                                message={errors.customer_phone}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <EquipmentPicker
                                                equipments={equipments}
                                                errors={errors}
                                            />
                                        </div>
                                        <div className="grid gap-2 md:col-span-2">
                                            <Label
                                                htmlFor="customer_equipment_notes"
                                                className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase"
                                            >
                                                Alat Tambahan Sendiri
                                            </Label>
                                            <Input
                                                id="customer_equipment_notes"
                                                name="customer_equipment_notes"
                                                placeholder="Contoh: gitar sendiri, pedal efek"
                                            />
                                            <InputError
                                                message={
                                                    errors.customer_equipment_notes
                                                }
                                            />
                                        </div>
                                        <div className="grid gap-2 md:col-span-2">
                                            <Label
                                                htmlFor="notes"
                                                className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase"
                                            >
                                                Catatan
                                            </Label>
                                            <Input
                                                id="notes"
                                                name="notes"
                                                placeholder="Contoh: recording vocal"
                                            />
                                            <InputError
                                                message={errors.notes}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <Button
                                                disabled={
                                                    processing ||
                                                    availableSlots.length === 0
                                                }
                                                className="w-full"
                                            >
                                                Booking Sekarang
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </Form>
                        </section>
                    )}

                    {/* Booking List */}
                    <section className="grid gap-5">
                        <div>
                            <h2 className="font-display text-2xl font-bold text-primary">
                                {isAdmin ? 'Semua Booking' : 'Booking Saya'}
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {isAdmin
                                    ? 'Kelola status dan pembayaran semua booking.'
                                    : 'Pantau dan kelola booking Anda.'}
                            </p>
                        </div>
                        {bookings.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-border p-10 text-center">
                                <p className="font-display text-lg font-semibold text-muted-foreground">
                                    Belum ada booking
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {bookings.map((b) => (
                                    <BookingCard
                                        key={b.code}
                                        booking={b}
                                        isAdmin={isAdmin}
                                        paymentMethods={paymentMethods}
                                    />
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Payment Methods Manager (Admin) */}
                    {isAdmin && (
                        <PaymentMethodManager
                            allPaymentMethods={allPaymentMethods}
                        />
                    )}
                </div>
            </RhapsodyLayout>
        </>
    );
}

function EquipmentPicker({
    equipments,
    errors,
}: {
    equipments: EquipmentOption[];
    errors: Record<string, string>;
}) {
    if (equipments.length === 0) {
        return null;
    }

    return (
        <div className="grid gap-3 rounded-lg border border-border bg-muted/30 p-4">
            <div>
                <p className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">
                    Alat Studio
                </p>
                <p className="mt-1 text-xs text-muted-foreground/80">
                    Centang alat yang dipakai. Mikrofon bisa 0-2 unit.
                </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
                {equipments.map((eq) => {
                    if (eq.isMicrophone) {
                        return (
                            <div
                                key={eq.id}
                                className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2"
                            >
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-primary">
                                        {eq.name}
                                    </p>
                                    {eq.additionalPrice > 0 && (
                                        <p className="text-[11px] text-muted-foreground">
                                            + Rp{' '}
                                            {eq.additionalPrice.toLocaleString(
                                                'id-ID',
                                            )}{' '}
                                            / unit
                                        </p>
                                    )}
                                </div>
                                <Select
                                    name={`equipment[${eq.id}]`}
                                    defaultValue="0"
                                >
                                    <SelectTrigger className="w-24">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from(
                                            { length: eq.stock + 1 },
                                            (_, i) => i,
                                        ).map((qty) => (
                                            <SelectItem
                                                key={qty}
                                                value={String(qty)}
                                            >
                                                {qty}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        );
                    }

                    return (
                        <label
                            key={eq.id}
                            className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2"
                        >
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-primary">
                                    {eq.name}
                                </p>
                                {eq.additionalPrice > 0 && (
                                    <p className="text-[11px] text-muted-foreground">
                                        + Rp{' '}
                                        {eq.additionalPrice.toLocaleString(
                                            'id-ID',
                                        )}
                                    </p>
                                )}
                            </div>
                            <Checkbox
                                name={`equipment[${eq.id}]`}
                                value="1"
                            />
                        </label>
                    );
                })}
            </div>
            {Object.entries(errors).some(([key]) =>
                key.startsWith('equipment.'),
            ) && (
                <p className="text-xs font-semibold text-destructive">
                    {Object.entries(errors)
                        .filter(([key]) => key.startsWith('equipment.'))
                        .map(([, msg]) => msg)
                        .join(' · ')}
                </p>
            )}
        </div>
    );
}

function BookingCard({
    booking: b,
    isAdmin,
    paymentMethods,
}: {
    booking: BookingItem;
    isAdmin: boolean;
    paymentMethods: PaymentMethodItem[];
}) {
    return (
        <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="font-display text-lg font-bold text-primary">
                            {b.code}
                        </p>
                        {isAdmin && (
                            <span className="text-sm text-muted-foreground">
                                · {b.customerName}
                            </span>
                        )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {b.bookingDate}, {b.startsAt} - {b.endsAt}
                    </p>
                    {b.customerPhone && (
                        <p className="text-sm text-muted-foreground">
                            {b.customerPhone}
                        </p>
                    )}
                    {b.notes && (
                        <p className="mt-1 text-xs text-muted-foreground/60">
                            "{b.notes}"
                        </p>
                    )}
                    {b.equipments.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                            {b.equipments.map((eq) => (
                                <span
                                    key={eq.id}
                                    className="rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide"
                                >
                                    {eq.name}
                                    {eq.quantity > 1 ? ` ×${eq.quantity}` : ''}
                                </span>
                            ))}
                        </div>
                    )}
                    {b.customerEquipmentNotes && (
                        <p className="mt-1 text-xs text-muted-foreground/80">
                            Alat sendiri: {b.customerEquipmentNotes}
                        </p>
                    )}
                    {b.adminNotes && (
                        <p className="mt-1 text-xs text-muted-foreground">
                            Admin: {b.adminNotes}
                        </p>
                    )}
                </div>
                <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-border bg-muted px-3 py-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                        {b.statusLabel}
                    </span>
                    <span className="rounded-full border border-border bg-muted px-3 py-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                        {b.paymentStatusLabel}
                    </span>
                    <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-bold tracking-wider text-primary-foreground uppercase">
                        Rp {b.totalPrice.toLocaleString('id-ID')}
                    </span>
                    {b.additionalPrice > 0 && (
                        <span className="rounded-full border border-border bg-card px-3 py-1 text-[10px] tracking-wider text-muted-foreground uppercase">
                            Base Rp {b.basePrice.toLocaleString('id-ID')} +
                            Alat Rp {b.additionalPrice.toLocaleString('id-ID')}
                        </span>
                    )}
                    {b.paymentLinkUrl && b.paymentStatus !== 'paid' && (
                        <a
                            href={b.paymentLinkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center rounded-md bg-green-600 px-4 py-1.5 text-[10px] font-bold tracking-wider text-white uppercase transition hover:opacity-90"
                        >
                            Bayar Sekarang
                        </a>
                    )}
                </div>
            </div>

            {isAdmin ? (
                <Form
                    action={`/bookings/${b.code}/status`}
                    method="patch"
                    className="mt-5 grid gap-3 border-t border-border pt-5 md:grid-cols-5"
                >
                    {({ processing, errors }) => (
                        <>
                            <Select name="status" defaultValue={b.status}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {bookingStatuses.map(([v, l]) => (
                                        <SelectItem key={v} value={v}>
                                            {l}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                name="payment_status"
                                defaultValue={b.paymentStatus}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Bayar" />
                                </SelectTrigger>
                                <SelectContent>
                                    {paymentStatuses.map(([v, l]) => (
                                        <SelectItem key={v} value={v}>
                                            {l}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input
                                name="admin_notes"
                                defaultValue={b.adminNotes ?? ''}
                                placeholder="Catatan admin"
                            />
                            <Button disabled={processing}>Update</Button>
                            <InputError message={errors.status} />
                            <InputError message={errors.payment_status} />
                        </>
                    )}
                </Form>
            ) : b.status === 'pending' ? (
                <Form
                    action={`/bookings/${b.code}`}
                    method="patch"
                    className="mt-5 grid gap-3 border-t border-border pt-5 md:grid-cols-5"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">
                                    Tanggal
                                </Label>
                                <Input
                                    name="booking_date"
                                    type="date"
                                    defaultValue={b.bookingDate}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">
                                    Jam
                                </Label>
                                <Input
                                    name="starts_at"
                                    type="time"
                                    defaultValue={b.startsAt}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">
                                    Bayar
                                </Label>
                                <Select
                                    name="payment_method_id"
                                    defaultValue={
                                        b.paymentMethodId
                                            ? String(b.paymentMethodId)
                                            : undefined
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Metode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {paymentMethods
                                            .filter((m) => m.isActive)
                                            .map((m) => (
                                                <SelectItem
                                                    key={m.id}
                                                    value={String(m.id)}
                                                >
                                                    {m.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">
                                    WA
                                </Label>
                                <Input
                                    name="customer_phone"
                                    defaultValue={b.customerPhone ?? ''}
                                />
                            </div>
                            <div className="flex items-end">
                                <Button disabled={processing}>Update</Button>
                            </div>
                            <InputError message={errors.booking_date} />
                            <InputError message={errors.starts_at} />
                        </>
                    )}
                </Form>
            ) : null}

            {(isAdmin || b.status === 'pending') && (
                <Form
                    action={`/bookings/${b.code}`}
                    method="delete"
                    className="mt-3"
                >
                    {({ processing }) => (
                        <Button
                            variant="outline"
                            disabled={processing}
                            className="w-full"
                        >
                            {isAdmin ? 'Hapus Booking' : 'Batalkan Booking'}
                        </Button>
                    )}
                </Form>
            )}
        </div>
    );
}

function PaymentMethodManager({
    allPaymentMethods,
}: {
    allPaymentMethods: PaymentMethodItem[];
}) {
    return (
        <section className="grid gap-5">
            <div>
                <h2 className="font-display text-2xl font-bold text-primary">
                    Metode Pembayaran
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Atur metode pembayaran yang diterima studio.
                </p>
            </div>
            <Form
                action="/payment-methods"
                method="post"
                className="grid gap-3 rounded-lg border border-border bg-card p-5 md:grid-cols-5"
                resetOnSuccess
            >
                {({ processing, errors }) => (
                    <>
                        <Select name="type" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Jenis" />
                            </SelectTrigger>
                            <SelectContent>
                                {methodTypes.map(([v, l]) => (
                                    <SelectItem key={v} value={v}>
                                        {l}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Input name="name" placeholder="Nama metode" required />
                        <Input name="instructions" placeholder="Instruksi" />
                        <Input
                            name="sort_order"
                            type="number"
                            placeholder="Urutan"
                            defaultValue={allPaymentMethods.length + 1}
                        />
                        <Button disabled={processing}>Tambah</Button>
                        <InputError message={errors.name} />
                    </>
                )}
            </Form>
            {allPaymentMethods.map((m) => (
                <div
                    key={m.id}
                    className="rounded-lg border border-border p-4"
                >
                    <Form
                        action={`/payment-methods/${m.id}`}
                        method="patch"
                        className="grid gap-3 md:grid-cols-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <Select name="type" defaultValue={m.type}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {methodTypes.map(([v, l]) => (
                                            <SelectItem key={v} value={v}>
                                                {l}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Input name="name" defaultValue={m.name} required />
                                <Input
                                    name="instructions"
                                    defaultValue={m.instructions ?? ''}
                                    placeholder="Instruksi"
                                />
                                <Input
                                    name="sort_order"
                                    type="number"
                                    defaultValue={m.sortOrder}
                                />
                                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Checkbox
                                        name="is_active"
                                        defaultChecked={m.isActive}
                                    />{' '}
                                    Aktif
                                </label>
                                <Button disabled={processing}>Simpan</Button>
                                <InputError message={errors.name} />
                            </>
                        )}
                    </Form>
                    <Form
                        action={`/payment-methods/${m.id}`}
                        method="delete"
                        className="mt-2"
                    >
                        {({ processing }) => (
                            <Button
                                variant="outline"
                                disabled={processing}
                                className="w-full"
                            >
                                Hapus
                            </Button>
                        )}
                    </Form>
                </div>
            ))}
        </section>
    );
}

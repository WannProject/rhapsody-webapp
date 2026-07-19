import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    Clock,
    CreditCard,
    Guitar,
    ReceiptText,
    RotateCcw,
    SlidersHorizontal,
} from 'lucide-react';
import { type FormEvent, useEffect, useMemo, useState } from 'react';
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
    status: 'available' | 'held' | 'booked' | 'blocked';
    statusLabel: string;
    booking: {
        code: string;
        status: string;
        customerName: string;
    } | null;
    block: { id: number; reason: string | null } | null;
};
type SlotBlockItem = {
    id: number;
    bookingDate: string;
    startsAt: string;
    endsAt: string;
    reason: string | null;
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
    bandName: string | null;
    contactName: string | null;
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
type FilterOption = {
    value: string;
    label: string;
};
type BookingFilters = {
    filter_date: string;
    band: string;
    status: string;
    payment_status: string;
};

type Props = {
    auth: Auth;
    pageMode: 'booking' | 'orders';
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
    slotBlocks: SlotBlockItem[];
    equipments: EquipmentOption[];
    paymentMethods: PaymentMethodItem[];
    allPaymentMethods: PaymentMethodItem[];
    bookings: BookingItem[];
    activeBookings: BookingItem[];
    historyBookings: BookingItem[];
    stats: Stats;
    filters: BookingFilters;
    bookingStatusOptions: FilterOption[];
    paymentStatusOptions: FilterOption[];
};

const methodTypes = [
    ['qris', 'QRIS'],
    ['virtual_account', 'Virtual Account'],
    ['bank_transfer', 'Transfer Bank'],
    ['cash', 'Tunai'],
];
const bookingFlowSteps = [
    { icon: CalendarDays, label: 'Tanggal' },
    { icon: Clock, label: 'Jam' },
    { icon: Guitar, label: 'Alat' },
    { icon: ReceiptText, label: 'Ringkasan' },
];

export default function BookingsPage() {
    const props = usePage<Props>().props;
    const {
        isAdmin,
        stats,
        bookings,
        activeBookings,
        historyBookings,
        scheduleSlots,
        slotBlocks,
        paymentMethods,
        allPaymentMethods,
        selectedDate,
        auth,
        equipments,
        filters,
        bookingStatusOptions,
        paymentStatusOptions,
        pageMode,
    } = props;
    const isOrdersPage = pageMode === 'orders';
    const title = isOrdersPage ? 'Info Pesanan' : 'Booking';
    const description = isOrdersPage
        ? isAdmin
            ? 'Filter dan kelola seluruh pesanan studio.'
            : 'Pantau pesanan aktif dan riwayat booking Anda.'
        : isAdmin
          ? 'Kelola jadwal studio dan blokir slot yang tidak tersedia.'
          : 'Pilih tanggal, jam, alat, lalu lanjutkan pembayaran.';

    return (
        <>
            <Head title={`RHAPSODY | ${title}`} />
            <RhapsodyLayout>
                <div className="mx-auto grid max-w-7xl gap-10">
                    <header className="grid gap-3">
                        <p className="text-xs font-bold tracking-[0.22em] text-muted-foreground uppercase">
                            {isAdmin ? 'Admin Studio' : 'Pelanggan'}
                        </p>
                        <h1 className="font-display text-[40px] leading-[1.05] font-extrabold tracking-tight text-primary md:text-[48px]">
                            {title}
                        </h1>
                        <p className="text-lg text-muted-foreground/80">
                            {description}
                        </p>
                    </header>

                    {/* Stats Grid */}
                    {isOrdersPage && (
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
                    )}

                    {/* Slot Grid */}
                    {!isOrdersPage && (
                        <section className="grid gap-5">
                            <div>
                                <h2 className="font-display text-2xl font-bold text-primary">
                                    Jadwal {selectedDate}
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Status tiap slot untuk tanggal terpilih.
                                </p>
                            </div>
                            <SlotGrid slots={scheduleSlots} />
                        </section>
                    )}

                    {/* Slot Block Manager (Superadmin) */}
                    {isAdmin && !isOrdersPage && (
                        <SlotBlockManager
                            selectedDate={selectedDate}
                            slotBlocks={slotBlocks}
                        />
                    )}

                    {isAdmin && isOrdersPage && (
                        <AdminBookingFilters
                            selectedDate={selectedDate}
                            filters={filters}
                            bookingStatusOptions={bookingStatusOptions}
                            paymentStatusOptions={paymentStatusOptions}
                        />
                    )}

                    {/* Booking Form (Customer) */}
                    {!isAdmin && !isOrdersPage && (
                        <CustomerBookingFlow
                            auth={auth}
                            selectedDate={selectedDate}
                            scheduleSlots={scheduleSlots}
                            paymentMethods={paymentMethods}
                            equipments={equipments}
                            studio={props.studio}
                        />
                    )}

                    {isOrdersPage && isAdmin ? (
                        <BookingListSection
                            id="info-pesanan"
                            title="Info Pesanan"
                            description="Kelola seluruh pesanan studio dan tindak lanjuti status booking."
                            bookings={bookings}
                            emptyMessage="Belum ada booking"
                            isAdmin={isAdmin}
                            paymentMethods={paymentMethods}
                            bookingStatusOptions={bookingStatusOptions}
                        />
                    ) : isOrdersPage ? (
                        <>
                            <BookingListSection
                                id="info-pesanan"
                                title="Pesanan Aktif"
                                description="Booking yang masih menunggu pembayaran atau sudah terkonfirmasi."
                                bookings={activeBookings}
                                emptyMessage="Belum ada pesanan aktif"
                                isAdmin={isAdmin}
                                paymentMethods={paymentMethods}
                                bookingStatusOptions={bookingStatusOptions}
                            />
                            <BookingListSection
                                id="riwayat-pesanan"
                                title="Riwayat Pesanan"
                                description="Booking yang sudah selesai, dibatalkan, kedaluwarsa, atau refund."
                                bookings={historyBookings}
                                emptyMessage="Belum ada riwayat pesanan"
                                isAdmin={isAdmin}
                                paymentMethods={paymentMethods}
                                bookingStatusOptions={bookingStatusOptions}
                            />
                        </>
                    ) : null}

                    {/* Payment Methods Manager (Admin) */}
                    {isAdmin && isOrdersPage && (
                        <PaymentMethodManager
                            allPaymentMethods={allPaymentMethods}
                        />
                    )}
                </div>
            </RhapsodyLayout>
        </>
    );
}

function AdminBookingFilters({
    selectedDate,
    filters,
    bookingStatusOptions,
    paymentStatusOptions,
}: {
    selectedDate: string;
    filters: BookingFilters;
    bookingStatusOptions: FilterOption[];
    paymentStatusOptions: FilterOption[];
}) {
    const [filterDate, setFilterDate] = useState(filters.filter_date);
    const [band, setBand] = useState(filters.band);
    const [status, setStatus] = useState(filters.status || 'all');
    const [paymentStatus, setPaymentStatus] = useState(
        filters.payment_status || 'all',
    );

    const applyFilters = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.get(
            '/orders',
            {
                date: selectedDate,
                filter_date: filterDate || undefined,
                band: band || undefined,
                status: status === 'all' ? undefined : status,
                payment_status:
                    paymentStatus === 'all' ? undefined : paymentStatus,
            },
            {
                preserveScroll: true,
                preserveState: false,
                replace: true,
            },
        );
    };

    const resetFilters = () => {
        setFilterDate('');
        setBand('');
        setStatus('all');
        setPaymentStatus('all');

        router.get(
            '/orders',
            { date: selectedDate },
            {
                preserveScroll: true,
                preserveState: false,
                replace: true,
            },
        );
    };

    return (
        <section id="orders-filter" className="grid scroll-mt-28 gap-5">
            <div>
                <h2 className="font-display text-2xl font-bold text-primary">
                    Filter Info Pesanan
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Saring pesanan berdasarkan tanggal, nama band, status
                    booking, dan status pembayaran.
                </p>
            </div>

            <form
                onSubmit={applyFilters}
                className="grid gap-3 rounded-lg border border-border bg-card p-5 lg:grid-cols-[minmax(150px,1fr)_minmax(180px,1.2fr)_minmax(160px,1fr)_minmax(170px,1fr)_auto]"
            >
                <div className="grid gap-2">
                    <Label
                        htmlFor="filter_date"
                        className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase"
                    >
                        Tanggal
                    </Label>
                    <Input
                        id="filter_date"
                        type="date"
                        value={filterDate}
                        onChange={(event) => setFilterDate(event.target.value)}
                    />
                </div>

                <div className="grid gap-2">
                    <Label
                        htmlFor="band"
                        className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase"
                    >
                        Nama Band
                    </Label>
                    <Input
                        id="band"
                        value={band}
                        onChange={(event) => setBand(event.target.value)}
                        placeholder="Cari band atau pemesan"
                    />
                </div>

                <div className="grid gap-2">
                    <Label className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">
                        Status Booking
                    </Label>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger>
                            <SelectValue placeholder="Semua status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua status</SelectItem>
                            {bookingStatusOptions.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-2">
                    <Label className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">
                        Status Pembayaran
                    </Label>
                    <Select
                        value={paymentStatus}
                        onValueChange={setPaymentStatus}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Semua pembayaran" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                Semua pembayaran
                            </SelectItem>
                            {paymentStatusOptions.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-end gap-2">
                    <Button type="submit">
                        <SlidersHorizontal className="size-4" />
                        Terapkan
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={resetFilters}
                    >
                        <RotateCcw className="size-4" />
                        Reset
                    </Button>
                </div>
            </form>
        </section>
    );
}

function CustomerBookingFlow({
    auth,
    selectedDate,
    scheduleSlots,
    paymentMethods,
    equipments,
    studio,
}: {
    auth: Auth;
    selectedDate: string;
    scheduleSlots: Slot[];
    paymentMethods: PaymentMethodItem[];
    equipments: EquipmentOption[];
    studio: Props['studio'];
}) {
    const availableSlots = useMemo(
        () => scheduleSlots.filter((slot) => slot.available),
        [scheduleSlots],
    );
    const [selectedTime, setSelectedTime] = useState(
        availableSlots[0]?.time ?? '',
    );
    const [paymentMethodId, setPaymentMethodId] = useState(
        paymentMethods[0] ? String(paymentMethods[0].id) : '',
    );
    const [equipmentSelection, setEquipmentSelection] = useState<
        Record<number, number>
    >({});
    const [customerEquipmentNotes, setCustomerEquipmentNotes] = useState('');

    const selectedSlot = useMemo(
        () => scheduleSlots.find((slot) => slot.time === selectedTime) ?? null,
        [scheduleSlots, selectedTime],
    );
    const selectedPaymentMethod = paymentMethods.find(
        (method) => String(method.id) === paymentMethodId,
    );
    const selectedEquipments = equipments
        .map((equipment) => ({
            ...equipment,
            quantity: equipmentSelection[equipment.id] ?? 0,
        }))
        .filter((equipment) => equipment.quantity > 0);
    const basePrice = Math.round(
        studio.hourlyRate * (studio.slotDurationMinutes / 60),
    );
    const additionalPrice = selectedEquipments.reduce(
        (total, equipment) =>
            total + equipment.additionalPrice * equipment.quantity,
        0,
    );
    const totalPrice = basePrice + additionalPrice;
    const canSubmit = Boolean(selectedSlot?.available && paymentMethodId);

    useEffect(() => {
        if (!selectedSlot?.available) {
            setSelectedTime(availableSlots[0]?.time ?? '');
        }
    }, [availableSlots, selectedSlot]);

    const updateDate = (date: string) => {
        router.get(
            '/bookings',
            { date },
            {
                preserveScroll: true,
                preserveState: false,
                replace: true,
            },
        );
    };

    const setEquipmentQuantity = (equipmentId: number, quantity: number) => {
        setEquipmentSelection((current) => {
            const next = { ...current };

            if (quantity <= 0) {
                delete next[equipmentId];
            } else {
                next[equipmentId] = quantity;
            }

            return next;
        });
    };

    return (
        <section id="booking-form" className="grid scroll-mt-28 gap-5">
            <div>
                <h2 className="font-display text-2xl font-bold text-primary">
                    Buat Booking
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Pilih tanggal, slot, alat, lalu lanjutkan pembayaran.
                </p>
            </div>

            <div className="grid gap-2 md:grid-cols-4">
                {bookingFlowSteps.map(({ icon: Icon, label }, index) => (
                    <div
                        key={label}
                        className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3"
                    >
                        <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                            <Icon className="size-4" />
                        </span>
                        <div>
                            <p className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                Langkah {index + 1}
                            </p>
                            <p className="text-sm font-semibold text-primary">
                                {label}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <Form
                action="/bookings"
                method="post"
                className="grid gap-6 rounded-lg border border-border bg-card p-5"
                resetOnSuccess={['notes', 'customer_equipment_notes']}
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-4 md:grid-cols-2">
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
                                    min={formatDateInput(new Date())}
                                    value={selectedDate}
                                    required
                                    onChange={(event) =>
                                        updateDate(event.target.value)
                                    }
                                />
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        ['Hari ini', new Date()],
                                        [
                                            'Besok',
                                            new Date(
                                                Date.now() +
                                                    24 * 60 * 60 * 1000,
                                            ),
                                        ],
                                    ].map(([label, date]) => {
                                        const value = formatDateInput(
                                            date as Date,
                                        );

                                        return (
                                            <Button
                                                key={label as string}
                                                type="button"
                                                variant={
                                                    selectedDate === value
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="sm"
                                                onClick={() =>
                                                    updateDate(value)
                                                }
                                            >
                                                <CalendarDays className="size-4" />
                                                {label as string}
                                            </Button>
                                        );
                                    })}
                                </div>
                                <InputError message={errors.booking_date} />
                            </div>

                            <div className="grid gap-2">
                                <Label className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">
                                    Jam Tersedia
                                </Label>
                                <Select
                                    name="starts_at"
                                    value={selectedTime}
                                    onValueChange={setSelectedTime}
                                    required
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Pilih jam kosong" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableSlots.map((slot) => (
                                            <SelectItem
                                                key={slot.time}
                                                value={slot.time}
                                            >
                                                {slot.time} - {slot.endsAt} (
                                                {slot.price})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.starts_at} />
                            </div>
                        </div>

                        <SlotGrid
                            slots={scheduleSlots}
                            selectedTime={selectedTime}
                            onSelectSlot={setSelectedTime}
                        />

                        <EquipmentPicker
                            equipments={equipments}
                            errors={errors}
                            selection={equipmentSelection}
                            onQuantityChange={setEquipmentQuantity}
                        />

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="customer_equipment_notes"
                                    className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase"
                                >
                                    Alat Tambahan Sendiri
                                </Label>
                                <Input
                                    id="customer_equipment_notes"
                                    name="customer_equipment_notes"
                                    value={customerEquipmentNotes}
                                    onChange={(event) =>
                                        setCustomerEquipmentNotes(
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Contoh: gitar sendiri, pedal efek"
                                />
                                <InputError
                                    message={errors.customer_equipment_notes}
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
                                <InputError message={errors.customer_phone} />
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
                                <InputError message={errors.notes} />
                            </div>
                        </div>

                        <div className="grid gap-4 border-t border-border pt-5 lg:grid-cols-[1fr_320px]">
                            <div className="grid gap-3">
                                <SummaryRow
                                    label="Tanggal"
                                    value={selectedDate}
                                />
                                <SummaryRow
                                    label="Jam"
                                    value={
                                        selectedSlot
                                            ? `${selectedSlot.time} - ${selectedSlot.endsAt}`
                                            : 'Belum dipilih'
                                    }
                                />
                                <SummaryRow
                                    label="Metode bayar"
                                    value={
                                        selectedPaymentMethod?.name ??
                                        'Belum dipilih'
                                    }
                                />
                                <SummaryRow
                                    label="Alat studio"
                                    value={
                                        selectedEquipments.length > 0
                                            ? selectedEquipments
                                                  .map((equipment) =>
                                                      equipment.quantity > 1
                                                          ? `${equipment.name} x${equipment.quantity}`
                                                          : equipment.name,
                                                  )
                                                  .join(', ')
                                            : 'Tidak ada'
                                    }
                                />
                                <SummaryRow
                                    label="Alat sendiri"
                                    value={
                                        customerEquipmentNotes || 'Tidak ada'
                                    }
                                />
                            </div>

                            <div className="grid content-between gap-4 rounded-lg border border-border bg-muted/30 p-4">
                                <div className="grid gap-2">
                                    <SummaryRow
                                        label="Harga slot"
                                        value={formatRupiah(basePrice)}
                                    />
                                    <SummaryRow
                                        label="Tambahan alat"
                                        value={formatRupiah(additionalPrice)}
                                    />
                                    <div className="flex items-center justify-between border-t border-border pt-3">
                                        <span className="text-sm font-semibold text-muted-foreground">
                                            Total pembayaran
                                        </span>
                                        <span className="font-display text-xl font-bold text-primary">
                                            {formatRupiah(totalPrice)}
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    disabled={processing || !canSubmit}
                                    className="w-full"
                                >
                                    <CreditCard className="size-4" />
                                    Lanjutkan Pembayaran
                                    <ArrowRight className="size-4" />
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </Form>
        </section>
    );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between gap-4">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-right text-sm font-semibold text-primary">
                {value}
            </span>
        </div>
    );
}

function formatRupiah(value: number): string {
    return `Rp ${value.toLocaleString('id-ID')}`;
}

function formatDateInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function SlotGrid({
    slots,
    selectedTime,
    onSelectSlot,
}: {
    slots: Slot[];
    selectedTime?: string;
    onSelectSlot?: (time: string) => void;
}) {
    const tone: Record<Slot['status'], string> = {
        available: 'border-primary/40 bg-primary/5 text-primary',
        held: 'border-amber-500/40 bg-amber-500/10 text-amber-700',
        booked: 'border-rose-500/40 bg-rose-500/10 text-rose-700',
        blocked: 'border-zinc-500/40 bg-zinc-500/10 text-zinc-700',
    };

    return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {slots.map((s) => {
                const isSelected = selectedTime === s.time;
                const interactive = Boolean(onSelectSlot && s.available);

                return (
                    <button
                        key={s.time}
                        type="button"
                        disabled={!interactive}
                        onClick={() => onSelectSlot?.(s.time)}
                        className={`rounded-lg border p-4 text-left transition ${
                            isSelected
                                ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                                : ''
                        } ${
                            interactive
                                ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-sm'
                                : 'cursor-default'
                        } ${tone[s.status]}`}
                    >
                        <div className="flex items-center justify-between">
                            <p className="font-display text-lg font-bold">
                                {s.time} - {s.endsAt}
                            </p>
                            <span className="inline-flex items-center gap-1 rounded-full border border-current px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                                {isSelected && (
                                    <CheckCircle2 className="size-3" />
                                )}
                                {s.statusLabel}
                            </span>
                        </div>
                        <p className="mt-1 text-xs opacity-80">{s.price}</p>
                        {s.booking && (
                            <p className="mt-1 text-xs opacity-80">
                                {s.booking.customerName} ({s.booking.code})
                            </p>
                        )}
                        {s.block?.reason && (
                            <p className="mt-1 text-xs opacity-80">
                                Alasan: {s.block.reason}
                            </p>
                        )}
                    </button>
                );
            })}
            {slots.length === 0 && (
                <p className="col-span-full text-center text-sm text-muted-foreground">
                    Tidak ada slot untuk tanggal ini.
                </p>
            )}
        </div>
    );
}

function SlotBlockManager({
    selectedDate,
    slotBlocks,
}: {
    selectedDate: string;
    slotBlocks: SlotBlockItem[];
}) {
    return (
        <section id="slot-blocks" className="grid scroll-mt-28 gap-5">
            <div>
                <h2 className="font-display text-2xl font-bold text-primary">
                    Blokir Slot
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Cegah customer membooking slot tertentu (libur, maintenance,
                    dll).
                </p>
            </div>

            <Form
                action="/admin/slot-blocks"
                method="post"
                className="grid gap-3 rounded-lg border border-border bg-card p-5 md:grid-cols-4"
            >
                {({ processing, errors }) => (
                    <>
                        <Input
                            name="booking_date"
                            type="date"
                            defaultValue={selectedDate}
                            required
                        />
                        <Input
                            name="starts_at"
                            type="time"
                            required
                            defaultValue="09:00"
                        />
                        <Input
                            name="reason"
                            placeholder="Alasan blokir (opsional)"
                        />
                        <Button disabled={processing}>Blokir Slot</Button>
                        <InputError message={errors.booking_date} />
                        <InputError message={errors.starts_at} />
                        <InputError message={errors.reason} />
                    </>
                )}
            </Form>

            {slotBlocks.length > 0 && (
                <div className="grid gap-3">
                    {slotBlocks.map((b) => (
                        <div
                            key={b.id}
                            className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 md:flex-row md:items-center md:justify-between"
                        >
                            <div>
                                <p className="font-display font-bold text-primary">
                                    {b.bookingDate}, {b.startsAt} - {b.endsAt}
                                </p>
                                {b.reason && (
                                    <p className="text-xs text-muted-foreground">
                                        {b.reason}
                                    </p>
                                )}
                            </div>
                            <Form
                                action={`/admin/slot-blocks/${b.id}`}
                                method="delete"
                            >
                                {({ processing }) => (
                                    <Button
                                        variant="outline"
                                        disabled={processing}
                                    >
                                        Buka Blokir
                                    </Button>
                                )}
                            </Form>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

function EquipmentPicker({
    equipments,
    errors,
    selection,
    onQuantityChange,
}: {
    equipments: EquipmentOption[];
    errors: Record<string, string>;
    selection?: Record<number, number>;
    onQuantityChange?: (equipmentId: number, quantity: number) => void;
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
                    const quantity = selection?.[eq.id] ?? 0;

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
                                    value={String(quantity)}
                                    onValueChange={(value) =>
                                        onQuantityChange?.(eq.id, Number(value))
                                    }
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
                                {quantity > 0 && (
                                    <input
                                        type="hidden"
                                        name={`equipment[${eq.id}]`}
                                        value={quantity}
                                    />
                                )}
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
                                checked={quantity > 0}
                                onCheckedChange={(checked) =>
                                    onQuantityChange?.(
                                        eq.id,
                                        checked === true ? 1 : 0,
                                    )
                                }
                            />
                            {quantity > 0 && (
                                <input
                                    type="hidden"
                                    name={`equipment[${eq.id}]`}
                                    value="1"
                                />
                            )}
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

function BookingListSection({
    id,
    title,
    description,
    bookings,
    emptyMessage,
    isAdmin,
    paymentMethods,
    bookingStatusOptions,
}: {
    id?: string;
    title: string;
    description: string;
    bookings: BookingItem[];
    emptyMessage: string;
    isAdmin: boolean;
    paymentMethods: PaymentMethodItem[];
    bookingStatusOptions: FilterOption[];
}) {
    return (
        <section id={id} className="grid scroll-mt-28 gap-5">
            <div>
                <h2 className="font-display text-2xl font-bold text-primary">
                    {title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    {description}
                </p>
            </div>
            {bookings.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-10 text-center">
                    <p className="font-display text-lg font-semibold text-muted-foreground">
                        {emptyMessage}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {bookings.map((booking) => (
                        <BookingCard
                            key={booking.code}
                            booking={booking}
                            isAdmin={isAdmin}
                            paymentMethods={paymentMethods}
                            bookingStatusOptions={bookingStatusOptions}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}

function BookingCard({
    booking: b,
    isAdmin,
    paymentMethods,
    bookingStatusOptions,
}: {
    booking: BookingItem;
    isAdmin: boolean;
    paymentMethods: PaymentMethodItem[];
    bookingStatusOptions: FilterOption[];
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
                                · {b.bandName ?? b.customerName}
                            </span>
                        )}
                    </div>
                    {isAdmin && b.contactName && (
                        <p className="text-sm text-muted-foreground">
                            Pemesan: {b.contactName}
                        </p>
                    )}
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
                                    className="rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase"
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
                    <Link
                        href={`/bookings/${b.code}`}
                        className="inline-flex items-center rounded-md border border-border bg-card px-4 py-1.5 text-[10px] font-bold tracking-wider text-primary uppercase transition hover:bg-muted"
                    >
                        Detail Pesanan
                    </Link>
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
                            Base Rp {b.basePrice.toLocaleString('id-ID')} + Alat
                            Rp {b.additionalPrice.toLocaleString('id-ID')}
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
                    className="mt-5 grid gap-3 border-t border-border pt-5 md:grid-cols-[minmax(160px,1fr)_minmax(160px,1fr)_minmax(220px,2fr)_auto]"
                >
                    {({ processing, errors }) => (
                        <>
                            <Select name="status" defaultValue={b.status}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {bookingStatusOptions.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="flex min-h-10 items-center rounded-md border border-border bg-muted/40 px-3 text-sm font-medium text-muted-foreground">
                                Bayar: {b.paymentStatusLabel}
                            </div>
                            <Input
                                name="admin_notes"
                                defaultValue={b.adminNotes ?? ''}
                                placeholder="Catatan admin"
                            />
                            <Button disabled={processing}>Update</Button>
                            <InputError message={errors.status} />
                        </>
                    )}
                </Form>
            ) : b.status === 'pending_payment' ? (
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

            {(isAdmin || b.status === 'pending_payment') && (
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
        <section id="payment-methods" className="grid scroll-mt-28 gap-5">
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
                <div key={m.id} className="rounded-lg border border-border p-4">
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
                                <Input
                                    name="name"
                                    defaultValue={m.name}
                                    required
                                />
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

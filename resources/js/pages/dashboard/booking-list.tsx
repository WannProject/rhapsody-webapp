import { Form } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { Booking, PaymentMethod, UserRole } from '@/pages/dashboard/types';

type BookingListProps = {
    bookings: Booking[];
    paymentMethods: PaymentMethod[];
    userRole: UserRole;
};

const bookingStatuses = [
    ['pending', 'Menunggu Konfirmasi'],
    ['confirmed', 'Terkonfirmasi'],
    ['cancelled', 'Dibatalkan'],
    ['completed', 'Selesai'],
];

const paymentStatuses = [
    ['unpaid', 'Belum Dibayar'],
    ['pending_confirmation', 'Menunggu Konfirmasi'],
    ['paid', 'Lunas'],
    ['cancelled', 'Dibatalkan'],
];

export function BookingList({
    bookings,
    paymentMethods,
    userRole,
}: BookingListProps) {
    return (
        <section className="rounded-lg border bg-card p-5">
            <div>
                <h2 className="text-lg font-semibold">
                    {userRole === 'admin' ? 'Semua Booking' : 'Booking Saya'}
                </h2>
                <p className="text-sm text-muted-foreground">
                    Kelola jadwal, status booking, dan status pembayaran.
                </p>
            </div>

            <div className="mt-5 grid gap-4">
                {bookings.length === 0 ? (
                    <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                        Belum ada booking.
                    </p>
                ) : null}

                {bookings.map((booking) => (
                    <article
                        key={booking.code}
                        className="rounded-md border p-4"
                    >
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div>
                                <p className="font-semibold">{booking.code}</p>
                                <p className="text-sm text-muted-foreground">
                                    {booking.bookingDate}, {booking.startsAt} -{' '}
                                    {booking.endsAt}
                                </p>
                                <p className="mt-1 text-sm">
                                    {booking.customerName} -{' '}
                                    {booking.customerPhone ?? '-'}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2 text-xs font-semibold">
                                <span className="rounded-md bg-muted px-2 py-1">
                                    {booking.statusLabel}
                                </span>
                                <span className="rounded-md bg-muted px-2 py-1">
                                    {booking.paymentStatusLabel}
                                </span>
                                <span className="rounded-md bg-muted px-2 py-1">
                                    Rp{' '}
                                    {booking.totalPrice.toLocaleString('id-ID')}
                                </span>
                            </div>
                        </div>

                        {userRole === 'admin' ? (
                            <AdminBookingActions booking={booking} />
                        ) : (
                            <CustomerBookingActions
                                booking={booking}
                                paymentMethods={paymentMethods}
                            />
                        )}
                    </article>
                ))}
            </div>
        </section>
    );
}

function AdminBookingActions({ booking }: { booking: Booking }) {
    return (
        <div className="mt-4 grid gap-3 border-t pt-4">
            <Form
                action={`/admin/bookings/${booking.code}`}
                method="patch"
                className="grid gap-3 md:grid-cols-4"
            >
                {({ processing, errors }) => (
                    <>
                        <Select name="status" defaultValue={booking.status}>
                            <SelectTrigger>
                                <SelectValue placeholder="Status booking" />
                            </SelectTrigger>
                            <SelectContent>
                                {bookingStatuses.map(([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            name="payment_status"
                            defaultValue={booking.paymentStatus}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Status pembayaran" />
                            </SelectTrigger>
                            <SelectContent>
                                {paymentStatuses.map(([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Input
                            name="admin_notes"
                            defaultValue={booking.adminNotes ?? ''}
                            placeholder="Catatan admin"
                        />

                        <Button disabled={processing}>Update Status</Button>
                        <InputError message={errors.status} />
                        <InputError message={errors.payment_status} />
                        <InputError message={errors.admin_notes} />
                    </>
                )}
            </Form>

            <Form action={`/admin/bookings/${booking.code}`} method="delete">
                {({ processing }) => (
                    <Button variant="destructive" disabled={processing}>
                        Hapus Booking
                    </Button>
                )}
            </Form>
        </div>
    );
}

function CustomerBookingActions({
    booking,
    paymentMethods,
}: {
    booking: Booking;
    paymentMethods: PaymentMethod[];
}) {
    if (booking.status !== 'pending') {
        return null;
    }

    return (
        <div className="mt-4 grid gap-3 border-t pt-4">
            <Form
                action={`/bookings/${booking.code}`}
                method="patch"
                className="grid gap-3 md:grid-cols-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-2">
                            <Label>Tanggal</Label>
                            <Input
                                name="booking_date"
                                type="date"
                                defaultValue={booking.bookingDate}
                                required
                            />
                            <InputError message={errors.booking_date} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Jam mulai</Label>
                            <Input
                                name="starts_at"
                                type="time"
                                defaultValue={booking.startsAt}
                                required
                            />
                            <InputError message={errors.starts_at} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Metode bayar</Label>
                            <Select
                                name="payment_method_id"
                                defaultValue={
                                    booking.paymentMethodId
                                        ? String(booking.paymentMethodId)
                                        : undefined
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Metode" />
                                </SelectTrigger>
                                <SelectContent>
                                    {paymentMethods
                                        .filter((method) => method.isActive)
                                        .map((method) => (
                                            <SelectItem
                                                key={method.id}
                                                value={String(method.id)}
                                            >
                                                {method.name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.payment_method_id} />
                        </div>
                        <div className="grid gap-2">
                            <Label>WhatsApp</Label>
                            <Input
                                name="customer_phone"
                                defaultValue={booking.customerPhone ?? ''}
                            />
                            <InputError message={errors.customer_phone} />
                        </div>
                        <div className="flex items-end">
                            <Button disabled={processing}>Update</Button>
                        </div>
                    </>
                )}
            </Form>

            <Form action={`/bookings/${booking.code}`} method="delete">
                {({ processing }) => (
                    <Button variant="outline" disabled={processing}>
                        Batalkan Booking
                    </Button>
                )}
            </Form>
        </div>
    );
}

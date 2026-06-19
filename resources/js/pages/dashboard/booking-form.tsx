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
import type { PaymentMethod, ScheduleSlot } from '@/pages/dashboard/types';
import type { Auth } from '@/types';

type BookingFormProps = {
    auth: Auth;
    selectedDate: string;
    scheduleSlots: ScheduleSlot[];
    paymentMethods: PaymentMethod[];
};

export function BookingForm({
    auth,
    selectedDate,
    scheduleSlots,
    paymentMethods,
}: BookingFormProps) {
    const availableSlots = scheduleSlots.filter((slot) => slot.available);
    const activePaymentMethods = paymentMethods.filter(
        (method) => method.isActive,
    );

    return (
        <section className="rounded-lg border bg-card p-5">
            <div>
                <h2 className="text-lg font-semibold">Buat Booking</h2>
                <p className="text-sm text-muted-foreground">
                    Pilih tanggal, jam kosong, dan metode pembayaran.
                </p>
            </div>

            <Form
                action="/bookings"
                method="post"
                className="mt-5 grid gap-4 md:grid-cols-2"
                resetOnSuccess={['notes']}
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="booking_date">Tanggal</Label>
                            <Input
                                id="booking_date"
                                name="booking_date"
                                type="date"
                                defaultValue={selectedDate}
                                required
                            />
                            <InputError message={errors.booking_date} />
                        </div>

                        <div className="grid gap-2">
                            <Label>Jam</Label>
                            <Select name="starts_at" required>
                                <SelectTrigger>
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

                        <div className="grid gap-2">
                            <Label>Metode pembayaran</Label>
                            <Select name="payment_method_id" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih metode" />
                                </SelectTrigger>
                                <SelectContent>
                                    {activePaymentMethods.map((method) => (
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
                            <Label htmlFor="customer_phone">
                                Nomor WhatsApp
                            </Label>
                            <Input
                                id="customer_phone"
                                name="customer_phone"
                                type="tel"
                                defaultValue={auth.user.phone ?? ''}
                                placeholder="62812xxxxxxx"
                            />
                            <InputError message={errors.customer_phone} />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="notes">Catatan</Label>
                            <Input
                                id="notes"
                                name="notes"
                                placeholder="Contoh: recording vocal, butuh setup 10 menit"
                            />
                            <InputError message={errors.notes} />
                        </div>

                        <div className="md:col-span-2">
                            <Button
                                disabled={
                                    processing || availableSlots.length === 0
                                }
                            >
                                Booking Sekarang
                            </Button>
                        </div>
                    </>
                )}
            </Form>
        </section>
    );
}

import { Form, router } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { PaymentMethod } from '@/pages/dashboard/types';

type PaymentMethodManagerProps = {
    paymentMethods: PaymentMethod[];
};

const methodTypes = [
    ['qris', 'QRIS'],
    ['virtual_account', 'Virtual Account'],
    ['bank_transfer', 'Transfer Bank'],
    ['cash', 'Tunai'],
];

export function PaymentMethodManager({
    paymentMethods,
}: PaymentMethodManagerProps) {
    return (
        <section className="rounded-lg border bg-card p-5">
            <div>
                <h2 className="text-lg font-semibold">Metode Pembayaran</h2>
                <p className="text-sm text-muted-foreground">
                    Admin dapat mengatur metode yang diterima studio.
                </p>
            </div>

            <Form
                action="/admin/payment-methods"
                method="post"
                className="mt-5 grid gap-3 md:grid-cols-5"
                resetOnSuccess
            >
                {({ processing, errors }) => (
                    <>
                        <Select name="type" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Jenis" />
                            </SelectTrigger>
                            <SelectContent>
                                {methodTypes.map(([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Input name="name" placeholder="Nama metode" required />
                        <Input
                            name="instructions"
                            placeholder="Instruksi pembayaran"
                        />
                        <Input
                            name="sort_order"
                            type="number"
                            placeholder="Urutan"
                            defaultValue={paymentMethods.length + 1}
                        />
                        <Button disabled={processing}>Tambah</Button>
                        <InputError message={errors.name} />
                    </>
                )}
            </Form>

            <div className="mt-5 grid gap-4">
                {paymentMethods.map((method) => (
                    <Form
                        key={method.id}
                        action={`/admin/payment-methods/${method.id}`}
                        method="patch"
                        className="grid gap-3 rounded-md border p-3 md:grid-cols-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <Select name="type" defaultValue={method.type}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {methodTypes.map(([value, label]) => (
                                            <SelectItem
                                                key={value}
                                                value={value}
                                            >
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Input
                                    name="name"
                                    defaultValue={method.name}
                                    required
                                />
                                <Input
                                    name="instructions"
                                    defaultValue={method.instructions ?? ''}
                                />
                                <Input
                                    name="sort_order"
                                    type="number"
                                    defaultValue={method.sortOrder}
                                />
                                <label className="flex items-center gap-2 text-sm">
                                    <Checkbox
                                        name="is_active"
                                        defaultChecked={method.isActive}
                                    />
                                    Aktif
                                </label>
                                <div className="flex gap-2">
                                    <Button disabled={processing}>
                                        Simpan
                                    </Button>
                                    <DeletePaymentMethodButton id={method.id} />
                                </div>
                                <InputError message={errors.name} />
                            </>
                        )}
                    </Form>
                ))}
            </div>
        </section>
    );
}

function DeletePaymentMethodButton({ id }: { id: number }) {
    return (
        <Button
            type="button"
            variant="outline"
            onClick={() => router.delete(`/admin/payment-methods/${id}`)}
        >
            Hapus
        </Button>
    );
}

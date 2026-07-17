import { Form, Head } from '@inertiajs/react';
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

type Studio = {
    name: string;
    address: string | null;
    description: string | null;
    contactPhone: string | null;
    locationUrl: string | null;
    opensAt: string;
    closesAt: string;
    slotDurationMinutes: number;
    minimumBookingMinutes: number;
    hourlyRate: number;
    isActive: boolean;
};

type Equipment = {
    id: number;
    name: string;
    category: string;
    stock: number;
    additionalPrice: number;
    isActive: boolean;
};

type Props = {
    studio: Studio;
    equipments: Equipment[];
};

const categories = [
    ['guitar', 'Gitar'],
    ['keyboard', 'Piano / Keyboard'],
    ['bass', 'Bass'],
    ['drum', 'Drum'],
    ['microphone', 'Mikrofon'],
    ['other', 'Lainnya'],
];

const fmt = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;

export default function StudioDataIndex({ studio, equipments }: Props) {
    return (
        <>
            <Head title="RHAPSODY | Ubah Data" />
            <RhapsodyLayout>
                <div className="mx-auto grid max-w-6xl gap-10">
                    <header className="grid gap-3">
                        <p className="text-xs font-bold tracking-[0.22em] text-muted-foreground uppercase">
                            Super Admin
                        </p>
                        <h1 className="font-display text-[40px] leading-[1.05] font-extrabold tracking-tight text-primary md:text-[48px]">
                            Ubah Data
                        </h1>
                        <p className="max-w-3xl text-lg text-muted-foreground/80">
                            Kelola informasi studio, harga, jam operasional, dan data alat yang tersedia untuk booking berikutnya.
                        </p>
                    </header>

                    <StudioForm studio={studio} />
                    <EquipmentManager equipments={equipments} />
                </div>
            </RhapsodyLayout>
        </>
    );
}

function StudioForm({ studio }: { studio: Studio }) {
    return (
        <section className="grid gap-5">
            <div>
                <h2 className="font-display text-2xl font-bold text-primary">
                    Data Studio
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Perubahan harga dan durasi dipakai untuk booking baru.
                </p>
            </div>

            <Form
                action="/admin/studio-data/studio"
                method="patch"
                className="grid gap-5 rounded-lg border border-border bg-card p-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-4 md:grid-cols-2">
                            <Field label="Nama Studio" error={errors.name}>
                                <Input
                                    name="name"
                                    defaultValue={studio.name}
                                    required
                                />
                            </Field>
                            <Field label="Nomor Kontak" error={errors.contact_phone}>
                                <Input
                                    name="contact_phone"
                                    type="tel"
                                    defaultValue={studio.contactPhone ?? ''}
                                    placeholder="62812xxxxxxx"
                                />
                            </Field>
                        </div>

                        <Field label="Alamat" error={errors.address}>
                            <textarea
                                name="address"
                                defaultValue={studio.address ?? ''}
                                className="min-h-24 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            />
                        </Field>

                        <Field label="Deskripsi" error={errors.description}>
                            <textarea
                                name="description"
                                defaultValue={studio.description ?? ''}
                                className="min-h-28 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            />
                        </Field>

                        <Field label="URL Lokasi" error={errors.location_url}>
                            <Input
                                name="location_url"
                                type="url"
                                defaultValue={studio.locationUrl ?? ''}
                                placeholder="https://maps.google.com/..."
                            />
                        </Field>

                        <div className="grid gap-4 md:grid-cols-5">
                            <Field label="Buka" error={errors.opens_at}>
                                <Input
                                    name="opens_at"
                                    type="time"
                                    defaultValue={studio.opensAt}
                                    required
                                />
                            </Field>
                            <Field label="Tutup" error={errors.closes_at}>
                                <Input
                                    name="closes_at"
                                    type="time"
                                    defaultValue={studio.closesAt}
                                    required
                                />
                            </Field>
                            <Field
                                label="Durasi Slot"
                                error={errors.slot_duration_minutes}
                            >
                                <Input
                                    name="slot_duration_minutes"
                                    type="number"
                                    min="30"
                                    step="30"
                                    defaultValue={studio.slotDurationMinutes}
                                    required
                                />
                            </Field>
                            <Field
                                label="Minimum Booking"
                                error={errors.minimum_booking_minutes}
                            >
                                <Input
                                    name="minimum_booking_minutes"
                                    type="number"
                                    min="30"
                                    step="30"
                                    defaultValue={studio.minimumBookingMinutes}
                                    required
                                />
                            </Field>
                            <Field label="Harga / Jam" error={errors.hourly_rate}>
                                <Input
                                    name="hourly_rate"
                                    type="number"
                                    min="0"
                                    defaultValue={studio.hourlyRate}
                                    required
                                />
                            </Field>
                        </div>

                        <div className="flex flex-col gap-4 border-t border-border pt-5 md:flex-row md:items-center md:justify-between">
                            <label className="flex items-center gap-3 text-sm font-semibold text-muted-foreground">
                                <Checkbox
                                    name="is_active"
                                    defaultChecked={studio.isActive}
                                />
                                Studio aktif untuk booking
                            </label>
                            <Button disabled={processing}>Simpan Data Studio</Button>
                        </div>
                    </>
                )}
            </Form>
        </section>
    );
}

function EquipmentManager({ equipments }: { equipments: Equipment[] }) {
    return (
        <section className="grid gap-5">
            <div>
                <h2 className="font-display text-2xl font-bold text-primary">
                    Data Alat
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Kelola stok dan biaya tambahan alat milik studio.
                </p>
            </div>

            <Form
                action="/admin/studio-data/equipment"
                method="post"
                className="grid gap-3 rounded-lg border border-border bg-card p-5 md:grid-cols-6"
                resetOnSuccess
            >
                {({ processing, errors }) => (
                    <>
                        <Input
                            name="name"
                            placeholder="Nama alat"
                            required
                            className="md:col-span-2"
                        />
                        <Select name="category" defaultValue="other" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map(([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Input
                            name="stock"
                            type="number"
                            min="0"
                            defaultValue="1"
                            placeholder="Stok"
                        />
                        <Input
                            name="additional_price"
                            type="number"
                            min="0"
                            defaultValue="0"
                            placeholder="Biaya"
                        />
                        <Button disabled={processing}>Tambah Alat</Button>
                        <InputError message={errors.name} />
                        <InputError message={errors.category} />
                        <InputError message={errors.stock} />
                        <InputError message={errors.additional_price} />
                    </>
                )}
            </Form>

            <div className="grid gap-4">
                {equipments.map((equipment) => (
                    <EquipmentRow key={equipment.id} equipment={equipment} />
                ))}

                {equipments.length === 0 && (
                    <div className="rounded-lg border border-dashed border-border p-10 text-center">
                        <p className="font-display text-lg font-semibold text-muted-foreground">
                            Belum ada data alat
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}

function EquipmentRow({ equipment }: { equipment: Equipment }) {
    return (
        <div className="rounded-lg border border-border bg-card p-4">
            <Form
                action={`/admin/studio-data/equipment/${equipment.id}`}
                method="patch"
                className="grid gap-3 md:grid-cols-7"
            >
                {({ processing, errors }) => (
                    <>
                        <Input
                            name="name"
                            defaultValue={equipment.name}
                            required
                            className="md:col-span-2"
                        />
                        <Select
                            name="category"
                            defaultValue={equipment.category}
                            required
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map(([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Input
                            name="stock"
                            type="number"
                            min="0"
                            defaultValue={equipment.stock}
                            required
                        />
                        <Input
                            name="additional_price"
                            type="number"
                            min="0"
                            defaultValue={equipment.additionalPrice}
                            required
                        />
                        <label className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                            <Checkbox
                                name="is_active"
                                defaultChecked={equipment.isActive}
                            />
                            Aktif
                        </label>
                        <Button disabled={processing}>Simpan</Button>
                        <InputError message={errors.name} />
                        <InputError message={errors.category} />
                        <InputError message={errors.stock} />
                        <InputError message={errors.additional_price} />
                    </>
                )}
            </Form>

            <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-muted-foreground">
                    Biaya tambahan saat ini: {fmt(equipment.additionalPrice)}
                </p>
                <Form
                    action={`/admin/studio-data/equipment/${equipment.id}`}
                    method="delete"
                >
                    {({ processing }) => (
                        <Button variant="outline" disabled={processing}>
                            Hapus Alat
                        </Button>
                    )}
                </Form>
            </div>
        </div>
    );
}

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <label className="grid gap-2">
            <Label className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">
                {label}
            </Label>
            {children}
            <InputError message={error} />
        </label>
    );
}

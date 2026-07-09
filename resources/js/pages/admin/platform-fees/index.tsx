import { Form, Head } from '@inertiajs/react';
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
import RhapsodyLayout from '@/layouts/rhapsody-layout';

type FeeRuleItem = {
    id: number;
    clientName: string;
    feeType: string;
    feeTypeLabel: string;
    percent: number;
    flatAmount: number;
    isActive: boolean;
    xenditSplitRuleId: string | null;
};

type Props = {
    feeRules: {
        data: FeeRuleItem[];
        current_page: number;
        last_page: number;
        total: number;
    };
};

const feeTypes = [
    ['flat', 'Flat'],
    ['percent', 'Percent'],
    ['hybrid', 'Hybrid'],
];

export default function PlatformFeesIndex({ feeRules }: Props) {
    return (
        <>
            <Head title="RHAPSODY | Platform Fees" />
            <RhapsodyLayout>
                <div className="mx-auto grid max-w-5xl gap-10">
                    <header className="grid gap-3">
                        <p className="text-xs font-bold tracking-[0.22em] text-muted-foreground uppercase">
                            Super Admin
                        </p>
                        <h1 className="font-display text-[40px] leading-[1.05] font-extrabold tracking-tight text-primary md:text-[48px]">
                            Platform Fee
                        </h1>
                        <p className="text-lg text-muted-foreground/80">
                            Konfigurasi fee yang dipotong otomatis dari setiap transaksi.
                        </p>
                    </header>

                    <Form
                        action="/admin/platform-fees"
                        method="post"
                        className="grid gap-4 rounded-lg border border-border bg-card p-5 md:grid-cols-4"
                        resetOnSuccess
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">Type</Label>
                                    <Select name="fee_type" required>
                                        <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                                        <SelectContent>
                                            {feeTypes.map(([v, l]) => (
                                                <SelectItem key={v} value={v}>{l}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.fee_type} />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">Percent (%)</Label>
                                    <Input name="percent" type="number" step="0.01" defaultValue="0" />
                                    <InputError message={errors.percent} />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">Flat Amount (Rp)</Label>
                                    <Input name="flat_amount" type="number" defaultValue="0" />
                                    <InputError message={errors.flat_amount} />
                                </div>
                                <div className="flex items-end">
                                    <Button disabled={processing}>Tambah Rule</Button>
                                </div>
                            </>
                        )}
                    </Form>

                    <section className="grid gap-4">
                        {feeRules.data.map((r) => (
                            <div key={r.id} className="rounded-lg border border-border bg-card p-5">
                                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-display text-lg font-bold text-primary">
                                                {r.clientName}
                                            </p>
                                            <span className="rounded-full border border-border bg-muted px-3 py-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                                                {r.feeTypeLabel}
                                            </span>
                                            <span className={`rounded-full px-3 py-1 text-[10px] font-bold tracking-wider uppercase ${
                                                r.isActive
                                                    ? 'bg-green-500/10 text-green-600'
                                                    : 'bg-muted text-muted-foreground'
                                            }`}>
                                                {r.isActive ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {r.feeType === 'percent' && `${r.percent}%`}
                                            {r.feeType === 'flat' && `Rp ${r.flatAmount.toLocaleString('id-ID')}`}
                                            {r.feeType === 'hybrid' && `${r.percent}% + Rp ${r.flatAmount.toLocaleString('id-ID')}`}
                                        </p>
                                        {r.xenditSplitRuleId && (
                                            <p className="mt-1 text-xs text-muted-foreground/60">
                                                Split Rule: {r.xenditSplitRuleId}
                                            </p>
                                        )}
                                    </div>
                                    <Form action={`/admin/platform-fees/${r.id}`} method="delete">
                                        {({ processing }) => (
                                            <Button variant="outline" disabled={processing}>Hapus</Button>
                                        )}
                                    </Form>
                                </div>
                            </div>
                        ))}

                        {feeRules.data.length === 0 && (
                            <div className="rounded-lg border border-dashed border-border p-10 text-center">
                                <p className="font-display text-lg font-semibold text-muted-foreground">
                                    Belum ada fee rule
                                </p>
                            </div>
                        )}
                    </section>
                </div>
            </RhapsodyLayout>
        </>
    );
}

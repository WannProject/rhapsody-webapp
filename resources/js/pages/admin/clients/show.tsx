import { Form, Head, Link } from '@inertiajs/react';
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

type Client = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    businessName: string | null;
    businessType: string | null;
    status: string;
    statusLabel: string;
    canReceivePayments: boolean;
    verifiedAt: string | null;
    xenditAccountId: string | null;
    xenditStatus: string | null;
    feeRule: {
        feeType: string;
        percent: number;
        flatAmount: number;
    } | null;
};

type Props = { client: Client };

const statusOptions = [
    ['draft', 'Draft'],
    ['invited', 'Invited'],
    ['submitted', 'Submitted'],
    ['verified', 'Verified'],
    ['rejected', 'Rejected'],
    ['suspended', 'Suspended'],
];

export default function ClientShow({ client: c }: Props) {
    return (
        <>
            <Head title={`RHAPSODY | ${c.name}`} />
            <RhapsodyLayout>
                <div className="mx-auto grid max-w-5xl gap-10">
                    <header className="grid gap-3">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/admin/clients">Kembali</Link>
                            </Button>
                        </div>
                        <h1 className="font-display text-[40px] leading-[1.05] font-extrabold tracking-tight text-primary md:text-[48px]">
                            {c.name}
                        </h1>
                        <div className="flex flex-wrap gap-2">
                            <span className={`rounded-full border px-3 py-1 text-[10px] font-bold tracking-wider uppercase ${
                                c.canReceivePayments
                                    ? 'border-green-500 bg-green-500/10 text-green-600'
                                    : 'border-border bg-muted text-muted-foreground'
                            }`}>
                                {c.statusLabel}
                            </span>
                        </div>
                    </header>

                    <section className="grid gap-5">
                        <div className="rounded-lg border border-border bg-card p-5">
                            <h2 className="font-display text-xl font-bold text-primary">Info Client</h2>
                            <dl className="mt-4 grid gap-3 md:grid-cols-2">
                                <div>
                                    <dt className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">Email</dt>
                                    <dd className="mt-1 text-sm">{c.email}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">Phone</dt>
                                    <dd className="mt-1 text-sm">{c.phone ?? '-'}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">Business</dt>
                                    <dd className="mt-1 text-sm">{c.businessName ?? '-'} {c.businessType && `(${c.businessType})`}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">Verified At</dt>
                                    <dd className="mt-1 text-sm">{c.verifiedAt ?? '-'}</dd>
                                </div>
                            </dl>
                        </div>

                        <div className="rounded-lg border border-border bg-card p-5">
                            <h2 className="font-display text-xl font-bold text-primary">Xendit Sub-Account</h2>
                            {c.xenditAccountId ? (
                                <dl className="mt-4 grid gap-3 md:grid-cols-2">
                                    <div>
                                        <dt className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">Account ID</dt>
                                        <dd className="mt-1 text-sm">{c.xenditAccountId}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">Status</dt>
                                        <dd className="mt-1 text-sm">{c.xenditStatus ?? '-'}</dd>
                                    </div>
                                </dl>
                            ) : (
                                <div className="mt-4">
                                    <p className="text-sm text-muted-foreground mb-3">
                                        Belum ada sub-account Xendit. Buat untuk mengaktifkan pembayaran.
                                    </p>
                                    <Form action={`/admin/clients/${c.id}/sub-account`} method="post">
                                        {({ processing }) => (
                                            <Button disabled={processing}>Buat Sub-Account Xendit</Button>
                                        )}
                                    </Form>
                                </div>
                            )}
                        </div>

                        <div className="rounded-lg border border-border bg-card p-5">
                            <h2 className="font-display text-xl font-bold text-primary">Update Status</h2>
                            <Form
                                action={`/admin/clients/${c.id}`}
                                method="patch"
                                className="mt-4 grid gap-3 md:grid-cols-3"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid gap-2">
                                            <Label className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">Status</Label>
                                            <Select name="status" defaultValue={c.status}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {statusOptions.map(([v, l]) => (
                                                        <SelectItem key={v} value={v}>{l}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.status} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">Phone</Label>
                                            <Input name="phone" defaultValue={c.phone ?? ''} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">Business Name</Label>
                                            <Input name="business_name" defaultValue={c.businessName ?? ''} />
                                        </div>
                                        <div className="md:col-span-3">
                                            <Button disabled={processing}>Update</Button>
                                        </div>
                                    </>
                                )}
                            </Form>
                        </div>

                        {c.feeRule && (
                            <div className="rounded-lg border border-border bg-card p-5">
                                <h2 className="font-display text-xl font-bold text-primary">Fee Rule</h2>
                                <dl className="mt-4 grid gap-3 md:grid-cols-3">
                                    <div>
                                        <dt className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">Type</dt>
                                        <dd className="mt-1 text-sm capitalize">{c.feeRule.feeType}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">Percent</dt>
                                        <dd className="mt-1 text-sm">{c.feeRule.percent}%</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">Flat</dt>
                                        <dd className="mt-1 text-sm">Rp {c.feeRule.flatAmount.toLocaleString('id-ID')}</dd>
                                    </div>
                                </dl>
                            </div>
                        )}
                    </section>
                </div>
            </RhapsodyLayout>
        </>
    );
}

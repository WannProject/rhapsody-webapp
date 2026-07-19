import { Form, Head, Link, router } from '@inertiajs/react';
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

type ClientItem = {
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
};

type Props = {
    clients: {
        data: ClientItem[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: { status?: string };
};

const statusOptions = [
    ['draft', 'Draft'],
    ['invited', 'Invited'],
    ['submitted', 'Submitted'],
    ['verified', 'Verified'],
    ['rejected', 'Rejected'],
    ['suspended', 'Suspended'],
];

export default function ClientsIndex({ clients, filters }: Props) {
    const updateStatusFilter = (status: string) => {
        router.get(
            '/admin/clients',
            status === 'all' ? {} : { status },
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };
    const pageUrl = (page: number) => {
        const params = new URLSearchParams({ page: String(page) });
        if (filters.status) {
            params.set('status', filters.status);
        }

        return `/admin/clients?${params.toString()}`;
    };

    return (
        <>
            <Head title="RHAPSODY | Clients" />
            <RhapsodyLayout>
                <div className="mx-auto grid max-w-7xl gap-10">
                    <header className="grid gap-3">
                        <p className="text-xs font-bold tracking-[0.22em] text-muted-foreground uppercase">
                            Super Admin
                        </p>
                        <h1 className="font-display text-[40px] leading-[1.05] font-extrabold tracking-tight text-primary md:text-[48px]">
                            Client Merchant
                        </h1>
                        <p className="text-lg text-muted-foreground/80">
                            Kelola client, sub-account Xendit, dan status KYC.
                        </p>
                    </header>

                    <Form
                        action="/admin/clients"
                        method="post"
                        className="grid gap-4 rounded-lg border border-border bg-card p-5 md:grid-cols-2"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">
                                        Nama
                                    </Label>
                                    <Input name="name" required placeholder="Nama client" />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">
                                        Email
                                    </Label>
                                    <Input name="email" type="email" required placeholder="email@client.com" />
                                    <InputError message={errors.email} />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">
                                        Phone
                                    </Label>
                                    <Input name="phone" placeholder="62812xxxxxxx" />
                                    <InputError message={errors.phone} />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">
                                        Business Name
                                    </Label>
                                    <Input name="business_name" placeholder="Nama bisnis" />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">
                                        Business Type
                                    </Label>
                                    <Input name="business_type" placeholder="Contoh: STUDIO" />
                                </div>
                                <div className="flex items-end">
                                    <Button disabled={processing}>Tambah Client</Button>
                                </div>
                            </>
                        )}
                    </Form>

                    <section className="grid gap-4">
                        <div className="flex items-center gap-3">
                            <Select
                                name="status_filter"
                                value={filters.status ?? 'all'}
                                onValueChange={updateStatusFilter}
                            >
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Filter status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua</SelectItem>
                                    {statusOptions.map(([v, l]) => (
                                        <SelectItem key={v} value={v}>{l}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <span className="text-sm text-muted-foreground">
                                Total: {clients.total} client
                            </span>
                        </div>

                        {clients.data.map((c) => (
                            <div key={c.id} className="rounded-lg border border-border bg-card p-5">
                                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-display text-lg font-bold text-primary">
                                                {c.name}
                                            </p>
                                            <span className={`rounded-full border px-3 py-1 text-[10px] font-bold tracking-wider uppercase ${
                                                c.canReceivePayments
                                                    ? 'border-green-500 bg-green-500/10 text-green-600'
                                                    : 'border-border bg-muted text-muted-foreground'
                                            }`}>
                                                {c.statusLabel}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {c.email} {c.phone && `· ${c.phone}`}
                                        </p>
                                        {c.businessName && (
                                            <p className="text-sm text-muted-foreground">
                                                {c.businessName} {c.businessType && `· ${c.businessType}`}
                                            </p>
                                        )}
                                        {c.xenditAccountId && (
                                            <p className="mt-1 text-xs text-muted-foreground/60">
                                                Xendit: {c.xenditAccountId} ({c.xenditStatus})
                                            </p>
                                        )}
                                        {!c.canReceivePayments && (
                                            <p className="mt-2 text-xs font-semibold text-amber-600">
                                                Client belum verified — belum bisa menerima pembayaran
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            variant="outline"
                                            asChild
                                        >
                                            <Link
                                                href={`/admin/clients/${c.id}`}
                                            >
                                                Detail
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {clients.data.length === 0 && (
                            <div className="rounded-lg border border-dashed border-border p-10 text-center">
                                <p className="font-display text-lg font-semibold text-muted-foreground">
                                    Belum ada client
                                </p>
                            </div>
                        )}
                    </section>

                    {clients.last_page > 1 && (
                        <div className="flex items-center justify-center gap-2">
                            {Array.from({ length: clients.last_page }, (_, i) => i + 1).map((page) => (
                                <Button
                                    key={page}
                                    size="sm"
                                    variant={
                                        page === clients.current_page
                                            ? 'default'
                                            : 'outline'
                                    }
                                    asChild
                                >
                                    <Link href={pageUrl(page)}>
                                        {page}
                                    </Link>
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
            </RhapsodyLayout>
        </>
    );
}

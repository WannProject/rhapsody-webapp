import { Form, Head, Link } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    Download,
    Filter,
    RotateCcw,
} from 'lucide-react';
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

type LedgerEntry = {
    id: number;
    type: string;
    amount: number;
    description: string | null;
    createdAt: string;
    paymentCode: string | null;
    withdrawalId: number | null;
};

type WithdrawalItem = {
    id: number;
    amount: number;
    status: string;
    statusLabel: string;
    destination: string;
    requestedBy: string | null;
    createdAt: string;
    xenditPayoutId: string | null;
    xenditReferenceId: string | null;
    xenditPayoutStatus: string | null;
    failureReason: string | null;
};
type BalanceSnapshot = {
    source: string;
    status: string;
    amount: number;
    ledgerAmount: number;
    currency: string;
    message: string;
    asOf: string;
};

type Props = {
    availableBalance: number;
    balanceSnapshot: BalanceSnapshot;
    totalPlatformFee: number;
    pendingWithdrawals: number;
    totalWithdrawn: number;
    ledgerEntries: LedgerEntry[];
    withdrawals: WithdrawalItem[];
    ledgerPagination: { currentPage: number; lastPage: number; total: number };
    withdrawalPagination: {
        currentPage: number;
        lastPage: number;
        total: number;
    };
    filters: {
        type: string | null;
        withdrawal_status: string | null;
        from_date: string | null;
        to_date: string | null;
    };
};

type Pagination = Props['ledgerPagination'];
type Filters = Props['filters'];

function walletUrl(
    filters: Filters,
    ledgerPage?: number,
    withdrawalPage?: number,
): string {
    const query = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value) {
            query.set(key, value);
        }
    });

    if (ledgerPage && ledgerPage > 1) {
        query.set('ledger_page', String(ledgerPage));
    }

    if (withdrawalPage && withdrawalPage > 1) {
        query.set('withdrawal_page', String(withdrawalPage));
    }

    const queryString = query.toString();

    return `/admin/platform-wallet${queryString ? `?${queryString}` : ''}`;
}

function PaginationControls({
    pagination,
    previousUrl,
    nextUrl,
}: {
    pagination: Pagination;
    previousUrl: string;
    nextUrl: string;
}) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
                Halaman {pagination.currentPage} dari {pagination.lastPage} ·{' '}
                {pagination.total} data
            </p>
            <div className="flex items-center gap-2">
                {pagination.currentPage > 1 ? (
                    <Button variant="outline" size="icon" asChild>
                        <Link
                            href={previousUrl}
                            preserveScroll
                            aria-label="Halaman sebelumnya"
                        >
                            <ChevronLeft />
                        </Link>
                    </Button>
                ) : (
                    <Button
                        variant="outline"
                        size="icon"
                        disabled
                        aria-label="Halaman sebelumnya"
                    >
                        <ChevronLeft />
                    </Button>
                )}
                {pagination.currentPage < pagination.lastPage ? (
                    <Button variant="outline" size="icon" asChild>
                        <Link
                            href={nextUrl}
                            preserveScroll
                            aria-label="Halaman berikutnya"
                        >
                            <ChevronRight />
                        </Link>
                    </Button>
                ) : (
                    <Button
                        variant="outline"
                        size="icon"
                        disabled
                        aria-label="Halaman berikutnya"
                    >
                        <ChevronRight />
                    </Button>
                )}
            </div>
        </div>
    );
}

export default function PlatformWalletIndex({
    availableBalance,
    balanceSnapshot,
    totalPlatformFee,
    pendingWithdrawals,
    totalWithdrawn,
    ledgerEntries,
    withdrawals,
    ledgerPagination,
    withdrawalPagination,
    filters,
}: Props) {
    const fmt = (n: number) => 'Rp ' + n.toLocaleString('id-ID');
    const exportQuery = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value) {
            exportQuery.set(key, value);
        }
    });

    const exportUrl = `/admin/platform-wallet/export${exportQuery.size ? `?${exportQuery.toString()}` : ''}`;
    const filterKey = Object.values(filters).join('|');

    return (
        <>
            <Head title="RHAPSODY | Platform Wallet" />
            <RhapsodyLayout>
                <div className="mx-auto grid max-w-7xl gap-10">
                    <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                        <div className="grid gap-3">
                            <p className="text-xs font-bold tracking-[0.22em] text-muted-foreground uppercase">
                                Super Admin
                            </p>
                            <h1 className="font-display text-[40px] leading-[1.05] font-extrabold tracking-tight text-primary md:text-[48px]">
                                Platform Wallet
                            </h1>
                            <p className="text-lg text-muted-foreground/80">
                                Saldo platform fee, riwayat ledger, dan
                                withdrawal.
                            </p>
                        </div>
                        <Button variant="outline" asChild>
                            <a href={exportUrl}>
                                <Download />
                                Export CSV
                            </a>
                        </Button>
                    </header>

                    <section className="grid gap-3 md:grid-cols-5">
                        {[
                            [
                                balanceSnapshot.source === 'xendit_live'
                                    ? 'Saldo Xendit Live'
                                    : 'Saldo Ledger Internal',
                                balanceSnapshot.amount,
                                true,
                            ],
                            ['Ledger Available', availableBalance, false],
                            ['Total Platform Fee', totalPlatformFee, false],
                            ['Pending Withdrawal', pendingWithdrawals, false],
                            ['Total Withdrawn', totalWithdrawn, false],
                        ].map(([label, value, highlight]) => (
                            <div
                                key={label as string}
                                className={`rounded-lg border p-5 ${highlight ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}
                            >
                                <p className="text-xs font-bold tracking-[0.22em] text-muted-foreground uppercase">
                                    {label as string}
                                </p>
                                <p className="mt-3 font-display text-[24px] leading-none font-bold text-primary">
                                    {fmt(value as number)}
                                </p>
                            </div>
                        ))}
                        <div className="rounded-lg border border-border bg-card p-5 md:col-span-5">
                            <p className="text-xs font-bold tracking-[0.22em] text-muted-foreground uppercase">
                                Sumber Saldo
                            </p>
                            <p className="mt-2 text-sm font-semibold text-primary">
                                {balanceSnapshot.message}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Status: {balanceSnapshot.status} · Currency:{' '}
                                {balanceSnapshot.currency} · As of:{' '}
                                {balanceSnapshot.asOf}
                            </p>
                        </div>
                    </section>

                    <section className="border-y border-border py-5">
                        <Form
                            key={filterKey}
                            action="/admin/platform-wallet"
                            method="get"
                            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:items-end"
                        >
                            <div className="grid gap-2">
                                <Label htmlFor="wallet-type">Tipe ledger</Label>
                                <Select
                                    name="type"
                                    defaultValue={filters.type ?? 'all'}
                                >
                                    <SelectTrigger
                                        id="wallet-type"
                                        className="w-full"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Semua tipe
                                        </SelectItem>
                                        <SelectItem value="credit">
                                            Credit
                                        </SelectItem>
                                        <SelectItem value="debit">
                                            Debit
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="withdrawal-status">
                                    Status withdrawal
                                </Label>
                                <Select
                                    name="withdrawal_status"
                                    defaultValue={
                                        filters.withdrawal_status ?? 'all'
                                    }
                                >
                                    <SelectTrigger
                                        id="withdrawal-status"
                                        className="w-full"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Semua status
                                        </SelectItem>
                                        <SelectItem value="pending">
                                            Pending
                                        </SelectItem>
                                        <SelectItem value="processing">
                                            Processing
                                        </SelectItem>
                                        <SelectItem value="succeeded">
                                            Succeeded
                                        </SelectItem>
                                        <SelectItem value="failed">
                                            Failed
                                        </SelectItem>
                                        <SelectItem value="cancelled">
                                            Cancelled
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="from-date">Dari tanggal</Label>
                                <Input
                                    id="from-date"
                                    name="from_date"
                                    type="date"
                                    defaultValue={filters.from_date ?? ''}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="to-date">Sampai tanggal</Label>
                                <Input
                                    id="to-date"
                                    name="to_date"
                                    type="date"
                                    defaultValue={filters.to_date ?? ''}
                                />
                            </div>
                            <Button type="submit">
                                <Filter />
                                Terapkan
                            </Button>
                            <Button type="button" variant="outline" asChild>
                                <Link href="/admin/platform-wallet">
                                    <RotateCcw />
                                    Reset
                                </Link>
                            </Button>
                        </Form>
                    </section>

                    {/* Withdrawal Form */}
                    <section className="grid gap-5">
                        <div>
                            <h2 className="font-display text-2xl font-bold text-primary">
                                Ajukan Withdrawal
                            </h2>
                        </div>
                        <Form
                            action="/admin/platform-withdrawals"
                            method="post"
                            className="grid gap-4 rounded-lg border border-border bg-card p-5 md:grid-cols-4"
                            resetOnSuccess
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">
                                            Nominal (Rp)
                                        </Label>
                                        <Input
                                            name="amount"
                                            type="number"
                                            required
                                            placeholder="50000"
                                        />
                                        <InputError message={errors.amount} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">
                                            Bank Code
                                        </Label>
                                        <Input
                                            name="bank_code"
                                            required
                                            placeholder="BCA"
                                        />
                                        <InputError
                                            message={errors.bank_code}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">
                                            Account Holder
                                        </Label>
                                        <Input
                                            name="account_holder"
                                            required
                                            placeholder="Nama pemilik"
                                        />
                                        <InputError
                                            message={errors.account_holder}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">
                                            Account Number
                                        </Label>
                                        <Input
                                            name="account_number"
                                            required
                                            placeholder="1234567890"
                                        />
                                        <InputError
                                            message={errors.account_number}
                                        />
                                    </div>
                                    <div className="md:col-span-4">
                                        <Button disabled={processing}>
                                            Ajukan Withdrawal
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </section>

                    {/* Withdrawal History */}
                    <section className="grid gap-5">
                        <div>
                            <h2 className="font-display text-2xl font-bold text-primary">
                                Riwayat Withdrawal
                            </h2>
                        </div>
                        <div className="overflow-hidden rounded-lg border border-border">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[1040px] text-sm">
                                    <thead className="bg-primary text-primary-foreground">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-extrabold tracking-wider uppercase">
                                                ID
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-extrabold tracking-wider uppercase">
                                                Nominal
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-extrabold tracking-wider uppercase">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-extrabold tracking-wider uppercase">
                                                Tujuan
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-extrabold tracking-wider uppercase">
                                                Diajukan
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-extrabold tracking-wider uppercase">
                                                Xendit
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-extrabold tracking-wider uppercase"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {withdrawals.map((w) => (
                                            <tr
                                                key={w.id}
                                                className="border-b border-border"
                                            >
                                                <td className="px-4 py-3">
                                                    #{w.id}
                                                </td>
                                                <td className="px-4 py-3 font-semibold">
                                                    {fmt(w.amount)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="rounded-full border border-border bg-muted px-2 py-1 text-[10px] font-bold tracking-wider uppercase">
                                                        {w.statusLabel}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {w.destination}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {w.createdAt}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground">
                                                    <p>
                                                        Ref:{' '}
                                                        {w.xenditReferenceId ??
                                                            '-'}
                                                    </p>
                                                    <p>
                                                        Payout:{' '}
                                                        {w.xenditPayoutId ??
                                                            '-'}
                                                    </p>
                                                    <p>
                                                        Status:{' '}
                                                        {w.xenditPayoutStatus ??
                                                            '-'}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {![
                                                        'succeeded',
                                                        'failed',
                                                        'cancelled',
                                                    ].includes(w.status) && (
                                                        <Form
                                                            action={`/admin/platform-withdrawals/${w.id}`}
                                                            method="delete"
                                                        >
                                                            {({
                                                                processing,
                                                            }) => (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    disabled={
                                                                        processing
                                                                    }
                                                                >
                                                                    Batal
                                                                </Button>
                                                            )}
                                                        </Form>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {withdrawals.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={7}
                                                    className="px-4 py-8 text-center text-muted-foreground"
                                                >
                                                    Belum ada withdrawal
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <PaginationControls
                                pagination={withdrawalPagination}
                                previousUrl={walletUrl(
                                    filters,
                                    ledgerPagination.currentPage,
                                    withdrawalPagination.currentPage - 1,
                                )}
                                nextUrl={walletUrl(
                                    filters,
                                    ledgerPagination.currentPage,
                                    withdrawalPagination.currentPage + 1,
                                )}
                            />
                        </div>
                    </section>

                    {/* Ledger Entries */}
                    <section className="grid gap-5">
                        <div>
                            <h2 className="font-display text-2xl font-bold text-primary">
                                Platform Fee Ledger
                            </h2>
                        </div>
                        <div className="overflow-hidden rounded-lg border border-border">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[760px] text-sm">
                                    <thead className="bg-primary text-primary-foreground">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-extrabold tracking-wider uppercase">
                                                Type
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-extrabold tracking-wider uppercase">
                                                Nominal
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-extrabold tracking-wider uppercase">
                                                Deskripsi
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-extrabold tracking-wider uppercase">
                                                Booking
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-extrabold tracking-wider uppercase">
                                                Tanggal
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ledgerEntries.map((e) => (
                                            <tr
                                                key={e.id}
                                                className="border-b border-border"
                                            >
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`rounded-full px-2 py-1 text-[10px] font-bold tracking-wider uppercase ${
                                                            e.type === 'credit'
                                                                ? 'bg-green-500/10 text-green-600'
                                                                : 'bg-red-500/10 text-red-600'
                                                        }`}
                                                    >
                                                        {e.type}
                                                    </span>
                                                </td>
                                                <td
                                                    className={`px-4 py-3 font-semibold ${e.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}
                                                >
                                                    {e.type === 'credit'
                                                        ? '+'
                                                        : '-'}
                                                    {fmt(e.amount)}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {e.description ?? '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {e.paymentCode ?? '-'}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {e.createdAt}
                                                </td>
                                            </tr>
                                        ))}
                                        {ledgerEntries.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="px-4 py-8 text-center text-muted-foreground"
                                                >
                                                    Belum ada ledger entry
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <PaginationControls
                                pagination={ledgerPagination}
                                previousUrl={walletUrl(
                                    filters,
                                    ledgerPagination.currentPage - 1,
                                    withdrawalPagination.currentPage,
                                )}
                                nextUrl={walletUrl(
                                    filters,
                                    ledgerPagination.currentPage + 1,
                                    withdrawalPagination.currentPage,
                                )}
                            />
                        </div>
                    </section>
                </div>
            </RhapsodyLayout>
        </>
    );
}

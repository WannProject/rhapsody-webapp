import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    failureReason: string | null;
};

type Props = {
    availableBalance: number;
    totalPlatformFee: number;
    pendingWithdrawals: number;
    totalWithdrawn: number;
    ledgerEntries: LedgerEntry[];
    withdrawals: WithdrawalItem[];
    ledgerPagination: { currentPage: number; lastPage: number; total: number };
    withdrawalPagination: { currentPage: number; lastPage: number; total: number };
};

export default function PlatformWalletIndex({
    availableBalance,
    totalPlatformFee,
    pendingWithdrawals,
    totalWithdrawn,
    ledgerEntries,
    withdrawals,
}: Props) {
    const fmt = (n: number) => 'Rp ' + n.toLocaleString('id-ID');

    return (
        <>
            <Head title="RHAPSODY | Platform Wallet" />
            <RhapsodyLayout>
                <div className="mx-auto grid max-w-7xl gap-10">
                    <header className="grid gap-3">
                        <p className="text-xs font-bold tracking-[0.22em] text-muted-foreground uppercase">
                            Super Admin
                        </p>
                        <h1 className="font-display text-[40px] leading-[1.05] font-extrabold tracking-tight text-primary md:text-[48px]">
                            Platform Wallet
                        </h1>
                        <p className="text-lg text-muted-foreground/80">
                            Saldo platform fee, riwayat ledger, dan withdrawal.
                        </p>
                    </header>

                    <section className="grid gap-3 md:grid-cols-4">
                        {[
                            ['Available Balance', availableBalance, true],
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
                                        <Input name="amount" type="number" required placeholder="50000" />
                                        <InputError message={errors.amount} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">
                                            Bank Code
                                        </Label>
                                        <Input name="bank_code" required placeholder="BCA" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">
                                            Account Holder
                                        </Label>
                                        <Input name="account_holder" required placeholder="Nama pemilik" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">
                                            Account Number
                                        </Label>
                                        <Input name="account_number" required placeholder="1234567890" />
                                        <InputError message={errors.account_number} />
                                    </div>
                                    <div className="md:col-span-4">
                                        <Button disabled={processing}>Ajukan Withdrawal</Button>
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
                            <table className="w-full text-sm">
                                <thead className="bg-primary text-primary-foreground">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-extrabold tracking-wider uppercase text-xs">ID</th>
                                        <th className="px-4 py-3 text-left font-extrabold tracking-wider uppercase text-xs">Nominal</th>
                                        <th className="px-4 py-3 text-left font-extrabold tracking-wider uppercase text-xs">Status</th>
                                        <th className="px-4 py-3 text-left font-extrabold tracking-wider uppercase text-xs">Tujuan</th>
                                        <th className="px-4 py-3 text-left font-extrabold tracking-wider uppercase text-xs">Diajukan</th>
                                        <th className="px-4 py-3 text-left font-extrabold tracking-wider uppercase text-xs"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {withdrawals.map((w) => (
                                        <tr key={w.id} className="border-b border-border">
                                            <td className="px-4 py-3">#{w.id}</td>
                                            <td className="px-4 py-3 font-semibold">{fmt(w.amount)}</td>
                                            <td className="px-4 py-3">
                                                <span className="rounded-full border border-border bg-muted px-2 py-1 text-[10px] font-bold tracking-wider uppercase">
                                                    {w.statusLabel}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">{w.destination}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{w.createdAt}</td>
                                            <td className="px-4 py-3">
                                                {!['succeeded', 'failed', 'cancelled'].includes(w.status) && (
                                                    <Form action={`/admin/platform-withdrawals/${w.id}`} method="delete">
                                                        {({ processing }) => (
                                                            <Button variant="outline" size="sm" disabled={processing}>
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
                                            <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                                                Belum ada withdrawal
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
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
                            <table className="w-full text-sm">
                                <thead className="bg-primary text-primary-foreground">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-extrabold tracking-wider uppercase text-xs">Type</th>
                                        <th className="px-4 py-3 text-left font-extrabold tracking-wider uppercase text-xs">Nominal</th>
                                        <th className="px-4 py-3 text-left font-extrabold tracking-wider uppercase text-xs">Deskripsi</th>
                                        <th className="px-4 py-3 text-left font-extrabold tracking-wider uppercase text-xs">Booking</th>
                                        <th className="px-4 py-3 text-left font-extrabold tracking-wider uppercase text-xs">Tanggal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ledgerEntries.map((e) => (
                                        <tr key={e.id} className="border-b border-border">
                                            <td className="px-4 py-3">
                                                <span className={`rounded-full px-2 py-1 text-[10px] font-bold tracking-wider uppercase ${
                                                    e.type === 'credit'
                                                        ? 'bg-green-500/10 text-green-600'
                                                        : 'bg-red-500/10 text-red-600'
                                                }`}>
                                                    {e.type}
                                                </span>
                                            </td>
                                            <td className={`px-4 py-3 font-semibold ${e.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                                {e.type === 'credit' ? '+' : '-'}{fmt(e.amount)}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">{e.description ?? '-'}</td>
                                            <td className="px-4 py-3">{e.paymentCode ?? '-'}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{e.createdAt}</td>
                                        </tr>
                                    ))}
                                    {ledgerEntries.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                                Belum ada ledger entry
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </RhapsodyLayout>
        </>
    );
}

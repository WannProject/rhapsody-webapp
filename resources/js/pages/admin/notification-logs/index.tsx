import { Head, router } from '@inertiajs/react';
import RhapsodyLayout from '@/layouts/rhapsody-layout';

type Log = {
    id: number;
    channel: string;
    recipient: string;
    title: string | null;
    message: string;
    status: 'pending' | 'sent' | 'failed';
    statusLabel: string;
    referenceType: string | null;
    referenceId: number | null;
    errorMessage: string | null;
    attempts: number;
    sentAt: string | null;
    createdAt: string;
};

type Props = {
    logs: Log[];
    filters: { channel: string | null; status: string | null };
    channels: string[];
    statuses: string[];
};

const statusTone: Record<Log['status'], string> = {
    pending: 'border-amber-500/40 bg-amber-500/10 text-amber-700',
    sent: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700',
    failed: 'border-rose-500/40 bg-rose-500/10 text-rose-700',
};

const BASE_URL = '/admin/notification-logs';

export default function NotificationLogsPage({
    logs,
    filters,
    channels,
    statuses,
}: Props) {
    const setFilter = (key: 'channel' | 'status', value: string) => {
        const next: Record<string, string> = {};
        const current = {
            channel: filters.channel ?? '',
            status: filters.status ?? '',
        };
        const updated = { ...current, [key]: value };
        if (updated.channel) next.channel = updated.channel;
        if (updated.status) next.status = updated.status;
        router.get(BASE_URL, next, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <>
            <Head title="Riwayat Notifikasi" />
            <RhapsodyLayout>
                <div className="mx-auto grid max-w-7xl gap-6">
                    <header>
                        <p className="text-xs font-bold tracking-[0.22em] text-muted-foreground uppercase">
                            Audit
                        </p>
                        <h1 className="font-display text-3xl font-extrabold text-primary md:text-4xl">
                            Riwayat Notifikasi
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Audit log WhatsApp/notifikasi yang dikirim sistem.
                        </p>
                    </header>

                    <section className="grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-3">
                        <FilterSelect
                            label="Channel"
                            value={filters.channel ?? ''}
                            options={channels}
                            onChange={(v) => setFilter('channel', v)}
                        />
                        <FilterSelect
                            label="Status"
                            value={filters.status ?? ''}
                            options={statuses}
                            onChange={(v) => setFilter('status', v)}
                        />
                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={() =>
                                    router.get(BASE_URL, {}, { preserveScroll: true })
                                }
                                className="text-sm font-semibold text-muted-foreground underline underline-offset-4 hover:text-primary"
                            >
                                Reset filter
                            </button>
                        </div>
                    </section>

                    <section className="grid gap-3">
                        {logs.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                                Belum ada notifikasi tercatat.
                            </div>
                        ) : (
                            logs.map((log) => (
                                <div
                                    key={log.id}
                                    className="grid gap-2 rounded-lg border border-border bg-card p-4"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-display text-sm font-bold text-primary">
                                                    #{log.id} · {log.channel}
                                                </span>
                                                <span
                                                    className={`rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${statusTone[log.status]}`}
                                                >
                                                    {log.statusLabel}
                                                </span>
                                                {log.attempts > 0 && (
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {log.attempts} percobaan
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Ke: {log.recipient}
                                                {log.title && <> · {log.title}</>}
                                                {log.referenceType && (
                                                    <>
                                                        {' '}
                                                        · {log.referenceType} #
                                                        {log.referenceId}
                                                    </>
                                                )}
                                            </p>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground">
                                            {log.createdAt}
                                        </p>
                                    </div>
                                    <pre className="whitespace-pre-wrap break-words rounded-md bg-muted/40 p-3 text-xs text-foreground/90">
                                        {log.message}
                                    </pre>
                                    {log.errorMessage && (
                                        <p className="text-xs text-rose-700">
                                            Error: {log.errorMessage}
                                        </p>
                                    )}
                                </div>
                            ))
                        )}
                    </section>
                </div>
            </RhapsodyLayout>
        </>
    );
}

function FilterSelect({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: string[];
    onChange: (value: string) => void;
}) {
    return (
        <label className="grid gap-1 text-xs font-bold tracking-[0.18em] text-muted-foreground uppercase">
            {label}
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm font-normal tracking-normal normal-case"
            >
                <option value="">Semua</option>
                {options.map((opt) => (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>
        </label>
    );
}

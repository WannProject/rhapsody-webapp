import { ShieldCheck } from 'lucide-react';

export function SecurityNotice() {
    return (
        <div className="rounded-lg border border-[#353535] bg-[#1b1b1b] p-5">
            <div className="flex items-center gap-3 text-white">
                <ShieldCheck className="size-6" />
                <span className="font-bold">Transaksi Terenkripsi & Aman</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[#8e9192]">
                Jika pembayaran belum terdeteksi setelah 5 menit, hubungi
                support dengan ID RHAP-99283-XP.
            </p>
        </div>
    );
}

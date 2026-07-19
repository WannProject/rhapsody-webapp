import {
    Banknote,
    Bell,
    CalendarDays,
    Drum,
    Home,
    Landmark,
    LineChart,
    Music2,
    Percent,
    QrCode,
    ReceiptText,
    Settings2,
    UserCircle,
    Users,
    Wallet,
} from 'lucide-react';
import type {
    Instrument,
    NavItem,
    PaymentMethod,
    ScheduleSlot,
    Studio,
} from '@/types/rhapsody';

export const studioImages = {
    piano: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA01pD4cbHTUU7wGS4lBNNQY_U2PXG78SlK13w62UmwpNfos7iVbsoIHDKzQVVntvSFkb0mfx09U1mzdSy7kOg9PtKKsPDJ4mwkV2N4g_bQON3GY46QcpHd48UVmrUr5ni6qJxUY37Vql2R9mKPFe4xUj-gmsDDhYqr7Qtmu5QNFd6waS8XIPTh64yl3Tl_WtaH2TcY2I-ebQq6Fe-XUpAYf4BTrKVfwN7rsERWPH8hPwviIhxqtivTGbnxZtkknx9CNCjk9tW1Qoi0',
    console:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuB47P6HVD8OkbAwoUUX_bImpOW1o-T-6ZOXuNvAIY0OZNdhpxPEzQeisu5J41ebqllJR6cRrdTyPU8NsVN2dkNDu91SoHixP0nz9GfrWSqBiACX2Ueay_wrlhCFGYZ0Bu3KzTLwDbU87ZXqcqL3yaHGLk0SH6Uw_4iMcj2FycPOCS2Ti_yFCyPrK-Tf-Us_LFd7ChWCSaYMiapoj_Yexj7Tp9dm4TL627P264zsOJ2J70hJ2uR54DX47ltFHfTJO5qZR0AHNEyh4Fqy',
    engineer:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDCoUlYvYkYwFfa7j49hBGBjpPUnGapG7DbIKIJu73URbjX4ixv-ZyzDtoxrW0VlGHNMRP4EWI-kT8NJitjbQ4HjpDOZQJxlBdiaFdcM5OH7JwIMuy7mouRVpbzZTM42kxnRgbKDYqFz3J7COCKC-7Pg5ckCBzHqvwRyAx0_748yZgpdQsJ6WXDpkvdffkCBxoPkRzIh0WhsU1xNVbi7eTvW1rChhNXz7ETzh8RUkQ6yoqAYj0NoXg_pfONmnB6i82WBkNb8tV0BKcE',
    microphone:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA78f0uPuMQdJXRR863BhUXN5azLlYnKAypib2wsNv2mRJlRqGiOLTMYQsmEZ-3OP_foM1Lp7kw06G3tsI7xsx2eGRF3LR3kL39eaCcsZ3u_5hR3LQrmju83Ajys_6Tix1XAz6y9DfEZj3A0dlNrm1MnI5xwANykBXjrTEmelI1YNrm57JAsPADEQYxq6RmAiJ1sb8ZPIyddhXECMPrHWOSOHwquzUqDdeKszDg1sXukgCPE3GyCOHFRdDF7FR96REZbJkqW54y69rq',
};

export const navItems: NavItem[] = [
    { view: 'home', label: 'Home', icon: Home, href: '/', audience: 'guest' },
    {
        view: 'schedule',
        label: 'Schedule',
        icon: CalendarDays,
        href: '/schedule',
        audience: 'guest',
    },
    {
        view: 'home',
        label: 'Beranda',
        icon: Home,
        href: '/',
        audience: 'customer',
        bottomNav: true,
    },
    {
        view: 'bookings',
        label: 'Booking',
        icon: CalendarDays,
        href: '/bookings#booking-form',
        audience: 'customer',
        bottomNav: true,
    },
    {
        view: 'info-orders',
        label: 'Info Pesanan',
        icon: ReceiptText,
        href: '/orders',
        audience: 'customer',
        bottomNav: true,
    },
    {
        view: 'profile',
        label: 'Profil',
        icon: UserCircle,
        href: '/settings/profile',
        audience: 'customer',
        bottomNav: true,
    },
    {
        view: 'appearance',
        label: 'Pengaturan',
        icon: Settings2,
        href: '/settings/appearance',
        audience: 'customer',
    },
    {
        view: 'home',
        label: 'Beranda',
        icon: Home,
        href: '/',
        audience: 'admin',
        bottomNav: true,
    },
    {
        view: 'info-orders',
        label: 'Pesanan',
        icon: ReceiptText,
        href: '/orders',
        audience: 'admin',
        bottomNav: true,
    },
    {
        view: 'reports',
        label: 'Laporan',
        icon: LineChart,
        href: '/reports',
        audience: 'admin',
        bottomNav: true,
    },
    {
        view: 'bookings',
        label: 'Jadwal Studio',
        icon: CalendarDays,
        href: '/bookings',
        audience: 'admin',
    },
    {
        view: 'studio-data',
        label: 'Data & Harga',
        icon: Settings2,
        href: '/admin/studio-data',
        audience: 'admin',
        bottomNav: true,
    },
    {
        view: 'notification-logs',
        label: 'Audit Notifikasi',
        icon: Bell,
        href: '/admin/notification-logs',
        audience: 'admin',
    },
    {
        view: 'profile',
        label: 'Profil',
        icon: UserCircle,
        href: '/settings/profile',
        audience: 'admin',
        bottomNav: true,
    },
    {
        view: 'appearance',
        label: 'Pengaturan',
        icon: Settings2,
        href: '/settings/appearance',
        audience: 'admin',
    },
    {
        view: 'clients',
        label: 'Client',
        icon: Users,
        href: '/admin/clients',
        audience: 'super_admin',
    },
    {
        view: 'platform-fees',
        label: 'Fee Platform',
        icon: Percent,
        href: '/admin/platform-fees',
        audience: 'super_admin',
    },
    {
        view: 'platform-wallet',
        label: 'Wallet',
        icon: Wallet,
        href: '/admin/platform-wallet',
        audience: 'super_admin',
        bottomNav: true,
    },
    {
        view: 'platform-withdrawals',
        label: 'Tarik Dana',
        icon: Banknote,
        href: '/admin/platform-wallet',
        audience: 'super_admin',
    },
];

export const studios: Studio[] = [
    {
        id: 'studio-a',
        name: 'Studio A',
        tier: 'Premium',
        subtitle: 'Grand Piano',
        rate: 'Rp 150.000 / jam',
        image: studioImages.piano,
        availability: 'Besok 14:00 - 16:00',
        capacity: '6 Musisi',
    },
    {
        id: 'studio-b',
        name: 'Studio B',
        tier: 'Pro',
        subtitle: 'Full Band Room',
        rate: 'Rp 120.000 / jam',
        image: studioImages.console,
        availability: 'Hari ini 19:00',
        capacity: '8 Musisi',
    },
    {
        id: 'studio-c',
        name: 'Studio C',
        tier: 'Vocal',
        subtitle: 'Recording Booth',
        rate: 'Rp 95.000 / jam',
        image: studioImages.microphone,
        availability: 'Besok 10:00',
        capacity: '3 Musisi',
    },
];

export const scheduleSlots: ScheduleSlot[] = [
    { time: '09:00', status: 'booked', label: 'Booked', price: '-' },
    {
        time: '11:00',
        status: 'promo',
        label: 'Promo Slot',
        price: 'Rp 120.000',
    },
    {
        time: '13:00',
        status: 'available',
        label: 'Available',
        price: 'Rp 150.000',
    },
    {
        time: '15:00',
        status: 'available',
        label: 'Available',
        price: 'Rp 150.000',
    },
    { time: '17:00', status: 'booked', label: 'Booked', price: '-' },
    {
        time: '19:00',
        status: 'promo',
        label: 'Promo Slot',
        price: 'Rp 120.000',
    },
];

export const instruments: Instrument[] = [
    { name: 'Grand Piano', detail: 'Yamaha C7, tuned daily', selected: true },
    { name: 'Drum Kit', detail: 'Pearl Export, cymbal pack', selected: true },
    { name: 'Bass Amp', detail: 'Ampeg stack', selected: false },
    { name: 'Guitar Amp', detail: 'Twin reverb and high gain', selected: true },
    { name: 'Vocal Mic', detail: 'Condenser with pop filter', selected: false },
    {
        name: 'Synth Station',
        detail: 'MIDI keys and analog pad',
        selected: false,
    },
];

export const priorityCriteria = [
    { label: 'Studio Tier', value: 88 },
    { label: 'User Loyalty', value: 74 },
    { label: 'Duration', value: 62 },
    { label: 'Promo Balance', value: 48 },
];

export const paymentMethods: PaymentMethod[] = [
    {
        name: 'QRIS',
        description: 'Scan melalui e-wallet dan mobile banking.',
        icon: QrCode,
    },
    {
        name: 'Virtual Account',
        description: 'Nomor VA otomatis untuk transfer bank.',
        icon: Landmark,
    },
    {
        name: 'Cash at Studio',
        description: 'Bayar di resepsionis dalam 15 menit.',
        icon: Banknote,
    },
];

export const bookingSummary = [
    ['Studio', 'Studio A'],
    ['Tanggal', 'Sabtu, 22 Juni'],
    ['Waktu', '11:00 - 13:00'],
    ['Durasi', '2 Jam'],
    ['Total', 'Rp 300.000'],
];

export const activityFeed = [
    {
        icon: ReceiptText,
        title: 'Pembayaran Berhasil',
        detail: 'Studio A - Invoice #4210',
        time: '2j yang lalu',
    },
    {
        icon: Music2,
        title: 'Sesi Selesai',
        detail: 'Studio B - 2 Jam',
        time: 'Kemarin',
    },
    {
        icon: Drum,
        title: 'Alat Dikonfirmasi',
        detail: 'Grand piano, drum kit, guitar amp',
        time: 'Senin',
    },
];

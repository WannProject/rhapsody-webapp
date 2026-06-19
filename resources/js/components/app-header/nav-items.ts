import { BookOpen, Folder, LayoutGrid } from 'lucide-react';
import { dashboard } from '@/routes';
import type { NavItem, Team } from '@/types';

export const rightNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function getMainNavItems(currentTeam: Team | null): NavItem[] {
    return [
        {
            title: 'Dashboard',
            href: currentTeam ? dashboard(currentTeam.slug) : '/',
            icon: LayoutGrid,
        },
    ];
}

import { Head } from '@inertiajs/react';
import RhapsodyLayout from '@/layouts/rhapsody-layout';
import { AdminReportScreen } from '@/pages/rhapsody/admin-report-screen';

export default function ReportPage() {
    return (
        <>
            <Head title="RHAPSODY | Reports" />
            <RhapsodyLayout>
                <AdminReportScreen onViewChange={() => {}} />
            </RhapsodyLayout>
        </>
    );
}

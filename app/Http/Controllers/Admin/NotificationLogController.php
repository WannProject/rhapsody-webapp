<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\NotificationLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationLogController extends Controller
{
    public function index(Request $request): Response
    {
        $channel = $request->query('channel');
        $status = $request->query('status');

        $logs = NotificationLog::query()
            ->when($channel, fn ($query) => $query->where('channel', $channel))
            ->when($status, fn ($query) => $query->where('status', $status))
            ->latest('id')
            ->limit(100)
            ->get()
            ->map(fn (NotificationLog $log) => [
                'id' => $log->id,
                'channel' => $log->channel,
                'recipient' => $log->recipient,
                'title' => $log->title,
                'message' => $log->message,
                'status' => $log->status->value,
                'statusLabel' => $log->status->label(),
                'referenceType' => $log->reference_type ? class_basename($log->reference_type) : null,
                'referenceId' => $log->reference_id,
                'errorMessage' => $log->error_message,
                'attempts' => $log->attempts,
                'sentAt' => $log->sent_at?->toDateTimeString(),
                'createdAt' => $log->created_at->toDateTimeString(),
            ]);

        return Inertia::render('admin/notification-logs/index', [
            'logs' => $logs,
            'filters' => [
                'channel' => $channel,
                'status' => $status,
            ],
            'channels' => ['whatsapp', 'email'],
            'statuses' => ['pending', 'sent', 'failed'],
        ]);
    }
}

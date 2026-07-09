<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('client_id')->nullable()->constrained()->nullOnDelete();
            $table->string('xendit_invoice_id')->nullable();
            $table->string('xendit_payment_id')->nullable();
            $table->string('xendit_external_id')->nullable();
            $table->string('payment_channel')->nullable();
            $table->unsignedBigInteger('amount');
            $table->unsignedBigInteger('platform_fee_expected')->default(0);
            $table->unsignedBigInteger('platform_fee_actual')->default(0);
            $table->string('status')->default('pending');
            $table->string('split_status')->default('not_applicable');
            $table->string('split_rule_id')->nullable();
            $table->string('payment_link_url')->nullable();
            $table->string('failure_reason')->nullable();
            $table->json('raw_webhook_payload')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('expired_at')->nullable();
            $table->timestamps();

            $table->index('xendit_invoice_id');
            $table->index('xendit_external_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};

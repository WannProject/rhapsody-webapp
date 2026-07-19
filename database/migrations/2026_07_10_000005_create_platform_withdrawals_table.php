<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('platform_withdrawals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('requested_by')->constrained('users')->cascadeOnDelete();
            $table->unsignedBigInteger('amount');
            $table->string('currency')->default('IDR');
            $table->string('status')->default('pending');
            $table->string('xendit_payout_id')->nullable();
            $table->string('xendit_reference_id')->nullable();
            $table->string('xendit_payout_status')->nullable();
            $table->string('destination_bank_code')->nullable();
            $table->string('destination_account_holder')->nullable();
            $table->string('destination_account_number')->nullable();
            $table->text('failure_reason')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamp('succeeded_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('xendit_payout_id');
            $table->index('xendit_reference_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('platform_withdrawals');
    }
};

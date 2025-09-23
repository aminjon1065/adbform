<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('first_forms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users');
            $table->date('date');
            $table->text('rayon');
            $table->text('jamoat');
            $table->text('selo')->nullable();
            $table->boolean('accept')->default(false);
            $table->text('name');
            $table->smallInteger('age');
            $table->text('phone');
            $table->smallInteger('family_count');
            $table->smallInteger('children_count')->default(0);
            $table->smallInteger('old_man_count')->default(0);
            $table->smallInteger('able_count')->default(0);
            $table->text('income');
            $table->integer('garden');
            $table->text("agriculture_experience");
            $table->json("seed")->nullable();
            $table->json("seedlings")->nullable();
            $table->text('irrigation_source');
            $table->boolean('beekeeping')->default(false);
            $table->json('storage');
            $table->boolean('refrigerator')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('first_forms');
    }
};

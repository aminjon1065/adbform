<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('first_forms', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->nullable()
                ->constrained()
                ->cascadeOnDelete();
            // 0. Дата встречи
            $table->date('meeting_date')->index();

            // 1. Адрес
            $table->string('rayon', 120);
            $table->string('jamoat', 120);
            $table->string('selo', 120)->nullable();

            // 2. Согласие
            $table->boolean('accept')->default(false);

            // 3. Участник
            $table->string('full_name', 200);
            $table->unsignedTinyInteger('age'); // 1..100
            $table->string('phone', 9); // ровно 9 цифр
            // $table->unique('phone'); // <- включи при необходимости

            // 4. Семья
            $table->unsignedTinyInteger('family_count');
            $table->unsignedTinyInteger('children_count')->default(0);
            $table->unsignedTinyInteger('elderly_count')->default(0);
            $table->unsignedTinyInteger('able_count')->default(0);

            // 5. Доход
            $table->string('income', 120); // либо enum в БД, но строка гибче

            // 6. Площадь участка (га)
            $table->decimal('plot_ha', 8, 2)->nullable(); // раньше было integer garden

            // 7. Опыт
            $table->string('agriculture_experience', 60); // овощеводство/садоводство/пчеловодство/нет опыта

            // 8. Семена/саженцы (массивы объектов {key, area})
            $table->json('seeds')->nullable();
            $table->json('seedlings')->nullable();

            // 9. Источник орошения (мульти)
            $table->json('irrigation_sources'); // ["none","well","pump","canal"]

            // 10. Пчеловодство
            $table->boolean('beekeeping')->default(false);

            // 11. Склад
            $table->boolean('has_storage')->default(false);
            $table->unsignedInteger('storage_area_sqm')->nullable(); // м²

            // 12. Холодильная камера
            $table->boolean('has_refrigerator')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('first_forms');
    }
};

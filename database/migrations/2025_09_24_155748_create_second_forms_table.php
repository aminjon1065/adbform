<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('second_forms', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->nullable()
                ->constrained()
                ->cascadeOnDelete();

            // 0. Дата встречи + адрес
            $table->date('meeting_date')->index();
            $table->string('rayon', 120);
            $table->string('jamoat', 120);
            $table->string('selo', 120)->nullable();

            // 1. Согласие
            $table->boolean('accept')->default(false);

            // 2. Информация о ДХ и руководителе
            $table->string('farm_name', 200);
            $table->string('leader_full_name', 200);
            $table->unsignedTinyInteger('leader_age');
            $table->string('leader_phone', 9);

            // 3. Площадь хозяйства (га)
            $table->decimal('farm_plot_ha', 8, 2)->nullable();

            // 4. Опыт
            $table->string('agriculture_experience', 60); // овощеводство/садоводство/пчеловодство/нет опыта

            // 5. Семена/саженцы (массивы объектов {key, area})
            $table->json('seeds')->nullable();
            $table->json('seedlings')->nullable();

            // 6. Техника (один вариант + другое)
            $table->string('equipment_choice', 40); // "freza" | "seeder" | "cultivator" | "other"
            $table->string('equipment_other_text', 120)->nullable();

            // 7. Орошение (мульти)
            $table->json('irrigation_sources'); // ["none","well","pump","canal"]

            // 8. Пчеловодство
            $table->boolean('beekeeping')->default(false);

            // 9. Склад
            $table->boolean('has_storage')->default(false);
            $table->unsignedInteger('storage_area_sqm')->nullable();

            // 10. Холодильная камера
            $table->boolean('has_refrigerator')->default(false);

            // 11. Подпись (опционально)
            $table->string('signature', 200)->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('second_forms');
    }
};

<?php

namespace Database\Seeders;

use App\Models\FirstForm;
use App\Models\User;
use Illuminate\Database\Seeder;

class FirstFormSeeder extends Seeder
{
    public function run(): void
    {
        // при необходимости создадим пользователей
        User::factory()->count(5)->create();

        // обычные записи
        FirstForm::factory()->count(100)->create();

        // несколько с гарантированными семенами
        FirstForm::factory()->count(20)->withSeeds()->create();

        // несколько с гарантированными саженцами
        FirstForm::factory()->count(20)->withSeedlings()->create();
    }
}

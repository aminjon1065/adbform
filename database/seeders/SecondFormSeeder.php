<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SecondForm;

class SecondFormSeeder extends Seeder
{
    public function run(): void
    {
        // 30 обычных
        SecondForm::factory()->count(100)->create();

        // 5 c семенами (овощеводство)
        SecondForm::factory()->count(20)->withSeeds()->create();

        // 5 с саженцами (садоводство)
        SecondForm::factory()->count(20)->withSeedlings()->create();
    }
}

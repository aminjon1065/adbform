<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {

        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@ex.com',
            'password' => Hash::make('admin123'),
        ]);
        // $this->call([
        //     FirstFormSeeder::class,
        //     SecondFormSeeder::class,
        // ]);
    }
}

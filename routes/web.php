<?php

use App\Http\Controllers\FirstFormController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use \App\Http\Controllers\SecondFormController;
Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::post('/first-forms', [FirstFormController::class, 'store'])
    ->name('first-forms.store');
Route::post('/second-forms', [SecondFormController::class, 'store'])
    ->name('second-forms.store');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

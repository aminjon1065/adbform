<?php

use App\Http\Controllers\FirstFormController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use \App\Http\Controllers\SecondFormController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/first-forms', [FirstFormController::class, 'index'])
    ->name('first-forms.index')->middleware('auth');
Route::post('/first-forms', [FirstFormController::class, 'store'])
    ->name('first-forms.store');
Route::get('/first-forms/export/excel', [FirstFormController::class, 'exportExcel'])
    ->name('first-forms.export.excel');

Route::get('/first-forms/export/pdf', [FirstFormController::class, 'exportPdf'])
    ->name('first-forms.export.pdf');


Route::get('/second-forms', [SecondFormController::class, 'index'])
    ->name('second-forms.index')->middleware('auth');
Route::post('/second-forms', [SecondFormController::class, 'store'])
    ->name('second-forms.store');
Route::get('/second-forms/export/excel', [SecondFormController::class, 'exportExcel'])
    ->name('second-forms.export.excel');

Route::get('/second-forms/export/pdf', [SecondFormController::class, 'exportPdf'])
    ->name('second-forms.export.pdf');
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

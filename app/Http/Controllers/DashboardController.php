<?php

namespace App\Http\Controllers;

use App\Models\FirstForm;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(){
        $firstForms = FirstForm::all();
        return Inertia::render('dashboard', [
            'firstForms' => $firstForms,
        ]);
    }
}

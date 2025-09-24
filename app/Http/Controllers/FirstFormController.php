<?php

namespace App\Http\Controllers;

use App\Http\Requests\FirstFormRequest;
use App\Models\FirstForm;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class FirstFormController extends Controller
{
    public function store(FirstFormRequest $request): RedirectResponse
    {
        $v = $request->validated();
        // Если frontend прислал пустые массивы — приведём к null, чтобы в БД были NULL, а не []
        $seeds      = !empty($v['seeds']) ? array_values($v['seeds']) : null;
        $seedlings  = !empty($v['seedlings']) ? array_values($v['seedlings']) : null;
        $userId = optional($request->user())->id;

        $form = FirstForm::create([
            'user_id'                 => $userId,

            'meeting_date'            => $v['meeting_date'],     // Y-m-d (cast: date)
            'rayon'                   => $v['rayon'],
            'jamoat'                  => $v['jamoat'],
            'selo'                    => $v['selo'] ?? null,

            'accept'                  => (bool) $v['accept'],

            'full_name'               => $v['full_name'],
            'age'                     => (int) $v['age'],
            'phone'                   => $v['phone'],

            'family_count'            => (int) $v['family_count'],
            'children_count'          => (int) ($v['children_count'] ?? 0),
            'elderly_count'           => (int) ($v['elderly_count'] ?? 0),
            'able_count'              => (int) ($v['able_count'] ?? 0),

            'income'                  => $v['income'],

            'plot_ha'                 => isset($v['plot_ha']) && $v['plot_ha'] !== ''
                ? (float) $v['plot_ha']
                : null,

            'agriculture_experience'  => $v['agriculture_experience'],

            'seeds'                   => $seeds,       // cast: array/json
            'seedlings'               => $seedlings,   // cast: array/json

            'irrigation_sources'      => $v['irrigation_sources'] ?? [],

            'beekeeping'              => (bool) ($v['beekeeping'] ?? false),

            'has_storage'             => (bool) $v['has_storage'],
            'storage_area_sqm'        => $v['has_storage']
                ? (isset($v['storage_area_sqm']) ? (int) $v['storage_area_sqm'] : null)
                : null,

            'has_refrigerator'        => (bool) $v['has_refrigerator'],
        ]);

        return back()->with('success', 'Анкета сохранена.');
    }


}

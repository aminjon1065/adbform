<?php

namespace App\Http\Controllers;

use App\Http\Requests\FirstFormRequest;
use App\Models\FirstForm;
use Illuminate\Http\RedirectResponse;

class FirstFormController extends Controller
{
    public function store(FirstFormRequest $request): RedirectResponse
    {
        $v = $request->validated();

        // seeds / seedlings: нормализуем и фильтруем пустые записи
        $seeds = !empty($v['seeds'])
            ? array_values(array_filter($v['seeds'], fn ($i) =>
                isset($i['key'], $i['area']) && $i['area'] !== ''
            ))
            : null;

        $seedlings = !empty($v['seedlings'])
            ? array_values(array_filter($v['seedlings'], fn ($i) =>
                isset($i['key'], $i['area']) && $i['area'] !== ''
            ))
            : null;

        // irrigation_sources: уникальные строки
        $irrigation = array_values(array_unique($v['irrigation_sources'] ?? []));

        // plot_ha: безопасное приведение под DECIMAL(8,2)
        $plotHa = (isset($v['plot_ha']) && $v['plot_ha'] !== '')
            ? number_format((float) $v['plot_ha'], 2, '.', '')
            : null;

        // (опционально) проверка согласованности семьи
        if (
            isset($v['family_count'], $v['children_count'], $v['elderly_count'], $v['able_count']) &&
            (int)$v['family_count'] < ((int)$v['children_count'] + (int)$v['elderly_count'] + (int)$v['able_count'])
        ) {
            return back()->withErrors([
                'family_count' => 'Сумма детей, пожилых и трудоспособных не может превышать общее количество семьи.',
            ])->withInput();
        }

        FirstForm::create([
            'user_id'                 => optional($request->user())->id,

            'meeting_date'            => $v['meeting_date'], // Y-m-d
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

            'plot_ha'                 => $plotHa,

            'agriculture_experience'  => $v['agriculture_experience'],

            'seeds'                   => $seeds,      // cast: array/json
            'seedlings'               => $seedlings,  // cast: array/json

            'irrigation_sources'      => $irrigation,

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

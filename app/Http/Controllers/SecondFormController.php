<?php

namespace App\Http\Controllers;

use App\Http\Requests\SecondFormRequest;
use App\Models\SecondForm;
use Illuminate\Http\RedirectResponse;

class SecondFormController extends Controller
{
    public function store(SecondFormRequest $request): RedirectResponse
    {
        $v = $request->validated();

        // seeds/seedlings: фильтрация пустых записей
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

        // орошение: уникальные строки
        $irrigation = array_values(array_unique($v['irrigation_sources'] ?? []));

        // decimal → строка для DECIMAL(8,2)
        $farmPlotHa = (isset($v['farm_plot_ha']) && $v['farm_plot_ha'] !== '')
            ? number_format((float)$v['farm_plot_ha'], 2, '.', '')
            : null;

        SecondForm::create([
            'user_id' => optional($request->user())->id,

            'meeting_date' => $v['meeting_date'],
            'rayon' => $v['rayon'],
            'jamoat' => $v['jamoat'],
            'selo' => $v['selo'] ?? null,

            'accept' => (bool)$v['accept'],

            'farm_name' => $v['farm_name'],
            'leader_full_name' => $v['leader_full_name'],
            'leader_age' => (int)$v['leader_age'],
            'leader_phone' => $v['leader_phone'],

            'farm_plot_ha' => $farmPlotHa,

            'agriculture_experience' => $v['agriculture_experience'],

            'seeds' => $seeds,
            'seedlings' => $seedlings,

            'equipment_choice' => $v['equipment_choice'],
            'equipment_other_text' => $v['equipment_choice'] === 'other' ? ($v['equipment_other_text'] ?? null) : null,

            'irrigation_sources' => $irrigation,

            'beekeeping' => (bool)$v['beekeeping'],

            'has_storage' => (bool)$v['has_storage'],
            'storage_area_sqm' => $v['has_storage']
                ? (isset($v['storage_area_sqm']) ? (int)$v['storage_area_sqm'] : null)
                : null,

            'has_refrigerator' => (bool)$v['has_refrigerator'],

            'signature' => $v['signature'] ?? null,
        ]);

        return back()->with('success', 'Анкета сохранена.');
    }
}

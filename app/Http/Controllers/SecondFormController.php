<?php

namespace App\Http\Controllers;

use App\Http\Requests\SecondFormRequest;
use App\Models\SecondForm;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Exports\SecondFormsExport;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
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
        ]);

        return back()->with('success', 'Анкета сохранена.');
    }

    public function exportExcel(Request $request)
    {
        return Excel::download(
            new SecondFormsExport($request),
            'second_forms_' . now()->format('Y-m-d_H-i') . '.xlsx'
        );
    }

    public function exportPdf(Request $request)
    {
        // Используем tuю же фильтрацию, что и index
        $items = SecondForm::query()
            ->search($request->input('q'))
            ->dateFrom($request->input('date_from'))
            ->dateTo($request->input('date_to'))
            // если есть доп. фильтры на странице — раскомментируй:
            ->experience($request->input('experience'))
            ->equipment($request->input('equipment_choice'))
            ->beekeeping(
                is_null($request->input('beekeeping')) ? null : (bool)$request->input('beekeeping')
            )
            ->hasStorage(
                is_null($request->input('has_storage')) ? null : (bool)$request->input('has_storage')
            )
            ->hasRefrigerator(
                is_null($request->input('has_refrigerator')) ? null : (bool)$request->input('has_refrigerator')
            )
            ->orderSafe($request->input('sort'), $request->input('order'))
            ->get();

        $pdf = Pdf::loadView('exports.second_forms_pdf', [
            'items'   => $items,
            'filters' => $request->only([
                'q','date_from','date_to','sort','order',
                'experience','equipment_choice','beekeeping','has_storage','has_refrigerator'
            ]),
        ])->setPaper('a4', 'landscape');

        return $pdf->download('second_forms_' . now()->format('Y-m-d_H-i') . '.pdf');
    }

    protected function baseQuery(Request $request)
    {
        $q = SecondForm::query();

        // Поиск
        if ($search = trim((string)$request->input('q'))) {
            $like = '%' . str_replace('%','\%',$search) . '%';
            $q->where(function ($qq) use ($like) {
                $qq->where('farm_name', 'like', $like)
                    ->orWhere('leader_full_name', 'like', $like)
                    ->orWhere('leader_phone', 'like', $like)
                    ->orWhere('rayon', 'like', $like)
                    ->orWhere('jamoat', 'like', $like)
                    ->orWhere('selo', 'like', $like)
                    ->orWhere('equipment_choice', 'like', $like)
                    ->orWhere('agriculture_experience', 'like', $like);
            });
        }

        // Дата “от/до”
        if ($from = $request->input('date_from')) {
            $q->whereDate('meeting_date', '>=', $from);
        }
        if ($to = $request->input('date_to')) {
            $q->whereDate('meeting_date', '<=', $to);
        }

        // Сортировка
        $sort = $request->input('sort', 'created_at');
        $order = $request->input('order', 'desc');
        if (!in_array($sort, SecondForm::sortWhitelist(), true)) {
            $sort = 'created_at';
        }
        $order = $order === 'asc' ? 'asc' : 'desc';

        return $q->orderBy($sort, $order);
    }

    public function index(Request $request): \Inertia\Response
    {
        $validated = $request->validate([
            'q'         => ['nullable','string','max:200'],
            'date_from' => ['nullable','date'],
            'date_to'   => ['nullable','date'],

            'sort'  => ['nullable','string','in:' . implode(',', SecondForm::sortWhitelist())],
            'order' => ['nullable','string','in:asc,desc'],

            'per_page' => ['nullable','integer','min:1','max:100'],
            'page'     => ['nullable','integer','min:1'],
        ]);

        $sort    = $validated['sort'] ?? 'created_at';
        $order   = $validated['order'] ?? 'desc';
        if (!in_array($sort, SecondForm::sortWhitelist(), true)) $sort = 'created_at';
        $order   = $order === 'asc' ? 'asc' : 'desc';
        $perPage = (int)($validated['per_page'] ?? 15);

        $builder = SecondForm::query()
            ->with(['user'])
            ->search($validated['q'] ?? null)
            ->dateFrom($validated['date_from'] ?? null)
            ->dateTo($validated['date_to'] ?? null)
            ->orderBy($sort, $order);

        $forms = $builder->paginate($perPage)->withQueryString();

        $filters = [
            'q' => $validated['q'] ?? null,
            'date_from' => $validated['date_from'] ?? null,
            'date_to' => $validated['date_to'] ?? null,
            'sort' => $sort,
            'order' => $order,
            'per_page' => $perPage,
        ];

        $available = [
            'experiences' => SecondForm::query()->select('agriculture_experience')->distinct()->pluck('agriculture_experience'),
            'rayons'      => SecondForm::query()->select('rayon')->distinct()->pluck('rayon'),
            'jamoats'     => SecondForm::query()->select('jamoat')->distinct()->pluck('jamoat'),
            'equipments'  => SecondForm::query()->select('equipment_choice')->distinct()->pluck('equipment_choice'),
        ];

        return Inertia::render('second-form/index', [
            'forms'    => $forms,
            'filters'  => $filters,
            'available'=> $available,
        ]);
    }
}

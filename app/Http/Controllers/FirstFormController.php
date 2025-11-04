<?php

namespace App\Http\Controllers;

use App\Http\Requests\FirstFormRequest;
use App\Models\FirstForm;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\FirstFormsExport;
use Barryvdh\DomPDF\Facade\Pdf;

class FirstFormController extends Controller
{
    public function store(FirstFormRequest $request): RedirectResponse
    {
        $v = $request->validated();

        // seeds / seedlings: нормализуем и фильтруем пустые записи
        $seeds = !empty($v['seeds'])
            ? array_values(array_filter($v['seeds'], fn($i) => isset($i['key'], $i['area']) && $i['area'] !== ''
            ))
            : null;

        $seedlings = !empty($v['seedlings'])
            ? array_values(array_filter($v['seedlings'], fn($i) => isset($i['key'], $i['area']) && $i['area'] !== ''
            ))
            : null;

        // irrigation_sources: уникальные строки
        $irrigation = array_values(array_unique($v['irrigation_sources'] ?? []));

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
            'user_id' => optional($request->user())->id,

            'meeting_date' => $v['meeting_date'], // Y-m-d
            'rayon' => $v['rayon'],
            'jamoat' => $v['jamoat'],
            'selo' => $v['selo'] ?? null,

            'accept' => (bool)$v['accept'],

            'full_name' => $v['full_name'],
            'age' => (int)$v['age'],
            'phone' => $v['phone'],

            'family_count' => (int)$v['family_count'],
            'children_count' => (int)($v['children_count'] ?? 0),
            'elderly_count' => (int)($v['elderly_count'] ?? 0),
            'able_count' => (int)($v['able_count'] ?? 0),

            'income' => $v['income'],

            'plot_ha' => $request->plot_ha,

            'agriculture_experience' => $v['agriculture_experience'],

            'seeds' => $seeds,      // cast: array/json
            'seedlings' => $seedlings,  // cast: array/json

            'irrigation_sources' => $irrigation,

            'beekeeping' => (bool)($v['beekeeping'] ?? false),

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
            new FirstFormsExport($request), // см. экспорт-класс ниже
            'first_forms_' . now()->format('Y-m-d_H-i') . '.xlsx'
        );
    }

    /** Экспорт PDF: все записи по фильтрам (без пагинации) */
    public function exportPdf(Request $request)
    {
        $items = $this->baseQuery($request)->get();

        $pdf = Pdf::loadView('exports.first_forms_pdf', [
            'items' => $items,
            'filters' => $request->only(['q', 'date_from', 'date_to', 'sort', 'order']),
        ])->setPaper('a4', 'landscape');

        return $pdf->download('first_forms_' . now()->format('Y-m-d_H-i') . '.pdf');
    }


    protected function baseQuery(Request $request)
    {
        $q = FirstForm::query();

        // Поиск
        if ($search = trim((string)$request->input('q'))) {
            $like = '%' . str_replace('%', '\%', $search) . '%';
            $q->where(function ($qq) use ($like) {
                $qq->where('full_name', 'like', $like)
                    ->orWhere('rayon', 'like', $like)
                    ->orWhere('jamoat', 'like', $like)
                    ->orWhere('selo', 'like', $like)
                    ->orWhere('phone', 'like', $like)
                    ->orWhere('income', 'like', $like);
            });
        }

        // Дата "от"
        if ($from = $request->input('date_from')) {
            $q->whereDate('meeting_date', '>=', $from);
        }

        // Дата "до"
        if ($to = $request->input('date_to')) {
            $q->whereDate('meeting_date', '<=', $to);
        }

        // Сортировка
        $sort = $request->input('sort', 'created_at');
        $order = $request->input('order', 'desc');
        $allowedSorts = ['created_at', 'meeting_date', 'full_name', 'age', 'rayon', 'jamoat', 'income', 'plot_ha'];
        if (!in_array($sort, $allowedSorts, true)) {
            $sort = 'created_at';
        }
        $order = $order === 'asc' ? 'asc' : 'desc';

        return $q->orderBy($sort, $order);
    }


    public function index(Request $request): Response
    {
        // Валидируем входящие query-параметры (всё опционально)
        $validated = $request->validate([
            'q' => ['nullable', 'string', 'max:200'],          // общий поиск
            'date_from' => ['nullable', 'date'],                        // фильтр по дате (от)
            'date_to' => ['nullable', 'date'],                        // фильтр по дате (до)

            'sort' => ['nullable', 'string', 'in:' . implode(',', FirstForm::sortWhitelist())],
            'order' => ['nullable', 'string', 'in:asc,desc'],

            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'], // размер страницы
            'page' => ['nullable', 'integer', 'min:1'],            // номер страницы
        ]);

        $q = $validated['q'] ?? null;
        $dateFrom = $validated['date_from'] ?? null;
        $dateTo = $validated['date_to'] ?? null;
        $sort = $validated['sort'] ?? 'created_at';
        $order = $validated['order'] ?? 'desc';
        $perPage = $validated['per_page'] ?? 15;

        // Гарантируем, что сортируем только разрешёнными полями
        if (!in_array($sort, FirstForm::sortWhitelist(), true)) {
            $sort = 'created_at';
        }
        $order = $order === 'asc' ? 'asc' : 'desc';

        // Базовый запрос (при желании добавь ->select([...]) для лёгкости)
        $builder = FirstForm::query()
            ->with(['user'])
            ->search($q)
            ->meetingDateBetween($dateFrom, $dateTo)
            ->orderBy($sort, $order);

        // Пагинация с сохранением query-строки (для навигации по страницам)
        $forms = $builder->paginate($perPage)->withQueryString();

        // Для фронтенда: отдадим исходные применённые фильтры и справочники
        $filters = [
            'q' => $q,
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
            'sort' => $sort,
            'order' => $order,
            'per_page' => (int)$perPage,
        ];

        // Примеры “справочников” — чтобы фронт мог строить фильтры локально:
        // (distinct значения по странице/всему набору — тут по ВСЕМУ набору)
        $available = [
            'incomes' => FirstForm::query()->select('income')->distinct()->pluck('income'),
            'experiences' => FirstForm::query()->select('agriculture_experience')->distinct()->pluck('agriculture_experience'),
            'rayons' => FirstForm::query()->select('rayon')->distinct()->pluck('rayon'),
            'jamoats' => FirstForm::query()->select('jamoat')->distinct()->pluck('jamoat'),
        ];

        // Рендер страницы Inertia. На фронте ты сможешь:
        // - показывать таблицу,
        // - делать клиентские фильтры ПО текущей странице,
        // - и при изменении глобальных фильтров — дергать этот же экшен с query-строкой.
        return Inertia::render('form-first/index', [
            'forms' => $forms,   // LengthAwarePaginator (Inertia сам сериализует)
            'filters' => $filters, // применённые фильтры (для UI)
            'available' => $available,
        ]);
    }
}

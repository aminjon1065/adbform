<?php

namespace App\Exports;

use App\Models\FirstForm;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class FirstFormsExport implements FromQuery, WithMapping, WithHeadings, ShouldAutoSize
{
    public function __construct(protected Request $request) {}

    // Внутри класса (FirstFormsExport / SecondFormsExport)

    private const IRRIGATION_LABELS = [
        'none'  => 'Нет',
        'well'  => 'Скважина',
        'pump'  => 'Насос',
        'canal' => 'Канал / река',
    ];

    private const SEED_LABELS = [
        'tomato'   => 'Помидор',
        'pepper'   => 'Болгарский перец',
        'cucumber' => 'Огурец',
        'onion'    => 'Лук',
        'beet'     => 'Свёкла',
        'potato'   => 'Картофель',
        'other'    => 'Другое',
    ];

    private const SEEDLING_LABELS = [
        'apricot'   => 'Абрикос',
        'apple'     => 'Яблоня',
        'grape'     => 'Виноград',
        'almond'    => 'Миндаль',
        'persimmon' => 'Хурма',
        'berries'   => 'Ягодные культуры',
        'other'     => 'Другое',
    ];

    private function labelIrrigation(?array $arr): string
    {
        if (!is_array($arr) || !$arr) return '';
        return collect($arr)
            ->map(fn($k) => self::IRRIGATION_LABELS[$k] ?? (string)$k)
            ->implode(', ');
    }

    private function labelPairs(?array $items, array $dict): string
    {
        if (!is_array($items) || !$items) return '';
        return collect($items)
            ->map(function ($i) use ($dict) {
                $key  = $i['key']  ?? '';
                $area = $i['area'] ?? '';
                $label = $dict[$key] ?? $key;
                return trim($label.': '.$area);
            })
            ->implode(', ');
    }

    public function query()
    {
        $q = FirstForm::query();

        if ($search = trim((string)$this->request->input('q'))) {
            $like = '%' . str_replace('%','\%',$search) . '%';
            $q->where(function ($qq) use ($like) {
                $qq->where('full_name', 'like', $like)
                    ->orWhere('rayon', 'like', $like)
                    ->orWhere('jamoat', 'like', $like)
                    ->orWhere('selo', 'like', $like)
                    ->orWhere('phone', 'like', $like)
                    ->orWhere('income', 'like', $like);
            });
        }

        if ($from = $this->request->input('date_from')) {
            $q->whereDate('meeting_date', '>=', $from);
        }
        if ($to = $this->request->input('date_to')) {
            $q->whereDate('meeting_date', '<=', $to);
        }

        $sort  = $this->request->input('sort', 'created_at');
        $order = $this->request->input('order', 'desc');
        $allowedSorts = ['created_at','meeting_date','full_name','age','rayon','jamoat','income','plot_ha'];
        if (! in_array($sort, $allowedSorts, true)) $sort = 'created_at';
        $order = $order === 'asc' ? 'asc' : 'desc';

        return $q->orderBy($sort, $order);
    }

    public function headings(): array
    {
        return [
            'ID',
            'Дата встречи',
            'Район',
            'Джамоат',
            'Село',
            'Согласие',
            'ФИО',
            'Возраст',
            'Телефон',
            'Семья: всего',
            'Семья: дети',
            'Семья: пожилые',
            'Семья: трудоспособные',
            'Доход',
            'Опыт',
            'Площадь, га',
            'Семена (ключ:площадь)',
            'Саженцы (ключ:площадь)',
            'Орошение (список)',
            'Пчеловодство',
            'Склад (есть?)',
            'Площадь склада, м²',
            'Холод. камера',
            'Создано',
        ];
    }

    public function map($row): array
    {
        $seeds      = $this->labelPairs($row->seeds, self::SEED_LABELS);
        $seedlings  = $this->labelPairs($row->seedlings, self::SEEDLING_LABELS);
        $irrigation = $this->labelIrrigation($row->irrigation_sources);

        return [
            $row->id,
            optional($row->meeting_date)->format('Y-m-d'),
            $row->rayon,
            $row->jamoat,
            $row->selo,
            $row->accept ? 'Да' : 'Нет',
            $row->full_name,
            $row->age,
            $row->phone,
            $row->family_count,
            $row->children_count,
            $row->elderly_count,
            $row->able_count,
            $row->income,
            $row->agriculture_experience,
            $row->plot_ha,
            $seeds,         // <-- русские метки + площадь
            $seedlings,     // <-- русские метки + площадь
            $irrigation,    // <-- русские метки
            $row->beekeeping ? 'Да' : 'Нет',
            $row->has_storage ? 'Да' : 'Нет',
            $row->has_storage ? $row->storage_area_sqm : null,
            $row->has_refrigerator ? 'Да' : 'Нет',
            optional($row->created_at)->format('Y-m-d H:i'),
        ];
    }

}

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
    ];

    private const SEEDLING_LABELS = [
        'apricot'   => 'Абрикос',
        'apple'     => 'Яблоня',
        'grape'     => 'Виноград',
        'almond'    => 'Миндаль',
        'persimmon' => 'Хурма',
        'berries'   => 'Ягодные культуры',
    ];

    private function labelIrrigation(?array $arr): string
    {
        if (!is_array($arr) || !$arr) return '';
        return collect($arr)
            ->map(fn($k) => self::IRRIGATION_LABELS[$k] ?? (string)$k)
            ->implode(', ');
    }

    /**
     * Извлечь площадь для конкретного ключа из массива items
     */
    private function getArea(?array $items, string $key): string
    {
        if (!is_array($items) || !$items) return '';
        foreach ($items as $item) {
            if (($item['key'] ?? '') === $key) {
                return (string)($item['area'] ?? '');
            }
        }
        return '';
    }

    /**
     * Извлечь "other" записи (other_1, other_2, etc.)
     * Возвращает массив из 4 элементов: [['name'=>..., 'area'=>...], ...]
     */
    private function getOtherEntries(?array $items): array
    {
        if (!is_array($items) || !$items) {
            return [
                ['name' => '', 'area' => ''],
                ['name' => '', 'area' => ''],
                ['name' => '', 'area' => ''],
                ['name' => '', 'area' => ''],
            ];
        }

        $others = [];
        foreach (['other_1', 'other_2', 'other_3', 'other_4'] as $key) {
            $found = false;
            foreach ($items as $item) {
                if (($item['key'] ?? '') === $key) {
                    $others[] = [
                        'name' => $item['name'] ?? '',
                        'area' => $item['area'] ?? '',
                    ];
                    $found = true;
                    break;
                }
            }
            if (!$found) {
                $others[] = ['name' => '', 'area' => ''];
            }
        }

        return $others;
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
            'Площадь, сотых',
            // Семена (6 основных культур)
            'Помидор, сотых',
            'Болгарский перец, сотых',
            'Огурец, сотых',
            'Лук, сотых',
            'Свёкла, сотых',
            'Картофель, сотых',
            // Семена: Другое (4 варианта)
            'Другое 1 (название)',
            'Другое 1, сотых',
            'Другое 2 (название)',
            'Другое 2, сотых',
            'Другое 3 (название)',
            'Другое 3, сотых',
            'Другое 4 (название)',
            'Другое 4, сотых',
            // Саженцы (6 основных культур)
            'Абрикос, сотых',
            'Яблоня, сотых',
            'Виноград, сотых',
            'Миндаль, сотых',
            'Хурма, сотых',
            'Ягодные культуры, сотых',
            // Саженцы: Другое (4 варианта)
            'Другое 1 (название)',
            'Другое 1, сотых',
            'Другое 2 (название)',
            'Другое 2, сотых',
            'Другое 3 (название)',
            'Другое 3, сотых',
            'Другое 4 (название)',
            'Другое 4, сотых',
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
        $irrigation = $this->labelIrrigation($row->irrigation_sources);

        // Извлечь площади для семян (6 основных)
        $seedAreas = [
            $this->getArea($row->seeds, 'tomato'),
            $this->getArea($row->seeds, 'pepper'),
            $this->getArea($row->seeds, 'cucumber'),
            $this->getArea($row->seeds, 'onion'),
            $this->getArea($row->seeds, 'beet'),
            $this->getArea($row->seeds, 'potato'),
        ];

        // Извлечь "другие" для семян (4 варианта)
        $seedOthers = $this->getOtherEntries($row->seeds);
        $seedOtherFlat = [];
        foreach ($seedOthers as $other) {
            $seedOtherFlat[] = $other['name'];
            $seedOtherFlat[] = $other['area'];
        }

        // Извлечь площади для саженцев (6 основных)
        $seedlingAreas = [
            $this->getArea($row->seedlings, 'apricot'),
            $this->getArea($row->seedlings, 'apple'),
            $this->getArea($row->seedlings, 'grape'),
            $this->getArea($row->seedlings, 'almond'),
            $this->getArea($row->seedlings, 'persimmon'),
            $this->getArea($row->seedlings, 'berries'),
        ];

        // Извлечь "другие" для саженцев (4 варианта)
        $seedlingOthers = $this->getOtherEntries($row->seedlings);
        $seedlingOtherFlat = [];
        foreach ($seedlingOthers as $other) {
            $seedlingOtherFlat[] = $other['name'];
            $seedlingOtherFlat[] = $other['area'];
        }

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
            // Семена: 6 основных культур
            ...$seedAreas,
            // Семена: 4 "других" (name, area, name, area, ...)
            ...$seedOtherFlat,
            // Саженцы: 6 основных культур
            ...$seedlingAreas,
            // Саженцы: 4 "других" (name, area, name, area, ...)
            ...$seedlingOtherFlat,
            $irrigation,
            $row->beekeeping ? 'Да' : 'Нет',
            $row->has_storage ? 'Да' : 'Нет',
            $row->has_storage ? $row->storage_area_sqm : null,
            $row->has_refrigerator ? 'Да' : 'Нет',
            optional($row->created_at)->format('Y-m-d H:i'),
        ];
    }

}

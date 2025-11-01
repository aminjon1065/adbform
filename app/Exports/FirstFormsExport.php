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
        'none'  => 'Не',
        'well'  => 'Чоҳ',
        'pump'  => 'Насос',
        'canal' => 'Канал / дарё',
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

    private const INCOME_LABELS = [
        'agriculture' => 'Кишоварзӣ',
        'seasonal'    => 'Корҳои мавсимӣ',
        'abroad'      => 'Кор дар хориҷа',
        'pension'     => 'Нафақа',
    ];

    private const EXPERIENCE_LABELS = [
        'овощеводство' => 'Сабзикорӣ',
        'садоводство'  => 'Боғдорӣ',
        'пчеловодство' => 'Занбӯриасалпарварӣ',
        'нет опыта'    => 'Таҷриба надорам',
    ];

    private function labelIrrigation(?array $arr): string
    {
        if (!is_array($arr) || !$arr) return '';
        return collect($arr)
            ->map(fn($k) => self::IRRIGATION_LABELS[$k] ?? (string)$k)
            ->implode(', ');
    }

    private function labelIncome(?string $income): string
    {
        if (!$income) return '';

        // Разбиваем по запятой и переводим каждый элемент
        $items = array_map('trim', explode(',', $income));
        $translated = [];

        foreach ($items as $item) {
            // Проверяем, есть ли это значение в словаре
            $translated[] = self::INCOME_LABELS[$item] ?? $item;
        }

        return implode(', ', $translated);
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

        if ($from = $this->request->input('date_from')) {
            $q->whereDate('meeting_date', '>=', $from);
        }
        if ($to = $this->request->input('date_to')) {
            $q->whereDate('meeting_date', '<=', $to);
        }

        $sort  = $this->request->input('sort', 'created_at');
        $order = $this->request->input('order', 'desc');
        $allowedSorts = ['created_at', 'meeting_date', 'full_name', 'age', 'rayon', 'jamoat', 'income', 'plot_ha'];
        if (! in_array($sort, $allowedSorts, true)) $sort = 'created_at';
        $order = $order === 'asc' ? 'asc' : 'desc';

        return $q->orderBy($sort, $order);
    }

    public function headings(): array
    {
        return [
            '№',
            'Ноҳия',
            'ҷамоат',
            'қишлоқ',
            'Ному насаб ',
            'Соли таваллуд',
            'Телефон',
            'Шумораи умумии аъзоёни оила',
            'кӯдакон',
            'пиронсолон',
            'қобили меҳнат',
            'Манбаи асосии даромади оила',
            'Масоҳати умумии замини наздиҳавлигӣ, сотых',
            'Дар кадом самт таҷрибаи корӣ доред?',
            'Помидор, сотых',
            'Қаламфури булғорӣ, сотых',
            'Бодиринг, сотых',
            'Пиёз , сотых',
            'Лаблабу, сотых',
            'Картофель, сотых',
            'Номи дигар намуди сабзавоти 1(Ном)',
            'сотых',
            'Номи дигар намуди сабзавоти 2(Ном)',
            'сотых',
            'Номи дигар намуди сабзавоти 3(Ном)',
            'сотых',
            'Номи дигар намуди сабзавоти 4(Ном)',
            'сотых',
            'Зардолу, сотых',
            'Себ, сотых',
            'Ангур, сотых',
            'Бодом, сотых',
            'Хурмо, сотых',
            'Буттамеваҳо, сотых',
            'Номи дигар намуди ниҳоли 1 (Ном)',
            'сотых',
            'Номи дигар намуди ниҳоли 2 (Ном)',
            'сотых',
            'Номи дигар намуди ниҳоли 3 (Ном)',
            'сотых',
            'Номи дигар намуди ниҳоли 4 (Ном)',
            'сотых',
            'Манбаи обёрии ба Шумо дастрасбударо нишон диҳед:',
            'Занбӯриасалпарварӣ',
            '10. Оё шумо анбор доред?',
            'масоҳати анбор, м²',
            'Оё шумо дастрасӣ ба сардхона доред?',
            'Оператор',
            'Рузи иловаи маълумот',
        ];
    }

    public function map($row): array
    {
        static $counter = 0;
        $counter++;

        $irrigation = $this->labelIrrigation($row->irrigation_sources);
        $income = $this->labelIncome($row->income);
        $experience = self::EXPERIENCE_LABELS[$row->agriculture_experience] ?? $row->agriculture_experience;

        // Формируем полный адрес
        $address = collect([$row->rayon, $row->jamoat, $row->selo])
            ->filter()
            ->implode(', ');

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
            $counter, // №
            $row->rayon, // Ном. района
            $row->jamoat, // Ном. джамоата
            $row->selo ?? '', // Ном. села
            $row->full_name, // ФИО
            $row->age, // Год рождения
            $row->phone, // Телефон
            $row->family_count, // Общее количество членов семьи
            $row->children_count, // в том числе детей
            $row->elderly_count, // пожилых
            $row->able_count, // трудоспособных
            $income, // Основной источник дохода семьи (переведённый)
            $row->plot_ha, // Площадь, сотых
            $experience, // Опыт (переведённый)
            // Семена: 6 основных культур
            ...$seedAreas,
            // Семена: 4 "других" (name, area, name, area, ...)
            ...$seedOtherFlat,
            // Саженцы: 6 основных культур
            ...$seedlingAreas,
            // Саженцы: 4 "других" (name, area, name, area, ...)
            ...$seedlingOtherFlat,
            $irrigation, // Орошение
            $row->beekeeping ? 'Ҳа' : 'Не', // Пчеловодство
            $row->has_storage ? 'Ҳа' : 'Не', // Склад
            $row->has_storage ? $row->storage_area_sqm : '', // Площадь склада
            $row->has_refrigerator ? 'Ҳа' : 'Не', // Холод. камера
            $row->user ? $row->user->name : 'Оператор удалён', // Оператор
            optional($row->created_at)->format('d.m.Y H:i'), // Дата создания
        ];
    }
}

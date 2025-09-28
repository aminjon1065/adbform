@php
    $IRRIGATION = [
        'none'  => 'Нет',
        'well'  => 'Скважина',
        'pump'  => 'Насос',
        'canal' => 'Канал / река',
    ];
    $SEEDS = [
        'tomato' => 'Помидор','pepper' => 'Болгарский перец','cucumber' => 'Огурец',
        'onion'  => 'Лук','beet' => 'Свёкла','potato' => 'Картофель','other' => 'Другое',
    ];
    $SEEDLINGS = [
        'apricot'=>'Абрикос','apple'=>'Яблоня','grape'=>'Виноград','almond'=>'Миндаль',
        'persimmon'=>'Хурма','berries'=>'Ягодные культуры','other'=>'Другое',
    ];

    $pairs = function($items, $dict) {
        if (!is_array($items) || empty($items)) return '';
        return collect($items)->map(function($i) use ($dict) {
            $k = $i['key'] ?? '';
            $a = $i['area'] ?? '';
            $label = $dict[$k] ?? $k;
            return trim($label.': '.$a);
        })->implode(', ');
    };

    $irrig = function($arr) use ($IRRIGATION) {
        if (!is_array($arr) || empty($arr)) return '';
        return collect($arr)->map(fn($k) => $IRRIGATION[$k] ?? $k)->implode(', ');
    };
@endphp

    <!doctype html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <style>
        @page {
            size: A3 landscape;
            margin: 12mm;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 12px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th, td {
            border: 1px solid #ccc;
            padding: 6px;
            vertical-align: top;
        }

        th {
            background: #f2f2f2;
        }

        .muted {
            color: #666;
            font-size: 11px;
        }
    </style>
</head>
<body>
<h3>Анкеты (Работницы)</h3>
<table>
    <thead>
    <tr>
        <th>ID</th>
        <th>Дата</th>
        <th>Адрес</th>
        <th>Согласие</th>
        <th>Ф.И.О.</th>
        <th>Возраст</th>
        <th>Телефон</th>
        <th>Семья</th>
        <th>Доход</th>
        <th>Опыт</th>
        <th>Площадь, га</th>
        <th>Семена</th>
        <th>Саженцы</th>
        <th>Орошение</th>
        <th>Пчёлы</th>
        <th>Склад</th>
        <th>Холод.</th>
        <th>Создано</th>
    </tr>
    </thead>
    <tbody>
    @forelse($items as $it)
        @php
            $seeds = $pairs($it->seeds ?? [], $SEEDS);
            $seedlings = $pairs($it->seedlings ?? [], $SEEDLINGS);
            $irrigation = $irrig($it->irrigation_sources ?? []);
        @endphp
        <tr>
            <td>{{ $it->id }}</td>
            <td>{{ optional($it->meeting_date)->format('Y-m-d') }}</td>
            <td>
                {{ $it->rayon }}<br>
                <span class="muted">{{ $it->jamoat }}@if($it->selo)
                        , {{ $it->selo }}
                    @endif</span>
            </td>
            <td>{{ $it->accept ? 'Да':'Нет' }}</td>
            <td>{{ $it->full_name }}</td>
            <td>{{ $it->age }}</td>
            <td>{{ $it->phone }}</td>
            <td>
                всего: {{ $it->family_count }}<br>
                дети: {{ $it->children_count }}, пожилые: {{ $it->elderly_count }}, труд.: {{ $it->able_count }}
            </td>
            <td>{{ $it->income }}</td>
            <td>{{ $it->agriculture_experience }}</td>
            <td>{{ $it->plot_ha }}</td>
            <td>{{ $seeds }}</td>
            <td>{{ $seedlings }}</td>
            <td>{{ $irrigation }}</td>
            <td>{{ $it->beekeeping ? 'Да':'Нет' }}</td>
            <td>{{ $it->has_storage ? ('Да' . ($it->storage_area_sqm ? ', '.$it->storage_area_sqm.' м²' : '')) : 'Нет' }}</td>
            <td>{{ $it->has_refrigerator ? 'Да':'Нет' }}</td>
            <td>{{ optional($it->created_at)->format('Y-m-d H:i') }}</td>
        </tr>
    @empty
        <tr>
            <td colspan="18" style="text-align:center">Нет данных</td>
        </tr>
    @endforelse
    </tbody>
</table>
</body>
</html>

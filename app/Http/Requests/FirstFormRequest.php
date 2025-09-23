<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class FirstFormRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $seedKeys = ['tomato', 'pepper', 'cucumber', 'onion', 'beet', 'potato', 'other'];
        $seedlingKeys = ['apricot', 'apple', 'grape', 'almond', 'persimmon', 'berries', 'other'];
        $irrigationSet = ['none', 'well', 'pump', 'canal'];
        $expSet = ['овощеводство', 'садоводство', 'пчеловодство', 'нет опыта'];

        return [
            // 0. Дата встречи и адрес
            'meeting_date' => ['required', 'date'], // Y-m-d
            'rayon' => ['required', 'string', 'max:120'],
            'jamoat' => ['required', 'string', 'max:120'],
            'selo' => ['nullable', 'string', 'max:120'],

            // 1. Согласие
            'accept' => ['required', 'boolean', 'accepted'],

            // 2. Участник
            'full_name' => ['required', 'string', 'max:200'],
            'age' => ['required', 'integer', 'between:1,100'],
            'phone' => ['required', 'digits:9'],
            // Rule::unique('first_forms','phone') // если нужно уникально

            // 3. Семья
            'family_count' => ['required', 'integer', 'min:0'],
            'children_count' => ['nullable', 'integer', 'min:0'],
            'elderly_count' => ['nullable', 'integer', 'min:0'],
            'able_count' => ['nullable', 'integer', 'min:0'],

            // 4. Доход
            'income' => ['required', 'string', 'max:120'],

            // 5. Площадь участка
            'plot_ha' => ['nullable', 'numeric', 'min:0'],

            // 6. Опыт
            'agriculture_experience' => ['required', Rule::in($expSet)],

            // 7. Семена (если опыт овощеводство — фронт уже показывает блок, но сервер можно не жёстко ограничивать)
            'seeds' => ['nullable', 'array'],
            'seeds.*.key' => ['required_with:seeds', 'string', Rule::in($seedKeys)],
            'seeds.*.area' => ['required_with:seeds', 'string', 'max:20'],

            // 8. Саженцы
            'seedlings' => ['nullable', 'array'],
            'seedlings.*.key' => ['required_with:seedlings', 'string', Rule::in($seedlingKeys)],
            'seedlings.*.area' => ['required_with:seedlings', 'string', 'max:20'],

            // 9. Орошение (мульти)
            'irrigation_sources' => ['required', 'array'],
            'irrigation_sources.*' => [Rule::in($irrigationSet)],

            // 10. Пчеловодство
            'beekeeping' => ['required', 'boolean'],

            // 11. Склад
            'has_storage' => ['required', 'boolean'],
            'storage_area_sqm' => ['nullable', 'integer', 'min:0', 'required_if:has_storage,true'],

            // 12. Холод. камера
            'has_refrigerator' => ['required', 'boolean'],
        ];
    }

    public function prepareForValidation(): void
    {
        // Нормализация входа
        $plot = $this->input('plot_ha');

        $this->merge([
            'accept' => (bool)$this->boolean('accept'),
            'beekeeping' => (bool)$this->boolean('beekeeping'),
            'has_storage' => (bool)$this->boolean('has_storage'),
            'has_refrigerator' => (bool)$this->boolean('has_refrigerator'),
            'phone' => $this->phone ? preg_replace('/\D+/', '', $this->phone) : null,
            'plot_ha' => $plot !== null && $plot !== '' ? str_replace(',', '.', $plot) : null,
            'meeting_date' => $this->meeting_date
                ? \Carbon\Carbon::parse($this->meeting_date)->toDateString()
                : null,
        ]);
    }

    public function messages(): array
    {
        return [
            'accept.accepted' => 'Необходимо согласие на участие.',
            'phone.digits' => 'Номер телефона должен содержать ровно 9 цифр.',
        ];
    }
}

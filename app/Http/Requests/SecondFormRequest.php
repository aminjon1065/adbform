<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class SecondFormRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $seedKeys = ['tomato','pepper','cucumber','onion','beet','potato','other'];
        $seedlingKeys = ['apricot','apple','grape','almond','persimmon','berries','other'];
        $irrigationSet = ['none','well','pump','canal'];
        $expSet = ['овощеводство','садоводство','пчеловодство','нет опыта'];
        $equipmentSet = ['freza','seeder','cultivator','other'];

        return [
            // Дата/адрес
            'meeting_date' => ['required','date'],
            'rayon' => ['required','string','max:120'],
            'jamoat' => ['required','string','max:120'],
            'selo' => ['nullable','string','max:120'],

            // Согласие
            'accept' => ['required','boolean','accepted'],

            // ДХ/руководитель
            'farm_name' => ['required','string','max:200'],
            'leader_full_name' => ['required','string','max:200'],
            'leader_age' => ['required','integer','between:18,100'],
            'leader_phone' => ['required','digits:9'],

            // Площадь хоз-ва
            'farm_plot_ha' => ['nullable','numeric','min:0'],

            // Опыт
            'agriculture_experience' => ['required', Rule::in($expSet)],

            // Семена
            'seeds' => ['nullable','array'],
            'seeds.*.key' => ['required_with:seeds','string', Rule::in($seedKeys)],
            'seeds.*.area' => ['required_with:seeds','string','max:20'],

            // Саженцы
            'seedlings' => ['nullable','array'],
            'seedlings.*.key' => ['required_with:seedlings','string', Rule::in($seedlingKeys)],
            'seedlings.*.area' => ['required_with:seedlings','string','max:20'],

            // Техника
            'equipment_choice' => ['required', Rule::in($equipmentSet)],
            'equipment_other_text' => ['nullable','string','max:120', 'required_if:equipment_choice,other'],

            // Орошение
            'irrigation_sources' => ['required','array'],
            'irrigation_sources.*' => [Rule::in($irrigationSet)],

            // Пчеловодство
            'beekeeping' => ['required','boolean'],

            // Склад
            'has_storage' => ['required','boolean'],
            'storage_area_sqm' => ['nullable','integer','min:0','required_if:has_storage,true'],

            // Холод. камера
            'has_refrigerator' => ['required','boolean'],

            // Подпись (необязательно)
            'signature' => ['nullable','string','max:200'],
        ];
    }

    public function prepareForValidation(): void
    {
        $this->merge([
            'accept' => (bool)$this->boolean('accept'),
            'beekeeping' => (bool)$this->boolean('beekeeping'),
            'has_storage' => (bool)$this->boolean('has_storage'),
            'has_refrigerator' => (bool)$this->boolean('has_refrigerator'),
            'leader_phone' => $this->leader_phone ? preg_replace('/\D+/', '', $this->leader_phone) : null,
            'farm_plot_ha' => $this->farm_plot_ha !== null && $this->farm_plot_ha !== '' ? str_replace(',', '.', $this->farm_plot_ha) : null,
            'meeting_date' => $this->meeting_date ? Carbon::parse($this->meeting_date)->toDateString() : null,
        ]);
    }

    public function messages(): array
    {
        return [
            'accept.accepted' => 'Необходимо согласие на участие.',
            'leader_phone.digits' => 'Номер телефона должен содержать ровно 9 цифр.',
            'equipment_other_text.required_if' => 'Укажите название техники в поле «Другое».',
        ];
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class SecondForm extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'meeting_date',
        'rayon','jamoat','selo',
        'accept',
        'farm_name',
        'leader_full_name','leader_age','leader_phone',
        'farm_plot_ha',
        'agriculture_experience',
        'seeds','seedlings',
        'equipment_choice','equipment_other_text',
        'irrigation_sources',
        'beekeeping',
        'has_storage','storage_area_sqm',
        'has_refrigerator',
    ];

    protected $casts = [
        'meeting_date' => 'date',
        'accept' => 'boolean',
        'leader_age' => 'integer',
        'farm_plot_ha' => 'decimal:2',
        'seeds' => 'array',
        'seedlings' => 'array',
        'irrigation_sources' => 'array',
        'beekeeping' => 'boolean',
        'has_storage' => 'boolean',
        'storage_area_sqm' => 'integer',
        'has_refrigerator' => 'boolean',
    ];
    public function setLeaderPhoneAttribute($value): void
    {
        $digits = preg_replace('/\D+/', '', (string) $value ?? '');
        $this->attributes['leader_phone'] = substr($digits, 0, 9);
    }

    // Человекочитаемая метка техники (для таблиц/экспортов)
    public function getEquipmentChoiceLabelAttribute(): string
    {
        return match ($this->equipment_choice) {
            'freza'      => 'Фреза',
            'seeder'     => 'Посевная машина',
            'cultivator' => 'Мотокультиватор',
            'other'      => $this->equipment_other_text ?: 'Другое',
            default      => (string) $this->equipment_choice,
        };
    }

    /* =================================================
     |  Скоупы: атомарные
     * =================================================*/
    public const SORT_WHITELIST = [
        'created_at',
        'meeting_date',
        'farm_name',
        'leader_full_name',
        'leader_age',
        'farm_plot_ha',
        'rayon',
        'jamoat',
        'equipment_choice',
    ];

    public static function sortWhitelist(): array
    {
        return self::SORT_WHITELIST;
    }
    public function scopeSearch(Builder $q, ?string $term): Builder
    {
        if (!$term) return $q;
        $t = mb_strtolower(trim($term));

        return $q->where(function (Builder $qq) use ($t) {
            $qq->whereRaw('LOWER(farm_name) LIKE ?', ["%{$t}%"])
                ->orWhereRaw('LOWER(leader_full_name) LIKE ?', ["%{$t}%"])
                ->orWhereRaw('LOWER(rayon) LIKE ?', ["%{$t}%"])
                ->orWhereRaw('LOWER(jamoat) LIKE ?', ["%{$t}%"])
                ->orWhereRaw('LOWER(selo) LIKE ?', ["%{$t}%"])
                ->orWhere('leader_phone', 'like', "%{$t}%")
                ->orWhereRaw('LOWER(equipment_choice) LIKE ?', ["%{$t}%"])
                ->orWhereRaw('LOWER(agriculture_experience) LIKE ?', ["%{$t}%"]);
        });
    }

    public function scopeDateFrom(Builder $q, ?string $ymd): Builder
    {
        if ($ymd) $q->whereDate('meeting_date', '>=', $ymd);
        return $q;
    }

    public function scopeDateTo(Builder $q, ?string $ymd): Builder
    {
        if ($ymd) $q->whereDate('meeting_date', '<=', $ymd);
        return $q;
    }

    public function scopeExperience(Builder $q, ?string $value): Builder
    {
        if ($value !== null && $value !== '') {
            $q->where('agriculture_experience', $value);
        }
        return $q;
    }

    public function scopeEquipment(Builder $q, ?string $value): Builder
    {
        if ($value !== null && $value !== '') {
            $q->where('equipment_choice', $value);
        }
        return $q;
    }

    public function scopeBeekeeping(Builder $q, ?bool $flag): Builder
    {
        if ($flag !== null) {
            $q->where('beekeeping', $flag);
        }
        return $q;
    }

    public function scopeHasStorage(Builder $q, ?bool $flag): Builder
    {
        if ($flag !== null) {
            $q->where('has_storage', $flag);
        }
        return $q;
    }

    public function scopeHasRefrigerator(Builder $q, ?bool $flag): Builder
    {
        if ($flag !== null) {
            $q->where('has_refrigerator', $flag);
        }
        return $q;
    }

    public function scopeOrderSafe(Builder $q, ?string $sort, ?string $order): Builder
    {
        $sort  = in_array($sort ?? '', self::SORT_WHITELIST, true) ? $sort : 'created_at';
        $order = $order === 'asc' ? 'asc' : 'desc';
        return $q->orderBy($sort, $order);
    }

    /** Комбинированный скоуп под контроллер */
    public function scopeFilter(Builder $q, array $filters): Builder
    {
        return $q
            ->search($filters['q'] ?? null)
            ->dateFrom($filters['date_from'] ?? null)
            ->dateTo($filters['date_to'] ?? null)
            ->experience($filters['experience'] ?? null)
            ->equipment($filters['equipment_choice'] ?? null)
            ->beekeeping($filters['beekeeping'] ?? null)          // ждёт bool|null
            ->hasStorage($filters['has_storage'] ?? null)          // ждёт bool|null
            ->hasRefrigerator($filters['has_refrigerator'] ?? null)// ждёт bool|null
            ->orderSafe($filters['sort'] ?? 'created_at', $filters['order'] ?? 'desc');
    }
}

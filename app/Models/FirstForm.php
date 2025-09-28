<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FirstForm extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id','meeting_date','rayon','jamoat','selo','accept',
        'full_name','age','phone',
        'family_count','children_count','elderly_count','able_count',
        'income','plot_ha','agriculture_experience',
        'seeds','seedlings','irrigation_sources',
        'beekeeping','has_storage','storage_area_sqm','has_refrigerator',
    ];

    protected $casts = [
        'meeting_date' => 'date',
        'accept' => 'boolean',
        'age' => 'integer',
        'family_count' => 'integer',
        'children_count' => 'integer',
        'elderly_count' => 'integer',
        'able_count' => 'integer',
        'plot_ha' => 'decimal:2',
        'seeds' => 'array',
        'seedlings' => 'array',
        'irrigation_sources' => 'array',
        'beekeeping' => 'boolean',
        'has_storage' => 'boolean',
        'storage_area_sqm' => 'integer',
        'has_refrigerator' => 'boolean',
    ];

    public function scopeSearch($q, ?string $term)
    {
        if (!$term) return $q;
        $t = mb_strtolower(trim($term));

        return $q->where(function ($qq) use ($t) {
            $qq->whereRaw('LOWER(full_name) LIKE ?', ["%{$t}%"])
                ->orWhereRaw('LOWER(rayon) LIKE ?', ["%{$t}%"])
                ->orWhereRaw('LOWER(jamoat) LIKE ?', ["%{$t}%"])
                ->orWhereRaw('LOWER(selo) LIKE ?', ["%{$t}%"])
                ->orWhere('phone', 'like', "%{$t}%");
        });
    }

    /** Диапазон даты встречи */
    public function scopeMeetingDateBetween($q, ?string $from, ?string $to)
    {
        if ($from) $q->where('meeting_date', '>=', $from);
        if ($to)   $q->where('meeting_date', '<=', $to);
        return $q;
    }

    /** Белый список сортировки */
    public static function sortWhitelist(): array
    {
        return [
            'meeting_date', 'full_name', 'age', 'rayon', 'jamoat',
            'income', 'plot_ha', 'created_at',
        ];
    }

    public function user():BelongsTo
    {
        return $this->belongsTo(User::class);
    }

}

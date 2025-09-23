<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FirstForm extends Model
{
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
}

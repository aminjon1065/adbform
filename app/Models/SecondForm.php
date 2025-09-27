<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
        'signature',
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
}

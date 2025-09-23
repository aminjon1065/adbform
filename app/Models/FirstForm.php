<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FirstForm extends Model
{
    protected $fillable = [
        'date',
        'rayon',
        'jamoat',
        'selo',
        'accept',
        'name',
        'age',
        'phone',
        'family_count',
        'children_count',
        'old_man_count',
        'able_count',
        'income',
        'garden',
        'agriculture_experience',
        'seed',
        'seedlings',
        'irrigation_source',
        'beekeeping',
        'storage',
        'refrigerator'
    ];

    protected $casts = [
        'accept' => 'boolean',
        'seed' => 'json',
        'seedlings' => 'json',
        'storage' => 'json',
        'refrigerator' => 'boolean',
    ];
}

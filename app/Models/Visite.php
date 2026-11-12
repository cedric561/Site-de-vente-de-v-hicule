<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Visite extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'visiteur', 'type', 'vehicule_id', 'appareil', 'source', 'pays', 'created_at',
    ];

    protected $casts = ['created_at' => 'datetime'];

    public function vehicule(): BelongsTo
    {
        return $this->belongsTo(Vehicule::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Abonne extends Model
{
    protected $fillable = ['nom', 'whatsapp', 'marque', 'budget_max', 'consentement_at', 'actif'];

    protected $casts = [
        'consentement_at' => 'datetime',
        'actif' => 'boolean',
    ];
}

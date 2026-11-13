<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Statut extends Model
{
    public const ETIQUETTES = [
        'nouveau' => 'Nouvel arrivage',
        'promo'   => 'Promo flash',
        'dernier' => 'Dernier exemplaire',
        'essai'   => 'Essai vidéo',
        'vendu'   => 'Vendu',
        'info'    => 'Info',
    ];

    protected $fillable = [
        'etiquette', 'legende', 'media', 'type_media', 'vehicule_id',
        'duree_heures', 'publie_le', 'expire_at',
    ];

    protected $casts = [
        'publie_le' => 'datetime',
        'expire_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::saving(function (Statut $statut) {
            if (! $statut->publie_le) {
                $statut->publie_le = now();
            }

            $statut->expire_at = $statut->publie_le->copy()->addHours((int) $statut->duree_heures);
            $statut->type_media = preg_match('/\.(mp4|webm|mov)$/i', (string) $statut->media) ? 'video' : 'image';
        });

        static::deleting(function (Statut $statut) {
            if ($statut->media) {
                Storage::disk('public')->delete($statut->media);
            }
        });
    }

    public function vehicule(): BelongsTo
    {
        return $this->belongsTo(Vehicule::class);
    }

    public function scopeActifs(Builder $query): Builder
    {
        return $query->where('publie_le', '<=', now())->where('expire_at', '>', now());
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Visite;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class VisiteController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'type'        => ['required', 'in:page,vehicule'],
            'vehicule_id' => ['nullable', 'integer', 'exists:vehicules,id'],
            'utm_source'  => ['nullable', 'string', 'max:60'],
            'referrer'    => ['nullable', 'string', 'max:500'],
        ]);

        $ua = (string) $request->userAgent();

        if (preg_match('/bot|crawl|spider|slurp|preview|facebookexternalhit|headless/i', $ua)) {
            return response()->noContent();
        }

        $ip = (string) $request->ip();

        Visite::create([
            'visiteur'    => hash_hmac('sha256', $ip . '|' . $ua . '|' . now()->toDateString(), (string) config('app.key')),
            'type'        => $data['type'],
            'vehicule_id' => $data['vehicule_id'] ?? null,
            'appareil'    => $this->appareil($ua),
            'source'      => $this->source($data['utm_source'] ?? null, $data['referrer'] ?? null, $request->getHost()),
            'pays'        => $this->pays($ip),
            'created_at'  => now(),
        ]);

        return response()->noContent();
    }

    private function appareil(string $ua): string
    {
        if (preg_match('/ipad|tablet|android(?!.*mobile)/i', $ua)) {
            return 'Tablette';
        }

        if (preg_match('/mobi|iphone|android/i', $ua)) {
            return 'Mobile';
        }

        return 'Ordinateur';
    }

    private function source(?string $utm, ?string $referrer, string $hoteLocal): string
    {
        $brut = strtolower($utm ?: (string) parse_url((string) $referrer, PHP_URL_HOST));

        if ($brut === '') {
            return 'Direct';
        }

        $reseaux = [
            'google' => 'Google', 'bing' => 'Bing', 'facebook' => 'Facebook',
            'instagram' => 'Instagram', 'whatsapp' => 'WhatsApp', 'wa.me' => 'WhatsApp',
            'tiktok' => 'TikTok', 'youtube' => 'YouTube', 'twitter' => 'X', 'linkedin' => 'LinkedIn',
        ];

        foreach ($reseaux as $cle => $nom) {
            if (str_contains($brut, $cle)) {
                return $nom;
            }
        }

        if (str_contains($brut, $hoteLocal)) {
            return 'Direct';
        }

        return $utm ? ucfirst(substr($brut, 0, 40)) : 'Autres sites';
    }

    private function pays(string $ip): string
    {
        if (! filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
            return 'Inconnu';
        }

        $cle = 'geo:' . hash('sha256', $ip);

        if ($pays = Cache::get($cle)) {
            return $pays;
        }

        try {
            $reponse = Http::timeout(2)->get('https://ipwho.is/' . $ip);

            if ($reponse->successful() && $reponse->json('success') && $reponse->json('country')) {
                Cache::put($cle, $reponse->json('country'), now()->addDays(30));

                return $reponse->json('country');
            }
        } catch (\Throwable $e) {
            // Service injoignable : la visite est enregistrée sans pays.
        }

        return 'Inconnu';
    }
}

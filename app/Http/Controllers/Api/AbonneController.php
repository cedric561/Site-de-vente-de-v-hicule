<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Abonne;
use Illuminate\Http\Request;

class AbonneController extends Controller
{
    public function store(Request $request)
    {
        $numero = preg_replace('/\D+/', '', (string) $request->input('whatsapp'));

        if (str_starts_with($numero, '00')) {
            $numero = substr($numero, 2);
        } elseif (strlen($numero) === 10 && str_starts_with($numero, '0')) {
            $numero = '225' . $numero;
        }

        $request->merge(['whatsapp' => $numero]);

        $data = $request->validate([
            'nom'          => ['nullable', 'string', 'max:80'],
            'whatsapp'     => ['required', 'digits_between:11,15'],
            'marque'       => ['nullable', 'string', 'max:80'],
            'budget_max'   => ['nullable', 'integer', 'min:0'],
            'consentement' => ['accepted'],
        ], [
            'whatsapp.required'       => 'Merci de saisir votre numéro WhatsApp.',
            'whatsapp.digits_between' => 'Numéro WhatsApp invalide. Exemple : 07 00 00 00 00.',
            'consentement.accepted'   => 'Merci de cocher la case de consentement.',
        ]);

        Abonne::updateOrCreate(
            ['whatsapp' => $data['whatsapp']],
            [
                'nom' => $data['nom'] ?? null,
                'marque' => $data['marque'] ?? null,
                'budget_max' => $data['budget_max'] ?? null,
                'consentement_at' => now(),
                'actif' => true,
            ]
        );

        return response()->json([
            'message' => 'Merci ! Nous vous préviendrons sur WhatsApp dès qu\'un véhicule correspondant sera publié.',
        ], 201);
    }
}

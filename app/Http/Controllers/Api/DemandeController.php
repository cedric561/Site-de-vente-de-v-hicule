<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Demande;
use Illuminate\Http\Request;

class DemandeController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'vehicule_id' => ['nullable', 'exists:vehicules,id'],
            'nom'         => ['required', 'string', 'max:120'],
            'telephone'   => ['required', 'string', 'min:8', 'max:20'],
            'email'       => ['nullable', 'email', 'max:150'],
            'type'        => ['required', 'in:information,essai,reservation,achat'],
            'message'     => ['nullable', 'string', 'max:1000'],
        ]);

        Demande::create($data);

        return response()->json([
            'message' => 'Votre demande a bien été envoyée. Un conseiller vous recontactera rapidement.',
        ], 201);
    }
}

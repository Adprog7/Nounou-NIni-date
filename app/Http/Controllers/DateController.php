<?php

namespace App\Http\Controllers;

use App\Models\DateChoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class DateController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'day'  => 'required|string|max:100',
            'time' => 'required|string|max:10',
            'food' => 'required|string|max:50',
        ]);

        $choice = DateChoice::create($data);

        try {
            Mail::raw(
                "Elle a dit OUI 💖\n\nQuand : {$data['day']}\nHeure : {$data['time']}\nEnvie de : {$data['food']}",
                fn ($m) => $m->to(env('NOTIFY_EMAIL'))->subject('Date confirmé 🎉')
            );
        } catch (\Throwable $e) {
            report($e);
        }

        return response()->json(['ok' => true, 'id' => $choice->id], 201);
    }
}
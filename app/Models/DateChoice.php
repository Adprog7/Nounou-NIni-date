<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DateChoice extends Model
{
    protected $fillable = ['day', 'time', 'food'];
}
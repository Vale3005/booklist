<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    public function readings()
    {
        return $this->hasMany(Reading::class);
    }
}

<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class PlannerTask extends Model {
    protected $fillable=['user_id','title','notes','due_date','minutes','category','done'];
    protected $casts=['done'=>'boolean','minutes'=>'integer'];
}

<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class ResourceState extends Model {
    protected $fillable=['user_id','lesson_content_id','bookmarked','downloaded_at','viewed_at'];
    protected $casts=['bookmarked'=>'boolean','downloaded_at'=>'datetime','viewed_at'=>'datetime'];
    public function content(){return $this->belongsTo(LessonContent::class,'lesson_content_id');}
}

<?php
namespace Database\Seeders;
use App\Models\{Board, Grade};
use Illuminate\Database\Seeder;
class DatabaseSeeder extends Seeder {
    public function run(): void {
        $board=Board::firstOrCreate(['code'=>'CBSE'],['name'=>'Central Board of Secondary Education','country'=>'India','is_active'=>true]);
        for($i=1;$i<=12;$i++) Grade::firstOrCreate(['board_id'=>$board->id,'grade_number'=>$i],['name'=>'Class '.$i,'code'=>'CLASS-'.$i,'is_active'=>true]);
    }
}

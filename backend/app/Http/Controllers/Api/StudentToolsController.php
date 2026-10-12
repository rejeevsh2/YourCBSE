<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\PlannerTask;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
class StudentToolsController extends Controller {
    public function profile(Request $r){return response()->json(['user'=>$r->user()]);}
    public function updateProfile(Request $r){
        $data=$r->validate(['name'=>'required|string|max:255','mobile'=>'nullable|string|max:30','bio'=>'nullable|string|max:2000']);
        $r->user()->forceFill($data)->save();return $this->profile($r);
    }
    public function password(Request $r){
        $data=$r->validate(['current_password'=>'required|string','password'=>'required|string|min:8|confirmed']);
        abort_unless(Hash::check($data['current_password'],$r->user()->password),422,'Current password is incorrect.');
        $r->user()->forceFill(['password'=>$data['password']])->save();
        $tokenId=$r->user()->currentAccessToken()->id??null;
        $r->user()->tokens()->when($tokenId,fn($q)=>$q->where('id','!=',$tokenId))->delete();
        return response()->json(['message'=>'Password changed. Other sessions have been signed out.']);
    }
    public function tasks(Request $r){
        $r->validate(['from'=>'nullable|date_format:Y-m-d','to'=>'nullable|date_format:Y-m-d']);
        $q=PlannerTask::where('user_id',$r->user()->id);
        if($r->filled('from'))$q->where('due_date','>=',$r->input('from'));
        if($r->filled('to'))$q->where('due_date','<=',$r->input('to'));
        return response()->json(['tasks'=>$q->orderBy('due_date')->orderBy('id')->get()]);
    }
    public function storeTask(Request $r){
        $data=$r->validate(['title'=>'required|string|max:255','notes'=>'nullable|string|max:5000','due_date'=>'required|date_format:Y-m-d','minutes'=>'required|integer|min:1|max:600','category'=>['required',Rule::in(['Learn','Practice','Revise','Test'])]]);
        return response()->json(['task'=>PlannerTask::create($data+['user_id'=>$r->user()->id])],201);
    }
    public function updateTask(Request $r,int $id){
        $task=PlannerTask::where('user_id',$r->user()->id)->findOrFail($id);
        $data=$r->validate(['title'=>'sometimes|required|string|max:255','notes'=>'nullable|string|max:5000','due_date'=>'sometimes|required|date_format:Y-m-d','minutes'=>'sometimes|required|integer|min:1|max:600','done'=>'sometimes|required|boolean','category'=>['sometimes','required',Rule::in(['Learn','Practice','Revise','Test'])]]);
        $task->update($data);return response()->json(['task'=>$task]);
    }
    public function deleteTask(Request $r,int $id){
        PlannerTask::where('user_id',$r->user()->id)->findOrFail($id)->delete();return response()->json(['message'=>'Task deleted.']);
    }
}

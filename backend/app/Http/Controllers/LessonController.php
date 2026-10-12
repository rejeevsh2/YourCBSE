<?php

namespace App\Http\Controllers;

use App\Models\Lesson;
use App\Models\User;
use App\Notifications\StudentNotification;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LessonController extends Controller
{
    private function notifyStudentsAboutLesson(Lesson $lesson): void
{
    $students = User::where('role', 'student')->get();

    foreach ($students as $student) {
        $prefs = json_decode($student->getRawOriginal('notification_preferences') ?? '{}', true) ?? [];
        if (($prefs['learning'] ?? true) === false) continue;
        $student->notify(new StudentNotification(
            'New Lesson Available',
            "{$lesson->title} is now available. Click here to start learning.",
            'lesson',
            "/student/lesson/{$lesson->id}"
        ));
    }
}
    /**
     * Display all lessons.
     */
    public function index()
    {
        return Lesson::with('chapter')
            ->orderBy('display_order')
            ->get();
    }

    /**
     * Display one lesson.
     */
    public function show($id)
    {
        return Lesson::with('chapter')->findOrFail($id);
    }

    /**
     * Create a new lesson.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'chapter_id'    => 'required|exists:chapters,id',
            'title'         => 'required|string|max:255',
            'slug'          => 'required|string|max:255|unique:lessons,slug',
            'lesson_number' => 'required|integer|min:1|max:255',
            'summary'       => 'nullable|string',
            'duration'      => 'nullable|integer|min:1|max:255',
            'display_order' => 'nullable|integer|min:1|max:255',
            'is_published'  => 'nullable|boolean',
            'is_active'     => 'nullable|boolean',
        ]);

       $lesson = Lesson::create($validated);

if ($lesson->is_published && $lesson->is_active) {
    $this->notifyStudentsAboutLesson($lesson);
}

return response()->json($lesson, 201);
    }

    /**
     * Update an existing lesson.
     */
    public function update(Request $request, $id)
    {
        $lesson = Lesson::findOrFail($id);

        $validated = $request->validate([
            'chapter_id'    => 'required|exists:chapters,id',
            'title'         => 'required|string|max:255',

            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('lessons', 'slug')->ignore($lesson->id),
            ],

            'lesson_number' => 'required|integer|min:1|max:255',
            'summary'       => 'nullable|string',
            'duration'      => 'nullable|integer|min:1|max:255',
            'display_order' => 'nullable|integer|min:1|max:255',
            'is_published'  => 'nullable|boolean',
            'is_active'     => 'nullable|boolean',
        ]);

       $wasPublished = (bool) $lesson->is_published;

$lesson->update($validated);

if (
    !$wasPublished &&
    $lesson->is_published &&
    $lesson->is_active
) {
    $this->notifyStudentsAboutLesson($lesson);
}

return response()->json($lesson);
    }

    /**
     * Delete a lesson.
     */
    public function destroy($id)
{
    $lesson = Lesson::findOrFail($id);

    $lessonLink = "/student/lesson/{$lesson->id}";

    User::where('role', 'student')
        ->get()
        ->each(function ($student) use ($lessonLink) {
            $student->notifications()
                ->get()
                ->filter(function ($notification) use ($lessonLink) {
                    return ($notification->data['link'] ?? null) === $lessonLink;
                })
                ->each
                ->delete();
        });

    $lesson->delete();

    return response()->json([
        'message' => 'Lesson deleted successfully.'
    ]);
}
}

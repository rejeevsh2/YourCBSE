import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { todayPlan } from "@/data/student-library";
import { studentService } from "@/lib/student";

const initialDone = todayPlan.filter((task) => task.done).map((task) => task.id);

/**
 * Completion state for today's planner checklist.
 *
 * Optimistic updates are persisted through `studentService`, so switching to
 * the Laravel API needs no changes in the planner screen.
 */
export function usePlannerProgress() {
  const [done, setDone] = useState<string[]>(initialDone);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const toggleTask = useCallback((taskId: string, next: boolean) => {
    setDone((current) => {
      const optimistic = next
        ? Array.from(new Set([...current, taskId]))
        : current.filter((id) => id !== taskId);

      void studentService.setPlannerTaskDone(taskId, next).then((result) => {
        if (!mounted.current) return;
        if (result.ok) {
          setDone(result.data);
        } else {
          setDone(current);
          toast.error(result.message);
        }
      });

      return optimistic;
    });
  }, []);

  const { totalMinutes, doneMinutes, goalPercent } = useMemo(() => {
    const total = todayPlan.reduce((sum, task) => sum + task.minutes, 0);
    const completed = todayPlan
      .filter((task) => done.includes(task.id))
      .reduce((sum, task) => sum + task.minutes, 0);
    return {
      totalMinutes: total,
      doneMinutes: completed,
      goalPercent: total ? Math.round((completed / total) * 100) : 0,
    };
  }, [done]);

  return { done, toggleTask, totalMinutes, doneMinutes, goalPercent };
}


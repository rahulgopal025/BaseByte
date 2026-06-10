import { useState, useCallback } from 'react';
import { getAllCourses } from '../api/course.api';
import type { Course } from '../types/course.types';

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllCourses();
      setCourses(res.data.data || []);
    } catch { /* handled by interceptor */ }
    finally { setLoading(false); }
  }, []);

  return { courses, loading, fetchCourses };
};

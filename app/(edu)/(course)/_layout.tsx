import { CourseTimeProvider } from '../../../components/CourseTimeProvider';
import { Slot } from 'expo-router';
// import ProfilePopover from '../../../components/ProfilePopover';

export default function Layout() {
  return (
    <CourseTimeProvider>
        {/* 课程时间统计 */}
      <Slot />
    </CourseTimeProvider>
  );
}
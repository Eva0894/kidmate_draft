import { CourseTimeProvider } from '../../../components/CourseTimeProvider';
import { Slot } from 'expo-router';

export default function Layout() {
  return (
    <CourseTimeProvider>
      <Slot />
    </CourseTimeProvider>
  );
}
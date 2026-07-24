import { useNavigationContext } from '../routes/NavigationProvider';

export function useNavigation() {
  const { controller } = useNavigationContext();

  return {
    navigate: controller.push,
    replace: controller.replace,
    hrefFor: controller.hrefFor,
  };
}

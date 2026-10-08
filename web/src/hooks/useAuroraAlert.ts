import { useSolarActivity } from './useSolarActivity';

export const useAuroraAlert = () => {
  const { data } = useSolarActivity();
  return data !== null && (data.kp >= 5 || data.bz <= -5);
};

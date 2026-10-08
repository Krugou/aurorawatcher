import { useContext } from 'react';

import { SolarActivityContext } from '../context/SolarActivityContext';

export const useSolarActivity = () => {
  const context = useContext(SolarActivityContext);
  if (!context) throw new Error('useSolarActivity must be used within SolarActivityProvider');
  return context;
};

import { selectSwapCanisterState } from '@/store';
import { useAppSelector } from '@/store';

export const useSwapCanisterStore = () =>{
  return useAppSelector(selectSwapCanisterState);
}
  

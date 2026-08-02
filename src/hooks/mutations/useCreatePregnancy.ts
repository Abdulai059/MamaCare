import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';

export interface CreatePregnancyInput {
  mother_id: string;
  lmp_date: string;
  edd_date: string;
}

async function createPregnancy(input: CreatePregnancyInput) {
  const { data, error } = await supabase
    .from('pregnancies')
    .insert([input])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export function useCreatePregnancy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPregnancy,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.pregnanciesList(),
      });
    },
  });
}

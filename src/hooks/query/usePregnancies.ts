import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryKeys';

export interface Pregnancy {
  id: string;
  mother_id: string;
  lmp_date: string;
  edd_date: string;
  status: 'active' | 'delivered' | 'lost';
  created_at: string;
  updated_at: string;
}

async function fetchPregnancies(): Promise<Pregnancy[]> {
  const { data, error } = await supabase
    .from('pregnancies')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export function usePregnancies() {
  return useQuery({
    queryKey: queryKeys.pregnanciesList(),
    queryFn: fetchPregnancies,
  });
}

async function fetchPregnancyDetail(id: string): Promise<Pregnancy> {
  const { data, error } = await supabase
    .from('pregnancies')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export function usePregnancy(id: string) {
  return useQuery({
    queryKey: queryKeys.pregnancyDetail(id),
    queryFn: () => fetchPregnancyDetail(id),
    enabled: !!id,
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { queryKeys } from "@/lib/queryKeys";

export interface CreateAssessmentInput {
  milestone_id: string;
  blood_pressure?: string;
  weight?: number;
  temperature?: number;
  hemoglobin?: number;
  symptoms?: string;
  notes?: string;
  danger_signs?: Record<string, boolean>;
}

async function createAssessment(input: CreateAssessmentInput) {
  const { data, error } = await supabase
    .from("clinical_assessments")
    .insert({
      milestone_id: input.milestone_id,
      blood_pressure: input.blood_pressure,
      weight: input.weight,
      temperature: input.temperature,
      symptoms: input.symptoms,
      notes: input.notes,
    })
    .select()
    .single();

  if (error) throw error;

  // If danger signs detected, create risk assessment
  if (input.danger_signs && Object.values(input.danger_signs).some((v) => v)) {
    const dangerSignsText = Object.entries(input.danger_signs)
      .filter(([, value]) => value)
      .map(([key]) => key)
      .join(", ");

    await supabase.from("risk_assessments").insert({
      assessment_id: data.id,
      risk_level: "HIGH",
      reason: `Danger signs detected: ${dangerSignsText}`,
    });
  }

  // Mark milestone as completed
  await supabase
    .from("care_plan_milestones")
    .update({
      status: "COMPLETED",
      completed_date: new Date().toISOString().split("T")[0],
    })
    .eq("id", input.milestone_id);

  return data;
}

export function useCreateAssessment(milestoneId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAssessment,
    onSuccess: () => {
      // Invalidate relevant queries
      if (milestoneId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.milestoneDetail(milestoneId),
        });
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard(),
      });
    },
  });
}

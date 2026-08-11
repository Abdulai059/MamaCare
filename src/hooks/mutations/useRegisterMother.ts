import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerMother } from "@/services/persons";
import { createPregnancyEpisode } from "@/services/episodes";
import { queryKeys } from "@/lib/queryKeys";

export interface RegisterMotherInput {
  household_id: string;
  first_name: string;
  last_name?: string;
  phone?: string;
  preferred_language?: string;
  date_of_birth?: string;
  is_pregnant?: boolean;
  lmp_date?: string;
  edd_date?: string;
}

export function useRegisterMother(householdId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RegisterMotherInput) => {
      try {
        console.log("📝 Step 1: Registering mother...", input);

        // Step 1: Register mother
        const mother = await registerMother({
          household_id: input.household_id,
          first_name: input.first_name,
          last_name: input.last_name,
          phone: input.phone,
          preferred_language: input.preferred_language,
          date_of_birth: input.date_of_birth,
          is_pregnant: input.is_pregnant,
        });

        console.log("✅ Mother registered:", mother.id, mother.first_name);

        // Step 2: If pregnant, auto-create pregnancy episode with milestones
        if (input.is_pregnant && input.lmp_date && input.edd_date) {
          console.log("🤰 Step 2: Creating pregnancy episode for mother:", mother.id);
          console.log("   LMP:", input.lmp_date, "EDD:", input.edd_date);

          const pregnancyEpisode = await createPregnancyEpisode({
            person_id: mother.id,
            lmp_date: input.lmp_date,
            edd_date: input.edd_date,
          });

          console.log("✅ Pregnancy episode created:", pregnancyEpisode.id);
          return { mother, pregnancyEpisode };
        } else {
          console.log("⏭️ Skipping pregnancy episode - is_pregnant:", input.is_pregnant, "lmp_date:", input.lmp_date, "edd_date:", input.edd_date);
        }

        return { mother, pregnancyEpisode: null };
      } catch (error) {
        console.error("❌ Error in registerMother mutation:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Invalidate household queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.personsByHousehold(householdId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.householdDetail(householdId),
      });

      // Invalidate care journey queries if pregnancy was created
      if (data.pregnancyEpisode) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.pregnancyEpisode(data.mother.id),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.activeEpisodes(data.mother.id),
        });
      }
    },
  });
}

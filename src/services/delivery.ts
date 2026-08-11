import { supabase } from "@/lib/supabase";
import {
  createMotherPostnatalEpisode,
  createNewbornEpisode,
} from "./episodes";

export interface DeliveryInput {
  pregnancy_episode_id: string;
  mother_id: string;
  delivery_date: string;
  delivery_type: string; // "VAGINAL" | "CESAREAN"
  complications?: string;
  mother_outcome: string;
  baby_weight_grams?: number;
  baby_sex: "MALE" | "FEMALE";
  apgar_score?: number;
}

/**
 * Record delivery and automatically trigger episode transitions
 * This is the key orchestration function that:
 * 1. Records delivery details
 * 2. Closes pregnancy episode
 * 3. Creates mother postnatal episode + milestones
 * 4. Creates newborn episode + milestones
 */
export async function recordDelivery(input: DeliveryInput): Promise<any> {
  try {
    console.log("Recording delivery for pregnancy episode:", input.pregnancy_episode_id);

    // Step 1: Create delivery record
    const { data: deliveryRecord, error: deliveryError } = await supabase
      .from("delivery_records")
      .insert({
        pregnancy_episode_id: input.pregnancy_episode_id,
        delivery_date: input.delivery_date,
        delivery_type: input.delivery_type,
        complications: input.complications,
        mother_outcome: input.mother_outcome,
        baby_weight_grams: input.baby_weight_grams,
        baby_sex: input.baby_sex,
        apgar_score: input.apgar_score,
      })
      .select()
      .single();

    if (deliveryError) throw deliveryError;

    console.log("Delivery record created:", deliveryRecord.id);

    // Step 2: Close pregnancy episode
    const { error: closeError } = await supabase
      .from("care_episodes")
      .update({
        status: "COMPLETED",
        actual_end_date: input.delivery_date,
      })
      .eq("id", input.pregnancy_episode_id);

    if (closeError) throw closeError;

    console.log("Pregnancy episode closed");

    // Step 3: Create mother postnatal episode (AUTOMATIC)
    console.log("Creating mother postnatal episode...");
    const maternalEpisode = await createMotherPostnatalEpisode({
      person_id: input.mother_id,
      delivery_date: input.delivery_date,
    });

    // Update delivery record with mother postnatal episode ID
    await supabase
      .from("delivery_records")
      .update({
        mother_postnatal_episode_id: maternalEpisode.id,
      })
      .eq("id", deliveryRecord.id);

    console.log("Mother postnatal episode created:", maternalEpisode.id);

    // Step 4: Create newborn episode (AUTOMATIC)
    console.log("Creating newborn episode...");
    const newbornEpisode = await createNewbornEpisode({
      person_id: input.mother_id, // Temporarily link to mother - should be baby person record
      mother_id: input.mother_id,
      delivery_date: input.delivery_date,
      birth_weight: input.baby_weight_grams,
      baby_sex: input.baby_sex,
    });

    // Update delivery record with newborn episode ID
    await supabase
      .from("delivery_records")
      .update({
        newborn_episode_id: newbornEpisode.id,
      })
      .eq("id", deliveryRecord.id);

    console.log("Newborn episode created:", newbornEpisode.id);

    // Return all created data
    return {
      delivery_record: deliveryRecord,
      maternal_episode: maternalEpisode,
      newborn_episode: newbornEpisode,
    };
  } catch (error) {
    console.error("Error recording delivery:", error);
    throw error;
  }
}

/**
 * Get delivery record with all related episodes
 */
export async function getDeliveryRecord(deliveryRecordId: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from("delivery_records")
      .select(
        `
        *,
        pregnancy_episode:pregnancy_episode_id (
          id,
          status,
          start_date,
          expected_end_date
        ),
        maternal_episode:mother_postnatal_episode_id (
          id,
          status,
          care_plan_milestones (
            id,
            title,
            due_date,
            status
          )
        ),
        newborn_episode:newborn_episode_id (
          id,
          status,
          care_plan_milestones (
            id,
            title,
            due_date,
            status
          )
        )
      `
      )
      .eq("id", deliveryRecordId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching delivery record:", error);
    throw error;
  }
}

/**
 * Get delivery records for a mother
 */
export async function getDeliveryRecordsByMother(
  motherId: string
): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from("delivery_records")
      .select(
        `
        id,
        delivery_date,
        delivery_type,
        mother_outcome,
        baby_weight_grams,
        baby_sex,
        apgar_score,
        created_at,
        pregnancy_episode:pregnancy_episode_id (
          id,
          start_date
        )
      `
      )
      .eq("pregnancy_episode.person_id", motherId)
      .order("delivery_date", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching delivery records:", error);
    throw error;
  }
}

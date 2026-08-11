import { supabase } from "@/lib/supabase";

interface CreatePregnancyInput {
  person_id: string;
  lmp_date: string;
  edd_date: string;
}

interface CreateMotherPostnatalInput {
  person_id: string;
  delivery_date: string;
}

interface CreateNewbornInput {
  person_id: string;
  mother_id: string;
  delivery_date: string;
  birth_weight?: number;
  baby_sex?: "MALE" | "FEMALE";
}

// Pregnancy milestone template
const PREGNANCY_MILESTONES = [
  {
    title: "Pregnancy Registration",
    milestone_type: "PREGNANCY_REGISTRATION",
    daysFromLMP: 0,
    windowStart: 0,
    windowEnd: 7,
    sequence: 1,
  },
  {
    title: "ANC Visit 1",
    milestone_type: "ANC_1",
    daysFromLMP: 84,
    windowStart: 0,
    windowEnd: 84,
    sequence: 2,
  },
  {
    title: "ANC Visit 2",
    milestone_type: "ANC_2",
    daysFromLMP: 140,
    windowStart: 133,
    windowEnd: 147,
    sequence: 3,
  },
  {
    title: "ANC Visit 3",
    milestone_type: "ANC_3",
    daysFromLMP: 196,
    windowStart: 182,
    windowEnd: 210,
    sequence: 4,
  },
  {
    title: "ANC Visit 4",
    milestone_type: "ANC_4",
    daysFromLMP: 245,
    windowStart: 238,
    windowEnd: 252,
    sequence: 5,
  },
  {
    title: "Delivery",
    milestone_type: "DELIVERY",
    daysFromLMP: 280,
    windowStart: 266,
    windowEnd: 294,
    sequence: 6,
  },
];

// Postnatal milestone template
const POSTNATAL_MILESTONES = [
  {
    title: "Postnatal Check (Day 1)",
    milestone_type: "PNC_1",
    daysFromDelivery: 1,
    windowStart: 0,
    windowEnd: 3,
    sequence: 1,
  },
  {
    title: "Postnatal Check (Day 3)",
    milestone_type: "PNC_2",
    daysFromDelivery: 3,
    windowStart: 2,
    windowEnd: 5,
    sequence: 2,
  },
  {
    title: "Postnatal Check (Day 7)",
    milestone_type: "PNC_3",
    daysFromDelivery: 7,
    windowStart: 6,
    windowEnd: 9,
    sequence: 3,
  },
  {
    title: "Postnatal Check (Week 6)",
    milestone_type: "PNC_4",
    daysFromDelivery: 42,
    windowStart: 35,
    windowEnd: 49,
    sequence: 4,
  },
];

// Newborn milestone template
const NEWBORN_MILESTONES = [
  {
    title: "Newborn Check (Day 1)",
    milestone_type: "NB_1",
    daysFromDelivery: 1,
    windowStart: 0,
    windowEnd: 3,
    sequence: 1,
  },
  {
    title: "Newborn Check (Day 3)",
    milestone_type: "NB_2",
    daysFromDelivery: 3,
    windowStart: 2,
    windowEnd: 5,
    sequence: 2,
  },
  {
    title: "Newborn Check (Day 7)",
    milestone_type: "NB_3",
    daysFromDelivery: 7,
    windowStart: 6,
    windowEnd: 9,
    sequence: 3,
  },
  {
    title: "Newborn Check (Week 6)",
    milestone_type: "NB_4",
    daysFromDelivery: 42,
    windowStart: 35,
    windowEnd: 49,
    sequence: 4,
  },
];

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Create a pregnancy episode and auto-generate milestones
 */
export async function createPregnancyEpisode(
  input: CreatePregnancyInput
): Promise<any> {
  try {
    const lmpDate = new Date(input.lmp_date);
    const eddDate = new Date(input.edd_date);

    // Create episode
    const { data: episode, error: episodeError } = await supabase
      .from("care_episodes")
      .insert({
        person_id: input.person_id,
        episode_type: "PREGNANCY",
        start_date: input.lmp_date,
        expected_end_date: input.edd_date,
        status: "ACTIVE",
      })
      .select()
      .single();

    if (episodeError) throw episodeError;

    // Generate milestones
    await generatePregnancyMilestones(episode.id, lmpDate);

    return episode;
  } catch (error) {
    console.error("Error creating pregnancy episode:", error);
    throw error;
  }
}

/**
 * Generate all pregnancy milestones for an episode
 */
async function generatePregnancyMilestones(
  episodeId: string,
  lmpDate: Date
): Promise<any> {
  try {
    const milestonesToInsert = PREGNANCY_MILESTONES.map((m) => ({
      episode_id: episodeId,
      title: m.title,
      milestone_type: m.milestone_type,
      due_date: formatDate(addDays(lmpDate, m.daysFromLMP)),
      expected_window_start: formatDate(addDays(lmpDate, m.windowStart)),
      expected_window_end: formatDate(addDays(lmpDate, m.windowEnd)),
      milestone_sequence: m.sequence,
      status: "PENDING",
      priority: 1,
    }));

    const { data, error } = await supabase
      .from("care_plan_milestones")
      .insert(milestonesToInsert)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error generating pregnancy milestones:", error);
    throw error;
  }
}

/**
 * Create mother postnatal episode after delivery
 */
export async function createMotherPostnatalEpisode(
  input: CreateMotherPostnatalInput
): Promise<any> {
  try {
    const deliveryDate = new Date(input.delivery_date);
    const expectedEndDate = new Date(deliveryDate);
    expectedEndDate.setDate(expectedEndDate.getDate() + 42); // 6 weeks

    // Create episode
    const { data: episode, error: episodeError } = await supabase
      .from("care_episodes")
      .insert({
        person_id: input.person_id,
        episode_type: "MOTHER_POSTNATAL",
        start_date: input.delivery_date,
        expected_end_date: formatDate(expectedEndDate),
        status: "ACTIVE",
      })
      .select()
      .single();

    if (episodeError) throw episodeError;

    // Generate milestones
    await generatePostnatalMilestones(episode.id, deliveryDate);

    return episode;
  } catch (error) {
    console.error("Error creating mother postnatal episode:", error);
    throw error;
  }
}

/**
 * Generate all postnatal milestones for mother
 */
async function generatePostnatalMilestones(
  episodeId: string,
  deliveryDate: Date
): Promise<any> {
  try {
    const milestonesToInsert = POSTNATAL_MILESTONES.map((m) => ({
      episode_id: episodeId,
      title: m.title,
      milestone_type: m.milestone_type,
      due_date: formatDate(addDays(deliveryDate, m.daysFromDelivery)),
      expected_window_start: formatDate(
        addDays(deliveryDate, m.windowStart)
      ),
      expected_window_end: formatDate(addDays(deliveryDate, m.windowEnd)),
      milestone_sequence: m.sequence,
      status: "PENDING",
      priority: 1,
    }));

    const { data, error } = await supabase
      .from("care_plan_milestones")
      .insert(milestonesToInsert)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error generating postnatal milestones:", error);
    throw error;
  }
}

/**
 * Create newborn episode after delivery
 */
export async function createNewbornEpisode(
  input: CreateNewbornInput
): Promise<any> {
  try {
    const deliveryDate = new Date(input.delivery_date);
    const expectedEndDate = new Date(deliveryDate);
    expectedEndDate.setDate(expectedEndDate.getDate() + 42); // 6 weeks

    // Create episode
    const { data: episode, error: episodeError } = await supabase
      .from("care_episodes")
      .insert({
        person_id: input.person_id,
        episode_type: "NEWBORN",
        start_date: input.delivery_date,
        expected_end_date: formatDate(expectedEndDate),
        status: "ACTIVE",
      })
      .select()
      .single();

    if (episodeError) throw episodeError;

    // Generate milestones
    await generateNewbornMilestones(episode.id, deliveryDate);

    return episode;
  } catch (error) {
    console.error("Error creating newborn episode:", error);
    throw error;
  }
}

/**
 * Generate all newborn milestones
 */
async function generateNewbornMilestones(
  episodeId: string,
  deliveryDate: Date
): Promise<any> {
  try {
    const milestonesToInsert = NEWBORN_MILESTONES.map((m) => ({
      episode_id: episodeId,
      title: m.title,
      milestone_type: m.milestone_type,
      due_date: formatDate(addDays(deliveryDate, m.daysFromDelivery)),
      expected_window_start: formatDate(
        addDays(deliveryDate, m.windowStart)
      ),
      expected_window_end: formatDate(addDays(deliveryDate, m.windowEnd)),
      milestone_sequence: m.sequence,
      status: "PENDING",
      priority: 1,
    }));

    const { data, error } = await supabase
      .from("care_plan_milestones")
      .insert(milestonesToInsert)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error generating newborn milestones:", error);
    throw error;
  }
}

/**
 * Get active pregnancy episode for a mother
 */
export async function getActivePregnancyEpisode(personId: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from("care_episodes")
      .select(
        `
        *,
        care_plan_milestones (
          id,
          title,
          milestone_type,
          due_date,
          expected_window_start,
          expected_window_end,
          completed_date,
          status,
          milestone_sequence
        )
      `
      )
      .eq("person_id", personId)
      .eq("episode_type", "PREGNANCY")
      .eq("status", "ACTIVE")
      .order("created_at", { ascending: false })
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching active pregnancy episode:", error);
    throw error;
  }
}

/**
 * Get all active episodes for a mother (pregnancy, postnatal, newborn)
 */
export async function getActiveEpisodes(personId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from("care_episodes")
      .select(
        `
        *,
        care_plan_milestones (
          id,
          title,
          milestone_type,
          due_date,
          completed_date,
          status,
          milestone_sequence
        )
      `
      )
      .eq("person_id", personId)
      .eq("status", "ACTIVE")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching active episodes:", error);
    throw error;
  }
}

/**
 * Complete a milestone and mark as completed
 */
export async function completeMilestone(
  milestoneId: string,
  completedDate?: string
): Promise<any> {
  try {
    const { data, error } = await supabase
      .from("care_plan_milestones")
      .update({
        status: "COMPLETED",
        completed_date: completedDate || formatDate(new Date()),
      })
      .eq("id", milestoneId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error completing milestone:", error);
    throw error;
  }
}

/**
 * Get overdue milestones for a mother
 */
export async function getOverdueMilestones(personId: string): Promise<any[]> {
  try {
    const today = formatDate(new Date());

    const { data, error } = await supabase
      .from("care_plan_milestones")
      .select(
        `
        id,
        title,
        milestone_type,
        due_date,
        status,
        care_episodes (
          id,
          episode_type,
          person_id,
          persons (
            id,
            first_name,
            last_name
          )
        )
      `
      )
      .eq("care_episodes.person_id", personId)
      .lt("due_date", today)
      .eq("status", "PENDING");

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching overdue milestones:", error);
    throw error;
  }
}

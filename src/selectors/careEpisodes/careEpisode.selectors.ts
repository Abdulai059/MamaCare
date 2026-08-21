import type { CareEpisode, EpisodeType, EpisodeStatus } from "@/utils/types/careEpisode";

export function selectCareEpisodesByPerson(
  careEpisodes: Record<string, CareEpisode>,
  personId: string,
): CareEpisode[] {
  return Object.values(careEpisodes).filter(
    (episode) => episode.person_id === personId && !episode.deleted_at,
  );
}

export function selectActiveCareEpisodes(
  careEpisodes: Record<string, CareEpisode>,
): CareEpisode[] {
  return Object.values(careEpisodes).filter(
    (episode) => episode.status === "ACTIVE" && !episode.deleted_at,
  );
}

export function selectCareEpisodesByType(
  careEpisodes: Record<string, CareEpisode>,
  episodeType: EpisodeType,
): CareEpisode[] {
  return Object.values(careEpisodes).filter(
    (episode) =>
      episode.episode_type === episodeType && !episode.deleted_at,
  );
}

export function selectCareEpisodesByStatus(
  careEpisodes: Record<string, CareEpisode>,
  status: EpisodeStatus,
): CareEpisode[] {
  return Object.values(careEpisodes).filter(
    (episode) => episode.status === status && !episode.deleted_at,
  );
}

export function selectActiveCareEpisode(
  careEpisodes: Record<string, CareEpisode>,
  personId: string,
): CareEpisode | null {
  return (
    Object.values(careEpisodes).find(
      (episode) =>
        episode.person_id === personId &&
        episode.status === "ACTIVE" &&
        !episode.deleted_at,
    ) || null
  );
}

export function selectCareEpisodeById(
  careEpisodes: Record<string, CareEpisode>,
  episodeId: string,
): CareEpisode | null {
  const episode = careEpisodes[episodeId];
  return episode && !episode.deleted_at ? episode : null;
}

export function selectPregnancyEpisodes(
  careEpisodes: Record<string, CareEpisode>,
): CareEpisode[] {
  return selectCareEpisodesByType(careEpisodes, "PREGNANCY");
}

export function selectPostnatalEpisodes(
  careEpisodes: Record<string, CareEpisode>,
): CareEpisode[] {
  return selectCareEpisodesByType(careEpisodes, "POSTNATAL");
}

export function selectNewbornEpisodes(
  careEpisodes: Record<string, CareEpisode>,
): CareEpisode[] {
  return selectCareEpisodesByType(careEpisodes, "NEWBORN");
}

export function selectPendingCareEpisodes(
  careEpisodes: Record<string, CareEpisode>,
): CareEpisode[] {
  return Object.values(careEpisodes).filter(
    (episode) =>
      !episode.deleted_at &&
      (!episode._synced || episode._syncState === "pending"),
  );
}

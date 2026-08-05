export const queryKeys = {
  all: ["app"] as const,

  auth: () => [...queryKeys.all, "auth"] as const,
  authUser: () => [...queryKeys.auth(), "user"] as const,

  households: () => [...queryKeys.all, "households"] as const,
  householdsList: () => [...queryKeys.households(), "list"] as const,
  householdDetail: (id: string) => [...queryKeys.households(), id] as const,

  communities: () => [...queryKeys.all, "communities"] as const,
  communitiesList: () => [...queryKeys.communities(), "list"] as const,

  compounds: () => [...queryKeys.all, "compounds"] as const,
  compoundsByCommunity: (communityId: string) =>
    [...queryKeys.compounds(), "community", communityId] as const,

  persons: () => [...queryKeys.all, "persons"] as const,
  personsByHousehold: (householdId: string) =>
    [...queryKeys.persons(), "household", householdId] as const,
  personDetail: (id: string) => [...queryKeys.persons(), id] as const,

  pregnancies: () => [...queryKeys.all, "pregnancies"] as const,
  pregnanciesList: () => [...queryKeys.pregnancies(), "list"] as const,
  pregnancyDetail: (id: string) => [...queryKeys.pregnancies(), id] as const,

  episodes: () => [...queryKeys.all, "episodes"] as const,
  episodesList: (personId: string) =>
    [...queryKeys.episodes(), "person", personId] as const,
  episodeDetail: (episodeId: string) =>
    [...queryKeys.episodes(), episodeId] as const,
  activeEpisodes: (personId: string) =>
    [...queryKeys.episodes(), "active", personId] as const,

  milestones: () => [...queryKeys.all, "milestones"] as const,
  milestonesByEpisode: (episodeId: string) =>
    [...queryKeys.milestones(), "episode", episodeId] as const,
  milestoneDetail: (milestoneId: string) =>
    [...queryKeys.milestones(), milestoneId] as const,
  overdueMilestones: (personId: string) =>
    [...queryKeys.milestones(), "overdue", personId] as const,

  careJourney: () => [...queryKeys.all, "careJourney"] as const,
  careJourneyDetail: (pregnancyId: string) =>
    [...queryKeys.careJourney(), pregnancyId] as const,
  pregnancyEpisode: (personId: string) =>
    [...queryKeys.careJourney(), "pregnancy", personId] as const,

  assessments: () => [...queryKeys.all, "assessments"] as const,
  assessmentsList: (pregnancyId: string) =>
    [...queryKeys.assessments(), pregnancyId] as const,
  assessmentDetail: (id: string) =>
    [...queryKeys.assessments(), "detail", id] as const,

  recommendations: () => [...queryKeys.all, "recommendations"] as const,
  recommendationsList: (pregnancyId: string) =>
    [...queryKeys.recommendations(), pregnancyId] as const,

  dashboard: () => [...queryKeys.all, "dashboard"] as const,
  dashboardStats: () => [...queryKeys.dashboard(), "stats"] as const,

  tasks: () => [...queryKeys.all, "tasks"] as const,
  tasksList: () => [...queryKeys.tasks(), "list"] as const,
};

export const queryKeys = {
  all: ['app'] as const,

  auth: () => [...queryKeys.all, 'auth'] as const,
  authUser: () => [...queryKeys.auth(), 'user'] as const,

  pregnancies: () => [...queryKeys.all, 'pregnancies'] as const,
  pregnanciesList: () => [...queryKeys.pregnancies(), 'list'] as const,
  pregnancyDetail: (id: string) => [...queryKeys.pregnancies(), id] as const,

  careJourney: () => [...queryKeys.all, 'careJourney'] as const,
  careJourneyDetail: (pregnancyId: string) => [...queryKeys.careJourney(), pregnancyId] as const,

  assessments: () => [...queryKeys.all, 'assessments'] as const,
  assessmentsList: (pregnancyId: string) => [...queryKeys.assessments(), pregnancyId] as const,
  assessmentDetail: (id: string) => [...queryKeys.assessments(), 'detail', id] as const,

  recommendations: () => [...queryKeys.all, 'recommendations'] as const,
  recommendationsList: (pregnancyId: string) => [...queryKeys.recommendations(), pregnancyId] as const,

  dashboard: () => [...queryKeys.all, 'dashboard'] as const,
  dashboardStats: () => [...queryKeys.dashboard(), 'stats'] as const,

  tasks: () => [...queryKeys.all, 'tasks'] as const,
  tasksList: () => [...queryKeys.tasks(), 'list'] as const,
};

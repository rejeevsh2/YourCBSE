/** Laravel route map for the Resource Center, kept in one place. */
export const resourceCenterEndpoints = {
  search: "/library/search",
  suggest: "/library/suggest",
  resource: (id: string) => `/library/resources/${id}`,
  userState: "/library/state",
  bookmark: (id: string) => `/library/resources/${id}/bookmark`,
  download: (id: string) => `/library/resources/${id}/download`,
  view: (id: string) => `/library/resources/${id}/view`,
} as const;


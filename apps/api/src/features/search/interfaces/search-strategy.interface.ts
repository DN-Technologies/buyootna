export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    current: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}

export interface SearchStrategy {
  // Receives the specific nested filter payload for its tab
  execute(
    filters: any,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<any>>;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

export interface PaginatedRequest {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
}

type ApiResponseBase<T> = {
  data: T;
  meta?: {
    current_page: number;
    last_page: number;
  };
};

export type ApiErrorResponse = {
  message: string;
};

export type User = ApiResponseBase<{
  id: number;
  lastName: string;
  firstName: string;
  middleName: string | null;
  email: string;
  isAdmin?: boolean;
}>;

export type Users = ApiResponseBase<User['data'][]>;

export type Machineries = ApiResponseBase<
  {
    id: number;
    name: string;
    description: string;
    user: User['data'];
  }[]
>;

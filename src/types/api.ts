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

export type Users = ApiResponseBase<Array<User['data']>>;

export type Machinery = ApiResponseBase<{
  id: number;
  name: string;
  description: string | null;
}>;

export type Machineries = ApiResponseBase<
  Array<
    Machinery['data'] & {
      user: User['data'];
    }
  >
>;

export type MachineryParameter = ApiResponseBase<{
  id: number;
  name: string;
  parameterType: 'input' | 'output';
  valueType: 'quantitative' | 'quality';
  machinery: Machinery['data'] | null;
}>;

export type MachineryParameters = ApiResponseBase<
  Array<MachineryParameter['data'] & { user: User['data'] }>
>;

export type Research = ApiResponseBase<{
  id: number;
  name: string;
  description: string | null;
  lastExperimentDate: string | null;
  machinery: Machinery['data'];
  parameters?: Array<MachineryParameter['data']>;
  author: User['data'];
  participants?: Array<User['data']>;
}>;
export type ResearchList = ApiResponseBase<Array<Research['data']>>;

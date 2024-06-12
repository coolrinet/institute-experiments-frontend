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
  machineryCount?: number;
  machineryParameterCount?: number;
  experimentCount?: number;
  researchCount?: number;
  participatoryResearchCount?: number;
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
  isPublic: boolean;
  machinery: Machinery['data'];
  parameters: MachineryParameters['data'];
  author: User['data'];
  participants?: Array<User['data']>;
  experimentsCount: number;
}>;
export type ResearchList = ApiResponseBase<Array<Omit<Research['data'], 'experimentsCount'>>>;

export type Experiment = ApiResponseBase<{
  id: number;
  name: string;
  date: string;
  user: User['data'];
  quantitativeInputs: ExperimentParameter<number>[];
  qualityInputs: ExperimentParameter<string>[];
  quantitativeOutputs: ExperimentParameter<number>[];
  qualityOutputs: ExperimentParameter<string>[];
}>;

type ExperimentParameter<T> = {
  parameterId: number;
  name: string;
  value: T;
};

export type Experiments = ApiResponseBase<
  Array<
    Omit<
      Experiment['data'],
      'quantitativeInputs' | 'qualityInputs' | 'quantitativeOutputs' | 'qualityOutputs'
    >
  >
>;

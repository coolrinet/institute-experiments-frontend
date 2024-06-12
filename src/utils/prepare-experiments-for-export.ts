import { getExperiments } from '~/api/experiments/get-experiments';

export async function prepareExperimentsForExport(reasearchId: number) {
  const experiments = await getExperiments(reasearchId, {
    withParameters: true,
  });

  const headers = [
    { label: 'Название эксперимента', key: 'name' },
    { label: 'Дата', key: 'date' },
    ...experiments.data[0].quantitativeInputs!.map(param => ({
      label: param.name,
      key: 'quantitativeInputs.' + param.parameterId,
    })),
    ...experiments.data[0].qualityInputs!.map(param => ({
      label: param.name,
      key: 'qualityInputs.' + param.parameterId,
    })),
    ...experiments.data[0].quantitativeOutputs!.map(param => ({
      label: param.name,
      key: 'quantitativeOutputs.' + param.parameterId,
    })),
    ...experiments.data[0].qualityOutputs!.map(param => ({
      label: param.name,
      key: 'qualityOutputs.' + param.parameterId,
    })),
  ];

  const data = experiments.data.map(experiment => ({
    name: experiment.name,
    date: experiment.date,
    quantitativeInputs: experiment.quantitativeInputs?.reduce(
      (acc, input) => ({
        ...acc,
        [input.parameterId]: input.value,
      }),
      {}
    ),
    qualityInputs: experiment.qualityInputs?.reduce(
      (acc, input) => ({
        ...acc,
        [input.parameterId]: input.value,
      }),
      {}
    ),
    quantitativeOutputs: experiment.quantitativeOutputs?.reduce(
      (acc, output) => ({
        ...acc,
        [output.parameterId]: output.value,
      }),
      {}
    ),
    qualityOutputs: experiment.qualityOutputs?.reduce(
      (acc, output) => ({
        ...acc,
        [output.parameterId]: output.value,
      }),
      {}
    ),
  }));

  return { headers, data };
}

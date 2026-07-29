import { CustomField } from './custom-field.entity';

describe('CustomField', () => {
  it('accepts configured classifiers', () => {
    const field = CustomField.create({
      id: '019fa500-0000-7000-8000-000000000201',
      accountId: '019fa500-0000-7000-8000-000000000202',
      opportunityId: '019fa500-0000-7000-8000-000000000203',
      defaultCustomFieldId: '019fa500-0000-7000-8000-000000000204',
      name: 'Riesgo',
      description: null,
      type: 'CLASSIFIER',
      classifiers: ['Bajo', 'Medio', 'Alto'],
      canSelectMultiple: true,
      automatic: true,
      aiPrompt: 'Clasifica el riesgo',
    });

    field.setValue(['Bajo', 'Medio']);

    expect(field.value).toEqual(['Bajo', 'Medio']);
  });

  it('rejects classifiers outside the template', () => {
    const field = CustomField.create({
      id: '019fa500-0000-7000-8000-000000000211',
      accountId: '019fa500-0000-7000-8000-000000000212',
      opportunityId: '019fa500-0000-7000-8000-000000000213',
      defaultCustomFieldId: '019fa500-0000-7000-8000-000000000214',
      name: 'Riesgo',
      description: null,
      type: 'CLASSIFIER',
      classifiers: ['Bajo', 'Alto'],
      canSelectMultiple: false,
      automatic: false,
      aiPrompt: null,
    });

    expect(() => field.setValue('Desconocido')).toThrow('El valor no coincide con la configuración del campo');
  });
});

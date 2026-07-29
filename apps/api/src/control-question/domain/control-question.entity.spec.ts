import { ControlQuestion } from './control-question.entity';

describe('ControlQuestion', () => {
  it('accepts an answer that matches the template type', () => {
    const question = ControlQuestion.create({
      id: '019fa500-0000-7000-8000-000000000101',
      accountId: '019fa500-0000-7000-8000-000000000102',
      opportunityId: '019fa500-0000-7000-8000-000000000103',
      defaultControlQuestionId: '019fa500-0000-7000-8000-000000000104',
      question: '¿Cumple los requisitos?',
      answerType: 'BOOLEAN',
      passConditionPrompt: null,
    });

    question.answer(false);

    expect(question.answerValue).toBe(false);
  });

  it('rejects an answer with a different type', () => {
    const question = ControlQuestion.create({
      id: '019fa500-0000-7000-8000-000000000111',
      accountId: '019fa500-0000-7000-8000-000000000112',
      opportunityId: '019fa500-0000-7000-8000-000000000113',
      defaultControlQuestionId: '019fa500-0000-7000-8000-000000000114',
      question: '¿Cumple los requisitos?',
      answerType: 'BOOLEAN',
      passConditionPrompt: null,
    });

    expect(() => question.answer('Sí')).toThrow('La respuesta no coincide con el tipo de la pregunta');
  });
});

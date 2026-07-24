import type { ActionTargetType, DefaultWorkflowStepActionDto, WorkflowStepDto } from '@tfg/types';

export type ActionPanelState =
  | { mode: 'closed' }
  | { mode: 'picking'; stepId: string }
  | { mode: 'configuring'; stepId: string; type: ActionTargetType; editing?: DefaultWorkflowStepActionDto };

type WorkflowEditorContext = {
  workflowId: Readonly<Ref<string>>;
  panelState: Readonly<Ref<ActionPanelState>>;
  currentStepActions: ComputedRef<DefaultWorkflowStepActionDto[]>;
  nextPosition: ComputedRef<number>;
  isOpen: ComputedRef<boolean>;
  openPicker: (stepId: string) => void;
  selectType: (type: ActionTargetType) => void;
  editAction: (stepId: string, action: DefaultWorkflowStepActionDto) => void;
  back: () => void;
  close: () => void;
};

const WORKFLOW_EDITOR_KEY = Symbol('workflowEditor');

export function provideWorkflowEditorContext(workflowId: Ref<string>, steps: Ref<WorkflowStepDto[]>) {
  const panelState = ref<ActionPanelState>({ mode: 'closed' });

  const currentStepActions = computed<DefaultWorkflowStepActionDto[]>(() => {
    const state = panelState.value;
    if (state.mode === 'closed') return [];
    return steps.value.find((s) => s.id === state.stepId)?.actions ?? [];
  });

  const nextPosition = computed(() => {
    const actions = currentStepActions.value;
    return actions.reduce((m, a) => Math.max(m, a.position), 0) + 1;
  });

  const isOpen = computed(() => panelState.value.mode !== 'closed');

  function openPicker(stepId: string) {
    panelState.value = { mode: 'picking', stepId };
  }

  function selectType(type: ActionTargetType) {
    const state = panelState.value;
    if (state.mode !== 'picking') return;
    panelState.value = { mode: 'configuring', stepId: state.stepId, type };
  }

  function editAction(stepId: string, action: DefaultWorkflowStepActionDto) {
    panelState.value = { mode: 'configuring', stepId, type: action.targetType, editing: action };
  }

  function back() {
    const state = panelState.value;
    if (state.mode === 'configuring' && !state.editing) {
      panelState.value = { mode: 'picking', stepId: state.stepId };
    }
  }

  function close() {
    panelState.value = { mode: 'closed' };
  }

  const context: WorkflowEditorContext = {
    workflowId: readonly(workflowId),
    panelState: readonly(panelState),
    currentStepActions,
    nextPosition,
    isOpen,
    openPicker,
    selectType,
    editAction,
    back,
    close,
  };

  provide(WORKFLOW_EDITOR_KEY, context);
  return context;
}

export function useWorkflowEditorContext(): WorkflowEditorContext {
  const ctx = inject<WorkflowEditorContext>(WORKFLOW_EDITOR_KEY);
  if (!ctx) throw new Error('useWorkflowEditorContext must be used within provideWorkflowEditorContext');
  return ctx;
}

<script setup lang="ts">
import type { ActionTargetType, DefaultWorkflowStepActionDto } from '@tfg/types';
import type { Component } from 'vue';
import ControlQuestionActionForm from './action-forms/ControlQuestionActionForm.vue';
import CustomFieldActionForm from './action-forms/CustomFieldActionForm.vue';
import SummaryActionForm from './action-forms/SummaryActionForm.vue';
import TaskActionForm from './action-forms/TaskActionForm.vue';
import AttachmentActionForm from './action-forms/AttachmentActionForm.vue';
import EmailNotificationActionForm from './action-forms/EmailNotificationActionForm.vue';
import OpportunityStatusUpdateActionForm from './action-forms/OpportunityStatusUpdateActionForm.vue';

const props = defineProps<{
  type: ActionTargetType;
  editing?: DefaultWorkflowStepActionDto;
}>();

defineEmits<{ saved: []; cancel: [] }>();

const FORM_COMPONENTS: Record<ActionTargetType, Component> = {
  control_question: ControlQuestionActionForm,
  custom_field: CustomFieldActionForm,
  summary: SummaryActionForm,
  task: TaskActionForm,
  attachment: AttachmentActionForm,
  email_notification: EmailNotificationActionForm,
  opportunity_status_update: OpportunityStatusUpdateActionForm,
};

const currentForm = computed(() => FORM_COMPONENTS[props.type]);
</script>

<template>
  <component :is="currentForm" :editing="editing" @saved="$emit('saved')" @cancel="$emit('cancel')" />
</template>

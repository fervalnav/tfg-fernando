import type { ActionTargetType } from '@tfg/types';
import type { Component } from 'vue';
import {
  LightbulbIcon,
  SlidersHorizontalIcon,
  BrainIcon,
  ListTodoIcon,
  PaperclipIcon,
  MailIcon,
  ArrowRightLeftIcon,
} from 'lucide-vue-next';

export type ActionTypeDefinition = {
  label: string;
  description: string;
  icon: Component;
  iconClass: string;
  borderClass: string;
  category: 'ai' | 'task' | 'notification' | 'opportunity';
  hasEntity: boolean;
};

export const ACTION_TYPE_REGISTRY: Record<ActionTargetType, ActionTypeDefinition> = {
  control_question: {
    label: 'Pregunta de control',
    description: 'Añade una pregunta de verificación al paso',
    icon: LightbulbIcon,
    iconClass: 'text-purple-600 bg-purple-50',
    borderClass: 'border-purple-200',
    category: 'ai',
    hasEntity: true,
  },
  custom_field: {
    label: 'Campo personalizado',
    description: 'Rellena un campo personalizado, manual o con IA',
    icon: SlidersHorizontalIcon,
    iconClass: 'text-green-600 bg-green-50',
    borderClass: 'border-green-200',
    category: 'ai',
    hasEntity: true,
  },
  summary: {
    label: 'Resumen IA',
    description: 'Genera un resumen automático con inteligencia artificial',
    icon: BrainIcon,
    iconClass: 'text-purple-600 bg-purple-50',
    borderClass: 'border-purple-200',
    category: 'ai',
    hasEntity: true,
  },
  task: {
    label: 'Tarea',
    description: 'Añade una tarea manual al paso',
    icon: ListTodoIcon,
    iconClass: 'text-yellow-600 bg-yellow-50',
    borderClass: 'border-yellow-200',
    category: 'task',
    hasEntity: false,
  },
  attachment: {
    label: 'Adjunto',
    description: 'Solicita la subida de un documento',
    icon: PaperclipIcon,
    iconClass: 'text-emerald-600 bg-emerald-50',
    borderClass: 'border-emerald-200',
    category: 'task',
    hasEntity: false,
  },
  email_notification: {
    label: 'Notificación email',
    description: 'Envía un email al completar el paso',
    icon: MailIcon,
    iconClass: 'text-blue-600 bg-blue-50',
    borderClass: 'border-blue-200',
    category: 'notification',
    hasEntity: false,
  },
  opportunity_status_update: {
    label: 'Cambio de estado',
    description: 'Mueve la oportunidad a otro estado del pipeline',
    icon: ArrowRightLeftIcon,
    iconClass: 'text-blue-600 bg-blue-50',
    borderClass: 'border-blue-200',
    category: 'opportunity',
    hasEntity: false,
  },
};

export const ACTION_TYPE_CATEGORIES: { key: ActionTypeDefinition['category']; label: string }[] = [
  { key: 'ai', label: 'Inteligencia Artificial' },
  { key: 'task', label: 'Tareas y documentos' },
  { key: 'notification', label: 'Notificaciones' },
  { key: 'opportunity', label: 'Oportunidad' },
];

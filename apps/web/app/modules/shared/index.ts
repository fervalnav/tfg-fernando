// Barrel público del módulo shared
// UI components
export * from './components/ui/button';
export * from './components/ui/input';
export * from './components/ui/label';
export * from './components/ui/form';
export * from './components/ui/card';
export * from './components/ui/avatar';
export * from './components/ui/badge';
export * from './components/ui/dialog';
export * from './components/ui/dropdown-menu';
export * from './components/ui/separator';
export * from './components/ui/sonner';
export { default as LiaWordmark } from './components/LiaWordmark.vue';

// Utils
export { cn } from './lib/utils';

// Composables
export { useApi } from './composables/useApi';

// Stores
export { useAuthStore } from './stores/auth.store';

<script setup lang="ts">
import { ref } from 'vue';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import {
  CheckIcon,
  AlertCircleIcon,
  InfoIcon,
  StarIcon,
  UserIcon,
  BellIcon,
} from 'lucide-vue-next';

definePageMeta({ layout: 'default', middleware: 'auth' });

const dialogOpen = ref(false);

const form = useForm({
  validationSchema: toTypedSchema(
    z.object({
      name: z.string().min(1, 'El nombre es obligatorio'),
      email: z.string().email('Email inválido'),
    }),
  ),
});

const onFormSubmit = form.handleSubmit(() => {
  dialogOpen.value = false;
  form.resetForm();
});
</script>

<template>
  <div class="p-8 max-w-5xl space-y-12">
    <div>
      <h1 class="text-3xl font-bold text-foreground">Demo de componentes</h1>
      <p class="text-muted-foreground mt-1">Referencia visual de shadcn-vue + paleta de colores de la app.</p>
    </div>

    <!-- Colors -->
    <section>
      <h2 class="text-lg font-semibold mb-4">Paleta de colores</h2>
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div v-for="color in [
          { name: 'background', cls: 'bg-background border' },
          { name: 'foreground', cls: 'bg-foreground' },
          { name: 'primary', cls: 'bg-primary' },
          { name: 'primary-foreground', cls: 'bg-primary-foreground border' },
          { name: 'secondary', cls: 'bg-secondary' },
          { name: 'muted', cls: 'bg-muted' },
          { name: 'accent', cls: 'bg-accent' },
          { name: 'destructive', cls: 'bg-destructive' },
          { name: 'card', cls: 'bg-card border' },
          { name: 'border', cls: 'bg-border' },
          { name: 'brand-navy', cls: 'bg-brand-navy' },
          { name: 'brand-yellow', cls: 'bg-brand-yellow' },
          { name: 'brand-blue', cls: 'bg-brand-blue' },
          { name: 'sidebar', cls: 'bg-sidebar' },
        ]" :key="color.name" class="flex flex-col gap-1">
          <div :class="[color.cls, 'h-12 rounded-lg']" />
          <span class="text-xs text-muted-foreground font-mono">{{ color.name }}</span>
        </div>
      </div>
    </section>

    <!-- Typography -->
    <section>
      <h2 class="text-lg font-semibold mb-4">Tipografía</h2>
      <div class="bg-card border rounded-xl p-6 space-y-3">
        <p class="text-4xl font-bold">Heading XL</p>
        <p class="text-2xl font-bold">Heading 2XL</p>
        <p class="text-xl font-semibold">Heading semibold</p>
        <p class="text-base">Texto base — lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        <p class="text-sm text-muted-foreground">Texto pequeño muted — subtítulos y metadatos.</p>
        <p class="text-xs text-muted-foreground">Texto XS — etiquetas y ayuda contextual.</p>
        <p class="font-mono text-sm">Fuente mono — código y IDs.</p>
      </div>
    </section>

    <!-- Buttons -->
    <section>
      <h2 class="text-lg font-semibold mb-4">Botones</h2>
      <div class="flex flex-wrap gap-3">
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="link">Link</Button>
        <Button disabled>Disabled</Button>
        <Button size="sm">Small</Button>
        <Button size="lg">Large</Button>
      </div>
    </section>

    <!-- Badges -->
    <section>
      <h2 class="text-lg font-semibold mb-4">Badges</h2>
      <div class="flex flex-wrap gap-3">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="destructive">Destructive</Badge>
      </div>
    </section>

    <!-- Inputs -->
    <section>
      <h2 class="text-lg font-semibold mb-4">Inputs</h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-xl">
        <div>
          <Label class="mb-1 block">Input normal</Label>
          <Input placeholder="Escribe algo..." />
        </div>
        <div>
          <Label class="mb-1 block">Input deshabilitado</Label>
          <Input placeholder="No editable" disabled />
        </div>
        <div>
          <Label class="mb-1 block">Select</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una opción" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a">Opción A</SelectItem>
              <SelectItem value="b">Opción B</SelectItem>
              <SelectItem value="c">Opción C</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>

    <!-- Cards -->
    <section>
      <h2 class="text-lg font-semibold mb-4">Cards</h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Título de la card</CardTitle>
            <CardDescription>Descripción opcional debajo del título.</CardDescription>
          </CardHeader>
          <CardContent>
            <p class="text-sm">Contenido principal de la card.</p>
          </CardContent>
          <CardFooter>
            <Button size="sm">Acción</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <CheckIcon class="size-4 text-primary" />
              Con icono
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-muted-foreground">Variante con icono en el título.</p>
          </CardContent>
        </Card>

        <Card class="border-destructive">
          <CardHeader>
            <CardTitle class="flex items-center gap-2 text-destructive">
              <AlertCircleIcon class="size-4" />
              Error state
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-muted-foreground">Card con borde destructivo.</p>
          </CardContent>
        </Card>
      </div>
    </section>

    <!-- Avatars -->
    <section>
      <h2 class="text-lg font-semibold mb-4">Avatares</h2>
      <div class="flex items-end gap-4">
        <Avatar class="size-16">
          <AvatarFallback class="text-xl font-semibold">AB</AvatarFallback>
        </Avatar>
        <Avatar class="size-12">
          <AvatarFallback class="text-base font-semibold">CD</AvatarFallback>
        </Avatar>
        <Avatar class="size-9">
          <AvatarFallback class="text-sm">EF</AvatarFallback>
        </Avatar>
        <Avatar class="size-6">
          <AvatarFallback class="text-xs">GH</AvatarFallback>
        </Avatar>
      </div>
    </section>

    <!-- Separator -->
    <section>
      <h2 class="text-lg font-semibold mb-4">Separator</h2>
      <div class="space-y-4 max-w-md">
        <div class="flex items-center gap-4">
          <span class="text-sm">Horizontal</span>
          <Separator class="flex-1" />
        </div>
        <div class="flex items-center gap-4 h-8">
          <span class="text-sm">Con</span>
          <Separator orientation="vertical" />
          <span class="text-sm">Vertical</span>
        </div>
      </div>
    </section>

    <!-- Skeleton -->
    <section>
      <h2 class="text-lg font-semibold mb-4">Skeleton</h2>
      <div class="space-y-3 max-w-sm">
        <div class="flex items-center gap-3">
          <Skeleton class="size-10 rounded-full" />
          <div class="space-y-2 flex-1">
            <Skeleton class="h-4 w-3/4 rounded" />
            <Skeleton class="h-3 w-1/2 rounded" />
          </div>
        </div>
        <Skeleton class="h-32 w-full rounded-xl" />
      </div>
    </section>

    <!-- Dialog -->
    <section>
      <h2 class="text-lg font-semibold mb-4">Dialog con formulario</h2>
      <Dialog v-model:open="dialogOpen">
        <DialogTrigger as-child>
          <Button>Abrir dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Formulario en dialog</DialogTitle>
            <DialogDescription>Ejemplo de formulario vee-validate dentro de un dialog.</DialogDescription>
          </DialogHeader>
          <form class="space-y-4 mt-2" @submit="onFormSubmit">
            <FormField v-slot="{ componentField }" name="name">
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Tu nombre" v-bind="componentField" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
            <FormField v-slot="{ componentField }" name="email">
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="tu@email.com" v-bind="componentField" />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
            <DialogFooter>
              <Button type="button" variant="outline" @click="dialogOpen = false">Cancelar</Button>
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>

    <!-- Tooltips -->
    <section>
      <h2 class="text-lg font-semibold mb-4">Tooltips</h2>
      <TooltipProvider>
        <div class="flex gap-4">
          <Tooltip>
            <TooltipTrigger as-child>
              <Button variant="outline" size="sm">
                <InfoIcon class="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Información adicional</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger as-child>
              <Button variant="outline" size="sm">
                <StarIcon class="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Marcar como favorito</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger as-child>
              <Button variant="outline" size="sm">
                <UserIcon class="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ver perfil</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger as-child>
              <Button variant="outline" size="sm">
                <BellIcon class="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Notificaciones</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </section>
  </div>
</template>

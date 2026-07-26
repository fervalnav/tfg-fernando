export const useOpportunityFilters = () => {
  const route = useRoute();
  const router = useRouter();

  const q = computed(() => (route.query['q'] as string | undefined) || undefined);
  const statusIds = computed(() => {
    const val = route.query['statusIds'];
    if (!val) return [];
    return (Array.isArray(val) ? val : [val]) as string[];
  });
  const userId = computed(() => (route.query['userId'] as string | undefined) || undefined);
  const dueDateFrom = computed(() => (route.query['dueDateFrom'] as string | undefined) || undefined);
  const dueDateTo = computed(() => (route.query['dueDateTo'] as string | undefined) || undefined);
  const amountMin = computed(() => {
    const val = route.query['amountMin'];
    return val ? Number(val) : undefined;
  });
  const amountMax = computed(() => {
    const val = route.query['amountMax'];
    return val ? Number(val) : undefined;
  });

  const hasActiveFilters = computed(
    () =>
      !!q.value ||
      statusIds.value.length > 0 ||
      !!userId.value ||
      !!dueDateFrom.value ||
      !!dueDateTo.value ||
      amountMin.value !== undefined ||
      amountMax.value !== undefined,
  );

  const filters = computed(() => ({
    q: q.value,
    statusIds: statusIds.value.length ? statusIds.value : undefined,
    userId: userId.value,
    dueDateFrom: dueDateFrom.value,
    dueDateTo: dueDateTo.value,
    amountMin: amountMin.value,
    amountMax: amountMax.value,
  }));

  function setFilter(key: string, value: string | string[] | number | undefined) {
    const current = { ...route.query };
    const next =
      value === undefined || value === '' || (Array.isArray(value) && value.length === 0)
        ? Object.fromEntries(Object.entries(current).filter(([k]) => k !== key))
        : { ...current, [key]: Array.isArray(value) ? value : String(value) };
    void router.push({ query: next });
  }

  function resetFilters() {
    void router.push({ query: {} });
  }

  return {
    q,
    statusIds,
    userId,
    dueDateFrom,
    dueDateTo,
    amountMin,
    amountMax,
    hasActiveFilters,
    filters,
    setFilter,
    resetFilters,
  };
};

import { trpc } from "@/lib/trpc";

export function useAuth() {
  const userQuery = trpc.auth.me.useQuery(undefined, { retry: false, staleTime: 60_000 });
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => void userQuery.refetch(),
  });

  return {
    user: userQuery.data ?? null,
    loading: userQuery.isLoading,
    logout: () => logoutMutation.mutate(),
  };
}

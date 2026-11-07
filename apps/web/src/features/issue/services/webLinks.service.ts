import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addIssueWebLink, removeIssueWebLink } from '@/lib/api/endpoints/issues';
import { qk } from '@/services/queryKeys';

function useWebLinkMutation<TVars>(issueId: number, run: (vars: TVars) => Promise<unknown>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: run,
    onSuccess: () => void qc.invalidateQueries({ queryKey: qk.issue(issueId) }),
  });
}

export function useAddIssueWebLink(issueId: number) {
  return useWebLinkMutation(issueId, (vars: { url: string; title: string | null }) =>
    addIssueWebLink(issueId, vars),
  );
}

export function useRemoveIssueWebLink(issueId: number) {
  return useWebLinkMutation(issueId, (webLinkId: number) => removeIssueWebLink(issueId, webLinkId));
}

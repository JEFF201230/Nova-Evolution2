# Recovery specification

`AppendOnlyJournal.classifyRunRecovery` classifies active process, report present/absent, worktree drift, orphan lock, completed, failed and cancelled runs. Existing `incompleteRuns` records remain available. Future commands `reconcile`, `resume`, `abandon`, `quarantine` and `recover` must append decisions to the journal and require explicit authority; this mission does not auto-resume or certify.

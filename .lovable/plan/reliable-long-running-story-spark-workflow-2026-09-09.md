# Reliable long-running Story Spark workflow

## Goal
Import the public Story Spark repository and make multi-hour script runs recoverable, observable, and unable to stall permanently on one provider request. Keep all supplied API keys in encrypted server-side secrets.

## Implementation
- Replace the template with the imported repository while preserving project-managed files and excluding all Git metadata.
- Keep Pixazo and Agnes credentials server-only; never send them to the browser, logs, saved progress, or source code.
- Fix the image pipeline so each individual provider request has a bounded watchdog, clear error classification, key rotation, backoff, and requeue behavior. The overall workflow itself will have no duration limit.
- Replace the fragile shared-array worker exit logic with a queue that tracks queued and active work explicitly, settles every job, and cannot lose retries when workers become idle.
- Reduce unsafe request fan-out to match the four configured image keys while retaining parallel generation. Batch-size changes will not be used as the primary fix.
- Make prompt generation resilient to dropped streams and malformed/partial provider output, with bounded per-call retries and visible failures instead of silent waiting.
- Save an atomic checkpoint after prompt groups and panel completions, including run state and error details, without storing image binary data.
- Change “Resume last run” to continue all missing prompts and panels automatically from the checkpoint, rather than merely restoring the grid.
- Recover interrupted `prompting` and `drawing` items as pending work, prevent duplicate jobs, and persist a final checkpoint on stop or failure.
- Add progress activity details so the screen distinguishes active work, cooldown, retry, and a provider failure.

## Validation
- Run focused tests for parsing, queue completion, retries, checkpoint restoration, and interrupted-state normalization.
- Verify the app builds without errors.
- Use the uploaded 527-line timestamped script in a real browser against the hosted preview, not the local development server.
- Verify that a run starts, checkpoints advance, a refresh exposes resume, resume continues missing work, and no browser console/runtime errors occur.
- Exercise a simulated hanging provider request to prove it is released and retried rather than freezing the entire workflow.

## Technical details
- The workflow remains browser-orchestrated through short, restartable server calls; no single five-hour HTTP request is created.
- Individual network operations receive watchdogs because an unlimited individual fetch is the current permanent-stall cause. These watchdogs do not limit total run duration.
- Saved checkpoints remain in IndexedDB so large scripts do not exceed browser storage limits.

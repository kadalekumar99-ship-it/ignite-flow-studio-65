export type RecoverableStatus = "waiting" | "prompting" | "drawing" | "done" | "error";

/** In-flight browser work cannot survive a refresh, so make it safely runnable again. */
export function recoverInterruptedShots<T extends { status: RecoverableStatus; error?: string }>(
  shots: T[],
): T[] {
  return shots.map((shot) =>
    shot.status === "prompting" || shot.status === "drawing"
      ? { ...shot, status: "waiting" as const, error: undefined }
      : shot,
  );
}
import { vi } from "vitest";

export default function setupAbortSignalStub(): void {
  vi.stubGlobal(
    "AbortSignal",
    class extends AbortSignal {
      static timeout(ms: number): AbortSignal {
        const controller = new AbortController();

        setTimeout(() => {
          controller.abort(
            new DOMException("The operation timed out.", "TimeoutError"),
          );
        }, ms);

        return controller.signal;
      }
    },
  );
}

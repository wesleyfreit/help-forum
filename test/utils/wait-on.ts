/**
 * This function loops through a function rerunning all assertions
 * inside of it until it gets a truthy result.
 *
 * If the maximum duration is reached, it then rejects.
 *
 * @param expectations A function containing all tests assertions
 * @param maxDuration Maximum wait time before rejecting
 */
export async function waitFor(
  assertions: () => void | Promise<void>,
  maxDuration = 1000,
): Promise<void> {
  return new Promise((resolve, reject) => {
    let elapsedTime = 0;

    const interval = setInterval(() => {
      void (async () => {
        elapsedTime += 10;

        try {
          await assertions();
          clearInterval(interval);
          resolve();
        } catch {
          if (elapsedTime >= maxDuration) {
            clearInterval(interval);
            reject(new Error('Timeout waiting for assertions to pass'));
          }
        }
      })();
    }, 10);
  });
}

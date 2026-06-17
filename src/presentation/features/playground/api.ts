/**
 * Playground feature — API layer.
 *
 * Thin wrapper re-exporting infrastructure service calls.
 * This is the ONLY file in the playground feature that imports from infrastructure/.
 */

import { playgroundService } from "@/infrastructure/playground/playgroundService";

export const playgroundApi = {
  /** Fetch the template configuration for a given playground template ID. */
  getTemplateConfig: playgroundService.getTemplateConfig,

  /** Step 1: Generate a unique instance ID for provisioning. */
  generateId: playgroundService.generateId,

  /** Step 2: Signal the backend to spin up the container. */
  create: playgroundService.create,

  /** Step 3: Poll for container boot readiness. */
  poll: playgroundService.poll,

  /** Step 4: Get connection IP & ports once the container is ready. */
  getConnectionInfo: playgroundService.getConnectionInfo,

  /** Step 5: Validate user work against automated tests. */
  checkTest: playgroundService.checkTest,

  /** Step 6a: Record a completion score. */
  createScore: playgroundService.createScore,

  /** Step 6b: Award XP to the user. */
  createXp: playgroundService.createXp,

  /** Step 7: Teardown — destroy the container. */
  teardown: playgroundService.teardown,

  /** List all active playgrounds for the current user. */
  listActive: playgroundService.listActive,

  /** Open the code-server process for IDE iframe. */
  openCodeServer: playgroundService.openCodeServer,

  /** Open the desktop GUI (noVNC/xpra) process. */
  openDesktopServer: playgroundService.openDesktopServer,
};

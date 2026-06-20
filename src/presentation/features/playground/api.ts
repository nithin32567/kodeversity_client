import { playgroundService } from "@/infrastructure/playground/playgroundService";

export const playgroundApi = {
  getTemplateConfig: playgroundService.getTemplateConfig,

  generateId: playgroundService.generateId,

  create: playgroundService.create,

  poll: playgroundService.poll,

  getConnectionInfo: playgroundService.getConnectionInfo,

  checkTest: playgroundService.checkTest,

  createScore: playgroundService.createScore,

  createXp: playgroundService.createXp,

  teardown: playgroundService.teardown,

  listActive: playgroundService.listActive,

  openCodeServer: playgroundService.openCodeServer,

  openDesktopServer: playgroundService.openDesktopServer,
};

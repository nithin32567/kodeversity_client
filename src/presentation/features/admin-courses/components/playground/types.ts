import type {
  TemplateConfig,
  TemplateBridge,
  TemplateVM,
  TemplateNetwork,
  TemplateDisk,
} from "@/domain/playground";

export type { TemplateConfig, TemplateBridge, TemplateVM, TemplateNetwork, TemplateDisk };

export type ActivePlayground = {
  _id: string;
  status: string;
  post_name?: string;
  type?: string;
  userid?: string;
  from?: string;
  ip?: string;
  start?: number;
};

export type InspectingInstance = {
  id: string;
  postName: string;
  type: string;
};

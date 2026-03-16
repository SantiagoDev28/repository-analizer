export interface SkillDefinition {
  name: string;
  description: string;
  schema: {
    type: 'object';
    properties: Record<string, { type: string; description: string }>;
    required: string[];
  };
}
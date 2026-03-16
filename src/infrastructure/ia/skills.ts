import { SkillDefinition } from '../../domain/value-objects';


export const DEBT_ANALYZER_SKILLS: SkillDefinition[] = [
  {
    name: 'get_files_above_threshold',
    description: `Returns files where lines of code exceed a given threshold.
                  Use this to identify oversized files with too many responsibilities.`,
    schema: {
      type: 'object',
      properties: {
        threshold: {
          type: 'number',
          description: 'Minimum lines of code. Example: 300',
        },
      },
      required: ['threshold'],
    },
  },
  {
    name: 'get_files_without_tests',
    description: `Returns files that have functions or classes but zero test coverage.
                  Use this to spot critical untested code.`,
    schema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_complexity_hotspots',
    description: `Returns files with unusually large individual functions.
                  Use this to find candidates for refactoring.`,
    schema: {
      type: 'object',
      properties: {
        functionLineThreshold: {
          type: 'number',
          description: 'Max acceptable lines per function. Example: 50',
        },
      },
      required: ['functionLineThreshold'],
    },
  },
];

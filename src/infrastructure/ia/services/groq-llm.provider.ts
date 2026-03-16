import { ChatGroq } from '@langchain/groq';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import {
  HumanMessage,
  SystemMessage,
  ToolMessage,
  BaseMessage,
} from '@langchain/core/messages';
import { LLMProvider } from '../../../domain/ports/LlmProvider';
import { DEBT_ANALYZER_INSTRUCTIONS } from '../instructions';
import { DEBT_ANALYZER_SKILLS } from '../skills';
import { executeSkill } from '../executer';
import { FileMetrics } from '../../../domain/value-objects';
import { AiAnalysis } from '../../../domain/value-objects';

export class GroqLLMProvider implements LLMProvider {
  private client: ChatGroq;

  constructor(apiKey?: string, model: string = 'compound-beta') {
    const key = apiKey || process.env.GROQ_API_KEY;
    if (!key) {
      throw new Error(
        'Groq API key is required. Set GROQ_API_KEY environment variable.',
      );
    }
    this.client = new ChatGroq({
      apiKey: key,
      model,
      temperature: 0.2, // bajo para análisis técnico — menos "creatividad"
      maxTokens: 2000,
    });
  }

  // ── Implementación del port original (compatible con tu código anterior) ──
  async generateResponse(prompt: string): Promise<string> {
    try {
      const message = await this.client.invoke([
        new SystemMessage(DEBT_ANALYZER_INSTRUCTIONS),
        new HumanMessage(prompt),
      ]);
      return message.content.toString();
    } catch (error) {
      throw new Error(
        `Failed to generate response from Groq: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      await this.client.invoke([new HumanMessage('ping')]);
      return true;
    } catch {
      return false;
    }
  }

  // ── Método extendido para el agentic loop con skills ──
  async analyzeWithSkills(
    metrics: FileMetrics[],
    repoContext: string,
  ): Promise<AiAnalysis> {
    // Construir los tools en formato LangChain
    const langchainTools = DEBT_ANALYZER_SKILLS.map((skill) =>
      tool(
        async (args: Record<string, unknown>) =>
          JSON.stringify(executeSkill(skill.name, args, metrics)),
        {
          name: skill.name,
          description: skill.description,
          schema: z.object(
            Object.fromEntries(
              Object.entries(skill.schema.properties).map(([key, val]) => [
                key,
                val.type === 'number'
                  ? z.number().describe(val.description)
                  : z.string().describe(val.description),
              ]),
            ),
          ),
        },
      ),
    );

    // Bindear los tools al cliente
    const clientWithTools = this.client.bindTools(langchainTools);

    const messages: BaseMessage[] = [
      new SystemMessage(DEBT_ANALYZER_INSTRUCTIONS),
      new HumanMessage(
        `Analyze this repository: ${repoContext}\n\n` +
          `Metrics for ${metrics.length} files:\n` +
          JSON.stringify(metrics, null, 2),
      ),
    ];

    // Agentic loop
    while (true) {
      const response = await clientWithTools.invoke(messages);
      messages.push(response);

      // Si el modelo quiere llamar tools
      if (response.tool_calls && response.tool_calls.length > 0) {
        for (const toolCall of response.tool_calls) {
          const result = executeSkill(
            toolCall.name,
            toolCall.args as Record<string, unknown>,
            metrics,
          );

          messages.push(
            new ToolMessage({
              content: JSON.stringify(result),
              tool_call_id: toolCall.id ?? toolCall.name,
            }),
          );
        }
        continue; // el modelo recibe los resultados y sigue razonando
      }

      // El modelo terminó — extraer y parsear JSON
      const rawContent = response.content.toString().trim();

      // Limpiar posibles backticks de markdown que el modelo agregue
      const clean = rawContent
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      return JSON.parse(clean) as AiAnalysis;
    }
  }
}

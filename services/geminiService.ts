import { GoogleGenAI } from "@google/genai";
import { DashboardStats, ServiceOrder, WashRecord } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const askBusinessAssistant = async (
  question: string,
  contextData: {
    stats: DashboardStats;
    recentOS: ServiceOrder[];
    recentWashes: WashRecord[];
  }
): Promise<string> => {
  const ai = getClient();
  if (!ai) return "Erro: Chave de API não configurada.";

  const contextString = JSON.stringify(contextData, null, 2);

  const prompt = `
    Você é um consultor especialista para a oficina "Auto Center Christo Car".
    Analise os dados abaixo e responda à pergunta do usuário de forma concisa e profissional.
    Use formatação Markdown para melhorar a leitura.
    
    Dados do Sistema:
    ${contextString}

    Pergunta do Usuário:
    ${question}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Não foi possível gerar uma resposta.";
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "Desculpe, ocorreu um erro ao consultar o assistente inteligente.";
  }
};
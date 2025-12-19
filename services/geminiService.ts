
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeInvoice = async (invoiceText: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Você é um especialista em leitura de boletos bancários brasileiros. 
      Analise o texto abaixo e extraia com precisão absoluta:
      1. Nome do Beneficiário/Empresa
      2. Valor total (apenas números, use ponto para decimais)
      3. Data de vencimento no formato YYYY-MM-DD
      4. Código de barras (apenas os números)
      
      Retorne APENAS um objeto JSON puro, sem markdown, com as chaves:
      {
        "company": "string",
        "value": number,
        "dueDate": "YYYY-MM-DD",
        "barcode": "string"
      }
      
      Texto do boleto:
      ${invoiceText}`,
      config: {
        responseMimeType: "application/json"
      }
    });

    if (!response.text) return null;
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Erro ao analisar boleto com Gemini:", error);
    return null;
  }
};

import { GoogleGenAI, Type } from '@google/genai';
import { ExtractedDesign } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function extractDesignFromImage(base64Image: string, mimeType: string): Promise<Omit<ExtractedDesign, 'id' | 'timestamp' | 'imageUrl'>> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        inlineData: {
          data: base64Image.split(',')[1],
          mimeType,
        },
      },
      {
        text: `你现在是世界顶尖的前端架构师与交互设计师，精通 Tailwind CSS 与 Framer Motion。
        请解析用户上传的设计截图，提取其「视觉与交互 DNA」。
        
        请严格按照请求的 JSON 格式输出。
        **重要语言要求**：所有描述性文本（如 summary, keywords, vibePrompt 以及颜色的 name 和 usage）必须直接使用**中文**撰写。请勿使用中英双语对照。对于代码、CSS 属性名（如 hex 值、box-shadow）、框架名称（如 Tailwind, Framer Motion）等技术名词，请保持使用英文。
        
        1. styleName: 风格创意命名（如"极简主义"、"赛博朋克"）。
        2. colors: 提取核心色板。为每种颜色提供精准的 hex 色值、一个创意的描述性名称（中文，如"赛博朋克紫"），以及它的预期用途（中文，如"全局背景"、"次要文本"）。
        3. fonts: 推测最接近的 Google Font 名称（保留英文名称）。
        4. visualAttributes: 提取圆角 (borderRadius，如 "0.5rem", "9999px")、阴影 (shadows，具体 CSS 阴影值)、边框 (borders，CSS border 值) 和具体的布局逻辑与间距策略 (spacing，中文描述如 "采用 16px 基准网格系统，营造呼吸感")。
        5. interaction: 请基于视觉特征“脑补”出最优雅的交互反馈。推断 Framer Motion 的交互物理参数。提供刚度 (stiffness, 如 100-500)、阻尼 (damping, 如 10-40) 和持续时间 (duration, 秒为单位)。
        6. summary: 100字以内的中文设计流派总结（提炼其核心精神）。
        7. keywords: 3-5 个描述该风格的关键词（中文）。
        8. vibePrompt: 一段可直接复制给 Cursor/Claude 的复现指令。包含 Tailwind 配置建议、Framer Motion 参数以及基于提取的设计规范的组件逻辑指南。（直接使用中文撰写说明，代码和配置部分使用英文）。`,
      },
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          styleName: { type: Type.STRING },
          colors: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                hex: { type: Type.STRING },
                name: { type: Type.STRING },
                usage: { type: Type.STRING },
              },
              required: ['hex', 'name', 'usage'],
            },
          },
          fonts: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          visualAttributes: {
            type: Type.OBJECT,
            properties: {
              borderRadius: { type: Type.STRING },
              shadows: { type: Type.STRING },
              borders: { type: Type.STRING },
              spacing: { type: Type.STRING },
            },
            required: ['borderRadius', 'shadows', 'borders', 'spacing'],
          },
          interaction: {
            type: Type.OBJECT,
            properties: {
              stiffness: { type: Type.NUMBER },
              damping: { type: Type.NUMBER },
              duration: { type: Type.NUMBER },
            },
            required: ['stiffness', 'damping', 'duration'],
          },
          summary: { type: Type.STRING },
          keywords: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          vibePrompt: { type: Type.STRING },
        },
        required: ['styleName', 'colors', 'fonts', 'visualAttributes', 'interaction', 'summary', 'keywords', 'vibePrompt'],
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('No response from Gemini');
  }

  try {
    const data = JSON.parse(text);
    return data;
  } catch (e) {
    console.error('Failed to parse JSON response:', text);
    throw new Error('Invalid JSON response from Gemini');
  }
}

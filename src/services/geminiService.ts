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
        3. fonts: 推测最接近的 Google Font 或通用字体名称（**极其重要**：如果是英文字体，请直接输出纯英文原名，如 "Inter", "Roboto", "Helvetica"，绝对不允许将其翻译为中文名字，比如把"Inter"错误翻译为"国际"；如果是原本自带的中文字体如"宋体"，则可以直接输出中文）。
        4. visualAttributes: 提取圆角 (borderRadius，如 "0.5rem", "9999px")、阴影 (shadows，具体 CSS 阴影值)、边框 (borders，CSS border 值) 和具体的布局逻辑与间距策略 (spacing，中文描述如 "采用 16px 基准网格系统，营造呼吸感")。（**注意：对象内部的 Key 必须严格保持英文，即 "borderRadius", "shadows", "borders", "spacing"，绝不能被翻译为中文如 "园林属性"、"阴影"、"尺寸"**）。
        5. interaction: 请基于视觉特征“脑补”出最优雅的交互反馈。推断 Framer Motion 的交互物理参数。提供刚度 (stiffness, 如 100-500)、阻尼 (damping, 如 10-40) 和持续时间 (duration, 秒为单位)。
        6. summary: 对视觉风格和氛围的简短总结（100字以内的中文）。
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
            description: "Must be pure English names for English fonts (e.g. 'Inter', 'Roboto'). Never translate to Chinese like '国际'. For Chinese fonts (e.g. '宋体'), keep in Chinese.",
          },
          visualAttributes: {
            type: Type.OBJECT,
            properties: {
              borderRadius: { type: Type.STRING, description: '描述圆角。请务必使用中文描述，但此 Key 必须是 "borderRadius"' },
              shadows: { type: Type.STRING, description: '描述阴影。请务必使用中文描述，但此 Key 必须是 "shadows"' },
              borders: { type: Type.STRING, description: '描述边框。请务必使用中文描述，但此 Key 必须是 "borders"' },
              spacing: { type: Type.STRING, description: '描述间距。请务必使用中文描述，但此 Key 必须是 "spacing"' },
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
    const rawData = JSON.parse(text);

    // Normalization to handle Gemini arbitrarily translating JSON keys despite instructions
    const normalizedAttributes: any = {
      borderRadius: rawData.visualAttributes?.borderRadius || rawData.visualAttributes?.['圆角'] || rawData.visualAttributes?.['园林属性'] || '0.5rem',
      shadows: rawData.visualAttributes?.shadows || rawData.visualAttributes?.['阴影'] || '无明显阴影',
      borders: rawData.visualAttributes?.borders || rawData.visualAttributes?.['边框'] || rawData.visualAttributes?.['认识'] || '无明显边框',
      spacing: rawData.visualAttributes?.spacing || rawData.visualAttributes?.['间距'] || rawData.visualAttributes?.['尺寸'] || '常规间距',
    };

    const data = {
      ...rawData,
      visualAttributes: normalizedAttributes
    };

    return data;
  } catch (e) {
    console.error('Failed to parse JSON response:', text);
    throw new Error('Invalid JSON response from Gemini');
  }
}

export interface ColorToken {
  hex: string;
  name: string;
  usage: string;
}

export interface VisualAttributes {
  borderRadius: string;
  shadows: string;
  borders: string;
  spacing: string;
}

export interface InteractionParams {
  stiffness: number;
  damping: number;
  duration: number;
}

export interface ExtractedDesign {
  id: string;
  timestamp: number;
  imageUrl: string;
  styleName?: string;
  colors: ColorToken[];
  fonts: string[];
  visualAttributes: VisualAttributes;
  interaction: InteractionParams;
  summary: string;
  keywords: string[];
  vibePrompt: string;
}

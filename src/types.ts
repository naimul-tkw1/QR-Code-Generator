
export type CornerType = 'square' | 'rounded' | 'extra-rounded' | 'dot' | 'classy' | 'classy-rounded';
export type DotType = 'square' | 'dots' | 'rounded' | 'extra-rounded' | 'classy' | 'classy-rounded';
export type CornerDotType = 'square' | 'dot';

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export interface QRConfig {
  value: string;
  width: number;
  height: number;
  margin: number;
  dotsColor: string;
  backgroundColor: string;
  dotsType: DotType;
  cornersColor: string;
  cornersType: CornerType;
  cornersDotColor: string;
  cornersDotType: CornerDotType;
  logoUrl?: string;
  logoSize: number;
  logoMargin: number;
  errorCorrectionLevel: ErrorCorrectionLevel;
}

export interface PosterConfig {
  text: string;
  bgFill: string;
  textColor: string;
  showPoster: boolean;
}

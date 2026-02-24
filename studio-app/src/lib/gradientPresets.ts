export interface GradientPreset {
  id: string
  label: string
  light: string
  dark: string
}

export const GRADIENT_PRESETS: GradientPreset[] = [
  {
    id: 'none',
    label: 'ללא',
    light: '#F5F3EE',
    dark: '#1A1A1A',
  },
  {
    id: 'warm-paper',
    label: 'נייר חם',
    light: 'linear-gradient(135deg, #F5F3EE 0%, #EDE7DB 100%)',
    dark: 'linear-gradient(135deg, #1A1A1A 0%, #1F1B16 100%)',
  },
  {
    id: 'sunset',
    label: 'שקיעה',
    light: 'linear-gradient(135deg, #F5F3EE 0%, #F0E4D7 50%, #E8D5C4 100%)',
    dark: 'linear-gradient(135deg, #1A1A1A 0%, #1E1714 50%, #221A15 100%)',
  },
  {
    id: 'ocean',
    label: 'אוקיינוס',
    light: 'linear-gradient(135deg, #F5F3EE 0%, #E8EDF2 50%, #DDE5ED 100%)',
    dark: 'linear-gradient(135deg, #1A1A1A 0%, #161A1E 50%, #141820 100%)',
  },
  {
    id: 'aurora',
    label: 'זוהר צפוני',
    light: 'linear-gradient(160deg, #F5F3EE 0%, #E8EDEA 40%, #E2E8F0 100%)',
    dark: 'linear-gradient(160deg, #1A1A1A 0%, #161B18 40%, #14181E 100%)',
  },
  {
    id: 'signal',
    label: 'סיגנל',
    light: 'linear-gradient(135deg, #F5F3EE 0%, #F2EDED 100%)',
    dark: 'linear-gradient(135deg, #1A1A1A 0%, #1E1616 100%)',
  },
]

export function getPresetById(id: string): GradientPreset {
  return GRADIENT_PRESETS.find(p => p.id === id) || GRADIENT_PRESETS[1]
}

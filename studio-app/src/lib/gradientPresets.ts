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
    light: '#FAFAFA',
    dark: '#000000',
  },
  {
    id: 'clean',
    label: 'נקי',
    light: 'linear-gradient(135deg, #FAFAFA 0%, #F5F5F7 100%)',
    dark: 'linear-gradient(135deg, #000000 0%, #1C1C1E 100%)',
  },
  {
    id: 'frost',
    label: 'כפור',
    light: 'linear-gradient(135deg, #FAFAFA 0%, #EEF1F5 50%, #E8ECF2 100%)',
    dark: 'linear-gradient(135deg, #000000 0%, #0A0E14 50%, #0D1117 100%)',
  },
  {
    id: 'dawn',
    label: 'שחר',
    light: 'linear-gradient(135deg, #FAFAFA 0%, #F5EEF0 50%, #F0E8ED 100%)',
    dark: 'linear-gradient(135deg, #000000 0%, #140D10 50%, #1A1015 100%)',
  },
  {
    id: 'ocean',
    label: 'אוקיינוס',
    light: 'linear-gradient(160deg, #FAFAFA 0%, #ECF0F5 40%, #E4ECF5 100%)',
    dark: 'linear-gradient(160deg, #000000 0%, #0A0F14 40%, #0D1520 100%)',
  },
  {
    id: 'mint',
    label: 'מנטה',
    light: 'linear-gradient(135deg, #FAFAFA 0%, #EDF5F0 100%)',
    dark: 'linear-gradient(135deg, #000000 0%, #0A140E 100%)',
  },
]

export function getPresetById(id: string): GradientPreset {
  return GRADIENT_PRESETS.find(p => p.id === id) || GRADIENT_PRESETS[1]
}

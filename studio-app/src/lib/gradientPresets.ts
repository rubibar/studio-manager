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
    light: '#F7F6F4',
    dark: '#1A1918',
  },
  {
    id: 'clean',
    label: 'נקי',
    light: 'linear-gradient(180deg, #F7F6F4 0%, #F2F0EC 100%)',
    dark: 'linear-gradient(180deg, #1A1918 0%, #1E1D1B 100%)',
  },
  {
    id: 'linen',
    label: 'פשתן',
    light: 'linear-gradient(160deg, #F9F7F3 0%, #F3EFEA 50%, #F7F5F1 100%)',
    dark: 'linear-gradient(160deg, #1B1A18 0%, #1F1D1A 50%, #1B1A18 100%)',
  },
  {
    id: 'clay',
    label: 'חימר',
    light: 'linear-gradient(135deg, #F7F5F1 0%, #F0EBE4 50%, #F5F2ED 100%)',
    dark: 'linear-gradient(135deg, #1A1918 0%, #1E1B18 50%, #1A1918 100%)',
  },
  {
    id: 'mist',
    label: 'ערפל',
    light: 'linear-gradient(180deg, #F5F5F4 0%, #F0F1F0 50%, #F6F5F3 100%)',
    dark: 'linear-gradient(180deg, #1A1A19 0%, #1B1C1B 50%, #1A1918 100%)',
  },
  {
    id: 'sand',
    label: 'חול',
    light: 'linear-gradient(160deg, #F8F6F2 0%, #F2EDE5 40%, #F6F3EE 100%)',
    dark: 'linear-gradient(160deg, #1B1A17 0%, #1F1C18 40%, #1B1A17 100%)',
  },
]

export function getPresetById(id: string): GradientPreset {
  return GRADIENT_PRESETS.find(p => p.id === id) || GRADIENT_PRESETS[1]
}

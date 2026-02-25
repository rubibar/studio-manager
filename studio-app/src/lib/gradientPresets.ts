export interface GradientPreset {
  id: string
  label: string
  light: string
  dark: string
}

export const GRADIENT_PRESETS: GradientPreset[] = [
  {
    id: 'void',
    label: 'ריק',
    light: '#080807',
    dark: '#050504',
  },
  {
    id: 'carbon',
    label: 'פחם',
    light: 'linear-gradient(180deg, #0A0A09 0%, #111110 100%)',
    dark: 'linear-gradient(180deg, #050504 0%, #0A0A09 100%)',
  },
  {
    id: 'steel',
    label: 'פלדה',
    light: 'linear-gradient(135deg, #0D0D0C 0%, #141413 50%, #0F0F0E 100%)',
    dark: 'linear-gradient(135deg, #060605 0%, #0A0A09 50%, #070706 100%)',
  },
  {
    id: 'ember',
    label: 'גחלת',
    light: 'linear-gradient(160deg, #0A0908 0%, #120E0B 50%, #0A0908 100%)',
    dark: 'linear-gradient(160deg, #050504 0%, #0A0806 50%, #050504 100%)',
  },
  {
    id: 'circuit',
    label: 'מעגל',
    light: 'linear-gradient(135deg, #080A0D 0%, #0A0D12 50%, #080A0D 100%)',
    dark: 'linear-gradient(135deg, #040507 0%, #06080C 50%, #040507 100%)',
  },
  {
    id: 'oxide',
    label: 'חלודה',
    light: 'linear-gradient(160deg, #0B0908 0%, #110D0B 40%, #0B0908 100%)',
    dark: 'linear-gradient(160deg, #060504 0%, #090706 40%, #060504 100%)',
  },
]

export function getPresetById(id: string): GradientPreset {
  return GRADIENT_PRESETS.find(p => p.id === id) || GRADIENT_PRESETS[1]
}

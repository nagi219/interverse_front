import { computed } from 'vue'

export function useCustomTheme() {
  const customTheme = computed(() => ({
  common: {
    primaryColor: '#E4BAB6',
    primaryColorHover: '#F3D2A8',
    primaryColorPressed: '#97715B',
    baseColor: '#FBE4E1',
    textColor: '#6B5147',
    textColorLight: '#97715B',
    borderColor: '#E4BAB6',
    bodyColor: '#F5E6E3',
    
    successColor: '#7FB069',
    warningColor: '#FFB347',
    errorColor: '#D9534F',
    infoColor: '#5BC0DE',
    
    // You may need to adjust these values to match Naive UI's color system
    successColorHover: '#8FC079',
    successColorPressed: '#6FA059',
    warningColorHover: '#FFBF57',
    warningColorPressed: '#EFA337',
    errorColorHover: '#E9635F',
    errorColorPressed: '#C9433F',
    infoColorHover: '#6BD0EE',
    infoColorPressed: '#4BB0CE',
    
    // Additional colors
    mutedColor: '#B0A8A6',
    highlightColor: '#FFD700',
  },
}))

return {
  customTheme
}
}
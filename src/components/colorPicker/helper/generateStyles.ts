import { ColorPoint } from '@/components/colorPicker/interface'

export function generateSolidStyle(
  red: number,
  green: number,
  blue: number,
  alpha: number,
): string {
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

export function generateGradientStyle(points: ColorPoint[], type: string): string {
  let style = ''
  const sortedPoints = points.slice()

  sortedPoints.sort((a, b) => a.left - b.left)

  if (type === 'linear') {
    style = `linear-gradient(90deg,`
  } else {
    style = 'radial-gradient('
  }

  sortedPoints.forEach((point, index) => {
    style += `rgba(${point.red}, ${point.green}, ${point.blue}, ${point.alpha}) ${point.left}%`

    if (index !== sortedPoints.length - 1) {
      style += ','
    }
  })

  style += ')'

  return style
}

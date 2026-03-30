import {
  defaultIconProps,
  getIconCSS,
  iconToHTML,
  iconToSVG,
  mergeIconData,
  replaceIDs,
  svgToData,
  wrapSVGContent
} from '@iconify/utils'
import {mapValues} from 'es-toolkit'
import parse from 'html-react-parser'
import mime from 'mime/lite'

import {getIconFilePaths, hasValues} from '../../misc'
import {EMPTY_OBJECT, ICON_CACHE} from '../../misc/constants'

const iconTypes = ['css', 'json', 'svg', 'txt', 'ico', 'pdf']

const idCases =
  // https://github.com/antfu-collective/icones/blob/e04ac9277776d791c1fc0696706708baa6a7d89f/src/utils/case.ts
  {
    bare: id => id.replace(/^.*:/, ''),
    barePascal: id =>
      id
        .replace(/^.*:/, '')
        .replaceAll(/(?:^|[-_:]+)(\w)/g, (_, c) => c.toUpperCase()),
    camel: id => id.replaceAll(/[-_:]+(\w)/g, (_, c) => c.toUpperCase()),
    component: id =>
      `<${id.replaceAll(/(?:^|[-_:]+)(\w)/g, (_, c) => c.toUpperCase())} />`,
    componentKebab: id => `<${id.replaceAll(':', '-')} />`,
    dash: id => id.replaceAll(':', '-'),
    doubleHyphen: id => id.replaceAll(':', '--'),
    iconify: id => id,
    iconifyTailwind: id => `icon-[${id.replaceAll(':', '--')}]`,
    pascal: id => id.replaceAll(/(?:^|[-_:]+)(\w)/g, (_, c) => c.toUpperCase()),
    slash: id => id.replaceAll(':', '/'),
    unocss: id => `i-${id.replaceAll(':', '-')}`,
    unocssColon: id => `i-${id}`
  }

// https://github.com/antfu-collective/icones/blob/main/src/utils/svgToPng.ts
export default (
  icon,
  {hFlip, rotate, scale, vFlip, wrapSvgContentEnd, wrapSvgContentStart}
) => {
  if (ICON_CACHE.has(icon.id)) return ICON_CACHE.get(icon.id)

  icon = {
    ...icon,
    INTERNAL: {
      as(fileType) {
        const data = {
          css: this.to.css,
          json: JSON.stringify(icon.data, undefined, 2),
          svg: this.to.html,
          txt: this.to.dataUrl
        }[fileType]

        return hasValues(data)
          ? {
              get blob() {
                return new Blob([data], {
                  type: this.type
                })
              },
              data,
              type: mime.getType(fileType)
            }
          : EMPTY_OBJECT
      },
      idCases: mapValues(idCases, value => value(icon.id)),
      paths: iconTypes.reduce((a, b) => {
        a[b] = getIconFilePaths(icon, b)

        return a
      }, {}),
      get to() {
        const iconData = mergeIconData(defaultIconProps, {
          ...icon.data,
          body: wrapSVGContent(
            icon.data.body,
            wrapSvgContentStart,
            wrapSvgContentEnd
          ),
          hFlip,
          hidden: undefined,
          rotate,
          vFlip
        })

        return {
          css: getIconCSS(iconData, {iconSelector: '[icon]'}),
          get dataUrl() {
            return svgToData(this.html)
          },
          get html() {
            const svg = iconToSVG(iconData, {
              height: iconData.height * scale,
              width: iconData.width * scale
            })

            return iconToHTML(replaceIDs(svg.body), svg.attributes)
          },
          get reactElement() {
            return parse(this.html)
          }
        }
      }
    }
  }

  ICON_CACHE.set(icon.id, icon)

  return icon
}

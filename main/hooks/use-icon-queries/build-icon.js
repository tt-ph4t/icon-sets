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
import {cache} from '../../misc/cache'
import {EMPTY, ICON_CACHE} from '../../misc/constants'

const types = ['css', 'json', 'svg', 'txt', 'pdf']

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

const defaults = {
  wrapSvgContentEnd: '',
  wrapSvgContentStart: ''
}

export default cache(
  (
    icon,
    {
      color,
      hFlip,
      rotate,
      scale,
      vFlip,
      wrapSvgContentEnd = defaults.wrapSvgContentEnd,
      wrapSvgContentStart = defaults.wrapSvgContentStart
    }
  ) => ({
    ...icon,
    more: {
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
          : EMPTY.OBJECT
      },
      idCases: mapValues(idCases, value => value(icon.id)),
      paths: types.reduce((a, b) => {
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

        const svg = iconToSVG(iconData, {
          height: iconData.height * scale,
          width: iconData.width * scale
        })

        const html = iconToHTML(replaceIDs(svg.body), {
          ...svg.attributes,
          style: `color: ${color}`
        })

        return {
          css: getIconCSS(iconData, {
            color,
            iconSelector: '[icon]'
          }),
          dataUrl: svgToData(html),
          html,
          reactElement: parse(html)
        }
      }
    }
  }),
  {
    cache: ICON_CACHE,
    getCacheKey: icon => icon.id
  }
)

import { lookupCollection, lookupCollections } from "@iconify/json";
import {
  getIconsTree,
  parseIconSetAsync,
  validateIconSet,
} from "@iconify/utils";
import * as toon from "@toon-format/toon";
import { sentenceCase } from "change-case";
import { isEqual, isPlainObject, pick, uniqWith } from "es-toolkit";
import { sort } from "fast-sort";
import has from "has-values";
import mapObject, { mapObjectSkip } from "map-obj";
import fs from "node:fs";
import spdxLicenseList from "spdx-license-list";

const dataPath = "data";

const sortKeys = (o, options = {}) => {
  const { order = "asc", deep = false } = options;
  const a = sort(Object.entries(o))[order](([a]) => a);

  return Object.fromEntries(
    deep
      ? a.map(([a, b]) => [a, isPlainObject(b) ? sortKeys(b, options) : b])
      : a,
  );
};

const validateToonData = (value, fallback) => {
  try {
    return toon.decode(toon.encode(value ?? fallback));
  } catch {
    return fallback;
  }
};

const writeFileSync = (file, data) =>
  fs.writeFileSync(`${file}.toon`, toon.encode(data));

fs.copyFileSync("node_modules/@iconify/json/collections.md", "readme.md");

fs.rmSync(dataPath, {
  recursive: true,
  force: true,
});

fs.mkdirSync(dataPath);

const collections = Object.fromEntries(
  uniqWith(
    Object.entries(await lookupCollections()),
    ([, a], [, b]) =>
      ["name", "total", "version", "author", "license"].every((key) =>
        isEqual(a[key], b[key]),
      ) &&
      (a.hidden || b.hidden),
  ),
);

writeFileSync(
  `${dataPath}/index`,
  sortKeys(
    Object.fromEntries(
      await Promise.all(
        Object.keys(collections).map(async (name) => {
          const collection = collections[name];
          const iconSet = validateIconSet(await lookupCollection(name));
          const iconSetPath = `${dataPath}/${iconSet.prefix}`;

          delete collection.samples;

          fs.mkdirSync(iconSetPath, { recursive: true });

          await parseIconSetAsync(iconSet, (iconName, iconData) => {
            writeFileSync(`${iconSetPath}/${iconName}`, iconData);
          });

          return [
            iconSet.prefix,
            {
              ...collection,
              chars: iconSet.chars ?? {},
              aliases: mapObject(getIconsTree(iconSet), (key, value) =>
                has(value) ? [key, value] : mapObjectSkip,
              ),
              categories: validateToonData(iconSet.categories, {}),
              category: iconSet.info.category ?? "Uncategorised",
              grid: iconSet.info.height ?? "No grid / mixed grid",
              hasAnimations: Boolean(
                iconSet.info.tags?.includes("Contains Animations"),
              ),
              get license() {
                const license = iconSet.info.license;
                const defaultLicense = spdxLicenseList[license.spdx];

                return {
                  ...defaultLicense,
                  spdx: license.spdx,
                  url: license.url ?? defaultLicense.url,
                };
              },
              get suffixes() {
                return has(iconSet.suffixes)
                  ? mapObject(iconSet.suffixes, (key, value) => [
                      key,
                      sentenceCase(value),
                    ])
                  : {};
              },
              tags: sort(iconSet.info.tags ?? []).asc(),
              version: iconSet.info.version ?? "None",
              prefixes: iconSet.prefixes ?? {},
              ...pick(iconSet, [
                "lastModified",
                "prefix",
                "left",
                "provider",
                "top",
                "width",
              ]),
              icons: sort(Object.keys(iconSet.icons)).asc(),
            },
          ];
        }),
      ),
    ),
    { deep: true },
  ),
);

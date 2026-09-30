const slots = new Map();
for (const [layout, prefix] of [['S15', 's15-grid'], ['S16', 's16-brief']]) {
  for (const ratio of ['21x9', '16x10']) {
    slots.set(`${prefix}-${ratio}`, { layout, ratio });
  }
  slots.set(`${prefix}-shot`, { layout, screenshot: true });
}

const ratioClasses = new Set(['r-21x9', 'r-16x10', 'r-16x9', 'r-4x3', 'r-3x2', 'r-3x4', 'r-1x1']);
const heightClasses = new Set(['h-16', 'h-18', 'h-22', 'h-26', 'h-28', 'h-32']);
const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

function attributes(tag) {
  const attrs = new Map();
  const body = tag.replace(/^<\/?[\w:-]+/, '').replace(/\/?\s*>$/, '');
  for (const match of body.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    const name = match[1].toLowerCase();
    if (!attrs.has(name)) attrs.set(name, match[2] ?? match[3] ?? match[4] ?? '');
  }
  return attrs;
}

function declarations(style = '') {
  return new Map(style.split(';').map((part) => {
    const colon = part.indexOf(':');
    return [part.slice(0, colon).trim().toLowerCase(), part.slice(colon + 1).replace(/\s*!important\s*$/i, '').trim().toLowerCase()];
  }).filter(([name]) => name));
}

function positiveRatio(value = '') {
  const parts = value.split('/').map((part) => part.trim());
  return parts.length <= 2 && parts.every((part) => /^(?:\d+(?:\.\d+)?|\.\d+)$/.test(part) && Number(part) > 0);
}

function hasSize(classes, style) {
  // A zero height overrides a ratio utility and still collapses the frame.
  for (const property of ['height', 'max-height']) {
    if (/^0(?:\.0+)?(?:px|vh|vw|rem|em|%)?$/.test(style.get(property) ?? '')) return false;
  }
  if (style.has('aspect-ratio') && !positiveRatio(style.get('aspect-ratio'))) return false;
  if ([...classes].some((name) => ratioClasses.has(name) || heightClasses.has(name))) return true;
  const height = style.get('height') ?? '';
  if (/^(?:\d+(?:\.\d+)?|\.\d+)(?:px|vh|vw|rem|em)$/.test(height) && parseFloat(height) > 0) return true;
  return positiveRatio(style.get('aspect-ratio'));
}

// Inspect every image, including missing/unknown slots and non-local sources.
// Track the actual parent: .frame-img > img is the template's sizing selector.
export function validateSwissImageSlots(html, layout) {
  const errors = [];
  const stack = [];
  const source = html.replace(/<!--[\s\S]*?-->|<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '');
  for (const match of source.matchAll(/<\/?([a-z][\w:-]*)\b(?:[^"'<>]|"[^"]*"|'[^']*')*>/gi)) {
    const tag = match[0];
    const name = match[1].toLowerCase();
    if (tag.startsWith('</')) {
      const index = stack.findLastIndex((element) => element.name === name);
      if (index >= 0) stack.length = index;
      continue;
    }
    const attrs = attributes(tag);
    if (name === 'img') {
      const slot = attrs.get('data-image-slot') ?? '';
      const contract = slots.get(slot);
      if (layout !== 'S15' && layout !== 'S16' && !/^s1[56]-/.test(slot)) continue;
      if (!contract) {
        const prefix = layout === 'S16' ? 's16-brief' : 's15-grid';
        errors.push(`${slot || 'Image missing data-image-slot'} is not a registered ${layout} image slot. Use ${prefix}-21x9 / ${prefix}-16x10 for generated images or ${prefix}-shot for source screenshots.`);
        continue;
      }
      if (contract.layout !== layout) {
        errors.push(`${slot} belongs to ${contract.layout}, not ${layout}.`);
      }
      const parent = stack.at(-1);
      const classes = new Set((parent?.attrs.get('class') ?? '').split(/\s+/));
      if (!classes.has('frame-img')) {
        errors.push(`${slot} must be a direct child of .frame-img so the template can size the image.`);
        continue;
      }
      const style = declarations(parent.attrs.get('style'));
      const imageStyle = declarations(attrs.get('style'));
      if (contract.screenshot) {
        if (!classes.has('fit-contain')) errors.push(`${slot} requires .fit-contain to preserve the complete source screenshot.`);
        if (classes.has('r-21x9')) errors.push(`${slot} must not use .r-21x9; use a screenshot frame such as .r-16x10 or an explicit height.`);
        if (!hasSize(classes, style)) errors.push(`${slot} requires an explicit positive frame height or aspect-ratio (for example .r-16x10 or .h-26); percentage height alone cannot guarantee a non-collapsing frame.`);
        if (imageStyle.has('object-fit') && imageStyle.get('object-fit') !== 'contain') errors.push(`${slot} must retain object-fit:contain to preserve the complete source screenshot.`);
      } else {
        if (classes.has('fit-contain')) errors.push(`${slot} uses fit-contain. Regenerated ${layout} images should fill the slot with .frame-img.r-${contract.ratio}.`);
        if (!classes.has(`r-${contract.ratio}`)) errors.push(`${slot} must use .frame-img.r-${contract.ratio} so the image slot controls the visible size.`);
        if ([...classes].some((value) => ratioClasses.has(value) && value !== `r-${contract.ratio}`)) errors.push(`${slot} has a conflicting frame ratio class.`);
        if (style.has('height') || [...classes].some((value) => /^h-\d/.test(value))) errors.push(`${slot} frame has an explicit height. Use aspect-ratio .r-${contract.ratio} instead of shrinking generated images into a short slot.`);
        const expected = contract.ratio.split('x').map(Number);
        const actual = (style.get('aspect-ratio') ?? '').split('/').map(Number);
        if (style.has('aspect-ratio') && (!positiveRatio(style.get('aspect-ratio')) || Math.abs(actual[0] / (actual[1] ?? 1) - expected[0] / expected[1]) > 0.001)) errors.push(`${slot} has a conflicting inline aspect-ratio.`);
        if (imageStyle.has('object-fit') && imageStyle.get('object-fit') !== 'cover') errors.push(`${slot} must use object-fit:cover to fill the generated image slot.`);
      }
    }
    if (!voidTags.has(name)) stack.push({ name, attrs });
  }
  return errors;
}

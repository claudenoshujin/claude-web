/* Add presentation cards without replacing native rows or return markers. */
export function normalizeSettingsSections(root, make) {
  for (const section of root.querySelectorAll('.cw-v4-section')) {
    let card = section.querySelector(':scope > .cw-v4-card');
    if (!card) { card = make('div', 'cw-v4-card'); section.append(card); }
    for (const child of [...section.childNodes]) {
      if (child === card || child.nodeType === 1 && child.matches('h2')) continue;
      card.append(child);
    }
  }
}

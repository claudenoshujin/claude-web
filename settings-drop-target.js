export function dropAfter(row, clientY) {
  const { y, height } = row.getBoundingClientRect();
  return clientY > y + height / 2;
}

export function clearDropLine(row) {
  row?.classList.remove('cw2-over', 'cw2-over-after');
}

export function showDropLine(row, after) {
  row.classList.toggle('cw2-over', !after);
  row.classList.toggle('cw2-over-after', after);
}

const sortType = 'application/x-cw-sort';

export function guardSortDrag(root) {
  const doc = root.ownerDocument;
  const win = doc.defaultView;
  let active;
  const read = event => event.dataTransfer?.getData(sortType);
  const own = event => event.dataTransfer?.types.includes(sortType);

  function end() {
    if (!active) return;
    active.abort();
    active = null;
    doc.body.classList.remove('dragover');
  }

  function stop(event) {
    if (!own(event)) return;
    event.stopPropagation();
    if (event.type === 'drop') end();
  }

  function start(event, id) {
    end();
    event.dataTransfer.setData(sortType, id);
    event.dataTransfer.effectAllowed = 'move';
    active = new win.AbortController();
    const { signal } = active;
    for (const type of ['dragenter', 'dragover', 'dragleave', 'drop']) {
      root.addEventListener(type, stop, { signal });
      // A drag can leave the editor before the user lets go.
      doc.addEventListener(type, event => {
        if (!root.contains(event.target)) stop(event);
      }, { capture: true, signal });
    }
    win.addEventListener('dragend', end, { capture: true, signal });
  }

  return { start, read, end };
}

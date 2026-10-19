type BackLayer = { id: number; close: () => void };

const layers: BackLayer[] = [];
let nextId = 0;

/** Register a dismissible layer (sheet, dialog). Returns an unregister function. */
export function pushBackLayer(close: () => void): () => void {
  const layer: BackLayer = { id: nextId++, close };
  layers.push(layer);
  return () => {
    const index = layers.findIndex((l) => l.id === layer.id);
    if (index !== -1) layers.splice(index, 1);
  };
}

/** Close the topmost layer. Returns false when nothing was open. */
export function closeTopBackLayer(): boolean {
  const top = layers[layers.length - 1];
  if (!top) return false;
  top.close();
  return true;
}

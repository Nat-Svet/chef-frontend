let ownedNames: string[] = [];

export function rememberOwnedItems(names: string[]) {
  ownedNames = names;
}

export function getOwnedItems() {
  return ownedNames;
}

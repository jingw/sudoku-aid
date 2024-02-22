export function checkbox(): HTMLInputElement {
  const element = document.createElement("input");
  element.type = "checkbox";
  return element;
}

export function radio(name: string, value: string): HTMLInputElement {
  const element = document.createElement("input");
  element.type = "radio";
  element.name = name;
  element.value = value;
  return element;
}

export function label(
  inner: HTMLElement,
  text: string,
  textFirst = false,
): HTMLLabelElement {
  const element = document.createElement("label");
  if (textFirst) {
    element.append(text);
  }
  element.append(inner);
  if (!textFirst) {
    element.append(text);
  }
  return element;
}

export function button(
  text: string,
  onclick: (e: MouseEvent) => void,
): HTMLButtonElement {
  const element = document.createElement("button");
  element.textContent = text;
  element.addEventListener("click", onclick);
  return element;
}

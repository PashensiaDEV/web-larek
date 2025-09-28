export class CardsContainer {
  constructor(private root: HTMLElement | null) {
    if (!root) throw new Error('.gallery not found');
  }

  render({ catalog }: { catalog: HTMLElement[] }) {
    this.root!.innerHTML = '';
    catalog.forEach((el) => this.root!.appendChild(el));
  }
}
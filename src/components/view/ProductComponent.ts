import { formatNumber, isEmpty } from "../../utils/utils";
import { Component } from "../base/component";

export class ProductComponent<T> extends Component<T> {

  constructor(Tpl:HTMLElement) {
      super(Tpl)
    }

  applyCategoryClass(el: HTMLElement, category?: string) {
		[...el.classList]
			.filter((c) => c.startsWith('card__category_'))
			.forEach((c) => el.classList.remove(c));

		const map: Record<string, string> = {
			'софт-скил': 'card__category_soft',
			'другое': 'card__category_other',
			'хард-скил': 'card__category_hard',
			'дополнительное': 'card__category_additional',
			'кнопка': 'card__category_button',
		};
		if (category && map[category]) el.classList.add(map[category]);
	}

  formatPrice(price: unknown): string {
		if (isEmpty(price)) return 'бесценно';
		const n = Number(price);
		return Number.isFinite(n) ? `${formatNumber(n)} синапсов` : 'бесценно';
	}
} 
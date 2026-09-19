/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CartItem } from '../types';

export function buildWhatsAppOrderMessage(cart: CartItem[], cartTotal: number): string {
  const lines: string[] = ['Bonjour Yolita ! Je souhaite commander :', ''];

  cart.forEach((item) => {
    const parts = [item.name];
    if (item.isDiy) {
      if (item.selectedBase) parts.push(`base ${item.selectedBase}`);
      if (item.selectedFruits && item.selectedFruits.length > 0) {
        parts.push(`fruits : ${item.selectedFruits.join(', ')}`);
      }
    } else if (item.selectedAroma) {
      parts.push(item.selectedAroma);
    }
    if (item.selectedCapacity) parts.push(item.selectedCapacity);

    lines.push(`• ${item.quantity} x ${parts.join(' — ')} (${(item.price * item.quantity).toLocaleString('fr-FR')} FCFA)`);
  });

  lines.push('');
  lines.push(`Total : ${cartTotal.toLocaleString('fr-FR')} FCFA`);
  lines.push('');
  lines.push('Merci de me confirmer la disponibilité et la livraison 🙏');

  return lines.join('\n');
}

export const YOLITA_WHATSAPP_NUMBER = '22947816778';

export function getWhatsAppOrderLink(cart: CartItem[], cartTotal: number): string {
  const message = buildWhatsAppOrderMessage(cart, cartTotal);
  return `https://wa.me/${YOLITA_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { YOLITA_WHATSAPP_NUMBER } from '../utils/whatsapp';

const DEFAULT_MESSAGE = "Bonjour Yolita ! Je souhaite passer une commande.";

export default function WhatsAppButton() {
  const href = `https://wa.me/${YOLITA_WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Commander sur WhatsApp"
      className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] shadow-lg shadow-black/20 flex items-center justify-center transition-transform hover:scale-105"
    >
      <svg viewBox="0 0 32 32" className="w-7 h-7 fill-white">
        <path d="M16.004 2.667c-7.363 0-13.333 5.97-13.333 13.333 0 2.353.615 4.647 1.784 6.667L2.667 29.333l6.84-1.795a13.27 13.27 0 0 0 6.497 1.696h.006c7.363 0 13.333-5.97 13.333-13.333S23.367 2.667 16.004 2.667Zm0 24.4h-.005a11.06 11.06 0 0 1-5.636-1.542l-.404-.24-4.06 1.065 1.084-3.96-.263-.407a11.02 11.02 0 0 1-1.69-5.883c0-6.107 4.968-11.075 11.078-11.075 2.96 0 5.742 1.153 7.834 3.246a11 11 0 0 1 3.243 7.833c0 6.107-4.968 11.075-11.08 11.075Zm6.07-8.294c-.332-.166-1.966-.97-2.271-1.08-.305-.11-.527-.166-.749.166-.222.333-.86 1.08-1.054 1.302-.194.222-.388.25-.72.083-.332-.166-1.402-.517-2.671-1.65-.987-.882-1.654-1.97-1.848-2.303-.194-.333-.02-.512.146-.678.15-.15.333-.389.5-.583.166-.194.222-.333.333-.555.11-.222.055-.416-.028-.583-.083-.166-.749-1.807-1.027-2.475-.27-.652-.545-.563-.749-.573l-.638-.011a1.225 1.225 0 0 0-.887.416c-.305.333-1.164 1.138-1.164 2.777s1.192 3.222 1.358 3.445c.166.222 2.346 3.583 5.684 5.024.794.343 1.414.548 1.897.702.797.253 1.522.217 2.096.132.639-.095 1.966-.804 2.244-1.581.278-.777.278-1.443.194-1.582-.083-.138-.305-.222-.638-.389Z"/>
      </svg>
    </a>
  );
}

import { initAssistant } from "./assistant/ui.js";
import { initContactForm } from "./modules/contact-form.js";
import { initDotnav } from "./modules/dotnav.js";
import { initQuote } from "./modules/quote.js";
import { initTheme } from "./modules/theme.js";
import { initWhatsapp } from "./modules/whatsapp.js";

initTheme();
initContactForm();
initDotnav();
initQuote();
initWhatsapp();
initAssistant();

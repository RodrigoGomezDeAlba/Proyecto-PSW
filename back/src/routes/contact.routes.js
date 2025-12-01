// back/src/routes/contact.routes.js
import { Router } from 'express';
import {
  sendContactMail,
  sendSubscriptionMail,
  sendPurchaseMail
} from '../controllers/contact.controller.js';  // 👈 OJO: "../controllers/..." SIN "src"

const router = Router();

router.post('/contact', sendContactMail);
router.post('/subscribe', sendSubscriptionMail);
router.post('/purchase', sendPurchaseMail);

export default router;

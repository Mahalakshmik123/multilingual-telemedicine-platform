import { Router } from 'express';
import { translateText, explainTerm, getSupportedLanguages } from '../controllers/translationController.ts';

const router = Router();

router.post('/', translateText);
router.post('/explain', explainTerm);
router.get('/languages', getSupportedLanguages);

export default router;

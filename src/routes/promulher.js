import { Router } from 'express';
import ProMulherController from '../controller/ProMulherQuestionnaire';

const router = Router();

router.get('/', ProMulherController.index);
router.get('/:id', ProMulherController.show);
router.post('/', ProMulherController.store);
router.put('/:id', ProMulherController.update);
router.delete('/:id', ProMulherController.destroy);

export default router;

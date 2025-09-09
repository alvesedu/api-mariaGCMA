import { Router } from 'express';
import ProtegeMulherFormController from '../controller/ProtegeMulherFormController.js';

const router = Router();

router.get('/', ProtegeMulherFormController.index);
router.get('/:id', ProtegeMulherFormController.show);
router.post('/', ProtegeMulherFormController.store);
router.put('/:id', ProtegeMulherFormController.update);
router.delete('/:id', ProtegeMulherFormController.destroy);

export default router;

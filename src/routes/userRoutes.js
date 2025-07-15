// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const authenticate = require('../middleware/authMiddleware');

router.get('/', authenticate, UserController.index);
router.get('/:id', authenticate, UserController.show);
router.post('/', authenticate, UserController.store);
router.put('/:id', authenticate, UserController.update);
router.delete('/:id', authenticate, UserController.delete);

module.exports = router;

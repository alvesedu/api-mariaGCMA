// src/controllers/ProMulherController.js
import ProMulherQuestionnaire from '../models/ProMulherSchema';

class ProMulherController {
  async index(req, res) {
    const data = await ProMulherQuestionnaire.find().sort({ createdAt: -1 });
    return res.json(data);
  }

  async show(req, res) {
    const item = await ProMulherQuestionnaire.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Registro não encontrado" });
    return res.json(item);
  }

  async store(req, res) {
    try {
      const created = await ProMulherQuestionnaire.create(req.body);
      return res.status(201).json(created);
    } catch (err) {
      return res.status(400).json({ 
        message: "Erro ao criar registro", 
        error: err.message 
      });
    }
  }

  async update(req, res) {
    try {
      const updated = await ProMulherQuestionnaire.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updated) return res.status(404).json({ message: "Registro não encontrado" });
      return res.json(updated);
    } catch (err) {
      return res.status(400).json({ 
        message: "Erro ao atualizar registro", 
        error: err.message 
      });
    }
  }

  async destroy(req, res) {
    const deleted = await ProMulherQuestionnaire.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Registro não encontrado" });
    return res.status(204).end();
  }
}

export default new ProMulherController();

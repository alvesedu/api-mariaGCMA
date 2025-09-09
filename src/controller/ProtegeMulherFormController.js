import ProtegeMulherForm from '../models/ProtegeMulherForm.js';

export default {
  async index(req, res) {
    const forms = await ProtegeMulherForm.find().sort({ createdAt: -1 });
    res.json(forms);
  },

  async show(req, res) {
    const { id } = req.params;
    const form = await ProtegeMulherForm.findById(id);
    if (!form) return res.status(404).json({ message: 'Formulário não encontrado' });
    res.json(form);
  },

  async store(req, res) {
    try {
      const newForm = await ProtegeMulherForm.create(req.body);
      res.status(201).json(newForm);
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: 'Erro ao criar formulário' });
    }
  },

  async update(req, res) {
    const { id } = req.params;
    try {
      const updated = await ProtegeMulherForm.findByIdAndUpdate(id, req.body, { new: true });
      res.json(updated);
    } catch (error) {
      res.status(400).json({ message: 'Erro ao atualizar formulário' });
    }
  },

  async destroy(req, res) {
    const { id } = req.params;
    await ProtegeMulherForm.findByIdAndDelete(id);
    res.status(204).send();
  }
};

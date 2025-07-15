import VictimQuestionnaire from '../models/VictimQuestionnaire'; // Ajuste o caminho conforme necessário

class VictimQuestionnaireController {
  // Listar todos os questionários de vítimas
  async index(req, res) {
    try {
      const questionnaires = await VictimQuestionnaire.find();
      res.status(200).json(questionnaires);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar questionários de vítimas' });
    }
  }

  // Mostrar um questionário de vítima específico
  async show(req, res) {
    try {
      const { cpf, rg } = req.query;

      let query = {};
      if (cpf) {
          query.cpf = cpf;
      } else if (rg) {
          query.rg = rg;
      } else {
          return res.status(400).json({ error: 'Informe o CPF ou RG para realizar a busca' });
      }

      const questionnaire = await VictimQuestionnaire.findOne(query);

      if (!questionnaire) {
          return res.status(404).json({ error: 'Questionário não encontrado' });
      }

      res.json(questionnaire);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar questionário' });
  }
  }

  // Criar um novo questionário de vítima
  async store(req, res) {
    try {
      const questionnaire = new VictimQuestionnaire(req.body);
      await questionnaire.save();
      res.status(201).json(questionnaire);
    } catch (error) {
      res.status(400).json({ error: 'Erro ao criar questionário de vítima', details: error.message });
    }
  }

  // Atualizar um questionário de vítima existente
  async update(req, res) {
    try {
      const { id } = req.params;
      const questionnaire = await VictimQuestionnaire.findByIdAndUpdate(id, req.body, { new: true });

      if (!questionnaire) {
        return res.status(404).json({ error: 'Questionário de vítima não encontrado' });
      }

      res.status(200).json(questionnaire);
    } catch (error) {
      res.status(400).json({ error: 'Erro ao atualizar questionário de vítima', details: error.message });
    }
  }

  // Deletar um questionário de vítima
  async delete(req, res) {
    try {
      const { id } = req.params;
      const questionnaire = await VictimQuestionnaire.findByIdAndDelete(id);

      if (!questionnaire) {
        return res.status(404).json({ error: 'Questionário de vítima não encontrado' });
      }

      res.status(204).send(); // Sem conteúdo na resposta
    } catch (error) {
      res.status(500).json({ error: 'Erro ao deletar questionário de vítima' });
    }
  }
}

export default new VictimQuestionnaireController();

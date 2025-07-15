import AuthorQuestionnaire from '../models/AuthorQuestionnaire';

class AuthorQuestionnaireController {
  // Listar todos os questionários
  async index(req, res) {
    try {
      const questionnaires = await AuthorQuestionnaire.find();
      return res.status(200).json(questionnaires);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Mostrar um questionário específico
  async show(req, res) {
    const { id, cpf, rg } = req.query;

    try {
        // Construir a consulta
        const query = {};
        if (id) {
            query._id = id;
        }
        if (cpf) {
            query.cpf = cpf;
        }
        if (rg) {
            query.rg = rg;
        }

        // Verificar se algum parâmetro foi fornecido
        if (Object.keys(query).length === 0) {
            return res.status(400).json({ message: 'Informe ao menos um parâmetro de busca (id, cpf ou rg)' });
        }

        // Executar a consulta
        const questionnaire = await AuthorQuestionnaire.findOne(query);

        if (!questionnaire) {
            return res.status(404).json({ message: 'Questionário não encontrado' });
        }

        return res.status(200).json(questionnaire);
    } catch (error) {
        console.error('Erro ao buscar questionário:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
}

  // Criar um novo questionário
  async store(req, res) {
    try {
      const newQuestionnaire = new AuthorQuestionnaire(req.body);
      await newQuestionnaire.save();
      return res.status(201).json({ message: 'Questionário criado com sucesso!', questionnaire: newQuestionnaire });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro interno do servidor!' });
    }
  }

  // Atualizar um questionário existente
  async update(req, res) {
    const { id } = req.params;
    try {
      const updatedQuestionnaire = await AuthorQuestionnaire.findByIdAndUpdate(id, req.body, { new: true });
      if (!updatedQuestionnaire) {
        return res.status(404).json({ message: 'Questionário não encontrado' });
      }
      return res.status(200).json({ message: 'Questionário atualizado com sucesso', questionnaire: updatedQuestionnaire });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  // Deletar um questionário
  async delete(req, res) {
    const { id } = req.params;
    try {
      const deletedQuestionnaire = await AuthorQuestionnaire.findByIdAndDelete(id);
      if (!deletedQuestionnaire) {
        return res.status(404).json({ message: 'Questionário não encontrado' });
      }
      return res.status(200).json({ message: 'Questionário deletado com sucesso' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}

export default new AuthorQuestionnaireController();

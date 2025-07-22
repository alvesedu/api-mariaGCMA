// src/routes/reports.js
import { Router } from 'express';
import ReportController from '../controller/ReportController';

const router = Router();

/**
 * GET /reports
 * → index: lista todos os relatórios disponíveis
 */
router.get('/', (req, res) => {
  res.json([
    { slug: 'victims-per-month',       name: 'Vítimas por Mês'                       },
    { slug: 'violence-types',           name: 'Tipos de Violência'                    },
    { slug: 'authors-by-municipality',  name: 'Autores por Município'                 },
    { slug: 'avg-children',             name: 'Média de Filhos (Vítimas e Autores)'   },
    { slug: 'housing-income',           name: 'Casos por Moradia × Renda'             },
    { slug: 'age-distribution',         name: 'Distribuição Etária (Vít/Aut)'         }
  ]);
});

/**
 * GET /reports/:slug
 * → show: chama o controller correspondente
 */
router.get('/:slug', (req, res, next) => {
  const { slug } = req.params;

  switch (slug) {
    case 'victims-per-month':
      return ReportController.victimsPerMonth(req, res, next);

    case 'violence-types':
      return ReportController.violenceTypesBreakdown(req, res, next);

    case 'authors-by-municipality':
      return ReportController.authorsByMunicipality(req, res, next);

    case 'avg-children':
      return ReportController.avgChildren(req, res, next);

    case 'housing-income':
      return ReportController.housingIncome(req, res, next);

    case 'age-distribution':
      return ReportController.ageDistribution(req, res, next);

    default:
      return res.status(404).json({ message: 'Relatório não encontrado' });
  }
});

export default router;

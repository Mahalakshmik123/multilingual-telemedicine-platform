import { Request, Response } from 'express';
import { MedicalTerm } from '../models/MedicalTerm.ts';
import { memoryStore } from '../models/store.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

export const getMedicalTerms = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, category } = req.query;

    let terms: any[] = [];
    try {
      terms = await MedicalTerm.find().sort({ term: 1 });
    } catch {}

    if (!terms || terms.length === 0) {
      terms = await memoryStore.medicalTerms.find();
    }

    let filtered = terms;

    if (search) {
      const q = String(search).toLowerCase();
      filtered = filtered.filter(
        t =>
          t.term?.toLowerCase().includes(q) ||
          t.definition?.toLowerCase().includes(q) ||
          t.category?.toLowerCase().includes(q) ||
          (t.translations && Object.values(t.translations).some((v: any) => String(v).toLowerCase().includes(q)))
      );
    }

    if (category && category !== 'All') {
      const c = String(category).toLowerCase();
      filtered = filtered.filter(t => t.category?.toLowerCase() === c);
    }

    res.json({
      success: true,
      count: filtered.length,
      terms: filtered.map(t => ({
        id: t._id || t.id,
        term: t.term,
        category: t.category,
        translations: t.translations,
        definition: t.definition,
        simplifiedExplanation: t.simplifiedExplanation,
        symptoms: t.symptoms,
        commonMistranslations: t.commonMistranslations
      }))
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch medical terms', error: error.message });
  }
};

export const getMedicalTermById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    let term: any = null;
    try { term = await MedicalTerm.findById(id); } catch {}
    if (!term) term = await memoryStore.medicalTerms.findById(id);

    if (!term) {
      res.status(404).json({ success: false, message: 'Medical term not found' });
      return;
    }

    res.json({ success: true, term });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch medical term', error: error.message });
  }
};

export const createMedicalTerm = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { term, category, translations, definition, simplifiedExplanation, symptoms } = req.body;

    if (!term || !category) {
      res.status(400).json({ success: false, message: 'Term and category are required' });
      return;
    }

    const termData = {
      term: term.trim(),
      category: category.trim(),
      translations: translations || {},
      definition: definition || '',
      simplifiedExplanation: simplifiedExplanation || '',
      symptoms: symptoms || []
    };

    let newTerm: any = null;
    try {
      newTerm = await MedicalTerm.create(termData);
    } catch {
      newTerm = await memoryStore.medicalTerms.create(termData);
    }

    res.status(201).json({
      success: true,
      message: 'Medical term added successfully',
      term: newTerm
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to create medical term', error: error.message });
  }
};

export const updateMedicalTerm = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { term, category, translations, definition, simplifiedExplanation, symptoms } = req.body;

    let updated: any = null;
    try {
      updated = await MedicalTerm.findByIdAndUpdate(
        id,
        { $set: { term, category, translations, definition, simplifiedExplanation, symptoms } },
        { new: true }
      );
    } catch {}

    if (!updated) {
      updated = await memoryStore.medicalTerms.findByIdAndUpdate(id, {
        term,
        category,
        translations,
        definition,
        simplifiedExplanation,
        symptoms
      });
    }

    if (!updated) {
      res.status(404).json({ success: false, message: 'Medical term not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Medical term updated successfully',
      term: updated
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update medical term', error: error.message });
  }
};

export const deleteMedicalTerm = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    let deleted: any = null;
    try { deleted = await MedicalTerm.findByIdAndDelete(id); } catch {}
    if (!deleted) deleted = await memoryStore.medicalTerms.findByIdAndDelete(id);

    if (!deleted) {
      res.status(404).json({ success: false, message: 'Medical term not found' });
      return;
    }

    res.json({ success: true, message: 'Medical term deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete medical term', error: error.message });
  }
};

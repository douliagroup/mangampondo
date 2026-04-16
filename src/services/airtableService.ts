import Airtable from 'airtable';

const BASE_ID = (import.meta as any).env.VITE_AIRTABLE_BASE_ID || 'appwSSdoHLI09lNwk';
const API_TOKEN = (import.meta as any).env.VITE_AIRTABLE_API_TOKEN;

// Initialize Airtable lazily to avoid errors if key is missing
let baseInstance: any = null;
const getBase = () => {
  if (!baseInstance && API_TOKEN) {
    baseInstance = new Airtable({ apiKey: API_TOKEN }).base(BASE_ID);
  }
  return baseInstance;
};

// Table Names
export const TABLES = {
  VISITORS: 'Visiteurs Gatekeeper',
  GUESTBOOK: 'Livre Or Temoignages',
  DOCUMENTS: 'Heritage Documents',
};

// --- CRUD Operations ---

/**
 * 1. Read all visitors
 */
export const getAllVisitors = async () => {
  const base = getBase();
  if (!base) return [];
  try {
    const records = await base(TABLES.VISITORS).select({
      view: 'Grid view', // Assumes a default view exists
    }).all();
    return records.map((record: any) => ({
      id: record.id,
      ...record.fields,
    }));
  } catch (error) {
    console.error('Error fetching visitors:', error);
    throw error;
  }
};

/**
 * 2. Add a new testimony to the guestbook
 */
export const addTestimony = async (data: {
  name: string;
  message: string;
  visitorId: string;
}) => {
  const base = getBase();
  if (!base) throw new Error("Airtable not initialized");
  try {
    const records = await base(TABLES.GUESTBOOK).create([
      {
        fields: {
          'Name': data.name,
          'Message': data.message,
          'Auteur': [data.visitorId], // Linked record expects an array of IDs
          'Date de publication': new Date().toISOString().split('T')[0],
          'Statut': 'En attente',
        },
      },
    ]);
    return records[0];
  } catch (error) {
    console.error('Error adding testimony:', error);
    throw error;
  }
};

/**
 * 3. List documents by category
 */
export const getDocumentsByCategory = async (category?: string) => {
  const base = getBase();
  if (!base) return [];
  try {
    const filterFormula = category ? `{Catégorie} = '${category}'` : '';
    const records = await base(TABLES.DOCUMENTS).select({
      filterByFormula: filterFormula,
      sort: [{ field: "Ordre d'affichage", direction: 'asc' }],
    }).all();
    
    return records.map((record: any) => ({
      id: record.id,
      title: record.get('Titre du document'),
      category: record.get('Catégorie'),
      file: record.get('Fichier'),
      year: record.get('Année de publication'),
      downloadUrl: record.get('Lien de téléchargement direct'),
    }));
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }
};

/**
 * 4. Update a testimony status
 */
export const updateTestimonyStatus = async (recordId: string, status: 'En attente' | 'Validé') => {
  const base = getBase();
  if (!base) throw new Error("Airtable not initialized");
  try {
    const records = await base(TABLES.GUESTBOOK).update([
      {
        id: recordId,
        fields: {
          'Statut': status,
        },
      },
    ]);
    return records[0];
  } catch (error) {
    console.error('Error updating testimony status:', error);
    throw error;
  }
};

/**
 * Extra: Get all validated testimonies
 */
export const getTestimonies = async () => {
  const base = getBase();
  if (!base) return [];
  try {
    const records = await base(TABLES.GUESTBOOK).select({
      filterByFormula: "{Statut} = 'Validé'",
      sort: [{ field: 'Date de publication', direction: 'desc' }],
    }).all();
    
    return records.map((record: any) => ({
      id: record.id,
      name: record.get('Name'),
      message: record.get('Message'),
      date: record.get('Date de publication'),
      relation: record.get('Auteur - Relation')?.[0] || 'Visiteur',
    }));
  } catch (error) {
    console.error('Error fetching testimonies:', error);
    throw error;
  }
};

/**
 * Extra: Register a visitor (Gatekeeper)
 */
export const registerVisitor = async (userData: {
  nom: string;
  prenom: string;
  email: string;
  relation: string;
}) => {
  const base = getBase();
  if (!base) return { id: 'temp-' + Date.now() }; // Return temp ID if no airtable
  try {
    // Check if visitor already exists by email
    const existing = await base(TABLES.VISITORS).select({
      filterByFormula: `{Email} = '${userData.email}'`,
    }).firstPage();

    if (existing.length > 0) {
      return existing[0];
    }

    const records = await base(TABLES.VISITORS).create([
      {
        fields: {
          'Nom Complet': `${userData.prenom} ${userData.nom}`,
          'Email': userData.email,
          'Relation': userData.relation,
          'Date de connexion': new Date().toISOString().split('T')[0],
        },
      },
    ]);
    return records[0];
  } catch (error) {
    console.error('Error registering visitor:', error);
    throw error;
  }
};

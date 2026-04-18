import Airtable from 'airtable';

const BASE_ID = 'appwSSdoHLI09lNwk';

// Tables
export const TABLES = {
  VISITORS: 'Visiteurs Gatekeeper',
  TESTIMONIALS: 'Livre Or Temoignages',
  HERITAGE: 'Heritage Documents',
};

let airtableBase: any = null;

export const getAirtableBase = () => {
  if (!airtableBase) {
    const apiKey = (import.meta as any).env?.VITE_AIRTABLE_API_TOKEN;
    if (!apiKey) {
      console.warn('Airtable API token is missing. Please set VITE_AIRTABLE_API_TOKEN in your environment.');
      return null;
    }
    airtableBase = new Airtable({ apiKey }).base(BASE_ID);
  }
  return airtableBase;
};

// --- Visitors ---

export interface Visitor {
  id?: string;
  nomComplet: string;
  email: string;
  relation: string;
  dateConnexion: string;
}

export const getVisitorByEmail = async (email: string): Promise<Visitor | null> => {
  const base = getAirtableBase();
  if (!base) return null;

  try {
    const records = await base(TABLES.VISITORS)
      .select({
        filterByFormula: `{Email} = '${email}'`,
        maxRecords: 1,
      })
      .firstPage();

    if (records.length === 0) return null;

    const record = records[0];
    return {
      id: record.id,
      nomComplet: record.get('Nom Complet') as string,
      email: record.get('Email') as string,
      relation: record.get('Relation') as string,
      dateConnexion: record.get('Date de connexion') as string,
    };
  } catch (error) {
    console.error('Error fetching visitor:', error);
    return null;
  }
};

export const registerVisitor = async (data: { nom: string; prenom: string; email: string; relation: string }): Promise<Visitor> => {
  const base = getAirtableBase();
  const nomComplet = `${data.prenom} ${data.nom}`;

  if (!base) return { nomComplet, email: data.email, relation: data.relation, dateConnexion: '' };

  try {
    // Check if exists first
    const existing = await getVisitorByEmail(data.email);
    if (existing) return existing;

    const record = await base(TABLES.VISITORS).create({
      'Nom Complet': nomComplet,
      'Email': data.email,
      'Relation': data.relation,
      'Date de connexion': new Date().toISOString().split('T')[0],
    });

    return {
      id: record.id,
      nomComplet: record.get('Nom Complet') as string,
      email: record.get('Email') as string,
      relation: record.get('Relation') as string,
      dateConnexion: record.get('Date de connexion') as string,
    };
  } catch (error) {
    console.error('Error creating visitor:', error);
    return { nomComplet, email: data.email, relation: data.relation, dateConnexion: '' };
  }
};

// --- Testimonials ---

export interface Testimonial {
  id?: string;
  idMessage?: number;
  auteurId: string; // Airtable Record ID of the visitor
  auteurName?: string;
  message: string;
  datePublication: string;
  statut: 'En attente' | 'Validé';
}

export const getTestimonies = async (): Promise<any[]> => {
  const base = getAirtableBase();
  if (!base) return [];

  try {
    const records = await base(TABLES.TESTIMONIALS)
      .select({
        view: 'Grid view',
        // Optional: filterByFormula: "{Statut} = 'Validé'",
        sort: [{ field: 'Date de publication', direction: 'desc' }],
      })
      .all();

    return records.map((record: any) => ({
      id: record.id,
      name: record.get('Name'), // We will display the name field for now or look up author
      message: record.get('Message'),
      date: record.get('Date de publication'),
      relation: 'Hommage', // Default or look up
    }));
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }
};

export const addTestimony = async (data: { name: string; message: string; visitorId: string }): Promise<boolean> => {
  const base = getAirtableBase();
  if (!base) return false;

  try {
    await base(TABLES.TESTIMONIALS).create({
      'Name': data.name,
      'Auteur': data.visitorId ? [data.visitorId] : undefined,
      'Message': data.message,
      'Date de publication': new Date().toISOString().split('T')[0],
      'Statut': 'Validé', // Default to validated for the sake of demo, or 'En attente'
    });
    return true;
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return false;
  }
};

// --- Heritage Documents ---

export interface HeritageDocument {
  id: string;
  titre: string;
  categorie: string;
  fichierUrl?: string;
  ordre: number;
  annee?: number;
}

export const getHeritageDocuments = async (): Promise<HeritageDocument[]> => {
  const base = getAirtableBase();
  if (!base) return [];

  try {
    const records = await base(TABLES.HERITAGE)
      .select({
        view: 'Grid view',
        sort: [{ field: 'Ordre d\'affichage', direction: 'asc' }],
      })
      .all();

    return records.map((record: any) => {
      const files = record.get('Fichier') || [];
      return {
        id: record.id,
        titre: record.get('Titre du document'),
        categorie: record.get('Catégorie'),
        fichierUrl: files.length > 0 ? files[0].url : undefined,
        ordre: record.get('Ordre d\'affichage'),
        annee: record.get('Année de publication'),
      };
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
};

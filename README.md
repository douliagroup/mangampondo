# Assistant Familial Manga Mpondo

Cette application est un assistant virtuel pour les obsèques de Manga Mpondo Albert Fructueux. Elle est conçue pour informer, rassurer et accompagner les proches.

## Déploiement sur Vercel

Pour déployer cette application sur Vercel via GitHub :

1.  **Poussez le code sur GitHub** : Créez un nouveau dépôt sur GitHub et poussez-y tout le code de ce projet.
2.  **Importez sur Vercel** : Connectez-vous à votre compte Vercel, cliquez sur "Add New" -> "Project", et sélectionnez votre dépôt GitHub.
3.  **Configurez les variables d'environnement** :
    *   Allez dans l'onglet "Environment Variables" de votre projet Vercel.
    *   Ajoutez une nouvelle variable nommée `GEMINI_API_KEY`.
    *   Collez votre clé API Gemini (que vous pouvez obtenir sur [Google AI Studio](https://aistudio.google.com/app/apikey)).
4.  **Déployez** : Cliquez sur "Deploy". Vercel détectera automatiquement qu'il s'agit d'un projet Vite et lancera le build.

## Fonctionnalités

*   **Assistant IA** : Répond aux questions sur les dates, le lieu et les contacts.
*   **Interface Mobile-First** : Navigation par onglets optimisée pour les smartphones.
*   **Thème Solennel** : Design Noir et Or avec particules et illustrations.
*   **Synthèse Vocale** : Lecture des réponses avec une voix douce.
*   **Reconnaissance Vocale** : Possibilité de poser des questions à la voix.

## Technologies

*   React 19
*   Vite
*   Tailwind CSS 4
*   Framer Motion
*   Google Gemini API (@google/genai)
*   Lucide React

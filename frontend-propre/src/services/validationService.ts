// src/services/validationService.ts
// Service de validation des documents - Version ultime avec correspondance maximale

export class ValidationService {
  /**
   * Nettoie une chaîne pour la comparaison
   */
  static cleanString(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
      .replace(/[^a-z0-9]/g, ''); // Garde seulement lettres et chiffres
  }

  /**
   * Extrait le nom de base d'un fichier sans extension et sans préfixes
   */
  static getBaseName(filename: string): string {
    // Enlève l'extension
    let name = filename.split('.').slice(0, -1).join('.');
    
    // Enlève les préfixes numériques (01_, 02_, 1_, 2-, etc.)
    name = name.replace(/^\d+[_\-\s]/, ''); // Supprime 01_, 02-, 001 etc.
    name = name.replace(/^[a-z]?\d+[_\-\s]/i, ''); // Supprime A01_, B02- etc.
    
    return name;
  }

  /**
   * Dictionnaire de correspondances pour les variantes de noms
   */
  static readonly NAME_MAPPINGS: Record<string, string[]> = {
    'demande_nomination': ['demande', 'nomination', 'demande_nomination', 'demande_nom'],
    'diplomes': ['diplome', 'diplomes', 'diplôme', 'diplômes', 'diplom'],
    'photo_identite': ['photo', 'identite', 'photo_identite', 'photo_identité', 'portrait'],
    'casier_judiciaire': ['casier', 'judiciaire', 'casier_judiciaire', 'casier_jud'],
    'certificat_medical': ['certificat', 'medical', 'certificat_medical', 'certificat_med'],
    'attestation_concours': ['attestation', 'concours', 'attestation_concours'],
    'lettre_motivation': ['lettre', 'motivation', 'lettre_motivation'],
    'cv': ['cv', 'curriculum', 'curriculum_vitae', 'curriculum vitae'],
    'arrete_nomination': ['arrete', 'nomination', 'arrêté', 'arrete_nomination'],
    'contrat': ['contrat', 'contract']
  };

  /**
   * Vérifie si un nom de fichier correspond à un document requis
   * Version ultra-flexible qui utilise des mappings et des mots-clés
   */
  static matchesRequiredFile(filename: string, requiredPattern: string): boolean {
    // Nettoyer le nom du fichier
    const baseName = this.getBaseName(filename);
    const cleanFilename = this.cleanString(baseName);
    
    // Nettoyer le pattern requis (enlever l'extension)
    const cleanPattern = this.cleanString(requiredPattern.replace(/\.\w+$/, ''));
    
    console.log(`Comparaison: "${filename}" (${cleanFilename}) avec "${requiredPattern}" (${cleanPattern})`);
    
    // 1. Correspondance exacte
    if (cleanFilename === cleanPattern) {
      console.log(`  ✅ Correspondance exacte`);
      return true;
    }
    
    // 2. Le fichier contient le pattern
    if (cleanFilename.includes(cleanPattern)) {
      console.log(`  ✅ Le fichier contient le pattern`);
      return true;
    }
    
    // 3. Le pattern contient le fichier
    if (cleanPattern.includes(cleanFilename)) {
      console.log(`  ✅ Le pattern contient le fichier`);
      return true;
    }
    
    // 4. Utiliser le dictionnaire de mappings
    const patternKey = Object.keys(this.NAME_MAPPINGS).find(key => 
      cleanPattern.includes(key) || key.includes(cleanPattern)
    );
    
    if (patternKey) {
      const variants = this.NAME_MAPPINGS[patternKey];
      // Vérifier si le nom du fichier correspond à une des variantes
      for (const variant of variants) {
        const cleanVariant = this.cleanString(variant);
        if (cleanFilename.includes(cleanVariant) || cleanVariant.includes(cleanFilename)) {
          console.log(`  ✅ Correspondance via mapping: ${patternKey} → ${variant}`);
          return true;
        }
      }
    }
    
    // 5. Recherche par mots-clés individuels
    const fileWords = cleanFilename.split(/(\d+)/).filter(w => w.length > 2);
    const patternWords = cleanPattern.split(/(\d+)/).filter(w => w.length > 2);
    
    for (const fileWord of fileWords) {
      for (const patternWord of patternWords) {
        if (fileWord.includes(patternWord) || patternWord.includes(fileWord)) {
          console.log(`  ✅ Correspondance par mot-clé: "${fileWord}" ↔ "${patternWord}"`);
          return true;
        }
      }
    }
    
    console.log(`  ❌ Aucune correspondance`);
    return false;
  }

  /**
   * Version améliorée de validation avec logs détaillés
   */
  static validateRequiredDocuments(
    requiredDocs: string[],
    uploadedFiles: File[]
  ): { 
    valid: boolean; 
    missing: string[]; 
    found: Array<{ required: string; file: File }>;
    suggestions: Array<{ required: string; possibleFiles: string[] }>;
    details: Array<{ required: string; tested: Array<{ file: string; result: boolean }> }>;
  } {
    const missing: string[] = [];
    const found: Array<{ required: string; file: File }> = [];
    const suggestions: Array<{ required: string; possibleFiles: string[] }> = [];
    const details: Array<{ required: string; tested: Array<{ file: string; result: boolean }> }> = [];

    console.log('\n=== DÉTAIL DE VALIDATION ===');
    
    // Pour chaque document requis
    requiredDocs.forEach(required => {
      console.log(`\n🔍 Recherche de: "${required}"`);
      const tested: Array<{ file: string; result: boolean }> = [];
      
      // Chercher un fichier correspondant
      const matchingFile = uploadedFiles.find(file => {
        const matches = this.matchesRequiredFile(file.name, required);
        tested.push({ file: file.name, result: matches });
        return matches;
      });

      if (matchingFile) {
        console.log(`  ✅ TROUVÉ: ${matchingFile.name}`);
        found.push({
          required,
          file: matchingFile
        });
      } else {
        console.log(`  ❌ NON TROUVÉ`);
        missing.push(required);
        
        // Proposer des fichiers proches
        const possibleFiles = uploadedFiles
          .filter(file => {
            const score = this.matchScore(file.name, required);
            return score > 0.3;
          })
          .map(f => f.name);
        
        if (possibleFiles.length > 0) {
          suggestions.push({
            required,
            possibleFiles
          });
        }
      }
      
      details.push({ required, tested });
    });

    console.log('\n=== RÉSUMÉ ===');
    console.log('Trouvés:', found.map(f => `${f.required} → ${f.file.name}`));
    console.log('Manquants:', missing);

    return {
      valid: missing.length === 0,
      missing,
      found,
      suggestions,
      details
    };
  }

  /**
   * Calcule un score de correspondance
   */
  static matchScore(filename: string, required: string): number {
    const baseName = this.getBaseName(filename);
    const cleanFile = this.cleanString(baseName);
    const cleanRequired = this.cleanString(required.replace(/\.\w+$/, ''));
    
    // Correspondance exacte
    if (cleanFile === cleanRequired) return 1.0;
    
    // Contient
    if (cleanFile.includes(cleanRequired)) return 0.9;
    if (cleanRequired.includes(cleanFile)) return 0.8;
    
    // Mappings
    const patternKey = Object.keys(this.NAME_MAPPINGS).find(key => 
      cleanRequired.includes(key) || key.includes(cleanRequired)
    );
    
    if (patternKey) {
      const variants = this.NAME_MAPPINGS[patternKey];
      for (const variant of variants) {
        const cleanVariant = this.cleanString(variant);
        if (cleanFile.includes(cleanVariant) || cleanVariant.includes(cleanFile)) {
          return 0.7;
        }
      }
    }
    
    return 0;
  }

  /**
   * Formate la taille d'un fichier
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Obtient l'icône du fichier
   */
  static getFileIcon(filename: string): string {
    if (filename.toLowerCase().endsWith('.pdf')) return '📄';
    if (filename.toLowerCase().match(/\.(doc|docx)$/)) return '📝';
    if (filename.toLowerCase().match(/\.(xls|xlsx)$/)) return '📊';
    if (filename.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/)) return '🖼️';
    return '📎';
  }
}
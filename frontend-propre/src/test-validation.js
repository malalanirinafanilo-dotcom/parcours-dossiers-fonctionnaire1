// test-validation.js
import { ValidationService } from './services/validationService';

// Simuler des fichiers avec vos noms
const mockFiles = [
  { name: '01_DEMANDE_NOMINATION.pdf' },
  { name: '02_DIPLOMES.pdf' },
  { name: '03_CASIER_JUDICIAIRE.pdf' },
  { name: '04_CERTIFICAT_MEDICAL.pdf' },
  { name: '05_PHOTO_IDENTITE.jpg' },
  { name: '06_ATTESTATION_CONCOURS.pdf' },
  { name: '07_LETTRE_MOTIVATION.pdf' },
  { name: '08_CV.pdf' }
].map(f => new File([], f.name));

const requiredDocs = [
  'demande_nomination.pdf',
  'diplomes.pdf',
  'casier_judiciaire.pdf',
  'certificat_medical.pdf',
  'photo_identite.jpg',
  'attestation_concours.pdf',
  'lettre_motivation.pdf',
  'cv.pdf'
];

console.log('=== TEST DE CORRESPONDANCE ===\n');

// Tester chaque fichier
mockFiles.forEach(file => {
  console.log(`\n📄 Fichier: ${file.name}`);
  requiredDocs.forEach(required => {
    const matches = ValidationService.matchesRequiredFile(file.name, required);
    if (matches) {
      console.log(`  ✅ Correspond avec: ${required}`);
    }
  });
});

// Validation globale
const result = ValidationService.validateRequiredDocuments(requiredDocs, mockFiles);
console.log('\n=== RÉSULTAT GLOBAL ===');
console.log('Documents trouvés:');
result.found.forEach(f => {
  console.log(`  ✅ ${f.required} → ${f.file.name} (confiance: ${Math.round(f.confidence * 100)}%)`);
});
if (result.missing.length > 0) {
  console.log('Documents manquants:', result.missing);
}
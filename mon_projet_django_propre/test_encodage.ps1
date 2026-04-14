# test_encodage.ps1
Write-Host "=== TEST ENCODAGE APRÈS CORRECTION ===" -ForegroundColor Cyan

# Vérifier la configuration de la base
Write-Host "`n1. Configuration de la base:" -ForegroundColor Yellow
psql -U postgres -d gestion_dossiers -c "
SELECT datname, encoding, pg_encoding_to_char(encoding), datcollate, datctype 
FROM pg_database 
WHERE datname = 'gestion_dossiers';
"

# Tester l'insertion de caractères accentués
Write-Host "`n2. Test d'insertion de caractères accentués:" -ForegroundColor Yellow
psql -U postgres -d gestion_dossiers -c "
INSERT INTO core_roles (id, name, code, description) 
VALUES (gen_random_uuid(), 'Intéressé Test', 'TEST_ACCENTS', 'Description avec accents: éèêëàâôùç')
ON CONFLICT (code) DO NOTHING
RETURNING *;
"

# Vérifier la lecture
Write-Host "`n3. Lecture des données:" -ForegroundColor Yellow
psql -U postgres -d gestion_dossiers -c "SELECT * FROM core_roles WHERE code = 'TEST_ACCENTS';"

Write-Host "`n=== FIN DU TEST ===" -ForegroundColor Cyan
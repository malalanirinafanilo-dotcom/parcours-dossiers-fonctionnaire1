# test_encodage_v2.ps1
Write-Host "=== TEST ENCODAGE POSTGRESQL (V2) ===" -ForegroundColor Cyan

# 1. Informations de la base
Write-Host "`n1. Configuration de la base:" -ForegroundColor Yellow
psql -U postgres -d gestion_dossiers -c "
SELECT 
    datname,
    pg_encoding_to_char(encoding) as encoding,
    datcollate as collate,
    datctype as ctype
FROM pg_database 
WHERE datname = 'gestion_dossiers';
"

# 2. Test simple sans UUID
Write-Host "`n2. Test d'insertion simple:" -ForegroundColor Yellow
psql -U postgres -d gestion_dossiers -c "
CREATE TABLE IF NOT EXISTS test_accent (
    id SERIAL PRIMARY KEY,
    texte TEXT
);

INSERT INTO test_accent (texte) VALUES 
    ('Test avec accents: éèêëàâôùç'),
    ('Intéressé Éducation DREN');

SELECT * FROM test_accent;
"

# 3. Nettoyer
psql -U postgres -d gestion_dossiers -c "DROP TABLE test_accent;" 2>$null

Write-Host "`n=== FIN DU TEST ===" -ForegroundColor Cyan
Write-Host "Si vous voyez les accents correctement, l'encodage fonctionne !" -ForegroundColor Green
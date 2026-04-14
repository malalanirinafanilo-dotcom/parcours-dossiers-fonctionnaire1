# show_all_data.ps1
Write-Host "=== APERÇU DE TOUTES VOS DONNÉES POSTGRESQL ===" -ForegroundColor Cyan

# 1. Connexion à PostgreSQL
$connection = "psql -U postgres -d gestion_dossiers -c"

# 2. Afficher les statistiques
Write-Host "`n📊 STATISTIQUES GÉNÉRALES:" -ForegroundColor Yellow
& $connection "SELECT 
    (SELECT COUNT(*) FROM dossiers_dossiers) as total_dossiers,
    (SELECT COUNT(*) FROM dossiers_fonctionnaires) as total_fonctionnaires,
    (SELECT COUNT(*) FROM dossiers_documents) as total_documents,
    (SELECT COUNT(*) FROM core_users) as total_utilisateurs,
    (SELECT COUNT(*) FROM core_roles) as total_roles;"

# 3. Afficher les 5 derniers dossiers
Write-Host "`n📁 5 DERNIERS DOSSIERS:" -ForegroundColor Yellow
& $connection "SELECT 
    id, 
    numero_dossier, 
    titre, 
    statut, 
    etape_actuelle,
    date_depot
FROM dossiers_dossiers 
ORDER BY date_depot DESC 
LIMIT 5;"

# 4. Afficher les documents
Write-Host "`n📄 DOCUMENTS:" -ForegroundColor Yellow
& $connection "SELECT 
    d.id,
    d.nom,
    d.type_document,
    d.fichier,
    dos.numero_dossier as dossier
FROM dossiers_documents d
JOIN dossiers_dossiers dos ON d.dossier_id = dos.id
ORDER BY d.created_at DESC
LIMIT 5;"

# 5. Afficher les utilisateurs
Write-Host "`n👤 UTILISATEURS:" -ForegroundColor Yellow
& $connection "SELECT 
    u.email,
    u.first_name,
    u.last_name,
    r.code as role,
    u.is_active
FROM core_users u
LEFT JOIN core_roles r ON u.role_id = r.id
ORDER BY u.created_at;"

# 6. Afficher l'historique récent
Write-Host "`n📋 HISTORIQUE RÉCENT:" -ForegroundColor Yellow
& $connection "SELECT 
    h.action,
    h.etape,
    h.commentaire,
    u.email as utilisateur,
    h.created_at
FROM dossiers_historique h
LEFT JOIN core_users u ON h.user_id = u.id
ORDER BY h.created_at DESC
LIMIT 10;"

Write-Host "`n=== FIN ===" -ForegroundColor Cyan
-- Création de la base de données
CREATE DATABASE gestion_dossiers
    WITH OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'fr_FR.UTF-8'
    LC_CTYPE = 'fr_FR.UTF-8';

\c gestion_dossiers;

-- Création des tables
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nom_role VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    password VARCHAR(128) NOT NULL,
    last_login TIMESTAMP,
    is_superuser BOOLEAN DEFAULT FALSE,
    username VARCHAR(150) UNIQUE NOT NULL,
    first_name VARCHAR(150),
    last_name VARCHAR(150),
    email VARCHAR(254) UNIQUE NOT NULL,
    is_staff BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    date_joined TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role_id INTEGER REFERENCES roles(id),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fonctionnaires (
    id SERIAL PRIMARY KEY,
    matricule VARCHAR(100) UNIQUE,
    numero_bin VARCHAR(100),
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    date_naissance DATE,
    lieu_naissance VARCHAR(150),
    sexe VARCHAR(20),
    adresse TEXT,
    telephone VARCHAR(50),
    email_professionnel VARCHAR(150),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dossiers (
    id SERIAL PRIMARY KEY,
    fonctionnaire_id INTEGER REFERENCES fonctionnaires(id) ON DELETE CASCADE,
    type_dossier VARCHAR(50) NOT NULL,
    reference VARCHAR(150),
    statut_global VARCHAR(50) DEFAULT 'EN_COURS',
    cree_par_id INTEGER REFERENCES users(id),
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dossier_data (
    id SERIAL PRIMARY KEY,
    dossier_id INTEGER UNIQUE REFERENCES dossiers(id) ON DELETE CASCADE,
    data JSONB NOT NULL
);

CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    dossier_id INTEGER REFERENCES dossiers(id) ON DELETE CASCADE,
    type_document VARCHAR(100),
    fichier VARCHAR(100) NOT NULL,
    date_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE workflow (
    id SERIAL PRIMARY KEY,
    dossier_id INTEGER REFERENCES dossiers(id) ON DELETE CASCADE,
    etape_actuelle VARCHAR(50),
    statut_etape VARCHAR(50) DEFAULT 'EN_COURS',
    commentaire TEXT,
    valide_par_id INTEGER REFERENCES users(id),
    date_debut TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_fin TIMESTAMP
);

CREATE TABLE ia_analyses (
    id SERIAL PRIMARY KEY,
    dossier_id INTEGER REFERENCES dossiers(id) ON DELETE CASCADE,
    score_risque NUMERIC(5,2),
    prediction_statut VARCHAR(50),
    prediction_delai INTEGER,
    anomalies_detectees TEXT,
    recommandations TEXT,
    date_analyse TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE historique_actions (
    id SERIAL PRIMARY KEY,
    dossier_id INTEGER REFERENCES dossiers(id) ON DELETE CASCADE,
    utilisateur_id INTEGER REFERENCES users(id),
    action TEXT,
    date_action TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Création des index pour performance
CREATE INDEX idx_dossiers_type ON dossiers(type_dossier);
CREATE INDEX idx_dossiers_statut ON dossiers(statut_global);
CREATE INDEX idx_dossiers_fonctionnaire ON dossiers(fonctionnaire_id);
CREATE INDEX idx_workflow_dossier ON workflow(dossier_id);
CREATE INDEX idx_ia_analyses_dossier ON ia_analyses(dossier_id);
CREATE INDEX idx_historique_dossier ON historique_actions(dossier_id);
CREATE INDEX idx_dossier_data_gin ON dossier_data USING GIN (data);

-- Insertion des rôles par défaut
INSERT INTO roles (nom_role) VALUES 
    ('ADMIN'),
    ('DREN'),
    ('MEN'),
    ('FOP'),
    ('FINANCE'),
    ('AGENT');
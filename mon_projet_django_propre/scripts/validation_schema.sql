CREATE TABLE FONCTIONNAIRE (
    matricule_fonctionnaire VARCHAR(50) PRIMARY KEY,
    nom_fonctionnaire VARCHAR(100) NOT NULL,
    prenom_fonctionnaire VARCHAR(100) NOT NULL,
    date_naissance DATE,
    categorie VARCHAR(50),
    grade VARCHAR(50)
);

CREATE TABLE ROLE (
    code_role INT PRIMARY KEY,
    nom_role VARCHAR(100) NOT NULL,
    description_role TEXT
);

CREATE TABLE AFFECTER (
    code_role INT NOT NULL,
    matricule_fonctionnaire VARCHAR(50) NOT NULL,
    PRIMARY KEY (code_role, matricule_fonctionnaire),
    FOREIGN KEY (code_role) REFERENCES ROLE(code_role),
    FOREIGN KEY (matricule_fonctionnaire) REFERENCES FONCTIONNAIRE(matricule_fonctionnaire)
);
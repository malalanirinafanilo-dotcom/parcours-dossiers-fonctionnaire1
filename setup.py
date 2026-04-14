from setuptools import setup, find_packages

setup(
    name="mon-gestionnaire-taches",
    version="1.0.0",
    author="Votre Nom",
    author_email="votre.email@example.com",
    description="Un gestionnaire de tâches simple en ligne de commande",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    python_requires=">=3.6",
    entry_points={
        "console_scripts": [
            "gestionnaire-taches=mon_gestionnaire.interface:main",
        ],
    },
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
)
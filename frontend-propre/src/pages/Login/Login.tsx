// src/pages/Login/Login.tsx - Version avec couleurs bleues
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles, Shield, CheckCircle2, Briefcase, GraduationCap, DollarSign, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { login } from '../../store/authSlice';
import { AppDispatch } from '../../store';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Email invalide').required('Email requis'),
  password: Yup.string().min(6, '6 caractères minimum').required('Mot de passe requis'),
});

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredAccount, setHoveredAccount] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleSubmit = async (values: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      await dispatch(login(values)).unwrap();
      toast.success('Connexion réussie');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error || 'Email ou mot de passe incorrect');
    } finally {
      setIsLoading(false);
    }
  };

  const testAccounts = [
    { role: 'Intéressé', email: 'interesse@example.com', icon: Users },
    { role: 'DREN', email: 'dren@example.com', icon: Briefcase },
    { role: 'MEN', email: 'men@example.com', icon: GraduationCap },
    { role: 'FOP', email: 'fop@example.com', icon: Sparkles },
    { role: 'Finance', email: 'finance@example.com', icon: DollarSign },
    { role: 'Admin', email: 'admin@example.com', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-dark-50 dark:bg-dark-950">
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-12">
        <div className="grid w-full max-w-6xl gap-12 lg:grid-cols-2">
          {/* Colonne gauche */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden flex-col justify-center space-y-6 lg:flex"
          >
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg">
              <Sparkles size={24} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold text-dark-900 dark:text-dark-100">
              Gestion des dossiers
              <br />
              <span className="text-primary-600">du fonctionnaire</span>
            </h1>
            <p className="text-lg text-dark-500 dark:text-dark-400">
              Plateforme centralisée de gestion des dossiers administratifs.
              Suivez vos demandes en temps réel à chaque étape du processus de validation.
            </p>

            <div className="space-y-4 pt-6">
              {[
                { icon: CheckCircle2, text: 'Suivi en temps réel' },
                { icon: CheckCircle2, text: 'Workflow transparent' },
                { icon: CheckCircle2, text: 'Sécurité renforcée' },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
                    <item.icon size={16} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <span className="text-dark-700 dark:text-dark-300">{item.text}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 pt-6">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-dark-200 text-xs font-bold text-dark-600 ring-2 ring-white dark:bg-dark-800 dark:text-dark-400 dark:ring-dark-900"
                  >
                    ✓
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-medium text-dark-900 dark:text-dark-100">
                  Plus de <span className="text-primary-600">1000+</span> dossiers traités
                </p>
                <p className="text-xs text-dark-500">Taux de satisfaction 99%</p>
              </div>
            </div>
          </motion.div>

          {/* Colonne droite - Formulaire */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-3xl border border-dark-200 bg-white p-8 shadow-xl dark:border-dark-800 dark:bg-dark-900"
          >
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-dark-900 dark:text-dark-100">Connexion</h2>
              <p className="mt-2 text-sm text-dark-500 dark:text-dark-400">
                Accédez à votre espace sécurisé
              </p>
            </div>

            {/* Comptes de démonstration */}
            <div className="mb-6 rounded-xl bg-dark-50 p-3 dark:bg-dark-800/50">
              <p className="mb-2 text-xs font-medium text-dark-500">Comptes de démonstration :</p>
              <div className="grid grid-cols-3 gap-2">
                {testAccounts.map((acc) => {
                  const Icon = acc.icon;
                  return (
                    <button
                      key={acc.email}
                      onMouseEnter={() => setHoveredAccount(acc.email)}
                      onMouseLeave={() => setHoveredAccount(null)}
                      onClick={() => handleSubmit({ email: acc.email, password: 'password123' })}
                      className={`flex items-center gap-1 rounded-lg p-1.5 text-xs transition-all ${
                        hoveredAccount === acc.email
                          ? 'bg-primary-600 text-white shadow-md'
                          : 'bg-white text-dark-600 hover:bg-dark-100 dark:bg-dark-900'
                      }`}
                    >
                      <Icon size={12} />
                      <span>{acc.role}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Formik
              initialValues={{ email: '', password: '' }}
              validationSchema={LoginSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched }) => (
                <Form className="space-y-5">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">
                      Adresse email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
                      <Field
                        type="email"
                        name="email"
                        className={`w-full rounded-xl border pl-10 pr-4 py-2.5 text-sm text-dark-900 placeholder:text-dark-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-100 ${
                          errors.email && touched.email ? 'border-red-500' : 'border-dark-200'
                        }`}
                        placeholder="nom@exemple.com"
                      />
                    </div>
                    <ErrorMessage name="email" component="p" className="mt-1 text-xs text-red-500" />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
                      <Field
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        className={`w-full rounded-xl border pl-10 pr-12 py-2.5 text-sm text-dark-900 placeholder:text-dark-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-800 dark:bg-dark-900 dark:text-dark-100 ${
                          errors.password && touched.password ? 'border-red-500' : 'border-dark-200'
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-primary-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <ErrorMessage name="password" component="p" className="mt-1 text-xs text-red-500" />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-700 hover:shadow-md disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        Se connecter
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </Form>
              )}
            </Formik>

            <div className="mt-6 text-center">
              <div className="flex items-center justify-center gap-2">
                <Shield size={14} className="text-primary-500" />
                <span className="text-xs text-dark-500 dark:text-dark-400">Connexion sécurisée</span>
                <span className="h-1 w-1 rounded-full bg-dark-300 dark:bg-dark-600" />
                <span className="text-xs text-dark-500 dark:text-dark-400">Chiffrement SSL</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
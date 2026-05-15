import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Eye, EyeOff, Mail, Lock, Shield, CheckCircle2 } from 'lucide-react';
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

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#F9FAFB' }}>
      <div className="w-full max-w-6xl">
        {/* Bannière principale - sans logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
            Gestion des dossiers
          </h1>
          <p className="text-gray-500 text-lg mt-2">du fonctionnaire</p>
          
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-12 h-px bg-gray-200"></div>
            <span className="text-xs text-gray-400 uppercase tracking-wider">Plateforme sécurisée</span>
            <div className="w-12 h-px bg-gray-200"></div>
          </div>
        </motion.div>

        {/* Contenu principal - 2 colonnes */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          
          {/* Colonne gauche - Texte d'accueil */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-4xl font-bold text-gray-800">
                Bonjour<br />et bienvenue
              </h2>
              <div className="w-16 h-1 bg-green-500 rounded-full mt-4"></div>
            </div>
            
            <p className="text-gray-500 leading-relaxed">
              Plateforme centralisée de gestion des dossiers administratifs. 
              Suivez vos demandes en temps réel à chaque étape du processus de validation.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 size={16} className="text-green-600" />
                </div>
                <span className="text-gray-600 text-sm">Suivi en temps réel</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 size={16} className="text-green-600" />
                </div>
                <span className="text-gray-600 text-sm">Workflow transparent</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 size={16} className="text-green-600" />
                </div>
                <span className="text-gray-600 text-sm">Sécurité renforcée</span>
              </div>
            </div>

            {/* Badge de confiance */}
            <div className="flex items-center gap-4 pt-6">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 border-2 border-white">✓</div>
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 border-2 border-white">✓</div>
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 border-2 border-white">✓</div>
              </div>
              <div>
                <p className="text-xs text-gray-500">Plus de <span className="font-semibold text-gray-700">1000+</span> dossiers traités</p>
                <p className="text-xs text-gray-400">Taux de satisfaction 99%</p>
              </div>
            </div>
          </motion.div>

          {/* Colonne droite - Formulaire de connexion */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-semibold text-gray-800">Connexion</h3>
              <p className="text-sm text-gray-500 mt-1">Accédez à votre espace sécurisé</p>
            </div>

            <Formik
              initialValues={{ email: '', password: '' }}
              validationSchema={LoginSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched }) => (
                <Form className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Adresse email
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" size={18} />
                      <Field
                        type="email"
                        name="email"
                        className={`w-full pl-10 pr-3 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                          errors.email && touched.email ? 'border-red-400' : 'border-gray-200'
                        }`}
                        placeholder="nom@exemple.com"
                      />
                    </div>
                    <ErrorMessage name="email" component="p" className="mt-1 text-xs text-red-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Mot de passe
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" size={18} />
                      <Field
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        className={`w-full pl-10 pr-12 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                          errors.password && touched.password ? 'border-red-400' : 'border-gray-200'
                        }`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <ErrorMessage name="password" component="p" className="mt-1 text-xs text-red-500" />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition-all shadow-lg shadow-green-500/20 hover:shadow-xl"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                    ) : (
                      "Se connecter maintenant"
                    )}
                  </button>
                </Form>
              )}
            </Formik>

            {/* Terms et Privacy */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400">
                En cliquant sur "Se connecter maintenant", vous acceptez les<br />
                <span className="text-green-600 hover:text-green-700 cursor-pointer">Conditions d'utilisation</span>
                {' '}et la{' '}
                <span className="text-green-600 hover:text-green-700 cursor-pointer">Politique de confidentialité</span>
              </p>
            </div>

            {/* Indicateur de sécurité */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center gap-2">
              <Shield size={14} className="text-green-500" />
              <span className="text-xs text-gray-400">Connexion sécurisée</span>
              <div className="w-1 h-1 rounded-full bg-gray-300"></div>
              <span className="text-xs text-gray-400">Chiffrement SSL</span>
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-12 pt-6 border-t border-gray-100"
        >
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} - Ministère de l'Éducation Nationale
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
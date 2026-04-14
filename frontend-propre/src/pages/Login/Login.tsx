import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { 
  Eye, 
  EyeOff, 
  LogIn, 
  Mail, 
  Lock, 
  Shield, 
  Users, 
  Briefcase, 
  GraduationCap, 
  DollarSign, 
  Sparkles,
  FolderOpen,  // ⭐ AJOUTER CET IMPORT
  CheckCircle,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { login } from '../../store/authSlice';
import { AppDispatch } from '../../store';

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email invalide')
    .required('Email requis'),
  password: Yup.string()
    .required('Mot de passe requis')
    .min(6, '6 caractères minimum'),
});

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [hoveredAccount, setHoveredAccount] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      const result = await dispatch(login(values)).unwrap();
      if (result) {
        toast.success('Connexion réussie', {
          icon: '🎉',
          style: {
            borderRadius: '10px',
            background: '#22c55e',
            color: '#fff',
          },
        });
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error || 'Email ou mot de passe incorrect');
    }
  };

  const testAccounts = [
    { role: 'Intéressé', email: 'interesse@example.com', icon: Users, color: 'from-green-500 to-green-600' },
    { role: 'DREN', email: 'dren@example.com', icon: Briefcase, color: 'from-green-500 to-green-600' },
    { role: 'MEN', email: 'men@example.com', icon: GraduationCap, color: 'from-green-500 to-green-600' },
    { role: 'FOP', email: 'fop@example.com', icon: Sparkles, color: 'from-green-500 to-green-600' },
    { role: 'Finance', email: 'finance@example.com', icon: DollarSign, color: 'from-green-500 to-green-600' },
    { role: 'Admin', email: 'admin@example.com', icon: Shield, color: 'from-green-500 to-green-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Éléments décoratifs animés */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      {/* Grille de points décoratifs */}
      <div className="absolute inset-0" style={{ 
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(34, 197, 94, 0.1) 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }}></div>

      <div className="max-w-5xl w-full relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-elevated border border-white/50 overflow-hidden animate-scale-in">
          <div className="flex flex-col md:flex-row">
            {/* Partie gauche - Formulaire de connexion */}
            <div className="md:w-1/2 p-8 lg:p-12">
              <div className="mb-8 text-center md:text-left">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg shadow-green-200 mb-4 transform hover:scale-105 transition-transform">
                  <span className="text-3xl font-bold text-white">G</span>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                  Parcours des dossiers
                </h1>
                <h2 className="text-xl text-neutral-600 mt-1">
                  du fonctionnaire
                </h2>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
                  <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse-soft"></span>
                  <span className="text-sm font-medium text-neutral-600">Madagascar</span>
                  <span className="w-3 h-3 rounded-full bg-green-700"></span>
                </div>
              </div>

              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-white rounded-xl border border-green-100">
                <p className="text-xs font-medium text-green-700 mb-2 flex items-center gap-1">
                  <Sparkles size={14} />
                  Comptes de démonstration :
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {testAccounts.map((acc) => {
                    const Icon = acc.icon;
                    return (
                      <div
                        key={acc.email}
                        onMouseEnter={() => setHoveredAccount(acc.email)}
                        onMouseLeave={() => setHoveredAccount(null)}
                        onClick={() => handleSubmit({ email: acc.email, password: 'password123' })}
                        className={`text-xs p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                          hoveredAccount === acc.email
                            ? `bg-gradient-to-r ${acc.color} text-white shadow-lg scale-105`
                            : 'bg-white border border-green-100 text-neutral-600 hover:border-green-200'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <Icon size={12} />
                          <span className="font-medium">{acc.role}</span>
                        </div>
                        <div className="text-[10px] mt-0.5 font-mono opacity-75">
                          {acc.email}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Formik
                initialValues={{ email: '', password: '' }}
                validationSchema={LoginSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, errors, touched }) => (
                  <Form className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="email" className="label">
                        Adresse email professionnelle
                      </label>
                      <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 group-focus-within:text-green-500 transition-colors" size={18} />
                        <Field
                          type="email"
                          name="email"
                          id="email"
                          className={`input pl-10 ${errors.email && touched.email ? 'input-error' : ''}`}
                          placeholder="prenom.nom@education.mg"
                        />
                      </div>
                      <ErrorMessage name="email">
                        {(msg) => <p className="mt-1 text-xs text-error-600">{msg}</p>}
                      </ErrorMessage>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="password" className="label">
                        Mot de passe
                      </label>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 group-focus-within:text-green-500 transition-colors" size={18} />
                        <Field
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          id="password"
                          className={`input pl-10 pr-12 ${errors.password && touched.password ? 'input-error' : ''}`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-green-600 transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <ErrorMessage name="password">
                        {(msg) => <p className="mt-1 text-xs text-error-600">{msg}</p>}
                      </ErrorMessage>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary w-full flex items-center justify-center gap-2 group"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Connexion...</span>
                        </>
                      ) : (
                        <>
                          <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
                          <span>Se connecter</span>
                        </>
                      )}
                    </button>
                  </Form>
                )}
              </Formik>
            </div>

            {/* Partie droite - Image/Illustration */}
            <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-green-600 to-green-500 p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
              
              {/* Éléments décoratifs */}
              <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white/20 rounded-full"></div>
              <div className="absolute bottom-10 right-10 w-48 h-48 border-2 border-white/20 rounded-full"></div>
              <div className="absolute top-1/2 left-1/4 w-16 h-16 border-2 border-white/20 transform rotate-45"></div>
              
              <div className="relative z-10 h-full flex flex-col items-center justify-center text-white">
                <h2 className="text-3xl font-bold mb-4 text-center">Bienvenue dans</h2>
                <h1 className="text-4xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-green-100">
                  Parcours des dossiers
                </h1>
                <h3 className="text-2xl font-semibold mb-8">du fonctionnaire</h3>
                
                <div className="space-y-6 mt-8 w-full">
                  <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 animate-slide-up">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <FolderOpen size={20} />
                    </div>
                    <div>
                      <p className="font-semibold">Suivez vos dossiers</p>
                      <p className="text-sm text-green-100">En temps réel</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <CheckCircle size={20} />
                    </div>
                    <div>
                      <p className="font-semibold">Validation simplifiée</p>
                      <p className="text-sm text-green-100">Workflow intégré</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Zap size={20} />
                    </div>
                    <div>
                      <p className="font-semibold">IA prédictive</p>
                      <p className="text-sm text-green-100">Anticipez les délais</p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 text-center">
                  <p className="text-sm text-green-100">
                    Fitiavana • Fahamarinana • Fandrosoana
                  </p>
                  <div className="flex justify-center gap-2 mt-3">
                    <span className="w-2 h-2 rounded-full bg-white"></span>
                    <span className="w-2 h-2 rounded-full bg-white/50"></span>
                    <span className="w-2 h-2 rounded-full bg-green-300"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-center text-xs text-neutral-500 mt-4">
          © 2024 - Ministère de l'Éducation Nationale - Madagascar
        </p>
      </div>
    </div>
  );
};

export default Login;
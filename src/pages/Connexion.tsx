/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useUser, validateBeninPhone } from '../UserContext';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Lock,
  LogIn, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  MailCheck,
  LogOut,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';

export default function Connexion() {
  const { customer, registerCustomer, loginCustomer, resendConfirmationEmail, logoutCustomer, deleteOwnAccount } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  // Active form view: 'login' or 'signup'
  const [activeForm, setActiveForm] = useState<'login' | 'signup'>('signup');

  // Input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  
  // Custom states for messages
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [phoneHelp, setPhoneHelp] = useState<{ isValid?: boolean; message?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState<string | null>(null);
  const [needsConfirmationLogin, setNeedsConfirmationLogin] = useState(false);
  const [resending, setResending] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    setErrorMsg('');
    const res = await deleteOwnAccount();
    setDeletingAccount(false);
    if (res.success) {
      navigate('/');
    } else {
      setErrorMsg(res.error || 'Impossible de supprimer le compte pour le moment.');
      setConfirmDelete(false);
    }
  };

  // Dynamic phone validation live check
  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (!val.trim()) {
      setPhoneHelp({});
      return;
    }
    const res = validateBeninPhone(val);
    setPhoneHelp({ isValid: res.isValid, message: res.message });
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setErrorMsg("Veuillez renseigner tous les champs obligatoires (*).");
      return;
    }

    const phoneRes = validateBeninPhone(phone);
    if (!phoneRes.isValid) {
      setErrorMsg(phoneRes.message);
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setSubmitting(true);
    const res = await registerCustomer(name, email, phone, password, address);
    setSubmitting(false);

    if (res.success) {
      if (res.needsEmailConfirmation) {
        setAwaitingConfirmation(email.trim().toLowerCase());
      } else {
        setSuccessMsg("Votre compte client Aliyota a été créé avec succès ! Bienvenue ! 🎉");
        setTimeout(() => {
          navigate(redirectPath);
        }, 1500);
      }
    } else {
      setErrorMsg(res.error || "Une erreur est survenue lors de l'enregistrement.");
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setNeedsConfirmationLogin(false);

    if (!email.trim() || !password.trim()) {
      setErrorMsg("Veuillez renseigner votre email et votre mot de passe.");
      return;
    }

    setSubmitting(true);
    const res = await loginCustomer(email, password);
    setSubmitting(false);

    if (res.success) {
      setSuccessMsg("Ravi de vous revoir ! Connexion réussie... 🥛");
      setTimeout(() => {
        navigate(redirectPath);
      }, 1500);
    } else {
      setErrorMsg(res.error || "Une erreur est survenue lors de la connexion.");
      if (res.needsEmailConfirmation) {
        setNeedsConfirmationLogin(true);
      }
    }
  };

  const handleResend = async (targetEmail: string) => {
    setResending(true);
    const res = await resendConfirmationEmail(targetEmail);
    setResending(false);
    if (res.success) {
      setSuccessMsg("Email de confirmation renvoyé ! Vérifiez votre boîte mail.");
    } else {
      setErrorMsg(res.error || "Impossible de renvoyer l'email pour le moment.");
    }
  };

  // Screen shown right after signup when email confirmation is required
  if (awaitingConfirmation) {
    return (
      <div className="pt-36 pb-24 bg-[#FAFAF8] min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[36px] p-8 md:p-10 border border-gray-100 shadow-xl text-center"
        >
          <div className="w-16 h-16 bg-[#F0F7F5] rounded-full flex items-center justify-center mx-auto mb-6 text-2xl border border-emerald-100">
            <MailCheck className="w-7 h-7 text-[#1E3F37]" />
          </div>
          <span className="text-[10px] font-black uppercase text-accent bg-accent/15 px-3 py-1 rounded-md border border-accent/20">
            Dernière étape
          </span>
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mt-4">
            Confirmez votre email
          </h2>
          <p className="text-sm text-gray-500 font-semibold mt-3 leading-relaxed">
            Nous avons envoyé un lien de confirmation à <strong className="text-gray-800">{awaitingConfirmation}</strong>. Cliquez sur ce lien pour activer votre compte Aliyota, puis revenez vous connecter.
          </p>

          {successMsg && (
            <p className="mt-4 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-150 rounded-xl p-3">
              {successMsg}
            </p>
          )}
          {errorMsg && (
            <p className="mt-4 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3">
              {errorMsg}
            </p>
          )}

          <div className="mt-8 space-y-3">
            <button
              onClick={() => handleResend(awaitingConfirmation)}
              disabled={resending}
              className="w-full bg-[#1E3F37] cursor-pointer text-white py-4 px-6 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#1E3F37]/90 transition-all shadow-md disabled:opacity-60"
            >
              {resending ? 'Envoi...' : "Renvoyer l'email de confirmation"}
            </button>
            <button
              onClick={() => {
                setAwaitingConfirmation(null);
                setActiveForm('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="w-full bg-gray-50 cursor-pointer text-gray-500 py-3 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-100 transition-all"
            >
              J'ai confirmé, me connecter
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // If customer already logged in, show elegant session info
  if (customer) {
    return (
      <div className="pt-36 pb-24 bg-[#FAFAF8] min-h-screen flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[36px] p-8 md:p-10 border border-gray-100 shadow-xl text-center"
        >
          <div className="w-16 h-16 bg-[#F0F7F5] rounded-full flex items-center justify-center mx-auto mb-6 text-2xl border border-emerald-100">
            🇧🇯
          </div>
          <span className="text-[10px] font-black uppercase text-accent bg-accent/15 px-3 py-1 rounded-md border border-accent/20">
            Compte Client Aliyota actif
          </span>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight mt-4">
            Bonjour, {customer.name} !
          </h1>
          <p className="text-xs text-gray-500 font-semibold mt-2 max-w-xs mx-auto">
            Vous êtes connecté avec l'adresse <strong className="text-gray-700">{customer.email}</strong>.
          </p>

          <div className="mt-8 bg-[#FAFAF6] rounded-2xl p-4 border border-gray-150 text-xs text-left space-y-2">
            <p className="text-gray-550 font-bold"><strong className="text-gray-800">Téléphone vérifié :</strong> {customer.phone}</p>
            {customer.address && (
              <p className="text-gray-550 font-bold"><strong className="text-gray-800">Adresse par défaut :</strong> {customer.address}</p>
            )}
          </div>

          <div className="mt-10 space-y-3">
            <Link
              to={redirectPath}
              className="w-full bg-[#1E3F37] text-white py-3.5 px-6 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-[#1E3F37]/90 transition-all shadow-md flex items-center justify-center gap-2"
            >
              Procéder à la commande <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/profil"
              className="w-full bg-white border border-gray-200 text-gray-600 py-3 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              <User className="w-3.5 h-3.5" /> Modifier mon profil
            </Link>

            <button
              onClick={() => logoutCustomer()}
              className="w-full bg-gray-50 text-gray-500 py-3 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" /> Se déconnecter
            </button>

            {errorMsg && (
              <p className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3">
                {errorMsg}
              </p>
            )}

            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-full text-rose-500 py-2 px-6 font-bold uppercase tracking-widest text-[10px] hover:text-rose-600 transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Supprimer définitivement mon compte
              </button>
            ) : (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-center space-y-3">
                <p className="text-xs font-bold text-rose-700">
                  ⚠️ Cette action est irréversible. Votre compte et toutes vos données (commandes, historique) seront supprimés définitivement. Confirmer ?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deletingAccount}
                    className="flex-1 bg-rose-600 text-white py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest disabled:opacity-60"
                  >
                    {deletingAccount ? 'Suppression...' : 'Oui, supprimer'}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 bg-white border border-gray-200 text-gray-500 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-36 pb-24 bg-gradient-to-br from-[#FAFAF5] to-[#eaece6] min-h-screen flex items-center justify-center px-4">
      <div className="max-w-xl w-full">
        
        {/* Aliyota Brand Greeting */}
        <div className="text-center mb-8">
          <span className="text-3xl block filter drop-shadow-sm mb-3">🌸</span>
          <h2 className="text-3xl font-black uppercase tracking-tight text-gray-900">Espace Client Aliyota</h2>
          <p className="text-xs font-bold text-gray-550 uppercase tracking-widest mt-1">
            Produits laitiers & yaourts moussés artisanaux béninois
          </p>
        </div>

        {/* Form Container */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[36px] shadow-2xl border border-gray-100 overflow-hidden"
        >
          {/* Top Tabs */}
          <div className="flex border-b border-gray-150 bg-gray-50">
            <button
              onClick={() => {
                setActiveForm('signup');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`w-1/2 py-5 font-black uppercase text-xs tracking-widest border-b-4 transition-all flex items-center justify-center gap-2 ${
                activeForm === 'signup'
                  ? 'border-[#1E3F37] text-[#1E3F37] bg-white'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              <Sparkles className="w-4 h-4 text-accent" /> Créer mon compte
            </button>
            <button
              onClick={() => {
                setActiveForm('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`w-1/2 py-5 font-black uppercase text-xs tracking-widest border-b-4 transition-all flex items-center justify-center gap-2 ${
                activeForm === 'login'
                  ? 'border-[#1E3F37] text-[#1E3F37] bg-white'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              <LogIn className="w-4 h-4 text-[#1E3F37]" /> Se connecter
            </button>
          </div>

          <div className="p-8 md:p-10">
            
            {/* Notifications */}
            <AnimatePresence mode="wait">
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-xs font-bold mb-6 flex items-start gap-2.5 text-left"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}

              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-emerald-55 bg-emerald-50 border border-emerald-150 text-emerald-800 p-4 rounded-2xl text-xs font-bold mb-6 flex items-start gap-2.5 text-left"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                  <span>{successMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* TAB CONTENT: SIGNUP */}
            {activeForm === 'signup' && (
              <form onSubmit={handleSignupSubmit} className="space-y-6 text-left">
                
                {/* Information Header */}
                <div className="bg-[#FAFAF6] rounded-2xl p-4 border border-gray-150 text-xs text-gray-600 leading-relaxed font-semibold">
                  🌿 <span className="font-extrabold text-[#1E3F37]">Directives Aliyota :</span> Un compte client est indispensable pour passer commande. Votre numéro béninois doit impérativement débuter par <strong className="text-[#1E3F37]">01</strong> conformément au plan de numérotation national mobile en vigueur !
                </div>

                {/* Nom */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black tracking-widest text-gray-405 text-gray-400">Nom et Prénom *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                      <User className="w-4 h-4" />
                    </span>
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Afiwa Tossou"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E3F37]/30 focus:border-[#1E3F37] transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">Adresse Email *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre-email@exemple.com"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E3F37]/30 focus:border-[#1E3F37] transition-all"
                    />
                  </div>
                </div>

                {/* Téléphone (with 01 verification) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">Numéro de téléphone Bénin *</label>
                    <span className="text-[9px] bg-emerald-50 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded border border-emerald-100 uppercase">
                      Plan National mobile 🇧🇯
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input 
                      type="tel" 
                      required
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="01 40 40 40 40 (Commence par 01)"
                      className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl text-sm font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E3F37]/30 transition-all ${
                        phoneHelp.isValid === true 
                          ? 'border-emerald-500 bg-emerald-50/10' 
                          : phoneHelp.isValid === false 
                            ? 'border-rose-450 border-rose-400 bg-rose-50/10' 
                            : 'border-gray-200'
                      }`}
                    />
                  </div>

                  {phoneHelp.message && (
                    <p className={`text-[10px] font-black leading-tight flex items-center gap-1.5 mt-1 ${
                      phoneHelp.isValid ? 'text-emerald-700' : 'text-rose-600'
                    }`}>
                      {phoneHelp.isValid ? '✓' : '⚠️'} {phoneHelp.message}
                    </p>
                  )}
                </div>

                {/* Mot de passe */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">Mot de passe *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input 
                      type={showSignupPassword ? 'text' : 'password'} 
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="6 caractères minimum"
                      className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E3F37]/30 focus:border-[#1E3F37] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword((v) => !v)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                    >
                      {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Adresse par défaut (Facultative) */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">Adresse de Livraison (Optionnelle)</label>
                  <div className="relative">
                    <span className="absolute top-3 left-3.5 text-gray-400 pointer-events-none">
                      <MapPin className="w-4 h-4" />
                    </span>
                    <input 
                      type="text" 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Ex: Fidjrossè, Cotonou, en face de la pharmacie"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E3F37]/30 focus:border-[#1E3F37] transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-8 bg-[#1E3F37] hover:bg-[#1E3F37]/90 text-white font-black py-4 rounded-xl shadow-lg transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <ShieldCheck className="w-4 h-4 text-accent" /> {submitting ? 'Création en cours...' : "Valider mon inscription et Commander"}
                </button>
              </form>
            )}

            {/* TAB CONTENT: LOGIN */}
            {activeForm === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-6 text-left">
                
                <div className="bg-[#F0F7F5] rounded-2xl p-4 border border-emerald-100 text-xs text-emerald-800 leading-relaxed font-semibold">
                  🔑 Saisissez vos identifiants de compte pour charger instantanément vos commandes précédentes et suivre leur statut de livraison !
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">Adresse Email</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre-email@exemple.com"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E3F37]/30"
                    />
                  </div>
                </div>

                {/* Mot de passe */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black tracking-widest text-gray-400">Mot de passe</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input 
                      type={showLoginPassword ? 'text' : 'password'} 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Votre mot de passe"
                      className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E3F37]/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword((v) => !v)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {needsConfirmationLogin && (
                    <button
                      type="button"
                      onClick={() => handleResend(email)}
                      disabled={resending}
                      className="text-[10px] font-black text-[#1E3F37] underline mt-1 disabled:opacity-60"
                    >
                      {resending ? 'Envoi...' : "Renvoyer l'email de confirmation"}
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-8 bg-[#1E3F37] hover:bg-[#1e3f37]/90 text-white font-black py-4 rounded-xl shadow-lg transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <LogIn className="w-4 h-4" /> {submitting ? 'Connexion...' : 'Se connecter'}
                </button>
              </form>
            )}

          </div>
        </motion.div>

        {/* Guest fallback button */}
        <div className="mt-8 text-center text-xs font-bold text-gray-400 flex items-center justify-center gap-1">
          <span>Vous souhaitez revoir nos produits ?</span>
          <Link to="/produits" className="text-[#1E3F37] hover:underline flex items-center gap-1">
            <ShoppingBag className="w-3.5 h-3.5" /> Visiter la boutique
          </Link>
        </div>

      </div>
    </div>
  );
}

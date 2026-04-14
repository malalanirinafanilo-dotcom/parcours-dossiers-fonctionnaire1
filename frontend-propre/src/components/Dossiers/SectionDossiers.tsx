import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  Eye, 
  FileText, 
  User, 
  Calendar,
  RotateCcw 
} from 'lucide-react';
import { Dossier } from '../../types';
import StatusChip from '../Common/StatusChip';
import { getCodeInfo } from '../../utils/codesMouvementComplet';

interface SectionDossiersProps {
  titre: string;
  compteur: number;
  dossiers: Dossier[];
  couleur: string;
  icone: React.ReactNode;
  type: string;
  limit?: number;
}

const SectionDossiers: React.FC<SectionDossiersProps> = ({
  titre,
  compteur,
  dossiers,
  couleur,
  icone,
  type,
  limit = 5
}) => {
  const navigate = useNavigate();
  const dossiersAffiches = dossiers.slice(0, limit);

  const getGradientColor = () => {
    switch (couleur) {
      case 'vert': return 'from-green-500 to-green-600';
      case 'bleu': return 'from-blue-500 to-blue-600';
      case 'violet': return 'from-purple-500 to-purple-600';
      case 'orange': return 'from-orange-500 to-orange-600';
      case 'rouge': return 'from-red-500 to-red-600';
      default: return 'from-green-500 to-green-600';
    }
  };

  const getBgColor = () => {
    switch (couleur) {
      case 'vert': return 'bg-green-50';
      case 'bleu': return 'bg-blue-50';
      case 'violet': return 'bg-purple-50';
      case 'orange': return 'bg-orange-50';
      case 'rouge': return 'bg-red-50';
      default: return 'bg-green-50';
    }
  };

  return (
    <div className="card overflow-hidden">
      {/* En-tête de section */}
      <div className={`flex items-center justify-between p-4 ${getBgColor()} rounded-t-xl border-b border-neutral-200`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${getGradientColor()} flex items-center justify-center text-white shadow-lg`}>
            {icone}
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900">{titre}</h3>
            <p className="text-sm text-neutral-600">
              {compteur} dossier{compteur > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        {dossiers.length > limit && (
          <button
            onClick={() => navigate(`/dossiers?section=${type}`)}
            className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1 font-medium"
          >
            Voir tout
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      {/* Liste des dossiers */}
      <div className="divide-y divide-neutral-100">
        {dossiersAffiches.length > 0 ? (
          dossiersAffiches.map((dossier) => {
            const codeInfo = getCodeInfo(dossier.code_mouvement || '');
            const estRejete = dossier.motif_rejet !== null && dossier.motif_rejet !== '';
            
            return (
              <div
                key={dossier.id}
                onClick={() => navigate(`/dossiers/${dossier.id}`)}
                className="p-4 hover:bg-green-50 cursor-pointer transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-mono text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                        {dossier.numero_dossier}
                      </span>
                      <StatusChip status={dossier.statut} size="sm" />
                      {estRejete && (
                        <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1">
                          <RotateCcw size={10} />
                          Rejeté
                        </span>
                      )}
                    </div>
                    
                    <h4 className="font-medium text-neutral-900 text-sm mb-1">{dossier.titre}</h4>
                    
                    <div className="flex items-center gap-3 text-xs text-neutral-600">
                      <span className="flex items-center gap-1">
                        <User size={12} className="text-green-500" />
                        {dossier.fonctionnaire_nom} {dossier.fonctionnaire_prenom}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-green-500" />
                        {new Date(dossier.date_depot).toLocaleDateString('fr-FR')}
                      </span>
                      {codeInfo && (
                        <span className="bg-neutral-100 px-2 py-0.5 rounded-full text-[10px]">
                          {codeInfo.code}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/dossiers/${dossier.id}`);
                    }}
                    className="p-1.5 hover:bg-white rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Voir les détails"
                  >
                    <Eye size={16} className="text-neutral-400 hover:text-green-600" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-neutral-500">
            <FileText size={24} className="mx-auto mb-2 text-neutral-300" />
            <p className="text-sm">Aucun dossier dans cette section</p>
          </div>
        )}
      </div>

      {/* Pied de section avec compteur */}
      {dossiers.length > 0 && (
        <div className="p-3 bg-neutral-50 border-t border-neutral-100 text-center">
          <span className="text-xs text-neutral-600">
            {dossiers.length} dossier{dossiers.length > 1 ? 's' : ''} au total
          </span>
        </div>
      )}
    </div>
  );
};

export default SectionDossiers;
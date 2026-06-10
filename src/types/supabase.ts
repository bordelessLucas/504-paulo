export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRoleEnum =
  | "colaborador"
  | "supervisor"
  | "gestor"
  | "gerente"
  | "rh"
  | "ceo"
  | "admin";

export type TipoAvaliacaoEnum = "quinzenal" | "semestral" | "anual";

export type TipoBeneficioAnualEnum =
  | "reajuste"
  | "plr"
  | "bonificacao"
  | "nenhum";

export type StatusSolicitacaoSalarialEnum =
  | "pendente_rh"
  | "pendente_ceo"
  | "aprovado"
  | "recusado";

export type TipoIncidenteEnum = "acidente_sms" | "no_show" | "advertencia";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nome: string;
          data_nascimento: string | null;
          funcao: string | null;
          classificacao: string | null;
          nivel_irata: string | null;
          data_admissao: string | null;
          departamento: string | null;
          ddd: string | null;
          telefone: string | null;
          expertise: string | null;
          formacao_tecnica: string | null;
          certificacao_edn: boolean;
          status: string | null;
          avatar_url: string | null;
          role: UserRoleEnum;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          nome: string;
          data_nascimento?: string | null;
          funcao?: string | null;
          classificacao?: string | null;
          nivel_irata?: string | null;
          data_admissao?: string | null;
          departamento?: string | null;
          ddd?: string | null;
          telefone?: string | null;
          expertise?: string | null;
          formacao_tecnica?: string | null;
          certificacao_edn?: boolean;
          status?: string | null;
          avatar_url?: string | null;
          role?: UserRoleEnum;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          data_nascimento?: string | null;
          funcao?: string | null;
          classificacao?: string | null;
          nivel_irata?: string | null;
          data_admissao?: string | null;
          departamento?: string | null;
          ddd?: string | null;
          telefone?: string | null;
          expertise?: string | null;
          formacao_tecnica?: string | null;
          certificacao_edn?: boolean;
          status?: string | null;
          avatar_url?: string | null;
          role?: UserRoleEnum;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "auth.users";
            referencedColumns: ["id"];
          },
        ];
      };

      perguntas: {
        Row: {
          id: string;
          codigo: string | null;
          descricao: string;
          secao_departamento: string | null;
          peso: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          codigo?: string | null;
          descricao: string;
          secao_departamento?: string | null;
          peso?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          codigo?: string | null;
          descricao?: string;
          secao_departamento?: string | null;
          peso?: number;
          created_at?: string;
        };
        Relationships: [];
      };

      avaliacoes: {
        Row: {
          id: string;
          avaliador_id: string | null;
          avaliado_id: string;
          tipo: TipoAvaliacaoEnum;
          created_at: string;
        };
        Insert: {
          id?: string;
          avaliador_id?: string | null;
          avaliado_id: string;
          tipo: TipoAvaliacaoEnum;
          created_at?: string;
        };
        Update: {
          id?: string;
          avaliador_id?: string | null;
          avaliado_id?: string;
          tipo?: TipoAvaliacaoEnum;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "avaliacoes_avaliador_id_fkey";
            columns: ["avaliador_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "avaliacoes_avaliado_id_fkey";
            columns: ["avaliado_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      respostas: {
        Row: {
          id: string;
          avaliacao_id: string;
          pergunta_id: string | null;
          nota: number | null;
          justificativa: string | null;
          evidencia: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          avaliacao_id: string;
          pergunta_id?: string | null;
          nota?: number | null;
          justificativa?: string | null;
          evidencia?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          avaliacao_id?: string;
          pergunta_id?: string | null;
          nota?: number | null;
          justificativa?: string | null;
          evidencia?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "respostas_avaliacao_avaliacao_id_fkey";
            columns: ["avaliacao_id"];
            referencedRelation: "avaliacoes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "respostas_avaliacao_pergunta_id_fkey";
            columns: ["pergunta_id"];
            referencedRelation: "perguntas";
            referencedColumns: ["id"];
          },
        ];
      };

      decisoes_anuais_estrategicas: {
        Row: {
          id: string;
          colaborador_id: string;
          decidido_por_id: string;
          ano_referencia: number;
          tipo_beneficio: TipoBeneficioAnualEnum;
          justificativa_financeira: string;
          media_quinzenal_ano: number | null;
          media_semestral_ano: number | null;
          avaliacao_anual_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          colaborador_id: string;
          decidido_por_id: string;
          ano_referencia: number;
          tipo_beneficio: TipoBeneficioAnualEnum;
          justificativa_financeira: string;
          media_quinzenal_ano?: number | null;
          media_semestral_ano?: number | null;
          avaliacao_anual_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          colaborador_id?: string;
          decidido_por_id?: string;
          ano_referencia?: number;
          tipo_beneficio?: TipoBeneficioAnualEnum;
          justificativa_financeira?: string;
          media_quinzenal_ano?: number | null;
          media_semestral_ano?: number | null;
          avaliacao_anual_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "decisoes_anuais_colaborador_id_fkey";
            columns: ["colaborador_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "decisoes_anuais_decidido_por_id_fkey";
            columns: ["decidido_por_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "decisoes_anuais_avaliacao_anual_id_fkey";
            columns: ["avaliacao_anual_id"];
            referencedRelation: "avaliacoes";
            referencedColumns: ["id"];
          },
        ];
      };

      incidentes: {
        Row: {
          id: string;
          colaborador_id: string;
          registrado_por_id: string;
          tipo_incidente: TipoIncidenteEnum;
          data_ocorrencia: string;
          descricao: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          colaborador_id: string;
          registrado_por_id: string;
          tipo_incidente: TipoIncidenteEnum;
          data_ocorrencia: string;
          descricao: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          colaborador_id?: string;
          registrado_por_id?: string;
          tipo_incidente?: TipoIncidenteEnum;
          data_ocorrencia?: string;
          descricao?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "incidentes_colaborador_id_fkey";
            columns: ["colaborador_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "incidentes_registrado_por_id_fkey";
            columns: ["registrado_por_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      melhorias_salariais: {
        Row: {
          id: string;
          colaborador_id: string;
          gerente_id: string | null;
          justificativa: string;
          status: StatusSolicitacaoSalarialEnum;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          colaborador_id: string;
          gerente_id?: string | null;
          justificativa: string;
          status?: StatusSolicitacaoSalarialEnum;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          colaborador_id?: string;
          gerente_id?: string | null;
          justificativa?: string;
          status?: StatusSolicitacaoSalarialEnum;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "melhorias_colaborador_id_fkey";
            columns: ["colaborador_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "melhorias_gerente_id_fkey";
            columns: ["gerente_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      avaliacoes_masked: {
        Row: {
          id: string;
          avaliado_id: string;
          tipo: TipoAvaliacaoEnum;
          created_at: string;
        };
        Relationships: [];
      };
      respostas_masked: {
        Row: {
          id: string;
          avaliacao_id: string;
          pergunta_id: string | null;
          nota: number | null;
          justificativa: string | null;
          evidencia: string | null;
          created_at: string;
        };
        Relationships: [];
      };
    };
    Functions: {
      get_user_id_by_email: {
        Args: {
          p_email: string;
        };
        Returns: string | null;
      };
    };
    Enums: {
      user_role: UserRoleEnum;
      tipo_avaliacao: TipoAvaliacaoEnum;
      status_solicitacao_salarial: StatusSolicitacaoSalarialEnum;
      tipo_incidente: TipoIncidenteEnum;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type JsonValue = Json;

export type UserRole = UserRoleEnum;
export type TipoAvaliacao = TipoAvaliacaoEnum;
export type TipoBeneficioAnual = TipoBeneficioAnualEnum;
export type StatusSolicitacaoSalarial = StatusSolicitacaoSalarialEnum;
export type TipoIncidente = TipoIncidenteEnum;

// Convenience aliases used across the app
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type PerguntaAvaliacao =
  Database["public"]["Tables"]["perguntas"]["Row"];
export type PerfilAlvo = string;
export type PontoMelhoria = {
  id: string;
  respostaAnteriorId: string;
  perguntaId: string | null;
  descricao: string;
};

export function isGestaoRole(role?: UserRole | null): boolean {
  return role === "gestor" || role === "gerente";
}

export function isSupervisorGestorRole(role?: UserRole | null): boolean {
  return role === "supervisor" || role === "gestor";
}

export function isGerenteRole(role?: UserRole | null): boolean {
  return role === "gerente";
}

export function isAdminDashboardRole(role?: UserRole | null): boolean {
  return role === "rh" || role === "ceo" || role === "admin";
}

export function isGerencialDashboardRole(role?: UserRole | null): boolean {
  return role === "ceo" || role === "admin";
}

export function isPainelAnualEstrategicoRole(role?: UserRole | null): boolean {
  return role === "rh" || role === "ceo" || role === "gerente" || role === "admin";
}

export const TIPO_INCIDENTE_LABELS: Record<TipoIncidente, string> = {
  acidente_sms: "Acidente SMS",
  no_show: "Falta (No-show)",
  advertencia: "Advertência",
};

export const TIPO_BENEFICIO_ANUAL_LABELS: Record<TipoBeneficioAnual, string> = {
  reajuste: "Reajuste",
  plr: "PLR",
  bonificacao: "Bonificação",
  nenhum: "Nenhum",
};

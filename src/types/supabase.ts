export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

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
          status: string | null;
          role: Database["public"]["Enums"]["user_role"];
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
          status?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
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
          status?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
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
          tipo: Database["public"]["Enums"]["tipo_avaliacao"];
          data_criacao: string;
        };
        Insert: {
          id?: string;
          avaliador_id?: string | null;
          avaliado_id: string;
          tipo: Database["public"]["Enums"]["tipo_avaliacao"];
          data_criacao?: string;
        };
        Update: {
          id?: string;
          avaliador_id?: string | null;
          avaliado_id?: string;
          tipo?: Database["public"]["Enums"]["tipo_avaliacao"];
          data_criacao?: string;
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

      melhorias_salariais: {
        Row: {
          id: string;
          colaborador_id: string;
          gerente_id: string | null;
          justificativa: string;
          status: Database["public"]["Enums"]["status_solicitacao_salarial"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          colaborador_id: string;
          gerente_id?: string | null;
          justificativa: string;
          status?: Database["public"]["Enums"]["status_solicitacao_salarial"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          colaborador_id?: string;
          gerente_id?: string | null;
          justificativa?: string;
          status?: Database["public"]["Enums"]["status_solicitacao_salarial"];
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
          tipo: Database["public"]["Enums"]["tipo_avaliacao"];
          data_criacao: string;
        };
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
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role:
        | "colaborador"
        | "supervisor"
        | "gestor"
        | "gerente"
        | "rh"
        | "ceo"
        | "admin";
      tipo_avaliacao: "quinzenal" | "semestral";
      status_solicitacao_salarial:
        | "pendente_rh"
        | "pendente_ceo"
        | "aprovado"
        | "recusado";
    };
  };
};

export type JsonValue = Json;

export type UserRole = Database["public"]["Enums"]["user_role"];
export type TipoAvaliacao = Database["public"]["Enums"]["tipo_avaliacao"];
export type StatusSolicitacaoSalarial =
  Database["public"]["Enums"]["status_solicitacao_salarial"];

// Convenience aliases used across the app
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type PerguntaAvaliacao =
  Database["public"]["Tables"]["perguntas"]["Row"];
export type PerfilAlvo = string;
export type PontoMelhoria = any;

export function isGestaoRole(role?: UserRole | null): boolean {
  return role === "gestor" || role === "gerente";
}

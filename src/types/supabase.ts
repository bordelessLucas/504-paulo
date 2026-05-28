export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.5';
  };
  public: {
    Tables: {
      avaliacoes: {
        Row: {
          avaliado_id: string;
          avaliador_id: string;
          created_at: string;
          data: string;
          id: string;
          tipo: Database['public']['Enums']['tipo_avaliacao'];
        };
        Insert: {
          avaliado_id: string;
          avaliador_id: string;
          created_at?: string;
          data?: string;
          id?: string;
          tipo: Database['public']['Enums']['tipo_avaliacao'];
        };
        Update: {
          avaliado_id?: string;
          avaliador_id?: string;
          created_at?: string;
          data?: string;
          id?: string;
          tipo?: Database['public']['Enums']['tipo_avaliacao'];
        };
        Relationships: [
          {
            foreignKeyName: 'avaliacoes_avaliado_id_fkey';
            columns: ['avaliado_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'avaliacoes_avaliador_id_fkey';
            columns: ['avaliador_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      perguntas_avaliacao: {
        Row: {
          created_at: string;
          id: string;
          perfil_alvo: Database['public']['Enums']['perfil_alvo'];
          peso: number;
          texto_pergunta: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          perfil_alvo: Database['public']['Enums']['perfil_alvo'];
          peso?: number;
          texto_pergunta: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          perfil_alvo?: Database['public']['Enums']['perfil_alvo'];
          peso?: number;
          texto_pergunta?: string;
        };
        Relationships: [];
      };
      pontos_melhoria: {
        Row: {
          avaliado_id: string;
          avaliador_id: string;
          data_criacao: string;
          descricao: string;
          id: string;
          resolvido: boolean;
        };
        Insert: {
          avaliado_id: string;
          avaliador_id: string;
          data_criacao?: string;
          descricao: string;
          id?: string;
          resolvido?: boolean;
        };
        Update: {
          avaliado_id?: string;
          avaliador_id?: string;
          data_criacao?: string;
          descricao?: string;
          id?: string;
          resolvido?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'pontos_melhoria_avaliado_id_fkey';
            columns: ['avaliado_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'pontos_melhoria_avaliador_id_fkey';
            columns: ['avaliador_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          data_admissao: string | null;
          departamento: string | null;
          funcao: string | null;
          id: string;
          nome: string;
          role: Database['public']['Enums']['user_role'];
          status: Database['public']['Enums']['profile_status'];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          data_admissao?: string | null;
          departamento?: string | null;
          funcao?: string | null;
          id: string;
          nome: string;
          role?: Database['public']['Enums']['user_role'];
          status?: Database['public']['Enums']['profile_status'];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          data_admissao?: string | null;
          departamento?: string | null;
          funcao?: string | null;
          id?: string;
          nome?: string;
          role?: Database['public']['Enums']['user_role'];
          status?: Database['public']['Enums']['profile_status'];
          updated_at?: string;
        };
        Relationships: [];
      };
      respostas_avaliacao: {
        Row: {
          avaliacao_id: string;
          comentario: string | null;
          created_at: string;
          id: string;
          nota: number;
          pergunta_id: string;
        };
        Insert: {
          avaliacao_id: string;
          comentario?: string | null;
          created_at?: string;
          id?: string;
          nota: number;
          pergunta_id: string;
        };
        Update: {
          avaliacao_id?: string;
          comentario?: string | null;
          created_at?: string;
          id?: string;
          nota?: number;
          pergunta_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'respostas_avaliacao_avaliacao_id_fkey';
            columns: ['avaliacao_id'];
            isOneToOne: false;
            referencedRelation: 'avaliacoes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'respostas_avaliacao_pergunta_id_fkey';
            columns: ['pergunta_id'];
            isOneToOne: false;
            referencedRelation: 'perguntas_avaliacao';
            referencedColumns: ['id'];
          },
        ];
      };
      solicitacoes_melhoria_salarial: {
        Row: {
          colaborador_id: string;
          created_at: string;
          gerente_id: string;
          id: string;
          justificativa: string;
          status: Database['public']['Enums']['status_solicitacao_salarial'];
          updated_at: string;
        };
        Insert: {
          colaborador_id: string;
          created_at?: string;
          gerente_id: string;
          id?: string;
          justificativa: string;
          status?: Database['public']['Enums']['status_solicitacao_salarial'];
          updated_at?: string;
        };
        Update: {
          colaborador_id?: string;
          created_at?: string;
          gerente_id?: string;
          id?: string;
          justificativa?: string;
          status?: Database['public']['Enums']['status_solicitacao_salarial'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'solicitacoes_melhoria_salarial_colaborador_id_fkey';
            columns: ['colaborador_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'solicitacoes_melhoria_salarial_gerente_id_fkey';
            columns: ['gerente_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
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
      perfil_alvo: 'rh' | 'tecnico' | 'bordo';
      profile_status: 'ativo' | 'ferias' | 'afastado' | 'desligado';
      status_solicitacao_salarial: 'pendente_rh' | 'pendente_ceo' | 'aprovado' | 'recusado';
      tipo_avaliacao: 'quinzenal' | 'semestral' | 'autoavaliacao';
      user_role: 'supervisor' | 'gestor' | 'gerente' | 'colaborador' | 'ceo' | 'admin';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      perfil_alvo: ['rh', 'tecnico', 'bordo'] as const,
      profile_status: ['ativo', 'ferias', 'afastado', 'desligado'] as const,
      status_solicitacao_salarial: [
        'pendente_rh',
        'pendente_ceo',
        'aprovado',
        'recusado',
      ] as const,
      tipo_avaliacao: ['quinzenal', 'semestral', 'autoavaliacao'] as const,
      user_role: [
        'supervisor',
        'gestor',
        'gerente',
        'colaborador',
        'ceo',
        'admin',
      ] as const,
    },
  },
} as const;

// --- Aliases de domínio (uso no app) ---

export type UserRole = Enums<'user_role'>;
export type ProfileStatus = Enums<'profile_status'>;
export type PerfilAlvo = Enums<'perfil_alvo'>;
export type TipoAvaliacao = Enums<'tipo_avaliacao'>;
export type StatusSolicitacaoSalarial = Enums<'status_solicitacao_salarial'>;

export type Profile = Tables<'profiles'>;
export type ProfileInsert = TablesInsert<'profiles'>;
export type ProfileUpdate = TablesUpdate<'profiles'>;

export type PerguntaAvaliacao = Tables<'perguntas_avaliacao'>;
export type PerguntaAvaliacaoInsert = TablesInsert<'perguntas_avaliacao'>;
export type PerguntaAvaliacaoUpdate = TablesUpdate<'perguntas_avaliacao'>;

export type Avaliacao = Tables<'avaliacoes'>;
export type AvaliacaoInsert = TablesInsert<'avaliacoes'>;
export type AvaliacaoUpdate = TablesUpdate<'avaliacoes'>;

export type RespostaAvaliacao = Tables<'respostas_avaliacao'>;
export type RespostaAvaliacaoInsert = TablesInsert<'respostas_avaliacao'>;
export type RespostaAvaliacaoUpdate = TablesUpdate<'respostas_avaliacao'>;

export type PontoMelhoria = Tables<'pontos_melhoria'>;
export type PontoMelhoriaInsert = TablesInsert<'pontos_melhoria'>;
export type PontoMelhoriaUpdate = TablesUpdate<'pontos_melhoria'>;

export type SolicitacaoMelhoriaSalarial = Tables<'solicitacoes_melhoria_salarial'>;
export type SolicitacaoMelhoriaSalarialInsert = TablesInsert<'solicitacoes_melhoria_salarial'>;
export type SolicitacaoMelhoriaSalarialUpdate = TablesUpdate<'solicitacoes_melhoria_salarial'>;

/** Papéis com permissões de gestão (acesso ampliado). */
export const GESTAO_ROLES: readonly UserRole[] = [
  'supervisor',
  'gestor',
  'gerente',
  'ceo',
  'admin',
] as const;

export function isGestaoRole(role: UserRole | null | undefined): boolean {
  return role != null && GESTAO_ROLES.includes(role);
}

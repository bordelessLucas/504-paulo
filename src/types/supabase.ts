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
  | "recusado"
  | "devolvida";

export type StatusValidacaoEnum =
  | "pendente_rh"
  | "pendente_ceo"
  | "aprovada"
  | "recusada"
  | "devolvida";

export type TipoIncidenteEnum = "acidente_sms" | "no_show" | "advertencia";

export type TipoNotificacaoEnum =
  | "avaliacao_registrada"
  | "autoavaliacao_enviada"
  | "solicitacao_reajuste"
  | "solicitacao_pendente_ceo"
  | "solicitacao_aprovada"
  | "solicitacao_recusada"
  | "incidente_registrado"
  | "decisao_anual_registrada"
  | "pdi_criado"
  | "pdi_atualizado"
  | "pdi_vencendo"
  | "pdi_vencido"
  | "pdi_concluido";

export type PdiEixoEnum = "P1" | "P2" | "P3" | "geral";

export type PdiStatusEnum =
  | "aberto"
  | "em_andamento"
  | "concluido"
  | "vencido"
  | "cancelado";

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
          lider_id: string | null;
          ddd: string | null;
          telefone: string | null;
          expertise: string | null;
          formacao_tecnica: string | null;
          certificacao_edn: boolean;
          codigo_interno: string | null;
          plataforma: string | null;
          formacao_academica: string | null;
          certificacoes: string | null;
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
          lider_id?: string | null;
          ddd?: string | null;
          telefone?: string | null;
          expertise?: string | null;
          formacao_tecnica?: string | null;
          certificacao_edn?: boolean;
          codigo_interno?: string | null;
          plataforma?: string | null;
          formacao_academica?: string | null;
          certificacoes?: string | null;
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
          lider_id?: string | null;
          ddd?: string | null;
          telefone?: string | null;
          expertise?: string | null;
          formacao_tecnica?: string | null;
          certificacao_edn?: boolean;
          codigo_interno?: string | null;
          plataforma?: string | null;
          formacao_academica?: string | null;
          certificacoes?: string | null;
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
          status: StatusValidacaoEnum;
          created_at: string;
        };
        Insert: {
          id?: string;
          avaliador_id?: string | null;
          avaliado_id: string;
          tipo: TipoAvaliacaoEnum;
          status?: StatusValidacaoEnum;
          created_at?: string;
        };
        Update: {
          id?: string;
          avaliador_id?: string | null;
          avaliado_id?: string;
          tipo?: TipoAvaliacaoEnum;
          status?: StatusValidacaoEnum;
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

      notificacoes: {
        Row: {
          id: string;
          destinatario_id: string;
          tipo: TipoNotificacaoEnum;
          titulo: string;
          mensagem: string;
          metadata: Json;
          lida: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          destinatario_id: string;
          tipo: TipoNotificacaoEnum;
          titulo: string;
          mensagem: string;
          metadata?: Json;
          lida?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          destinatario_id?: string;
          tipo?: TipoNotificacaoEnum;
          titulo?: string;
          mensagem?: string;
          metadata?: Json;
          lida?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notificacoes_destinatario_id_fkey";
            columns: ["destinatario_id"];
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

      planos_desenvolvimento: {
        Row: {
          id: string;
          colaborador_id: string;
          avaliacao_origem_id: string | null;
          criado_por_id: string;
          eixo: PdiEixoEnum;
          titulo: string;
          descricao: string | null;
          indicador_sucesso: string;
          prazo: string;
          status: PdiStatusEnum;
          progresso_pct: number;
          observacoes_responsavel: string | null;
          observacoes_colaborador: string | null;
          concluido_em: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          colaborador_id: string;
          avaliacao_origem_id?: string | null;
          criado_por_id: string;
          eixo: PdiEixoEnum;
          titulo: string;
          descricao?: string | null;
          indicador_sucesso: string;
          prazo: string;
          status?: PdiStatusEnum;
          progresso_pct?: number;
          observacoes_responsavel?: string | null;
          observacoes_colaborador?: string | null;
          concluido_em?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          colaborador_id?: string;
          avaliacao_origem_id?: string | null;
          criado_por_id?: string;
          eixo?: PdiEixoEnum;
          titulo?: string;
          descricao?: string | null;
          indicador_sucesso?: string;
          prazo?: string;
          status?: PdiStatusEnum;
          progresso_pct?: number;
          observacoes_responsavel?: string | null;
          observacoes_colaborador?: string | null;
          concluido_em?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "planos_desenvolvimento_colaborador_id_fkey";
            columns: ["colaborador_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "planos_desenvolvimento_avaliacao_origem_id_fkey";
            columns: ["avaliacao_origem_id"];
            referencedRelation: "avaliacoes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "planos_desenvolvimento_criado_por_id_fkey";
            columns: ["criado_por_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      pdi_atualizacoes: {
        Row: {
          id: string;
          pdi_id: string;
          autor_id: string;
          status_anterior: string | null;
          status_novo: string | null;
          progresso_anterior: number | null;
          progresso_novo: number | null;
          comentario: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          pdi_id: string;
          autor_id: string;
          status_anterior?: string | null;
          status_novo?: string | null;
          progresso_anterior?: number | null;
          progresso_novo?: number | null;
          comentario?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          pdi_id?: string;
          autor_id?: string;
          status_anterior?: string | null;
          status_novo?: string | null;
          progresso_anterior?: number | null;
          progresso_novo?: number | null;
          comentario?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pdi_atualizacoes_pdi_id_fkey";
            columns: ["pdi_id"];
            referencedRelation: "planos_desenvolvimento";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pdi_atualizacoes_autor_id_fkey";
            columns: ["autor_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      colaborador_potencial: {
        Row: {
          colaborador_id: string;
          potencial: "baixo" | "medio" | "alto";
          avaliado_por_id: string | null;
          observacao: string | null;
          updated_at: string;
        };
        Insert: {
          colaborador_id: string;
          potencial?: "baixo" | "medio" | "alto";
          avaliado_por_id?: string | null;
          observacao?: string | null;
          updated_at?: string;
        };
        Update: {
          colaborador_id?: string;
          potencial?: "baixo" | "medio" | "alto";
          avaliado_por_id?: string | null;
          observacao?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };

      plano_sucessao: {
        Row: {
          id: string;
          posicao_chave: string;
          titular_id: string | null;
          sucessor_1_id: string | null;
          prontidao_s1: string | null;
          sucessor_2_id: string | null;
          prontidao_s2: string | null;
          gap_identificado: string | null;
          acao_desenvolvimento: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          posicao_chave: string;
          titular_id?: string | null;
          sucessor_1_id?: string | null;
          prontidao_s1?: string | null;
          sucessor_2_id?: string | null;
          prontidao_s2?: string | null;
          gap_identificado?: string | null;
          acao_desenvolvimento?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          posicao_chave?: string;
          titular_id?: string | null;
          sucessor_1_id?: string | null;
          prontidao_s1?: string | null;
          sucessor_2_id?: string | null;
          prontidao_s2?: string | null;
          gap_identificado?: string | null;
          acao_desenvolvimento?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      denuncias: {
        Row: {
          id: string;
          id_relato: string;
          data_abertura: string;
          cliente_plataforma: string | null;
          unidade: string | null;
          anonimo: boolean;
          nome_relatante: string | null;
          funcao_relatante: string | null;
          nome_denunciado: string | null;
          funcao_denunciado: string | null;
          tipo_denuncia:
            | "assedio_moral"
            | "assedio_sexual"
            | "desvio_conduta"
            | "risco_vida"
            | "fraude"
            | "discriminacao"
            | "outros"
            | null;
          risco_ocupacional: boolean;
          gravidade: "baixa" | "media" | "alta" | "critica" | null;
          reincidencia: boolean;
          status: "aberto" | "em_analise" | "concluido" | "arquivado";
          prazo_sla: string | null;
          data_fechamento: string | null;
          descricao: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          id_relato: string;
          data_abertura?: string;
          cliente_plataforma?: string | null;
          unidade?: string | null;
          anonimo?: boolean;
          nome_relatante?: string | null;
          funcao_relatante?: string | null;
          nome_denunciado?: string | null;
          funcao_denunciado?: string | null;
          tipo_denuncia?:
            | "assedio_moral"
            | "assedio_sexual"
            | "desvio_conduta"
            | "risco_vida"
            | "fraude"
            | "discriminacao"
            | "outros"
            | null;
          risco_ocupacional?: boolean;
          gravidade?: "baixa" | "media" | "alta" | "critica" | null;
          reincidencia?: boolean;
          status?: "aberto" | "em_analise" | "concluido" | "arquivado";
          prazo_sla?: string | null;
          data_fechamento?: string | null;
          descricao?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          id_relato?: string;
          data_abertura?: string;
          cliente_plataforma?: string | null;
          unidade?: string | null;
          anonimo?: boolean;
          nome_relatante?: string | null;
          funcao_relatante?: string | null;
          nome_denunciado?: string | null;
          funcao_denunciado?: string | null;
          tipo_denuncia?:
            | "assedio_moral"
            | "assedio_sexual"
            | "desvio_conduta"
            | "risco_vida"
            | "fraude"
            | "discriminacao"
            | "outros"
            | null;
          risco_ocupacional?: boolean;
          gravidade?: "baixa" | "media" | "alta" | "critica" | null;
          reincidencia?: boolean;
          status?: "aberto" | "em_analise" | "concluido" | "arquivado";
          prazo_sla?: string | null;
          data_fechamento?: string | null;
          descricao?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      riscos_nr1: {
        Row: {
          id: string;
          id_risco: string;
          data_identificacao: string;
          area_setor: string | null;
          tipo_risco: string | null;
          descricao: string;
          probabilidade: number;
          severidade: number;
          nivel_risco: string | null;
          medida_controle: string | null;
          responsavel_id: string | null;
          prazo: string | null;
          status: "identificado" | "em_tratamento" | "controlado" | "encerrado";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          id_risco: string;
          data_identificacao?: string;
          area_setor?: string | null;
          tipo_risco?: string | null;
          descricao: string;
          probabilidade: number;
          severidade: number;
          nivel_risco?: string | null;
          medida_controle?: string | null;
          responsavel_id?: string | null;
          prazo?: string | null;
          status?: "identificado" | "em_tratamento" | "controlado" | "encerrado";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          id_risco?: string;
          data_identificacao?: string;
          area_setor?: string | null;
          tipo_risco?: string | null;
          descricao?: string;
          probabilidade?: number;
          severidade?: number;
          nivel_risco?: string | null;
          medida_controle?: string | null;
          responsavel_id?: string | null;
          prazo?: string | null;
          status?: "identificado" | "em_tratamento" | "controlado" | "encerrado";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      planos_acao_compliance: {
        Row: {
          id: string;
          id_acao: string;
          origem_tipo: string;
          origem_id: string | null;
          descricao_acao: string;
          responsavel_id: string | null;
          data_inicio: string | null;
          prazo: string | null;
          status: "nao_iniciado" | "em_andamento" | "concluido" | "cancelado";
          conclusao_pct: number;
          evidencia: string | null;
          observacoes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          id_acao: string;
          origem_tipo: string;
          origem_id?: string | null;
          descricao_acao: string;
          responsavel_id?: string | null;
          data_inicio?: string | null;
          prazo?: string | null;
          status?: "nao_iniciado" | "em_andamento" | "concluido" | "cancelado";
          conclusao_pct?: number;
          evidencia?: string | null;
          observacoes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          id_acao?: string;
          origem_tipo?: string;
          origem_id?: string | null;
          descricao_acao?: string;
          responsavel_id?: string | null;
          data_inicio?: string | null;
          prazo?: string | null;
          status?: "nao_iniciado" | "em_andamento" | "concluido" | "cancelado";
          conclusao_pct?: number;
          evidencia?: string | null;
          observacoes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      audit_log: {
        Row: {
          id: string;
          usuario_id: string | null;
          acao: string;
          tabela: string;
          registro_id: string | null;
          campo_alterado: string | null;
          valor_anterior: string | null;
          valor_novo: string | null;
          ip_address: string | null;
          observacao: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          usuario_id?: string | null;
          acao: string;
          tabela: string;
          registro_id?: string | null;
          campo_alterado?: string | null;
          valor_anterior?: string | null;
          valor_novo?: string | null;
          ip_address?: string | null;
          observacao?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          usuario_id?: string | null;
          acao?: string;
          tabela?: string;
          registro_id?: string | null;
          campo_alterado?: string | null;
          valor_anterior?: string | null;
          valor_novo?: string | null;
          ip_address?: string | null;
          observacao?: string | null;
          created_at?: string;
        };
        Relationships: [];
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
      processar_pdis_vencidos: {
        Args: Record<string, never>;
        Returns: number;
      };
      processar_alertas_pdi_vencendo: {
        Args: {
          p_dias?: number;
        };
        Returns: number;
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

export function isRhRole(role?: UserRole | null): boolean {
  return role === "rh";
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

/** Somente RH, CEO e Admin registram o veredito financeiro anual. */
export function canRegistrarDecisaoAnualRole(role?: UserRole | null): boolean {
  return isRhRole(role) || role === "ceo" || role === "admin";
}

export const TIPO_BENEFICIO_ANUAL_OPTIONS: readonly TipoBeneficioAnual[] = [
  "plr",
  "bonificacao",
  "reajuste",
  "nenhum",
] as const;

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

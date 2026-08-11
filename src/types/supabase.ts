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

export type TipoIncidenteEnum = "acidente_sms" | "no_show" | "advertencia" | "desvio_comportamental";

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
  | "pdi_concluido"
  | "ima_critico";

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
          telefone_2: string | null;
          endereco: string | null;
          cidade_uf: string | null;
          telefone_emergencia: string | null;
          tipo_contrato: string | null;
          especialidade: string | null;
          aceita_dobra: boolean;
          total_no_show: number;
          total_bafometro_positivo: number;
          total_toxicologico_positivo: number;
          trocas_plataforma_avaliacao_baixa: number;
          perfil_risco: string | null;
          observacoes: string | null;
          data_demissao: string | null;
          motivo_demissao: string | null;
          tipo_demissao: string | null;
          apto_recontratacao: boolean | null;
          salario_base: number | null;
          organizacao_id: string | null;
          must_change_password: boolean;
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
          organizacao_id?: string | null;
          must_change_password?: boolean;
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
          organizacao_id?: string | null;
          must_change_password?: boolean;
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
          {
            foreignKeyName: "profiles_organizacao_id_fkey";
            columns: ["organizacao_id"];
            referencedRelation: "organizacoes";
            referencedColumns: ["id"];
          },
        ];
      };

      organizacoes: {
        Row: {
          id: string;
          owner_id: string;
          nome: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          nome: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          nome?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organizacoes_owner_id_fkey";
            columns: ["owner_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };

      assinaturas: {
        Row: {
          organizacao_id: string;
          plan_id: string;
          activated_at: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          organizacao_id: string;
          plan_id: string;
          activated_at?: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          organizacao_id?: string;
          plan_id?: string;
          activated_at?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assinaturas_organizacao_id_fkey";
            columns: ["organizacao_id"];
            referencedRelation: "organizacoes";
            referencedColumns: ["id"];
          },
        ];
      };

      cargos: {
        Row: {
          id: string;
          nome: string;
          codigo_cbo: string | null;
          departamento: string | null;
          descricao: string | null;
          ativo: boolean;
          organizacao_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          codigo_cbo?: string | null;
          departamento?: string | null;
          descricao?: string | null;
          ativo?: boolean;
          organizacao_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          codigo_cbo?: string | null;
          departamento?: string | null;
          descricao?: string | null;
          ativo?: boolean;
          organizacao_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cargos_organizacao_id_fkey";
            columns: ["organizacao_id"];
            isOneToOne: false;
            referencedRelation: "organizacoes";
            referencedColumns: ["id"];
          },
        ];
      };
      clientes: {
        Row: {
          id: string;
          codigo: string | null;
          cnpj: string | null;
          razao_social: string;
          nome_fantasia: string | null;
          endereco: string | null;
          cidade: string | null;
          uf: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          codigo?: string | null;
          cnpj?: string | null;
          razao_social: string;
          nome_fantasia?: string | null;
          endereco?: string | null;
          cidade?: string | null;
          uf?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          codigo?: string | null;
          cnpj?: string | null;
          razao_social?: string;
          nome_fantasia?: string | null;
          endereco?: string | null;
          cidade?: string | null;
          uf?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      cliente_unidades: {
        Row: {
          id: string;
          cliente_id: string;
          nome: string;
          aeroporto_embarque: string | null;
          cidade: string | null;
          contato_base_nome: string | null;
          contato_base_telefone: string | null;
          contato_base_email: string | null;
          contato_base_depto: string | null;
          contato_bordo_nome: string | null;
          contato_bordo_telefone: string | null;
          contato_bordo_email: string | null;
          contato_bordo_depto: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          cliente_id: string;
          nome: string;
          aeroporto_embarque?: string | null;
          cidade?: string | null;
          contato_base_nome?: string | null;
          contato_base_telefone?: string | null;
          contato_base_email?: string | null;
          contato_base_depto?: string | null;
          contato_bordo_nome?: string | null;
          contato_bordo_telefone?: string | null;
          contato_bordo_email?: string | null;
          contato_bordo_depto?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          cliente_id?: string;
          nome?: string;
          aeroporto_embarque?: string | null;
          cidade?: string | null;
          contato_base_nome?: string | null;
          contato_base_telefone?: string | null;
          contato_base_email?: string | null;
          contato_base_depto?: string | null;
          contato_bordo_nome?: string | null;
          contato_bordo_telefone?: string | null;
          contato_bordo_email?: string | null;
          contato_bordo_depto?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cliente_unidades_cliente_id_fkey";
            columns: ["cliente_id"];
            referencedRelation: "clientes";
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
          periodo_inicio: string | null;
          periodo_fim: string | null;
          quinzena: string | null;
          cliente_id: string | null;
          unidade_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          avaliador_id?: string | null;
          avaliado_id: string;
          tipo: TipoAvaliacaoEnum;
          status?: StatusValidacaoEnum;
          periodo_inicio?: string | null;
          periodo_fim?: string | null;
          quinzena?: string | null;
          cliente_id?: string | null;
          unidade_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          avaliador_id?: string | null;
          avaliado_id?: string;
          tipo?: TipoAvaliacaoEnum;
          status?: StatusValidacaoEnum;
          periodo_inicio?: string | null;
          periodo_fim?: string | null;
          quinzena?: string | null;
          cliente_id?: string | null;
          unidade_id?: string | null;
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
          {
            foreignKeyName: "avaliacoes_cliente_id_fkey";
            columns: ["cliente_id"];
            referencedRelation: "clientes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "avaliacoes_unidade_id_fkey";
            columns: ["unidade_id"];
            referencedRelation: "cliente_unidades";
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
          horario_aproximado: string | null;
          reincidencia: boolean | null;
          on_offshore: string | null;
          dias_embarcados: number | null;
          prev_mob: string | null;
          prev_demob: string | null;
          cliente_id: string | null;
          unidade_id: string | null;
          plataforma_texto: string | null;
          relatante_nome: string | null;
          acao_tomada: string | null;
          comentario_cliente: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          colaborador_id: string;
          registrado_por_id: string;
          tipo_incidente: TipoIncidenteEnum;
          data_ocorrencia: string;
          descricao: string;
          horario_aproximado?: string | null;
          reincidencia?: boolean | null;
          on_offshore?: string | null;
          dias_embarcados?: number | null;
          prev_mob?: string | null;
          prev_demob?: string | null;
          cliente_id?: string | null;
          unidade_id?: string | null;
          plataforma_texto?: string | null;
          relatante_nome?: string | null;
          acao_tomada?: string | null;
          comentario_cliente?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          colaborador_id?: string;
          registrado_por_id?: string;
          tipo_incidente?: TipoIncidenteEnum;
          data_ocorrencia?: string;
          descricao?: string;
          horario_aproximado?: string | null;
          reincidencia?: boolean | null;
          on_offshore?: string | null;
          dias_embarcados?: number | null;
          prev_mob?: string | null;
          prev_demob?: string | null;
          cliente_id?: string | null;
          unidade_id?: string | null;
          plataforma_texto?: string | null;
          relatante_nome?: string | null;
          acao_tomada?: string | null;
          comentario_cliente?: string | null;
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
          tipo_solicitacao: string | null;
          valor_estimado: number | null;
          percentual_reajuste: number | null;
          curso_nome: string | null;
          curso_instituicao: string | null;
          checklist: Json;
          parecer_gestor: string | null;
          parecer_rh: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          colaborador_id: string;
          gerente_id?: string | null;
          justificativa: string;
          status?: StatusSolicitacaoSalarialEnum;
          tipo_solicitacao?: string | null;
          valor_estimado?: number | null;
          percentual_reajuste?: number | null;
          curso_nome?: string | null;
          curso_instituicao?: string | null;
          checklist?: Json;
          parecer_gestor?: string | null;
          parecer_rh?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          colaborador_id?: string;
          gerente_id?: string | null;
          justificativa?: string;
          status?: StatusSolicitacaoSalarialEnum;
          tipo_solicitacao?: string | null;
          valor_estimado?: number | null;
          percentual_reajuste?: number | null;
          curso_nome?: string | null;
          curso_instituicao?: string | null;
          checklist?: Json;
          parecer_gestor?: string | null;
          parecer_rh?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "melhorias_salariais_colaborador_id_fkey";
            columns: ["colaborador_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "melhorias_salariais_gerente_id_fkey";
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
      ensure_organizacao_for_owner: {
        Args: {
          p_owner_id: string;
          p_nome?: string | null;
        };
        Returns: string;
      };
      claim_owner_ceo: {
        Args: {
          p_nome?: string | null;
        };
        Returns: undefined;
      };
      activate_organizacao_assinatura: {
        Args: {
          p_owner_id: string;
          p_plan_id: string;
          p_nome?: string | null;
        };
        Returns: string;
      };
      get_minha_assinatura: {
        Args: {
          p_user_id?: string | null;
        };
        Returns: {
          plan_id: string;
          activated_at: string;
          organizacao_id: string;
        }[];
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
  desvio_comportamental: "Desvio Comportamental",
};

export const TIPO_BENEFICIO_ANUAL_LABELS: Record<TipoBeneficioAnual, string> = {
  reajuste: "Reajuste",
  plr: "PLR",
  bonificacao: "Bonificação",
  nenhum: "Nenhum",
};

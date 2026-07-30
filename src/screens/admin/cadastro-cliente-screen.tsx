import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ScreenHeader } from '@/components/navigation/screen-header';
import { TabScreenContainer } from '@/components/navigation/tab-screen-container';
import { GlassCard } from '@/components/premium/GlassCard';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { useToast } from '@/components/ui/toast';
import { layout } from '@/constants/theme';
import {
  createCliente,
  fetchClientesComUnidades,
  type ClienteComUnidades,
  type CreateClienteInput,
} from '@/features/clientes/api';
import { useUserRole } from '@/hooks/use-user-role';
import { isAdminDashboardRole } from '@/types/supabase';

const INITIAL_FORM: CreateClienteInput = {
  codigo: '',
  cnpj: '',
  razaoSocial: '',
  nomeFantasia: '',
  endereco: '',
  cidade: '',
  uf: '',
  unidadeNome: '',
  aeroportoEmbarque: '',
  contatoBaseNome: '',
  contatoBaseTelefone: '',
  contatoBaseEmail: '',
  contatoBaseDepto: '',
  contatoBordoNome: '',
  contatoBordoTelefone: '',
  contatoBordoEmail: '',
  contatoBordoDepto: '',
};

export function CadastroClienteScreen() {
  const { role } = useUserRole();
  const { showToast } = useToast();
  const canWrite = isAdminDashboardRole(role);

  const [clientes, setClientes] = useState<ClienteComUnidades[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateClienteInput>(INITIAL_FORM);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setClientes(await fetchClientesComUnidades());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar clientes.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = useCallback(async () => {
    if (!canWrite || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await createCliente(form);
      showToast('Cliente cadastrado.', 'success');
      setForm(INITIAL_FORM);
      await load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao salvar cliente.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [canWrite, form, isSubmitting, load, showToast]);

  return (
    <TabScreenContainer scrollable contentContainerStyle={styles.content}>
      <ScreenHeader
        title="Cadastro de Cliente"
        description="Clientes, plataformas/unidades e contatos de base/bordo."
      />

      {canWrite ? (
        <GlassCard>
          <ThemedText type="smallBold">Novo cliente</ThemedText>
          <View style={styles.form}>
            <Input
              label="Código"
              value={form.codigo ?? ''}
              onChangeText={(codigo) => setForm((c) => ({ ...c, codigo }))}
            />
            <Input
              label="CNPJ"
              mask="cnpj"
              placeholder="00.000.000/0000-00"
              value={form.cnpj ?? ''}
              onChangeText={(cnpj) => setForm((c) => ({ ...c, cnpj }))}
            />
            <Input
              label="Razão social"
              value={form.razaoSocial}
              onChangeText={(razaoSocial) => setForm((c) => ({ ...c, razaoSocial }))}
            />
            <Input
              label="Nome fantasia"
              value={form.nomeFantasia ?? ''}
              onChangeText={(nomeFantasia) => setForm((c) => ({ ...c, nomeFantasia }))}
            />
            <Input
              label="Endereço"
              value={form.endereco ?? ''}
              onChangeText={(endereco) => setForm((c) => ({ ...c, endereco }))}
            />
            <Input
              label="Cidade"
              value={form.cidade ?? ''}
              onChangeText={(cidade) => setForm((c) => ({ ...c, cidade }))}
            />
            <Input
              autoCapitalize="characters"
              label="UF"
              mask="uf"
              placeholder="RJ"
              value={form.uf ?? ''}
              onChangeText={(uf) => setForm((c) => ({ ...c, uf }))}
            />
            <Input
              label="Plataforma / Unidade"
              value={form.unidadeNome ?? ''}
              onChangeText={(unidadeNome) => setForm((c) => ({ ...c, unidadeNome }))}
            />
            <Input
              label="Aeroporto embarque"
              value={form.aeroportoEmbarque ?? ''}
              onChangeText={(aeroportoEmbarque) => setForm((c) => ({ ...c, aeroportoEmbarque }))}
            />

            <ThemedText type="smallBold" style={styles.sectionTitle}>
              Contato de base
            </ThemedText>
            <Input
              label="Nome"
              value={form.contatoBaseNome ?? ''}
              onChangeText={(contatoBaseNome) => setForm((c) => ({ ...c, contatoBaseNome }))}
            />
            <Input
              label="Telefone"
              mask="phoneFull"
              value={form.contatoBaseTelefone ?? ''}
              onChangeText={(contatoBaseTelefone) =>
                setForm((c) => ({ ...c, contatoBaseTelefone }))
              }
            />
            <Input
              autoCapitalize="none"
              keyboardType="email-address"
              label="E-mail"
              value={form.contatoBaseEmail ?? ''}
              onChangeText={(contatoBaseEmail) => setForm((c) => ({ ...c, contatoBaseEmail }))}
            />
            <Input
              label="Departamento"
              value={form.contatoBaseDepto ?? ''}
              onChangeText={(contatoBaseDepto) => setForm((c) => ({ ...c, contatoBaseDepto }))}
            />

            <ThemedText type="smallBold" style={styles.sectionTitle}>
              Contato de bordo
            </ThemedText>
            <Input
              label="Nome"
              value={form.contatoBordoNome ?? ''}
              onChangeText={(contatoBordoNome) => setForm((c) => ({ ...c, contatoBordoNome }))}
            />
            <Input
              label="Telefone"
              mask="phoneFull"
              value={form.contatoBordoTelefone ?? ''}
              onChangeText={(contatoBordoTelefone) =>
                setForm((c) => ({ ...c, contatoBordoTelefone }))
              }
            />
            <Input
              autoCapitalize="none"
              keyboardType="email-address"
              label="E-mail"
              value={form.contatoBordoEmail ?? ''}
              onChangeText={(contatoBordoEmail) => setForm((c) => ({ ...c, contatoBordoEmail }))}
            />
            <Input
              label="Departamento"
              value={form.contatoBordoDepto ?? ''}
              onChangeText={(contatoBordoDepto) => setForm((c) => ({ ...c, contatoBordoDepto }))}
            />

            <Button
              label={isSubmitting ? 'Salvando…' : 'Salvar cliente'}
              onPress={() => void handleSubmit()}
              disabled={isSubmitting}
            />
          </View>
        </GlassCard>
      ) : null}

      {isLoading ? <SkeletonLoader /> : null}
      {error ? (
        <ThemedText themeColor="danger" type="small">
          {error}
        </ThemedText>
      ) : null}

      {clientes.map((cliente) => (
        <GlassCard key={cliente.id} padding="compact">
          <ThemedText type="smallBold">
            {cliente.nomeFantasia ?? cliente.razaoSocial}
          </ThemedText>
          <ThemedText themeColor="textSecondary" type="small">
            {cliente.codigo ?? '—'} · {cliente.cnpj ?? '—'}
          </ThemedText>
          <ThemedText themeColor="textSecondary" type="small">
            {cliente.cidade ?? '—'} / {cliente.uf ?? '—'}
          </ThemedText>
          {cliente.unidades.map((u) => (
            <View key={u.id} style={styles.unidadeBlock}>
              <ThemedText type="small" style={styles.unidade}>
                Unidade: {u.nome}
                {u.aeroportoEmbarque ? ` · ${u.aeroportoEmbarque}` : ''}
              </ThemedText>
              {u.contatoBaseNome ? (
                <ThemedText themeColor="textSecondary" type="small">
                  Base: {u.contatoBaseNome}
                  {u.contatoBaseTelefone ? ` · ${u.contatoBaseTelefone}` : ''}
                </ThemedText>
              ) : null}
              {u.contatoBordoNome ? (
                <ThemedText themeColor="textSecondary" type="small">
                  Bordo: {u.contatoBordoNome}
                  {u.contatoBordoTelefone ? ` · ${u.contatoBordoTelefone}` : ''}
                </ThemedText>
              ) : null}
            </View>
          ))}
        </GlassCard>
      ))}
    </TabScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: layout.space.md,
    paddingBottom: layout.space.xxl,
  },
  form: { gap: layout.space.sm, marginTop: layout.space.sm },
  sectionTitle: { marginTop: layout.space.sm },
  unidade: { marginTop: 4 },
  unidadeBlock: { marginTop: 4, gap: 2 },
});

import { useCallback, useRef, useState, type ChangeEvent } from 'react';

import { Button } from '../ui/Button';
import { uploadProfilesFromCsv } from '@/features/rh/upload-profiles-batch';
import { useAuthRole } from '@/hooks/use-auth-role';
import { isAdminDashboardRole } from '@/types/supabase';
import admin from '../../styles/admin.module.css';

type UploadStatus = 'idle' | 'loading' | 'success' | 'error';

type UploadPlanilhaFormProps = {
  onImported?: (count: number) => void;
};

export function UploadPlanilhaForm({ onImported }: UploadPlanilhaFormProps) {
  const { role, isLoading: isRoleLoading } = useAuthRole();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [lineErrors, setLineErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);

  const canUpload = isAdminDashboardRole(role);
  const isBusy = status === 'loading';

  const handleFile = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';

      if (!file || !canUpload || isBusy) {
        return;
      }

      const lowerName = file.name.toLowerCase();
      if (!lowerName.endsWith('.csv') && !lowerName.endsWith('.txt')) {
        setStatus('error');
        setMessage('Selecione um arquivo .csv (ou .txt com conteúdo CSV).');
        return;
      }

      try {
        setStatus('loading');
        setMessage(null);
        setLineErrors([]);
        setFileName(file.name);

        const csvContent = await file.text();
        const uploadResult = await uploadProfilesFromCsv(csvContent);

        setLineErrors(uploadResult.lineErrors);

        if (uploadResult.importedCount === 0) {
          setStatus('error');
          setMessage(
            uploadResult.lineErrors.length > 0
              ? 'Nenhuma linha importada. Revise os erros abaixo.'
              : 'Nenhum perfil válido encontrado no arquivo.',
          );
          return;
        }

        const createdSuffix =
          uploadResult.createdAuthCount > 0
            ? ` ${uploadResult.createdAuthCount} conta(s) criada(s) com senha padrão.`
            : '';
        const errorSuffix =
          uploadResult.lineErrors.length > 0
            ? ` ${uploadResult.lineErrors.length} linha(s) com erro.`
            : '';

        setStatus(uploadResult.lineErrors.length > 0 ? 'error' : 'success');
        setMessage(
          `${uploadResult.importedCount} perfil(is) importado(s) com sucesso.${createdSuffix}${errorSuffix}`,
        );
        onImported?.(uploadResult.importedCount);
      } catch (error) {
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Não foi possível importar a planilha.');
      }
    },
    [canUpload, isBusy, onImported],
  );

  if (isRoleLoading) {
    return null;
  }

  if (!canUpload) {
    return (
      <p className={admin.hint}>
        Apenas RH, CEO e administradores podem importar planilhas de RH.
      </p>
    );
  }

  return (
    <div className={admin.uploadBox}>
      <p className={admin.hint}>
        CSV com ficha completa: email, nome, classificacao, nivel_irata, datas, telefone,
        certificacoes, status e role. Contas novas recebem senha temporária de primeiro acesso.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,.txt,text/csv,text/plain"
        hidden
        onChange={(event) => void handleFile(event)}
      />

      <Button
        type="button"
        isLoading={isBusy}
        onClick={() => inputRef.current?.click()}
      >
        {isBusy ? 'Importando...' : 'Selecionar planilha CSV'}
      </Button>

      {fileName ? <p className={admin.hint}>Arquivo: {fileName}</p> : null}

      {message ? (
        <p
          className={`${admin.feedback} ${
            status === 'error' ? admin.feedbackError : admin.feedbackSuccess
          }`}
        >
          {message}
        </p>
      ) : null}

      {lineErrors.length > 0 ? (
        <div className={admin.errorReport}>
          <p className={admin.errorReportTitle}>Relatório de erros por linha</p>
          {lineErrors.map((lineError, index) => (
            <p key={`${lineError}-${index}`} className={admin.errorLine}>
              {lineError}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

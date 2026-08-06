-- Documenta o fluxo de e-mail para incidentes graves.
-- O app invoca a Edge Function `notify-incidente-grave` após INSERT.
-- Configure no Supabase:
--   supabase secrets set RESEND_API_KEY=re_xxx
--   supabase secrets set INCIDENTE_EMAIL_FROM="Vertek Avalia <avisos@seudominio.com>"
--   supabase functions deploy notify-incidente-grave

CREATE OR REPLACE FUNCTION public.log_incidente_grave()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.tipo_incidente IN ('acidente_sms', 'no_show') THEN
    RAISE LOG 'incidente_grave: id=%, colaborador_id=%, tipo=%, data=%',
      NEW.id, NEW.colaborador_id, NEW.tipo_incidente, NEW.data_ocorrencia;
  END IF;

  RETURN NEW;
END;
$$;

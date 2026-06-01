SELECT tgname, tgrelid::regclass::text AS table_name FROM pg_trigger WHERE tgname IN ('trg_profiles_updated_at','trg_melhorias_updated_at');

#!/bin/bash

# Wczytaj zmienne z .env
if [ -f ./.env ]; then
    set -a
    source .env
    set +a
fi

# Sprawdź wymagane zmienne
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$SUPABASE_DB_PASSWORD" ]; then
    echo "❌ Brakuje zmiennych VITE_SUPABASE_URL lub SUPABASE_DB_PASSWORD"
    exit 1
fi

# Wyciągnij ref z URL
SUPABASE_REF=$(echo "$VITE_SUPABASE_URL" | cut -d'.' -f1 | cut -d'/' -f3)

# Connection string
CONNECTION_STRING="postgresql://postgres.$SUPABASE_REF:$SUPABASE_DB_PASSWORD@aws-0-eu-north-1.pooler.supabase.com:5432/postgres"
OUTPUT_FILE="${1:-triggers_functions.md}"

echo "🔗 Łączenie z bazą..."

# Eksport triggerów i funkcji - użyj heredoc dla lepszego escapowania
psql "$CONNECTION_STRING" -t -A > "$OUTPUT_FILE" << 'EOF'
WITH trigger_info AS (
  SELECT 
    t.trigger_name,
    t.event_object_table as table_name,
    t.action_timing,
    t.event_manipulation,
    t.action_orientation,
    t.action_condition,
    pg_get_triggerdef(tr.oid) as trigger_definition,
    t.action_statement
  FROM information_schema.triggers t
  JOIN pg_trigger tr ON tr.tgname = t.trigger_name
  JOIN pg_class c ON c.oid = tr.tgrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE t.trigger_schema = 'public'
    AND n.nspname = 'public'
),
function_info AS (
  SELECT 
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    pg_get_functiondef(p.oid) as function_definition,
    d.description
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  LEFT JOIN pg_description d ON d.objoid = p.oid
  WHERE n.nspname = 'public'
    AND p.prokind IN ('f', 'p')  -- f=function, p=procedure
)
SELECT 
  '# DATABASE TRIGGERS AND FUNCTIONS' || E'\n' ||
  'Generated: ' || NOW()::text || E'\n\n' ||
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM trigger_info) 
    THEN '## TRIGGERS' || E'\n\n' || 
      (SELECT STRING_AGG(
        '### Trigger: ' || trigger_name || E'\n' ||
        '- **Table**: ' || table_name || E'\n' ||
        '- **Timing**: ' || action_timing || ' ' || event_manipulation || E'\n' ||
        '- **Orientation**: ' || action_orientation || E'\n' ||
        CASE 
          WHEN action_condition IS NOT NULL 
          THEN '- **Condition**: ' || action_condition || E'\n'
          ELSE ''
        END ||
        E'\n```sql\n' || trigger_definition || E'\n```\n',
        E'\n'
        ORDER BY table_name, trigger_name
      ) FROM trigger_info) || E'\n\n'
    ELSE '## TRIGGERS\n\n*No triggers found in public schema*\n\n'
  END ||
  
  CASE 
    WHEN EXISTS (SELECT 1 FROM function_info) 
    THEN '## FUNCTIONS' || E'\n\n' || 
      (SELECT STRING_AGG(
        '### Function: ' || function_name || '(' || arguments || ')' || E'\n' ||
        CASE 
          WHEN description IS NOT NULL 
          THEN '> ' || description || E'\n\n'
          ELSE ''
        END ||
        '```sql' || E'\n' || function_definition || E'\n```\n',
        E'\n'
        ORDER BY function_name
      ) FROM function_info)
    ELSE '## FUNCTIONS\n\n*No functions found in public schema*'
  END
  as export;
EOF

# Sprawdź czy zapytanie się powiodło
if [ $? -eq 0 ]; then
    echo "✅ Triggery i funkcje zapisane do: $OUTPUT_FILE"
    echo ""
    echo "📊 Wyeksportowano:"
    echo "  - Triggery (z pełnymi definicjami)"
    echo "  - Funkcje (z kodem źródłowym)"
    echo ""
    
    # Szybkie podsumowanie
    TRIGGER_COUNT=$(grep -c "### Trigger:" "$OUTPUT_FILE" 2>/dev/null || echo "0")
    FUNCTION_COUNT=$(grep -c "### Function:" "$OUTPUT_FILE" 2>/dev/null || echo "0")
    
    echo "📈 Statystyki:"
    echo "  - Triggerów: $TRIGGER_COUNT"
    echo "  - Funkcji: $FUNCTION_COUNT"
else
    echo "❌ Błąd podczas pobierania triggerów i funkcji"
    exit 1
fi
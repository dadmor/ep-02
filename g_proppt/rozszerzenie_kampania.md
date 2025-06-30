Podgląd reklam: 
- szacowany zasięg / kliki
- szacowana liczba konwersji (cel kampanii)
- jakość reklamy ( %)
- wygląd reklamy w różnych formatach (w zależności od umiejscowienia)
- Informacja o błędach (o nieuzupełnionych elementach)
Ustawienie kampanii: 
* Cel kampanii:
- Brand Awareness
- Traffic
- Lead Generation
- Conversions
- App Intalls
- Sprzedaż online
* Budżet kampanii
* Okres kampanii
* Rodzaj reklamy:
- Tekstowa
- Banerowa
- Wideo
- Produktowa
- Mix (Tekst+materiał reklamowy)
* Targetowanie:
- Lokalizacja
- Grupy odbiorców 
* Uzupełnienie elementów reklamy:
- Nagłówki
- Teksty reklam
- Obraz/wideo
- UTM
- URL
* Implementacja kodów zlecających
* Publikacja kampanii


Rozszerzenie do wymagan


-- Rozszerzenie istniejącej tabeli campaigns (minimalne zmiany)
ALTER TABLE google_ads_campaigns 
ADD COLUMN campaign_objective TEXT, -- Brand Awareness, Traffic, Lead Generation, etc.
ADD COLUMN ad_type TEXT, -- Tekstowa, Banerowa, Wideo, Produktowa, Mix
ADD COLUMN validation_status JSONB DEFAULT '{"errors": [], "warnings": []}',
ADD COLUMN estimated_reach INTEGER,
ADD COLUMN estimated_clicks INTEGER,
ADD COLUMN estimated_conversions INTEGER,
ADD COLUMN quality_score INTEGER; -- Jakość reklamy w %

-- Tabela dla materiałów reklamowych (wszystko w jednej)
CREATE TABLE ad_assets (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES google_ads_campaigns(id),
    asset_type TEXT NOT NULL, -- 'headline', 'description', 'image', 'video', 'url'
    content TEXT, -- Tekst lub URL
    metadata JSONB, -- Dodatkowe info: alt_text, dimensions, utm_params, etc.
    position INTEGER DEFAULT 1,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (id)
);

-- Rozszerzenie targetowania (proste JSONB)
CREATE TABLE campaign_targeting (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES google_ads_campaigns(id),
    targeting_type TEXT NOT NULL, -- 'location', 'audience', 'keyword', 'demographic'
    targeting_data JSONB NOT NULL, -- Elastyczne przechowywanie różnych typów
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (id)
);

-- Uproszczona tabela dla błędów/ostrzeżeń
CREATE TABLE campaign_issues (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES google_ads_campaigns(id),
    issue_type TEXT NOT NULL, -- 'error', 'warning'
    field_name TEXT,
    message TEXT NOT NULL,
    resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (id)
);

-- Indeksy dla wydajności
CREATE INDEX idx_ad_assets_campaign_id ON ad_assets(campaign_id);
CREATE INDEX idx_campaign_targeting_campaign_id ON campaign_targeting(campaign_id);
CREATE INDEX idx_campaign_issues_campaign_id ON campaign_issues(campaign_id);
CREATE INDEX idx_campaign_issues_resolved ON campaign_issues(resolved);

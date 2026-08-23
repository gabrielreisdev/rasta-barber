-- ==============================================================================
-- RASTA BARBER - MODELAGEM DE BANCO DE DADOS (COM BLOQUEIO DE FOLGAS NO CALENDÁRIO)
-- ==============================================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist"; -- Essencial para a constraint anti-conflito de horários

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('client', 'barber');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABELA: PROFILES (Apenas para o Administrador / Barbeiro)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'barber',
    full_name TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. TABELA: BARBER_STATUS (Status em Tempo Real e Programação de Presença)
CREATE TABLE IF NOT EXISTS public.barber_status (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    barber_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_online BOOLEAN NOT NULL DEFAULT false,
    status_mode TEXT NOT NULL DEFAULT 'offline', -- 'immediate', 'scheduled', 'offline'
    scheduled_date TEXT, -- YYYY-MM-DD
    scheduled_time TEXT, -- HH:mm
    custom_message TEXT,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

INSERT INTO public.barber_status (id, is_online, status_mode) 
VALUES (1, false, 'offline') 
ON CONFLICT (id) DO NOTHING;

-- 5. TABELA: SERVICES (Catálogo de Serviços)
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. TABELA: WORKING_HOURS (Expediente Padrão Semanal)
CREATE TABLE IF NOT EXISTS public.working_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    is_working BOOLEAN NOT NULL DEFAULT true,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    lunch_start TIME,
    lunch_end TIME,
    CONSTRAINT valid_work_hours CHECK (start_time < end_time),
    CONSTRAINT valid_lunch_hours CHECK (lunch_start IS NULL OR (lunch_start < lunch_end AND lunch_start >= start_time AND lunch_end <= end_time)),
    CONSTRAINT unique_day_of_week UNIQUE (day_of_week)
);

-- 7. TABELA: BLOCKED_DATES (Datas específicas bloqueadas / Folgas selecionadas no calendário pelo Barbeiro)
CREATE TABLE IF NOT EXISTS public.blocked_dates (
    date DATE PRIMARY KEY,
    reason TEXT DEFAULT 'Folga / Indisponível',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. TABELA: APPOINTMENTS (Agendamentos diretos)
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL CHECK (appointment_date >= CURRENT_DATE),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status appointment_status NOT NULL DEFAULT 'confirmed',
    total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT valid_appointment_time CHECK (start_time < end_time),
    CONSTRAINT no_overlapping_appointments EXCLUDE USING gist (
        appointment_date WITH =,
        tsrange(
            (appointment_date + start_time)::timestamp,
            (appointment_date + end_time)::timestamp
        ) WITH &&
    ) WHERE (status IN ('confirmed', 'pending'))
);

-- 9. TABELA: APPOINTMENT_SERVICES
CREATE TABLE IF NOT EXISTS public.appointment_services (
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
    price_at_booking NUMERIC(10, 2) NOT NULL CHECK (price_at_booking >= 0),
    PRIMARY KEY (appointment_id, service_id)
);

-- ÍNDICES
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_phone ON public.appointments(client_phone);
CREATE INDEX IF NOT EXISTS idx_services_active ON public.services(is_active);

-- ==============================================================================
-- 10. FUNÇÕES DE SEGURANÇA & ROW LEVEL SECURITY
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.is_barber()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'barber'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger de criação do Admin
CREATE OR REPLACE FUNCTION public.handle_new_admin()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, phone, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Mestre Rasta (Barbeiro)'),
        NEW.raw_user_meta_data->>'phone',
        'barber'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_admin();

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barber_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_services ENABLE ROW LEVEL SECURITY;

-- Limpar policies antigas
DROP POLICY IF EXISTS "Profiles visíveis pelo dono" ON public.profiles;
DROP POLICY IF EXISTS "Todos visualizam status do barbeiro" ON public.barber_status;
DROP POLICY IF EXISTS "Apenas barbeiro altera status" ON public.barber_status;
DROP POLICY IF EXISTS "Todos vêem serviços ativos" ON public.services;
DROP POLICY IF EXISTS "Apenas barbeiro gerencia serviços" ON public.services;
DROP POLICY IF EXISTS "Todos consultam horário de funcionamento" ON public.working_hours;
DROP POLICY IF EXISTS "Apenas barbeiro altera horários" ON public.working_hours;
DROP POLICY IF EXISTS "Todos consultam dias bloqueados" ON public.blocked_dates;
DROP POLICY IF EXISTS "Apenas barbeiro gerencia dias bloqueados" ON public.blocked_dates;
DROP POLICY IF EXISTS "Leitura de agendamentos" ON public.appointments;
DROP POLICY IF EXISTS "Barbeiro gerencia agendamentos" ON public.appointments;
DROP POLICY IF EXISTS "Serviços dos agendamentos visíveis" ON public.appointment_services;

-- POLICIES
CREATE POLICY "Profiles visíveis pelo dono" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Todos visualizam status do barbeiro" ON public.barber_status FOR SELECT USING (true);
CREATE POLICY "Apenas barbeiro altera status" ON public.barber_status FOR UPDATE USING (public.is_barber());
CREATE POLICY "Todos vêem serviços ativos" ON public.services FOR SELECT USING (is_active = true OR public.is_barber());
CREATE POLICY "Apenas barbeiro gerencia serviços" ON public.services FOR ALL USING (public.is_barber());
CREATE POLICY "Todos consultam horário de funcionamento" ON public.working_hours FOR SELECT USING (true);
CREATE POLICY "Apenas barbeiro altera horários" ON public.working_hours FOR ALL USING (public.is_barber());

-- BLOCKED DATES POLICIES
CREATE POLICY "Todos consultam dias bloqueados" ON public.blocked_dates FOR SELECT USING (true);
CREATE POLICY "Apenas barbeiro gerencia dias bloqueados" ON public.blocked_dates FOR ALL USING (public.is_barber());

CREATE POLICY "Leitura de agendamentos" ON public.appointments FOR SELECT USING (true);
CREATE POLICY "Barbeiro gerencia agendamentos" ON public.appointments FOR ALL USING (public.is_barber());
CREATE POLICY "Serviços dos agendamentos visíveis" ON public.appointment_services FOR SELECT USING (true);

-- ==============================================================================
-- 11. RPC PÚBLICA SEGURA PARA CRIAÇÃO DIRETA DE AGENDAMENTO (SEM LOGIN)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.create_booking(
    p_appointment_date DATE,
    p_start_time TIME,
    p_service_ids UUID[],
    p_client_name TEXT,
    p_client_phone TEXT
)
RETURNS UUID AS $$
DECLARE
    v_total_duration INT := 0;
    v_total_price NUMERIC(10,2) := 0;
    v_end_time TIME;
    v_appointment_id UUID;
    v_service RECORD;
BEGIN
    IF p_client_name IS NULL OR trim(p_client_name) = '' THEN
        RAISE EXCEPTION 'Por favor, informe seu nome para o agendamento.';
    END IF;

    IF p_client_phone IS NULL OR trim(p_client_phone) = '' THEN
        RAISE EXCEPTION 'Por favor, informe seu telefone/WhatsApp.';
    END IF;

    IF array_length(p_service_ids, 1) IS NULL OR array_length(p_service_ids, 1) = 0 THEN
        RAISE EXCEPTION 'Selecione ao menos um serviço.';
    END IF;

    -- Verifica se a data está bloqueada pelo barbeiro (folga)
    IF EXISTS (SELECT 1 FROM public.blocked_dates WHERE date = p_appointment_date) THEN
        RAISE EXCEPTION 'A barbearia está fechada nesta data selecionada.';
    END IF;

    -- Calcula preço total e tempo total
    FOR v_service IN 
        SELECT id, price, duration_minutes 
        FROM public.services 
        WHERE id = ANY(p_service_ids) AND is_active = true
    LOOP
        v_total_duration := v_total_duration + v_service.duration_minutes;
        v_total_price := v_total_price + v_service.price;
    END LOOP;

    IF v_total_duration = 0 THEN
        RAISE EXCEPTION 'Nenhum serviço válido ou ativo foi selecionado.';
    END IF;

    v_end_time := p_start_time + (v_total_duration || ' minutes')::INTERVAL;

    -- Insere o agendamento
    INSERT INTO public.appointments (
        client_name,
        client_phone,
        client_id,
        appointment_date,
        start_time,
        end_time,
        total_price,
        status
    ) VALUES (
        trim(p_client_name),
        trim(p_client_phone),
        auth.uid(),
        p_appointment_date,
        p_start_time,
        v_end_time,
        v_total_price,
        'confirmed'
    ) RETURNING id INTO v_appointment_id;

    INSERT INTO public.appointment_services (appointment_id, service_id, price_at_booking)
    SELECT v_appointment_id, s.id, s.price
    FROM public.services s
    WHERE s.id = ANY(p_service_ids);

    RETURN v_appointment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Habilita Realtime
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.barber_status;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- SEED: Horários padrão da semana
INSERT INTO public.working_hours (day_of_week, is_working, start_time, end_time, lunch_start, lunch_end)
VALUES
    (0, false, '09:00', '14:00', NULL, NULL),                 -- Domingo: Folga
    (1, true,  '09:00', '19:00', '12:00', '13:00'),          -- Segunda
    (2, true,  '09:00', '19:00', '12:00', '13:00'),          -- Terça
    (3, true,  '09:00', '19:00', '12:00', '13:00'),          -- Quarta
    (4, true,  '09:00', '19:00', '12:00', '13:00'),          -- Quinta
    (5, true,  '09:00', '20:00', '12:00', '13:00'),          -- Sexta
    (6, true,  '08:30', '18:00', '12:30', '13:30')           -- Sábado
ON CONFLICT (day_of_week) DO NOTHING;

-- SEED: Serviços Iniciais
INSERT INTO public.services (name, description, price, duration_minutes, is_active)
VALUES
    ('Corte Clássico / Degradê', 'Corte com tesoura e máquina, acabamento impecável e alinhamento preciso na navalha.', 40.00, 35, true),
    ('Barba Completa / Modelagem', 'Modelagem completa da barba, alinhamento das linhas e finalização com balm hidratante.', 35.00, 30, true),
    ('Combo Rasta Master (Corte + Barba)', 'A combinação ideal: corte degradê de precisão + modelagem e alinhamento completo da barba.', 70.00, 60, true),
    ('Design de Sobrancelha', 'Alinhamento e limpeza precisa com navalhete.', 15.00, 15, true)
ON CONFLICT DO NOTHING;

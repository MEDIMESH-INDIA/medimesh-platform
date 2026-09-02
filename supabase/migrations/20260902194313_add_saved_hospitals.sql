CREATE TABLE public.saved_hospitals (
    patient_id uuid NOT NULL,
    hospital_slug text NOT NULL,
    created_at timestamptz DEFAULT now(),
    PRIMARY KEY (patient_id, hospital_slug)
);

ALTER TABLE public.saved_hospitals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view their own saved hospitals"
ON public.saved_hospitals
FOR SELECT
TO authenticated
USING (auth.uid() = patient_id);

CREATE POLICY "Patients can insert their own saved hospitals"
ON public.saved_hospitals
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = patient_id AND
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'patient'
    )
);

CREATE POLICY "Patients can delete their own saved hospitals"
ON public.saved_hospitals
FOR DELETE
TO authenticated
USING (auth.uid() = patient_id);

GRANT SELECT, INSERT, DELETE ON public.saved_hospitals TO authenticated;
GRANT ALL ON public.saved_hospitals TO service_role;

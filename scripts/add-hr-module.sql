-- Ajout du module RH dans les modules activés
INSERT INTO "system_Modules_Enabled" (id, name, enabled, position) 
VALUES (
  'hr-module-' || gen_random_uuid(), 
  'hr', 
  true, 
  8
)
ON CONFLICT (name) DO UPDATE SET
  enabled = true,
  position = 8;

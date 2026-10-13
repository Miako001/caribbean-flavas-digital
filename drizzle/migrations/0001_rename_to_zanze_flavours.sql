UPDATE public.restaurant_settings SET value = 'Zanzé Flavours' WHERE key = 'restaurant_name';
UPDATE public.restaurant_settings SET value = replace(value, 'Caribbean Flavas', 'Zanzé Flavours') WHERE key IN ('description', 'about_intro');
UPDATE public.restaurant_settings SET value = 'hello@zanzeflavours.example' WHERE key = 'email' AND value = 'hello@caribbeanflavas.example';
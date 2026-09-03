-- ROLES ---------------------------------------------------------------
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- MENU CATEGORIES -----------------------------------------------------
CREATE TABLE public.menu_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  display_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.menu_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.menu_categories TO authenticated;
GRANT ALL ON public.menu_categories TO service_role;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active categories" ON public.menu_categories
  FOR SELECT TO anon, authenticated USING (active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage categories" ON public.menu_categories
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER menu_categories_touch BEFORE UPDATE ON public.menu_categories
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- MENU ITEMS ----------------------------------------------------------
CREATE TABLE public.menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.menu_categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  price numeric(10,2),
  image_url text,
  available boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  popular boolean NOT NULL DEFAULT false,
  new_item boolean NOT NULL DEFAULT false,
  chefs_pick boolean NOT NULL DEFAULT false,
  spicy boolean NOT NULL DEFAULT false,
  dietary_tags text[] NOT NULL DEFAULT '{}',
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.menu_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.menu_items TO authenticated;
GRANT ALL ON public.menu_items TO service_role;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read menu items" ON public.menu_items
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage menu items" ON public.menu_items
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER menu_items_touch BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- OFFERS --------------------------------------------------------------
CREATE TABLE public.offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  price numeric(10,2),
  discount text,
  start_date date,
  end_date date,
  active boolean NOT NULL DEFAULT true,
  terms text,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.offers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.offers TO authenticated;
GRANT ALL ON public.offers TO service_role;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read offers" ON public.offers
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage offers" ON public.offers
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER offers_touch BEFORE UPDATE ON public.offers
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- TESTIMONIALS --------------------------------------------------------
CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  review text NOT NULL,
  rating int NOT NULL DEFAULT 5,
  review_date date,
  approved boolean NOT NULL DEFAULT false,
  visible boolean NOT NULL DEFAULT true,
  is_sample boolean NOT NULL DEFAULT false,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testimonials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read visible testimonials" ON public.testimonials
  FOR SELECT TO anon, authenticated USING ((approved = true AND visible = true) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage testimonials" ON public.testimonials
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER testimonials_touch BEFORE UPDATE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- RESTAURANT SETTINGS (single row keyed by key/value pairs) ------------
CREATE TABLE public.restaurant_settings (
  key text PRIMARY KEY,
  value text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.restaurant_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.restaurant_settings TO authenticated;
GRANT ALL ON public.restaurant_settings TO service_role;
ALTER TABLE public.restaurant_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read settings" ON public.restaurant_settings
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage settings" ON public.restaurant_settings
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER restaurant_settings_touch BEFORE UPDATE ON public.restaurant_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- FEEDBACK ------------------------------------------------------------
CREATE TABLE public.feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  email text,
  rating int,
  message text NOT NULL,
  enjoyed_most text,
  would_recommend text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.feedback TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.feedback TO authenticated;
GRANT ALL ON public.feedback TO service_role;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit feedback" ON public.feedback
  FOR INSERT TO anon, authenticated WITH CHECK (
    char_length(message) BETWEEN 1 AND 2000
    AND (name IS NULL OR char_length(name) <= 100)
    AND (email IS NULL OR char_length(email) <= 255)
    AND (rating IS NULL OR rating BETWEEN 1 AND 5)
  );
CREATE POLICY "Admins read feedback" ON public.feedback
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete feedback" ON public.feedback
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- SEED ----------------------------------------------------------------
INSERT INTO public.menu_categories (name, slug, description, display_order) VALUES
  ('Jamaican Classics', 'jamaican-classics', 'The dishes that built the flava.', 1),
  ('Mains', 'mains', 'Big plates, bigger flava.', 2),
  ('Sides', 'sides', 'The perfect supporting cast.', 3),
  ('Reggae Fries', 'reggae-fries', 'Loaded fries, island style.', 4),
  ('Drinks', 'drinks', 'Tropical refreshment.', 5),
  ('Desserts', 'desserts', 'Sweet island endings.', 6),
  ('Specials', 'specials', 'Limited-time flava.', 7);

INSERT INTO public.menu_items (category_id, name, description, price, image_url, featured, popular, chefs_pick, spicy, display_order)
SELECT c.id, 'Jerk Chicken',
  'Tender chicken marinated in Caribbean spices and jerk seasoning, grilled to perfection with that unmistakable smoky Jamaican flava.',
  12.50, '/images/dish-jerk-chicken.jpg', true, true, false, true, 1
FROM public.menu_categories c WHERE c.slug = 'jamaican-classics';

INSERT INTO public.menu_items (category_id, name, description, price, image_url, featured, popular, chefs_pick, display_order)
SELECT c.id, 'Flavoured Oxtail',
  'Slow-cooked, rich and tender oxtail infused with bold Caribbean flavours for a deep, unforgettable taste.',
  16.00, '/images/dish-oxtail.jpg', true, false, true, 2
FROM public.menu_categories c WHERE c.slug = 'jamaican-classics';

INSERT INTO public.menu_items (category_id, name, description, price, image_url, featured, spicy, display_order)
SELECT c.id, 'Jerked Goat',
  'Tender goat seasoned with our signature jerk spices and slow-cooked for a rich, spicy Caribbean experience.',
  15.00, '/images/dish-jerked-goat.jpg', true, true, 3
FROM public.menu_categories c WHERE c.slug = 'mains';

INSERT INTO public.menu_items (category_id, name, description, price, image_url, featured, new_item, display_order)
SELECT c.id, 'Reggae Fries',
  'Crispy golden fries loaded with Caribbean-inspired flavours and our signature toppings.',
  7.50, '/images/dish-reggae-fries.jpg', true, true, 4
FROM public.menu_categories c WHERE c.slug = 'reggae-fries';

INSERT INTO public.offers (title, description, image_url, price, discount, start_date, end_date, active, terms, display_order) VALUES
  ('Jerk Chicken Combo', 'Jerk chicken served with selected Caribbean sides and a drink.', '/images/dish-jerk-chicken.jpg', 15.00, 'Save 15%', CURRENT_DATE, CURRENT_DATE + 60, true, 'Dine-in and takeaway. While stocks last.', 1),
  ('Oxtail Special', 'A special serving of our flavoured oxtail with your choice of side.', '/images/dish-oxtail.jpg', 18.00, NULL, CURRENT_DATE, CURRENT_DATE + 60, true, 'Subject to availability.', 2),
  ('Weekend Flavas', 'Special weekend food deals and limited-time dishes.', '/images/dish-reggae-fries.jpg', NULL, 'Weekend only', CURRENT_DATE, CURRENT_DATE + 60, true, 'Available Friday to Sunday.', 3);

INSERT INTO public.testimonials (customer_name, review, rating, approved, visible, is_sample, display_order) VALUES
  ('Sample Review', 'The flavours were amazing. Definitely coming back!', 5, true, true, true, 1),
  ('Sample Review', 'The jerk chicken was incredible. Proper Caribbean flava!', 5, true, true, true, 2),
  ('Sample Review', 'Great food, great vibes and amazing service.', 5, true, true, true, 3);

INSERT INTO public.restaurant_settings (key, value) VALUES
  ('restaurant_name', 'Caribbean Flavas'),
  ('tagline', 'Taste the Flavas of the Caribbean'),
  ('description', 'Caribbean Flavas brings the bold, vibrant flavours of Jamaica and the Caribbean to your plate.'),
  ('phone', '+00 000 000 0000'),
  ('whatsapp', ''),
  ('email', 'hello@caribbeanflavas.example'),
  ('address', 'Address coming soon'),
  ('opening_hours', 'Mon - Sun: hours coming soon'),
  ('instagram', ''),
  ('tiktok', ''),
  ('facebook', ''),
  ('qr_code_url', ''),
  ('qr_menu_destination', '/menu'),
  ('about_intro', 'Caribbean Flavas brings the bold, vibrant flavours of Jamaica and the Caribbean to your plate. We are a small restaurant with big flava, serving food inspired by the culture, flavours, and spirit of the islands.'),
  ('about_flava_source', 'Our food is inspired by Jamaican and wider Caribbean cooking: jerk spice over open heat, slow-cooked stews, fresh herbs, scotch bonnet warmth, and sides that make a plate feel complete.'),
  ('about_small_big', 'We are a small kitchen, and that is on purpose. Smaller means we can care about every plate, season properly, cook to order where we can, and treat every guest like family.'),
  ('about_philosophy', 'Food first. Culture always. Hospitality that feels warm. And a community we want to keep feeding for a long time.');

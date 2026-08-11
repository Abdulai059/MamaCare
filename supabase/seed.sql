-- =========================================================
-- MAMALINK SEED DATA
-- For local development and testing
-- =========================================================

-- Insert test regions
insert into regions (name) values
  ('Northern Region'),
  ('Ashanti Region'),
  ('Western Region')
on conflict (name) do nothing;

-- Insert test districts
insert into districts (region_id, name) values
  ((select id from regions where name = 'Northern Region'), 'Tamale Metropolitan'),
  ((select id from regions where name = 'Northern Region'), 'Sagnarigu District'),
  ((select id from regions where name = 'Ashanti Region'), 'Kumasi Metropolitan'),
  ((select id from regions where name = 'Western Region'), 'Sekondi-Takoradi Metropolitan')
on conflict (region_id, name) do nothing;

-- Insert test communities
insert into communities (district_id, name) values
  ((select id from districts where name = 'Tamale Metropolitan'), 'Downtown Tamale'),
  ((select id from districts where name = 'Tamale Metropolitan'), 'Aboabo'),
  ((select id from districts where name = 'Sagnarigu District'), 'Nyohani'),
  ((select id from districts where name = 'Kumasi Metropolitan'), 'Bantama'),
  ((select id from districts where name = 'Western Region'), 'Effia')
on conflict (district_id, name) do nothing;

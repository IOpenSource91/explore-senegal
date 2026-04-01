-- Remove default demo prices from the initial seeded tours.
-- Admins can add prices manually later when they actually want them displayed.

UPDATE tours
SET price = NULL
WHERE (slug = 'aventure-lac-rose' AND price = 125)
   OR (slug = 'decouverte-villages-mbodienne' AND price = 95)
   OR (slug = 'ile-de-goree-histoire-culture' AND price = 110);

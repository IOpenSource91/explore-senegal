import { ArrowRight, Clock3, MapPinned, Mountain, Users } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { cn, formatPrice } from '@/lib/utils';
import {
  getDifficultyLabel,
  getRouteDestinationNames,
  getTourName,
  getTourShortDescription,
} from '@/lib/public';
import type { Destination, Tour } from '@/types/database';

type TourDestinationRelation = {
  destination?: Pick<Destination, 'name'> | null;
};

type TourCardTour = Pick<
  Tour,
  | 'id'
  | 'name'
  | 'name_en'
  | 'name_es'
  | 'slug'
  | 'short_description'
  | 'short_description_en'
  | 'short_description_es'
  | 'duration'
  | 'price'
  | 'currency'
  | 'max_group_size'
  | 'difficulty'
  | 'cover_image'
  | 'featured'
> & {
  tour_destinations?: TourDestinationRelation[] | null;
};

interface TourCardLabels {
  cta: string;
  featured: string;
  from: string;
  people: string;
  route: string;
}

interface TourCardProps {
  tour: TourCardTour;
  locale: string;
  labels: TourCardLabels;
  className?: string;
}

export function TourCard({
  tour,
  locale,
  labels,
  className,
}: TourCardProps) {
  const name = getTourName(tour, locale);
  const description = getTourShortDescription(tour, locale);
  const routeStops = getRouteDestinationNames(tour.tour_destinations).slice(0, 3);
  const difficulty = getDifficultyLabel(locale, tour.difficulty);
  const price = tour.price ? formatPrice(tour.price, tour.currency) : null;

  return (
    <Link
      href={`/circuits/${tour.slug}` as any}
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-[1.8rem] border border-outline-variant/45 bg-surface-container-lowest shadow-[0_18px_42px_rgba(96,54,19,0.08)] transition-transform duration-300 hover:-translate-y-1',
        className
      )}
    >
      <div className="relative aspect-[16/11] overflow-hidden bg-surface-container-high">
        {tour.cover_image ? (
          <>
            <img
              src={tour.cover_image}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 scrim-card" />
          </>
        ) : (
          <div className="gradient-hero h-full w-full" />
        )}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-5">
          {tour.featured ? (
            <span className="rounded-full bg-black/30 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-sm">
              {labels.featured}
            </span>
          ) : (
            <span />
          )}
          {price && (
            <span className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-primary shadow-sm">
              {labels.from} {price}
            </span>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          {routeStops.length > 0 && (
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/72">
              <MapPinned size={13} />
              <span>{routeStops.join(' · ')}</span>
            </div>
          )}
          <h3 className="max-w-[18rem] font-heading text-[1.85rem] font-bold leading-tight">
            {name}
          </h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-5 p-5">
        <p className="line-clamp-3 text-[15px] leading-7 text-on-surface-variant">
          {description}
        </p>

        <div className="flex flex-wrap gap-2">
          {tour.duration && (
            <span className="inline-flex items-center gap-2 rounded-full bg-surface-container px-4 py-2 text-sm font-medium text-on-surface">
              <Clock3 size={14} className="text-primary" />
              <span>{tour.duration}</span>
            </span>
          )}

          {tour.max_group_size && (
            <span className="inline-flex items-center gap-2 rounded-full bg-surface-container px-4 py-2 text-sm font-medium text-on-surface">
              <Users size={14} className="text-primary" />
              <span>
                {tour.max_group_size} {labels.people}
              </span>
            </span>
          )}

          {difficulty && (
            <span className="inline-flex items-center gap-2 rounded-full bg-surface-container px-4 py-2 text-sm font-medium text-on-surface">
              <Mountain size={14} className="text-primary" />
              <span>{difficulty}</span>
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-outline-variant/30 pt-4">
          <span className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
            {labels.cta}
          </span>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white transition-transform duration-300 group-hover:translate-x-1">
            <ArrowRight size={18} />
          </span>
        </div>
      </div>
    </Link>
  );
}

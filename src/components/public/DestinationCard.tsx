import { ArrowRight, Compass, MapPinned } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { getDestinationDescription, getDestinationTagline } from '@/lib/public';
import type { Destination } from '@/types/database';

type DestinationCardDestination = Pick<
  Destination,
  | 'id'
  | 'name'
  | 'description'
  | 'description_en'
  | 'description_es'
  | 'tagline'
  | 'tagline_en'
  | 'tagline_es'
  | 'cover_image'
> & {
  tour_destinations?: Array<{ tour_id: string }> | null;
};

interface DestinationCardProps {
  destination: DestinationCardDestination;
  locale: string;
  ctaLabel: string;
  countLabel: string;
}

export function DestinationCard({
  destination,
  locale,
  ctaLabel,
  countLabel,
}: DestinationCardProps) {
  const description = getDestinationDescription(destination, locale);
  const tagline = getDestinationTagline(destination, locale);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.8rem] border border-outline-variant/45 bg-surface-container-lowest shadow-[0_18px_42px_rgba(96,54,19,0.08)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-container-high">
        {destination.cover_image ? (
          <>
            <img
              src={destination.cover_image}
              alt={destination.name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 scrim-card" />
          </>
        ) : (
          <div className="gradient-hero h-full w-full" />
        )}

        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          {tagline && (
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-black/26 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm">
              <MapPinned size={13} />
              <span>{tagline}</span>
            </div>
          )}
          <h3 className="max-w-[16rem] font-heading text-[1.9rem] font-bold leading-tight">
            {destination.name}
          </h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-5 p-5">
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-surface-container px-4 py-2 text-sm font-medium text-on-surface">
          <Compass size={14} className="text-primary" />
          <span>{countLabel}</span>
        </span>

        <p className="line-clamp-3 text-[15px] leading-7 text-on-surface-variant">
          {description}
        </p>

        <div className="mt-auto border-t border-outline-variant/30 pt-4">
          <Link
            href="/circuits"
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-primary"
          >
            <span>{ctaLabel}</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}

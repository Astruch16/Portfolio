import { CashVisual } from "@/components/work/visuals/cash-visual";
import { ChartVisual } from "@/components/work/visuals/chart-visual";
import { CommerceVisual } from "@/components/work/visuals/commerce-visual";
import { MapVisual } from "@/components/work/visuals/map-visual";
import { PropertyVisual } from "@/components/work/visuals/property-visual";
import type { ProjectVisual } from "@/data/projects";

/** Shared by the work index and the case studies, so a project's placeholder
    reads the same wherever it appears. */
export const COMPOSITIONS: Record<
  ProjectVisual,
  (props: { accent: string }) => React.ReactElement
> = {
  map: MapVisual,
  commerce: CommerceVisual,
  chart: ChartVisual,
  property: PropertyVisual,
  cash: CashVisual,
};

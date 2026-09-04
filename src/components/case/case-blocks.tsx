import { ArchitectureDiagram } from "@/components/case/architecture-diagram";
import { ArrowSequence } from "@/components/case/arrow-sequence";
import { CaseVisualFrame } from "@/components/case/case-visual";
import { DataTerminal } from "@/components/case/data-terminal";
import { DesignSpecimen } from "@/components/case/design-specimen";
import { IngestionPipeline } from "@/components/case/ingestion-pipeline";
import { MarketplaceLoop } from "@/components/case/marketplace-loop";
import { MarketSpecimen } from "@/components/case/market-specimen";
import { RedemptionFlow } from "@/components/case/redemption-flow";
import { StackDiagram } from "@/components/case/stack-diagram";
import { TechStack } from "@/components/case/tech-stack";
import { TwoSided } from "@/components/case/two-sided";
import { sequenceTone } from "@/components/case/sequence-tones";
import { Lift, MaskReveal } from "@/components/motion/reveal";
import type { CaseBlock } from "@/data/case-studies";
import type { Project } from "@/data/projects";

/**
 * One renderer per block type.
 *
 * Each keeps the page's existing language — mono labels, hairlines, the same
 * type ramp — so a chapter made of four different blocks still reads as one
 * document. Nothing here is a card.
 */

function Paragraphs({ items }: { items: string[] }) {
  return (
    <Lift onView className="flex max-w-[62ch] flex-col gap-6">
      {items.map((paragraph, i) => (
        <p key={i} className="text-lead text-muted">
          {paragraph}
        </p>
      ))}
    </Lift>
  );
}

/** Weight without a container: an accent rule, a step up in scale, and room. */
function Emphasis({ lines, accent }: { lines: string[]; accent: string }) {
  return (
    <div
      className="max-w-[46ch] border-l-2 py-1 pl-6 lg:-ml-6"
      style={{ borderColor: accent }}
    >
      {lines.map((line, i) => (
        <p
          key={line}
          className="display text-[clamp(1.15rem,2.1vw,1.75rem)] leading-[1.2] text-fg"
        >
          <MaskReveal onView delay={i * 0.08}>
            {line}
          </MaskReveal>
        </p>
      ))}
    </div>
  );
}

function Steps({ items, accent }: { items: string[]; accent: string }) {
  return <ArrowSequence items={items} accent={accent} />;
}

function Decisions({
  label,
  items,
  accent,
}: {
  label: string;
  items: string[];
  accent: string;
}) {
  return (
    <div className="max-w-[52ch]">
      <p className="label text-faint">{label}</p>
      <ul className="mt-4">
        {items.map((item, i) => (
          <Lift
            key={item}
            onView
            delay={i * 0.06}
            as="li"
            className="flex gap-6 border-t border-hairline py-4"
          >
            <span
              className="label shrink-0"
              style={{ color: sequenceTone(i, accent) }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="label text-muted">{item}</span>
          </Lift>
        ))}
      </ul>
    </div>
  );
}

function Transform({
  rows,
  accent,
}: {
  rows: { label: string; value: string }[];
  accent: string;
}) {
  return (
    <div className="max-w-[46ch] border-l border-hairline-strong pl-6">
      {rows.map((row, i) => {
        const last = i === rows.length - 1;
        return (
          <Lift
            key={row.label}
            onView
            delay={i * 0.08}
            className="border-t border-hairline py-5 first:border-t-0 first:pt-0"
          >
            <p className="label" style={last ? { color: accent } : undefined}>
              {row.label}
            </p>
            <p className="display mt-2 text-[clamp(1rem,1.7vw,1.4rem)] leading-tight text-fg">
              {row.value}
            </p>
          </Lift>
        );
      })}
    </div>
  );
}

function Statement({ lines }: { lines: string[] }) {
  return (
    <p className="display text-[clamp(1.6rem,4vw,3.25rem)] leading-[0.98] text-fg">
      {lines.map((line, i) => (
        <MaskReveal key={line} onView delay={i * 0.08}>
          {line}
        </MaskReveal>
      ))}
    </p>
  );
}

function Metrics({
  metrics,
  accent,
}: {
  metrics: { value: string | null; label: string }[];
  accent: string;
}) {
  return (
    <div className="grid gap-x-8 gap-y-10 sm:grid-cols-3">
      {metrics.map((metric, i) => (
        <Lift key={metric.label} onView delay={0.06 + i * 0.06}>
          {metric.value ? (
            <p
              className="display text-[clamp(2.25rem,4.5vw,3.5rem)] leading-none"
              style={{ color: accent }}
            >
              {metric.value}
            </p>
          ) : (
            <p className="font-mono text-[clamp(2rem,4vw,3rem)] leading-none font-light text-faint">
              &mdash;
            </p>
          )}
          <p className="label mt-4 border-t border-hairline pt-3 text-muted">
            {metric.label}
          </p>
        </Lift>
      ))}
    </div>
  );
}

function TitledList({
  items,
  accent,
}: {
  items: { title: string; body: string }[];
  accent: string;
}) {
  return (
    <ul className="max-w-[62ch]">
      {items.map((item, i) => (
        <Lift
          key={item.title}
          onView
          delay={i * 0.06}
          as="li"
          className="flex gap-6 border-t border-hairline py-6"
        >
          <span
            className="label shrink-0"
            style={{ color: sequenceTone(i, accent) }}
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <span>
            <span className="label block text-fg">{item.title}</span>
            <span className="mt-2 block text-lead text-muted">{item.body}</span>
          </span>
        </Lift>
      ))}
    </ul>
  );
}

function Gallery({ visuals, project }: { visuals: CaseBlock & { type: "gallery" }; project: Project }) {
  return (
    <div className="flex flex-col gap-10">
      {visuals.visuals.map((visual, i) => (
        <Lift key={visual.title ?? i} onView delay={0.04}>
          {visual.title ? (
            <p className="label mb-3 text-fg">
              <span className="text-faint">{String(i + 1).padStart(2, "0")} / </span>
              {visual.title}
            </p>
          ) : null}
          <CaseVisualFrame visual={{ ...visual, caption: null }} project={project} />
          {visual.caption ? (
            <p className="mt-3 max-w-[52ch] font-mono text-[0.6875rem] leading-[1.7] text-muted">
              {visual.caption}
            </p>
          ) : null}
        </Lift>
      ))}
    </div>
  );
}

export function CaseBlockRenderer({
  block,
  project,
}: {
  block: CaseBlock;
  project: Project;
}) {
  switch (block.type) {
    case "paragraphs":
      return <Paragraphs items={block.items} />;
    case "emphasis":
      return <Emphasis lines={block.lines} accent={project.accent} />;
    case "steps":
      return <Steps items={block.items} accent={project.accent} />;
    case "decisions":
      return (
        <Decisions label={block.label} items={block.items} accent={project.accent} />
      );
    case "architecture":
      return <ArchitectureDiagram nodes={block.nodes} accent={project.accent} />;
    case "transform":
      return <Transform rows={block.rows} accent={project.accent} />;
    case "statement":
      return <Statement lines={block.lines} />;
    case "metrics":
      return <Metrics metrics={block.metrics} accent={project.accent} />;
    case "list":
      return <TitledList items={block.items} accent={project.accent} />;
    case "gallery":
      return <Gallery visuals={block} project={project} />;
    case "loop":
      return (
        <MarketplaceLoop hub={block.hub} stages={block.stages} accent={project.accent} />
      );
    case "flow":
      return (
        <RedemptionFlow
          source={block.source}
          branches={block.branches}
          chain={block.chain}
          accent={project.accent}
        />
      );
    case "mirror":
      return <TwoSided sides={block.sides} accent={project.accent} />;
    case "stack":
      return (
        <StackDiagram
          entries={block.entries}
          core={block.core}
          infra={block.infra}
          data={block.data}
          systems={block.systems}
          accent={project.accent}
        />
      );
    case "specimen":
      return <DesignSpecimen swatches={block.swatches} accent={project.accent} />;
    case "terminal":
      return (
        <DataTerminal
          hub={block.hub}
          sources={block.sources}
          features={block.features}
          accent={project.accent}
        />
      );
    case "ingestion":
      return (
        <IngestionPipeline
          sources={block.sources}
          stages={block.stages}
          features={block.features}
          accent={project.accent}
        />
      );
    case "mint-specimen":
      return <MarketSpecimen swatches={block.swatches} />;
    case "techstack":
      return <TechStack groups={block.groups} accent={project.accent} />;
  }
}

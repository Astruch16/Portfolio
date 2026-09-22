"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

import { SymbolTopography } from "@/components/about/symbol-topography";
import { CarrierWave } from "@/components/contact/carrier-wave";
import { PacketStream } from "@/components/contact/packet-stream";
import { NameField } from "@/components/hero/name-field";
import { SculptureStatic } from "@/components/hero/sculpture-static";
import { Action, Choice, Exhibit, Slider } from "@/components/playground/exhibit";
import type { MosaicLine } from "@/data/name-mosaic";
import { MOSAIC_CELL, nameMosaic } from "@/data/name-mosaic";
import { sampleMosaic } from "@/lib/mosaic-sampler";
import { FORMS, type FormIndex } from "@/lib/sculpture-forms";
import { sculpture } from "@/lib/sculpture-state";
import { uplink } from "@/lib/uplink";

/**
 * The specimens: the site's own live pieces, off the page they work on and
 * wired to controls.
 *
 * Every one is the component the site actually ships — imported, not rebuilt —
 * so what a visitor turns here is the same code running in the hero, the about
 * page and the contact form. Nothing is a video or a screenshot.
 */

const SculptureScene = dynamic(
  () => import("@/components/hero/sculpture-scene").then((m) => m.SculptureScene),
  { ssr: false },
);

/* --- 01 · The sculpture ------------------------------------------------------ */

const RENDERERS = [
  { id: "webgl", label: "WebGL" },
  { id: "flat", label: "Flat canvas" },
] as const;

export function SculptureSpecimen() {
  const state = useSyncExternalStore(
    sculpture.subscribe,
    sculpture.getSnapshot,
    sculpture.getServerSnapshot,
  );
  const [renderer, setRenderer] = useState<(typeof RENDERERS)[number]["id"]>("webgl");

  return (
    <Exhibit
      index="01"
      title="The sculpture"
      where="The hero"
      href="/"
      note="A few thousand particles carrying their position in all six forms at once. One shader blends between them, so a morph is one draw call rather than six models. The flat canvas runs the same morph, lift and sway on the CPU for phones and reduced motion, and never downloads three.js."
      stageClassName="aspect-4/3"
      controls={
        <>
          <Choice
            label="Form"
            value={FORMS[state.form]}
            options={FORMS.map((form) => ({ id: form, label: form }))}
            onChange={(form) => sculpture.choose(FORMS.indexOf(form) as FormIndex)}
          />
          <Choice
            label="Renderer"
            value={renderer}
            options={RENDERERS}
            onChange={setRenderer}
          />
          <Action label="Scatter it" onClick={() => sculpture.scatter()} />
        </>
      }
    >
      {renderer === "webgl" ? (
        <SculptureScene active fit={1} lift={0} shift={0} />
      ) : (
        <SculptureStatic fit={1} lift={0} shift={0} />
      )}
      <p className="label pointer-events-none absolute bottom-3 left-4 text-faint">
        {renderer === "webgl" ? "Drag to turn · click to scatter" : "Tap to scatter · no WebGL"}
      </p>
    </Exhibit>
  );
}

/* --- 02 · The name field ------------------------------------------------------ */

export function NameSpecimen() {
  const [first, setFirst] = useState("Adam");
  const [second, setSecond] = useState("Struch");
  const [cell, setCell] = useState(MOSAIC_CELL);
  const [ready, setReady] = useState(false);

  // The sample needs the display face itself; before it lands, the name the
  // hero ships stands in.
  useEffect(() => {
    let live = true;
    document.fonts.ready.then(() => {
      if (live) setReady(true);
    });
    return () => {
      live = false;
    };
  }, []);

  const wanted = useMemo(() => [first, second].filter((line) => line.trim().length), [first, second]);

  // Derived rather than stored: a sample is a canvas read per line, cheap
  // enough to take on every keystroke at this size, and there is nothing worth
  // keeping between runs. It only ever runs in the browser, since `ready` is
  // set by an effect.
  const lines: MosaicLine[] = useMemo(
    () => (ready && wanted.length ? sampleMosaic(wanted, cell) : nameMosaic),
    [ready, wanted, cell],
  );

  const field = (
    <label className="block">
      <span className="label text-faint">First line</span>
      <input
        value={first}
        maxLength={12}
        onChange={(event) => setFirst(event.target.value)}
        className="mt-2 w-full border-0 border-b border-hairline-strong bg-transparent py-2 font-mono text-[0.9375rem] text-fg caret-accent outline-none transition-colors focus:border-accent"
      />
    </label>
  );

  return (
    <Exhibit
      index="02"
      title="The name field"
      where="The hero"
      href="/"
      note="The letterforms are sampled from the real display face — every cell of ink becomes one code symbol with a home to return to. Type your own and it re-samples as you go. Move across it and the symbols part; press it and the whole thing blows apart."
      stageClassName="grid min-h-[20rem] place-items-center px-6 py-10"
      controls={
        <>
          {field}
          <label className="block">
            <span className="label text-faint">Second line</span>
            <input
              value={second}
              maxLength={12}
              onChange={(event) => setSecond(event.target.value)}
              className="mt-2 w-full border-0 border-b border-hairline-strong bg-transparent py-2 font-mono text-[0.9375rem] text-fg caret-accent outline-none transition-colors focus:border-accent"
            />
          </label>
          <Slider
            label="Cell pitch"
            value={Number(cell.toFixed(3))}
            min={0.028}
            max={0.07}
            step={0.002}
            suffix="em"
            onChange={setCell}
          />
        </>
      }
    >
      <span className="display block text-[clamp(2.25rem,6vw,4.5rem)] text-fg">
        <NameField
          key={lines.map((line) => line.text).join("/")}
          lines={lines}
          typed={lines.map(() => true)}
          enabled
          charMs={40}
        />
      </span>
      <span className="sr-only">
        {wanted.join(" ")} drawn as a field of code symbols.
      </span>
    </Exhibit>
  );
}

/* --- 03 · The topography ------------------------------------------------------ */

export function TopographySpecimen() {
  const [pitch, setPitch] = useState(8);
  const [fontPx, setFontPx] = useState(6.5);
  const [levels, setLevels] = useState(30);

  return (
    <Exhibit
      index="03"
      title="Symbol topography"
      where="The about page"
      href="/about"
      note="A height field contoured by marching squares, where the lines are never stroked: each cell a contour passes through gets one symbol at the crossing. Because the grid pitch matches the symbol spacing, they fall into runs that read as lines from across the room and as code up close."
      stageClassName="h-[clamp(18rem,45vh,26rem)]"
      controls={
        <>
          <Slider label="Grid pitch" value={pitch} min={5} max={18} suffix="px" onChange={setPitch} />
          <Slider
            label="Symbol size"
            value={fontPx}
            min={4}
            max={14}
            step={0.5}
            suffix="px"
            onChange={setFontPx}
          />
          <Slider label="Contours" value={levels} min={6} max={60} onChange={setLevels} />
        </>
      }
    >
      <SymbolTopography key={`${pitch}-${fontPx}-${levels}`} pitch={pitch} fontPx={fontPx} levels={levels} />
    </Exhibit>
  );
}

/* --- 04 · The uplink ---------------------------------------------------------- */

export function UplinkSpecimen() {
  const input = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");

  // The contact page's canvases read the same store this writes to, so typing
  // here drives them exactly as typing into the form does.
  useEffect(() => () => uplink.reset(), []);

  return (
    <Exhibit
      index="04"
      title="The uplink"
      where="The contact page"
      href="/contact"
      note="Two canvases fed by one tiny store: a carrier that carries a pulse for every key pressed, and a dish that catches a packet per character and rings as each lands. Neither re-renders React — the form writes to the store, the canvases read it."
      stageClassName="flex h-[clamp(17rem,42vh,23rem)] flex-col"
      controls={
        <>
          <label className="block">
            <span className="label text-faint">Type into it</span>
            <input
              ref={input}
              value={text}
              maxLength={120}
              placeholder="Anything at all"
              onChange={(event) => {
                setText(event.target.value);
                uplink.set({ phase: "writing", length: event.target.value.length });
                uplink.pulse(0.85);
              }}
              className="mt-2 w-full border-0 border-b border-hairline-strong bg-transparent py-2 font-mono text-[0.9375rem] text-fg caret-accent outline-none transition-colors placeholder:text-faint focus:border-accent"
            />
          </label>
          <Action
            label="Send it"
            onClick={() => {
              uplink.set({ phase: "sent" });
              uplink.pulse(3);
              setText("");
              input.current?.focus();
              window.setTimeout(() => uplink.set({ phase: "idle", length: 0 }), 3200);
            }}
          />
        </>
      }
    >
      <CarrierWave className="h-[45%] w-full" />
      <div className="relative flex-1 border-t border-hairline">
        <PacketStream className="absolute inset-0 h-full w-full" />
      </div>
      <p className="label pointer-events-none absolute bottom-3 left-4 text-faint">
        Carrier · packets · dish
      </p>
    </Exhibit>
  );
}

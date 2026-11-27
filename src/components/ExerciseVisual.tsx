import { useEffect, useId, useState } from "react";
import { getVisual, type DiagramId, type Lang } from "../data/visuals";

type Pt = [number, number];

type Pose = {
  head: Pt;
  shoulder: Pt;
  hip: Pt;
  knee: Pt;
  foot: Pt;
  elbow: Pt;
  hand: Pt;
  knee2?: Pt;
  foot2?: Pt;
  elbow2?: Pt;
  hand2?: Pt;
  highlight: Pt;
  tool: "dumbbell" | "barbell" | "cable" | "ball" | "wheel" | "bar";
  toolAt: Pt;
  toolAt2?: Pt;
};

const sumoUp: Pose = {
  head: [120, 28],
  shoulder: [120, 46],
  hip: [120, 84],
  knee: [92, 112],
  foot: [74, 138],
  knee2: [148, 112],
  foot2: [166, 138],
  elbow: [108, 70],
  hand: [112, 96],
  elbow2: [132, 70],
  hand2: [128, 96],
  highlight: [120, 84],
  tool: "dumbbell",
  toolAt: [120, 108],
};

const sumoDown: Pose = {
  ...sumoUp,
  head: [120, 46],
  shoulder: [120, 64],
  hip: [120, 96],
  knee: [86, 118],
  foot: [68, 138],
  knee2: [154, 118],
  foot2: [172, 138],
  elbow: [108, 88],
  hand: [114, 112],
  elbow2: [132, 88],
  hand2: [126, 112],
  highlight: [120, 96],
  toolAt: [120, 124],
};

function pose(diagram: DiagramId, frame: 0 | 1): Pose {
  const table: Record<DiagramId, [Pose, Pose]> = {
    "sumo-db": [sumoUp, sumoDown],
    "pit-pull": [
      arms(false),
      arms(true),
    ],
    tyi: [armsT(false), armsT(true)],
    "block-pull": [hinge(true, "barbell", false), hinge(true, "barbell", true)],
    "offset-squat": [squat(false, "one"), squat(true, "one")],
    "ball-rollout": [roll("ball", false), roll("ball", true)],
    "chin-underhand": [pullup(false), pullup(true)],
    pallof: [pallof(false), pallof(true)],
    "rack-carry": [rack(false), rack(true)],
    "suitcase-rdl": [hinge(false, "dumbbell", false), hinge(false, "dumbbell", true)],
    "close-pushup": [pushup(false), pushup(true)],
    "ab-wheel": [roll("wheel", false), roll("wheel", true)],
    "half-kneel-landmine": [kneelPress("barbell", false), kneelPress("barbell", true)],
    "one-arm-carry": [carry(false), carry(true)],
    "half-kneel-press": [kneelPress("dumbbell", false), kneelPress("dumbbell", true)],
    "cross-carry": [cross(false), cross(true)],
    "db-deadlift": [hinge(true, "dumbbells", false), hinge(true, "dumbbells", true)],
    nordic: [nordic(false), nordic(true)],
  };
  return table[diagram][frame];
}

function arms(bent: boolean): Pose {
  return {
    head: [120, 32],
    shoulder: [120, 50],
    hip: [120, 92],
    knee: [108, 116],
    foot: [104, 138],
    knee2: [132, 116],
    foot2: [136, 138],
    elbow: bent ? [96, 68] : [92, 78],
    hand: bent ? [108, 58] : [88, 104],
    elbow2: bent ? [144, 68] : [148, 78],
    hand2: bent ? [132, 58] : [152, 104],
    highlight: [120, 70],
    tool: "dumbbell",
    toolAt: bent ? [108, 52] : [84, 110],
    toolAt2: bent ? [132, 52] : [156, 110],
  };
}

function armsT(y: boolean): Pose {
  return {
    head: [78, 36],
    shoulder: [96, 52],
    hip: [150, 70],
    knee: [176, 86],
    foot: [196, 98],
    elbow: y ? [70, 28] : [70, 52],
    hand: y ? [48, 12] : [44, 52],
    elbow2: y ? [122, 28] : [122, 52],
    hand2: y ? [146, 12] : [150, 52],
    highlight: [96, 48],
    tool: "dumbbell",
    toolAt: y ? [44, 14] : [40, 52],
    toolAt2: y ? [150, 14] : [154, 52],
  };
}

function hinge(deep: boolean, tool: "barbell" | "dumbbell" | "dumbbells", standing: boolean): Pose {
  if (standing) {
    return {
      head: [118, 26],
      shoulder: [118, 44],
      hip: [122, 82],
      knee: [124, 110],
      foot: [128, 138],
      elbow: [132, 64],
      hand: [136, 86],
      highlight: [122, 78],
      tool: tool === "dumbbells" ? "dumbbell" : tool,
      toolAt: [142, 96],
      toolAt2: tool === "dumbbells" ? [128, 96] : undefined,
    };
  }
  return {
    head: [62, 58],
    shoulder: [84, 70],
    hip: [124, 86],
    knee: [126, 112],
    foot: [130, 138],
    elbow: [70, 86],
    hand: [58, deep ? 118 : 100],
    highlight: [124, 82],
    tool: tool === "dumbbells" ? "dumbbell" : tool,
    toolAt: [52, deep ? 126 : 108],
    toolAt2: tool === "dumbbells" ? [68, deep ? 126 : 108] : undefined,
  };
}

function squat(down: boolean, load: "one"): Pose {
  void load;
  return {
    head: [120, down ? 48 : 28],
    shoulder: [120, down ? 64 : 46],
    hip: [120, down ? 100 : 86],
    knee: [86, down ? 118 : 112],
    foot: [70, 138],
    knee2: [154, down ? 118 : 112],
    foot2: [170, 138],
    elbow: [100, down ? 72 : 58],
    hand: [108, down ? 64 : 50],
    highlight: [120, down ? 96 : 84],
    tool: "dumbbell",
    toolAt: [108, down ? 58 : 44],
  };
}

function roll(tool: "ball" | "wheel", out: boolean): Pose {
  return {
    head: [out ? 168 : 132, out ? 78 : 70],
    shoulder: [out ? 150 : 120, 84],
    hip: [78, 96],
    knee: [62, 116],
    foot: [48, 132],
    elbow: [out ? 176 : 140, 96],
    hand: [out ? 198 : 156, 108],
    highlight: [78, 90],
    tool,
    toolAt: [out ? 206 : 162, 116],
  };
}

function pullup(up: boolean): Pose {
  return {
    head: [120, up ? 36 : 52],
    shoulder: [120, up ? 50 : 68],
    hip: [120, up ? 92 : 104],
    knee: [112, up ? 114 : 120],
    foot: [108, up ? 134 : 138],
    knee2: [128, up ? 114 : 120],
    foot2: [132, up ? 134 : 138],
    elbow: [96, up ? 42 : 52],
    hand: [92, 22],
    elbow2: [144, up ? 42 : 52],
    hand2: [148, 22],
    highlight: [120, up ? 40 : 60],
    tool: "bar",
    toolAt: [120, 18],
  };
}

function pallof(out: boolean): Pose {
  return {
    head: [128, 32],
    shoulder: [128, 50],
    hip: [128, 92],
    knee: [118, 116],
    foot: [112, 138],
    knee2: [140, 116],
    foot2: [146, 138],
    elbow: out ? [150, 58] : [116, 64],
    hand: out ? [176, 58] : [108, 70],
    highlight: [128, 78],
    tool: "cable",
    toolAt: out ? [40, 58] : [40, 70],
  };
}

function rack(step: boolean): Pose {
  return {
    head: [116, 26],
    shoulder: [118, 44],
    hip: [120, 84],
    knee: [118, 112],
    foot: [step ? 108 : 116, 138],
    knee2: [132, 110],
    foot2: [step ? 150 : 136, 138],
    elbow: [100, 58],
    hand: [108, 48],
    elbow2: [138, 58],
    hand2: [130, 48],
    highlight: [120, 70],
    tool: "dumbbell",
    toolAt: [104, 42],
    toolAt2: [134, 42],
  };
}

function pushup(down: boolean): Pose {
  return {
    head: [168, down ? 78 : 62],
    shoulder: [150, down ? 86 : 70],
    hip: [96, down ? 92 : 78],
    knee: [70, down ? 100 : 88],
    foot: [40, down ? 108 : 98],
    elbow: [158, down ? 100 : 86],
    hand: [172, 112],
    highlight: [150, 80],
    tool: "none" as unknown as Pose["tool"],
    toolAt: [176, 116],
  };
}

function kneelPress(tool: "dumbbell" | "barbell", up: boolean): Pose {
  return {
    head: [132, up ? 24 : 36],
    shoulder: [128, up ? 42 : 54],
    hip: [118, 90],
    knee: [104, 124],
    foot: [78, 132],
    knee2: [146, 118],
    foot2: [168, 136],
    elbow: up ? [146, 28] : [146, 62],
    hand: up ? [150, 14] : [150, 48],
    highlight: [128, 50],
    tool,
    toolAt: up ? [154, 12] : [156, 46],
  };
}

function carry(step: boolean): Pose {
  return {
    head: [118, 26],
    shoulder: [118, 44],
    hip: [120, 84],
    knee: [116, 112],
    foot: [step ? 104 : 114, 138],
    knee2: [132, 110],
    foot2: [step ? 148 : 134, 138],
    elbow: [136, 70],
    hand: [140, 98],
    highlight: [120, 78],
    tool: "dumbbell",
    toolAt: [146, 108],
  };
}

function cross(step: boolean): Pose {
  return {
    head: [120, 28],
    shoulder: [120, 48],
    hip: [120, 88],
    knee: [108, 114],
    foot: [step ? 96 : 104, 138],
    knee2: [136, 114],
    foot2: [step ? 156 : 140, 138],
    elbow: [104, 62],
    hand: [136, 70],
    highlight: [120, 74],
    tool: "dumbbell",
    toolAt: [142, 74],
  };
}

function nordic(down: boolean): Pose {
  return down
    ? {
        head: [176, 96],
        shoulder: [156, 100],
        hip: [96, 108],
        knee: [70, 124],
        foot: [48, 132],
        elbow: [170, 112],
        hand: [186, 124],
        highlight: [96, 104],
        tool: "bar",
        toolAt: [40, 128],
      }
    : {
        head: [108, 28],
        shoulder: [104, 46],
        hip: [96, 86],
        knee: [78, 116],
        foot: [56, 132],
        elbow: [120, 64],
        hand: [126, 84],
        highlight: [96, 80],
        tool: "bar",
        toolAt: [48, 128],
      };
}

const COPY: Record<DiagramId, { en: [string, string]; pt: [string, string] }> = {
  "sumo-db": {
    en: ["Wide stance, stand tall", "Hips back, dumbbell lowers"],
    pt: ["Base larga, em pé", "Anca atrás, haltere desce"],
  },
  "pit-pull": {
    en: ["Arms long", "Thumbs toward the armpits, hold"],
    pt: ["Braços longos", "Polegares às axilas, segura"],
  },
  tyi: {
    en: ["T: arms out to the sides", "Y: arms angled overhead"],
    pt: ["T: braços aos lados", "Y: braços em diagonal"],
  },
  "block-pull": {
    en: ["Bar starts on blocks, about knee height", "Stand tall"],
    pt: ["Barra em blocos, à altura do joelho", "Fica alto"],
  },
  "offset-squat": {
    en: ["One dumbbell at the chest", "Squat, weight stays offset"],
    pt: ["Um haltere no peito", "Agacha, peso fica de lado"],
  },
  "ball-rollout": {
    en: ["Hands on the ball, knees down", "Roll the ball forward"],
    pt: ["Mãos na bola, joelhos no chão", "Rola a bola à frente"],
  },
  "chin-underhand": {
    en: ["Hang, palms toward you", "Pull until the chin clears the bar"],
    pt: ["Suspenso, palmas para ti", "Puxa até o queixo passar a barra"],
  },
  pallof: {
    en: ["Half kneel, hands at the chest", "Press straight out, resist the twist"],
    pt: ["Meio ajoelhado, mãos no peito", "Empurra em frente, sem rodar"],
  },
  "rack-carry": {
    en: ["Dumbbells racked at the shoulders", "Walk"],
    pt: ["Halteres nos ombros", "Caminha"],
  },
  "suitcase-rdl": {
    en: ["One dumbbell at the side", "Hinge, weight stays on one side"],
    pt: ["Um haltere ao lado", "Flexão da anca, peso de um lado"],
  },
  "close-pushup": {
    en: ["Hands close under the chest", "Lower with elbows tight"],
    pt: ["Mãos juntas sob o peito", "Desce com os cotovelos junto ao corpo"],
  },
  "ab-wheel": {
    en: ["Knees down, wheel under the shoulders", "Roll forward"],
    pt: ["Joelhos no chão, roda sob os ombros", "Rola à frente"],
  },
  "half-kneel-landmine": {
    en: ["Half kneel, landmine at the shoulder", "Press up and out"],
    pt: ["Meio ajoelhado, landmine no ombro", "Empurra para cima e à frente"],
  },
  "one-arm-carry": {
    en: ["One heavy dumbbell at the side", "Walk without leaning"],
    pt: ["Um haltere pesado ao lado", "Caminha sem inclinar"],
  },
  "half-kneel-press": {
    en: ["Half kneel, dumbbell at the shoulder", "Press overhead"],
    pt: ["Meio ajoelhado, haltere no ombro", "Empurra acima da cabeça"],
  },
  "cross-carry": {
    en: ["Dumbbell held across the body", "Walk"],
    pt: ["Haltere cruzado à frente do corpo", "Caminha"],
  },
  "db-deadlift": {
    en: ["Dumbbells beside the feet", "Stand tall"],
    pt: ["Halteres junto aos pés", "Fica alto"],
  },
  nordic: {
    en: ["Kneel, ankles fixed", "Lower the body under control"],
    pt: ["Ajoelha, tornozelos fixos", "Desce o corpo controlado"],
  },
};

function Tool({ pose }: { pose: Pose }) {
  const spots = [pose.toolAt, pose.toolAt2].filter(Boolean) as Pt[];
  return (
    <g>
      {spots.map((at, index) => (
        <g key={index} transform={`translate(${at[0]} ${at[1]})`}>
          {pose.tool === "dumbbell" ? (
            <>
              <line x1={-8} y1={0} x2={8} y2={0} stroke="#d7e2c8" strokeWidth="3" />
              <circle cx={-10} cy={0} r="5" fill="#c8f542" />
              <circle cx={10} cy={0} r="5" fill="#c8f542" />
            </>
          ) : null}
          {pose.tool === "barbell" ? (
            <>
              <line x1={-22} y1={0} x2={22} y2={0} stroke="#d7e2c8" strokeWidth="3" />
              <rect x={-26} y={-6} width="6" height="12" rx="1" fill="#c8f542" />
              <rect x={20} y={-6} width="6" height="12" rx="1" fill="#c8f542" />
            </>
          ) : null}
          {pose.tool === "ball" ? <circle r="12" fill="#7eb6d6" /> : null}
          {pose.tool === "wheel" ? (
            <>
              <circle r="8" fill="none" stroke="#c8f542" strokeWidth="3" />
              <line x1={-14} y1={-8} x2={14} y2={-8} stroke="#d7e2c8" strokeWidth="3" />
            </>
          ) : null}
          {pose.tool === "bar" ? <line x1={-36} y1={0} x2={36} y2={0} stroke="#d7e2c8" strokeWidth="4" /> : null}
          {pose.tool === "cable" ? (
            <>
              <rect x={-6} y={-16} width="10" height="22" rx="1" fill="#8aa08a" />
              <line x1={0} y1={-4} x2={70} y2={0} stroke="#c8f542" strokeWidth="2" />
            </>
          ) : null}
        </g>
      ))}
    </g>
  );
}

function limb(a: Pt, b: Pt, key: string) {
  return <line key={key} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />;
}

export function FormSketch({
  diagram,
  frame,
  lang,
  label,
}: {
  diagram: DiagramId;
  frame: 0 | 1;
  lang: Lang;
  label: string;
}) {
  const p = pose(diagram, frame);
  const caption = COPY[diagram][lang][frame];
  return (
    <svg viewBox="0 0 240 168" className="sketch" role="img" aria-label={label}>
      <rect width="240" height="168" rx="0" fill="#121815" />
      <path d="M16 146 H224" stroke="#314036" strokeWidth="2" />
      <circle cx={p.highlight[0]} cy={p.highlight[1]} r="16" fill="#c8f542" opacity="0.28" />
      <g stroke="#f4f7f2" strokeWidth="6" strokeLinecap="round" fill="none">
        {limb(p.shoulder, p.hip, "torso")}
        {limb(p.hip, p.knee, "thigh")}
        {limb(p.knee, p.foot, "shin")}
        {p.knee2 && p.foot2 ? (
          <>
            {limb(p.hip, p.knee2, "thigh2")}
            {limb(p.knee2, p.foot2, "shin2")}
          </>
        ) : null}
        {limb(p.shoulder, p.elbow, "arm")}
        {limb(p.elbow, p.hand, "fore")}
        {p.elbow2 && p.hand2 ? (
          <>
            {limb(p.shoulder, p.elbow2, "arm2")}
            {limb(p.elbow2, p.hand2, "fore2")}
          </>
        ) : null}
      </g>
      <circle cx={p.head[0]} cy={p.head[1]} r="9" fill="#f4f7f2" />
      {p.tool === ("none" as Pose["tool"]) ? null : <Tool pose={p} />}
      <text x="120" y="162" textAnchor="middle" fill="#a7b5ab" fontSize="11" fontFamily="Barlow, sans-serif">
        {caption}
      </text>
    </svg>
  );
}

function positionWord(lang: Lang, frame: 0 | 1): string {
  if (lang === "pt") return frame === 0 ? "posição inicial" : "posição final";
  return frame === 0 ? "start position" : "end position";
}

export function ExerciseVisual({
  exerciseId,
  name,
  lang,
}: {
  exerciseId: string;
  name: string;
  lang: Lang;
}) {
  const visual = getVisual(exerciseId);
  const [open, setOpen] = useState(false);
  const [frame, setFrame] = useState<0 | 1>(0);
  const [paused, setPaused] = useState(false);
  const titleId = useId();
  const frames = visual.kind === "photo" ? visual.frames : (["diagram", "diagram"] as const);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open || paused) return;
    const id = window.setInterval(() => setFrame((current) => (current === 0 ? 1 : 0)), 1200);
    return () => window.clearInterval(id);
  }, [open, paused]);

  useEffect(() => {
    setFrame(0);
    setPaused(false);
    setOpen(false);
  }, [exerciseId]);

  const alt = (index: 0 | 1) => `${name}, ${positionWord(lang, index)}`;

  return (
    <>
      <button
        type="button"
        className="thumb"
        data-testid="exercise-visual"
        aria-label={`${name}. ${lang === "pt" ? "Ver o movimento em grande." : "View the movement larger."}`}
        onClick={() => setOpen(true)}
      >
        {visual.kind === "photo" ? (
          <>
            <img src={visual.frames[0]} alt="" loading="lazy" decoding="async" />
            <img className="frame-b" src={visual.frames[1]} alt="" loading="lazy" decoding="async" />
          </>
        ) : (
          <span className="thumb-sketch" aria-hidden="true">
            <FormSketch diagram={visual.diagram} frame={0} lang={lang} label="" />
            <span className="frame-b">
              <FormSketch diagram={visual.diagram} frame={1} lang={lang} label="" />
            </span>
          </span>
        )}
        <span className="thumb-tag">{visual.kind === "photo" ? "Start · End" : "Guide"}</span>
      </button>

      {open ? (
        <div className="lightbox" onClick={() => setOpen(false)}>
          <div
            className="lightbox-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            data-testid="visual-lightbox"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="lightbox-bar">
              <h2 id={titleId}>{name}</h2>
              <button type="button" className="quiet" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
            <div className="lightbox-stage">
              {visual.kind === "photo" ? (
                <img src={frames[frame]} alt={alt(frame)} />
              ) : (
                <FormSketch diagram={visual.diagram} frame={frame} lang={lang} label={alt(frame)} />
              )}
            </div>
            <div className="frame-picks" role="group" aria-label="Position">
              {([0, 1] as const).map((index) => (
                <button
                  key={index}
                  type="button"
                  aria-pressed={frame === index}
                  onClick={() => {
                    setPaused(true);
                    setFrame(index);
                  }}
                >
                  {index === 0 ? "Start" : "End"}
                </button>
              ))}
              <button type="button" onClick={() => setPaused((value) => !value)}>
                {paused ? "Play" : "Pause"}
              </button>
            </div>
            <p className="credit">
              {visual.kind === "photo" ? (
                <>
                  Photo: {visual.sourceName}.{" "}
                  <a href={visual.sourceUrl} target="_blank" rel="noreferrer">
                    free-exercise-db
                  </a>{" "}
                  · <a href={visual.licenseUrl}>{visual.license}</a>
                  {visual.note ? <span className="credit-note">{visual.note}</span> : null}
                </>
              ) : (
                <>
                  Drawn for FitTracker. No matching openly licensed photo.
                  <span className="credit-note">{visual.reason}</span>
                </>
              )}
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}

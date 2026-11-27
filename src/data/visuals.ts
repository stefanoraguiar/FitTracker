import catalog from "./exercises.json";

export type Lang = "en" | "pt";

export type DiagramId =
  | "sumo-db"
  | "pit-pull"
  | "tyi"
  | "block-pull"
  | "offset-squat"
  | "ball-rollout"
  | "chin-underhand"
  | "pallof"
  | "rack-carry"
  | "suitcase-rdl"
  | "close-pushup"
  | "ab-wheel"
  | "half-kneel-landmine"
  | "one-arm-carry"
  | "half-kneel-press"
  | "cross-carry"
  | "db-deadlift"
  | "nordic";

export type Visual =
  | {
      kind: "photo";
      frames: [string, string];
      sourceName: string;
      sourceUrl: string;
      license: "Unlicense";
      licenseUrl: string;
      note?: string;
    }
  | {
      kind: "diagram";
      diagram: DiagramId;
      reason: string;
    };

const DB = "https://github.com/yuhonas/free-exercise-db";
const UNLICENSE = "https://unlicense.org/";

function photo(folder: string, sourceName: string, note?: string): Visual {
  const base = `${import.meta.env.BASE_URL}exercises/${folder}/`;
  return {
    kind: "photo",
    frames: [`${base}0.webp`, `${base}1.webp`],
    sourceName,
    sourceUrl: `${DB}/tree/main/exercises/${folder}`,
    license: "Unlicense",
    licenseUrl: UNLICENSE,
    note,
  };
}

function diagram(diagram: DiagramId, reason: string): Visual {
  return { kind: "diagram", diagram, reason };
}

const seatedRow = photo(
  "Seated_Cable_Rows",
  "Seated Cable Rows",
  "Photo shows the seated cable-row station with a close handle. Switch the grip to match the sheet.",
);
const dbBench = photo("Dumbbell_Bench_Press", "Dumbbell Bench Press");
const inclinePress = photo(
  "Incline_Dumbbell_Press",
  "Incline Dumbbell Press",
  "Photo shows both arms. Press one arm at a time when the sheet says so.",
);

export const VISUALS: Record<string, Visual> = {
  "dumbbell-sumo-deadlift": diagram(
    "sumo-db",
    "No dumbbell sumo deadlift photo. A barbell sumo picture would point at the wrong bar.",
  ),
  "push-ups": photo("Pushups", "Pushups"),
  "dumbbell-bench-press": dbBench,
  "one-arm-dumbbell-row": photo("One-Arm_Dumbbell_Row", "One-Arm Dumbbell Row"),
  "chest-flies": photo("Dumbbell_Flyes", "Dumbbell Flyes"),
  "front-plank": photo("Plank", "Plank"),
  "pit-pulls": diagram("pit-pull", "Program-specific hold. No matching photo."),
  "overhead-tricep-extensions": photo("Standing_Dumbbell_Triceps_Extension", "Standing Dumbbell Triceps Extension"),
  "goblet-squat": photo(
    "Goblet_Squat",
    "Goblet Squat",
    "Kettlebell in the photo. Hold a dumbbell the same way, at the chest.",
  ),
  "underhand-lat-pulldown": photo("Underhand_Cable_Pulldowns", "Underhand Cable Pulldowns"),
  "dumbbell-romanian-deadlift": photo(
    "Stiff-Legged_Dumbbell_Deadlift",
    "Stiff-Legged Dumbbell Deadlift",
    "Same dumbbell hip hinge as a Romanian deadlift. Keep a soft bend in the knees.",
  ),
  "split-squats": photo("Split_Squat_with_Dumbbells", "Split Squat with Dumbbells"),
  "side-plank": photo("Side_Bridge", "Side Bridge"),
  "dumbbell-pullover": photo("Straight-Arm_Dumbbell_Pullover", "Straight-Arm Dumbbell Pullover"),
  "lateral-raise": photo("Side_Lateral_Raise", "Side Lateral Raise"),
  "seated-row": seatedRow,
  "step-ups": photo("Dumbbell_Step_Ups", "Dumbbell Step Ups"),
  "farmer-carry": photo(
    "Farmers_Walk",
    "Farmer's Walk",
    "Farmer handles in the photo. Carry a heavy dumbbell in each hand the same way.",
  ),
  "tyis-incline-bench": diagram("tyi", "T-Y-I is a three-position sequence. A single rear-delt raise would be the wrong picture."),
  "tyis-flat-bench": diagram("tyi", "T-Y-I is a three-position sequence. A single rear-delt raise would be the wrong picture."),
  "dumbbell-curls": photo("Dumbbell_Bicep_Curl", "Dumbbell Bicep Curl"),
  "rack-pulls": diagram("block-pull", "No rack-pull photo. A floor deadlift would hide the raised start."),
  "tricep-pushdowns": photo("Triceps_Pushdown", "Triceps Pushdown"),
  "incline-dumbbell-bench-press": inclinePress,
  "rope-curls": photo("Cable_Hammer_Curls_-_Rope_Attachment", "Cable Hammer Curls - Rope Attachment"),
  "neutral-grip-seated-row": seatedRow,
  "raised-deadlift": diagram("block-pull", "No raised-deadlift photo. A floor pull would hide the higher start."),
  "offset-goblet-squat": diagram("offset-squat", "No offset-load squat photo. A centered goblet squat would hide the offset."),
  "swiss-ball-rollouts": diagram("ball-rollout", "No Swiss-ball rollout photo. A barbell rollout is a different tool."),
  "chin-ups": diagram(
    "chin-underhand",
    "The dataset’s Chin-Up photos are an overhand pull-up. Chin-ups here use an underhand grip.",
  ),
  "front-squat": photo("Front_Barbell_Squat", "Front Barbell Squat"),
  "barbell-romanian-deadlift": photo("Romanian_Deadlift", "Romanian Deadlift"),
  "half-kneeling-pallof-press": diagram("pallof", "No Pallof-press photo."),
  "racked-carry": diagram("rack-carry", "No front-rack carry photo. A farmer walk holds the weights at the sides."),
  "one-arm-incline-db-bench-press": inclinePress,
  "suitcase-romanian-deadlift": diagram(
    "suitcase-rdl",
    "No one-dumbbell Romanian deadlift photo. A two-dumbbell hinge would hide the suitcase load.",
  ),
  "overhand-seated-row": seatedRow,
  "close-grip-push-ups": diagram(
    "close-pushup",
    "The dataset’s close-grip push-up photo reads as a normal-width push-up.",
  ),
  deadlift: photo("Barbell_Deadlift", "Barbell Deadlift"),
  "ez-bar-curls": photo("EZ-Bar_Curl", "EZ-Bar Curl"),
  "alternating-dumbbell-bench-press": photo(
    "Dumbbell_Bench_Press",
    "Dumbbell Bench Press",
    "Photo shows both arms pressing together. Alternate arms on this sheet.",
  ),
  "bent-over-dumbbell-row": photo("Bent_Over_Two-Dumbbell_Row", "Bent Over Two-Dumbbell Row"),
  "ab-wheel-rollouts": diagram("ab-wheel", "No ab-wheel photo. A barbell rollout is a different tool."),
  "bench-press": photo("Barbell_Bench_Press_-_Medium_Grip", "Barbell Bench Press - Medium Grip"),
  "half-kneeling-landmine-press": diagram(
    "half-kneel-landmine",
    "The landmine photo is a standing squat-to-press, not half-kneeling.",
  ),
  "one-arm-farmer-carry": diagram("one-arm-carry", "No one-arm carry photo. The farmer-walk photo uses two hands."),
  "half-kneeling-dumbbell-press": diagram(
    "half-kneel-press",
    "No half-kneeling press photo. The standing one-arm press is a different setup.",
  ),
  "cross-body-carry": diagram("cross-carry", "No cross-body carry photo."),
  "swiss-ball-leg-curls": photo("Ball_Leg_Curl", "Ball Leg Curl"),
  "back-squats": photo("Barbell_Full_Squat", "Barbell Full Squat"),
  "underhand-seated-row": seatedRow,
  "dumbbell-kettlebell-swing": photo("One-Arm_Kettlebell_Swings", "One-Arm Kettlebell Swings"),
  "standing-landmine-press": photo(
    "Landmine_Linear_Jammer",
    "Landmine Linear Jammer",
    "Shows the landmine press. The photo starts in a squat; stay more upright if the sheet says standing.",
  ),
  "standing-external-rotation": photo("External_Rotation_with_Cable", "External Rotation with Cable"),
  "dumbbell-deadlift": diagram(
    "db-deadlift",
    "No conventional dumbbell deadlift photo. The stiff-leg photo is a Romanian hinge, not a deadlift from the floor.",
  ),
  "hand-walkouts": photo("Inchworm", "Inchworm"),
  "chest-supported-supinated-db-row": photo(
    "Dumbbell_Incline_Row",
    "Dumbbell Incline Row",
    "Chest-supported one-arm row. Turn the palm up if the sheet says supinated.",
  ),
  "double-dumbbell-front-squat": photo(
    "Front_Squats_With_Two_Kettlebells",
    "Front Squats With Two Kettlebells",
    "Two kettlebells in the front rack. Hold two dumbbells the same way.",
  ),
  "dumbbell-tricep-kickback": photo(
    "Standing_Bent-Over_One-Arm_Dumbbell_Triceps_Extension",
    "Standing Bent-Over One-Arm Dumbbell Triceps Extension",
  ),
  "nordic-ham-curls": diagram("nordic", "No Nordic curl photo. The glute-ham raise photo is a different machine."),
  "dumbbell-skull-crusher": photo("Lying_Dumbbell_Tricep_Extension", "Lying Dumbbell Tricep Extension"),
  "dumbbell-hammer-curls": photo("Hammer_Curls", "Hammer Curls"),
  "standing-one-arm-db-shoulder-press": photo("Dumbbell_One-Arm_Shoulder_Press", "Dumbbell One-Arm Shoulder Press"),
  "side-lying-external-rotation": photo("External_Rotation", "External Rotation"),
};

const catalogIds = (catalog as { exercises: { id: string }[] }).exercises.map((exercise) => exercise.id);
const missing = catalogIds.filter((id) => !VISUALS[id]);
if (missing.length) {
  throw new Error(`Missing exercise visuals: ${missing.join(", ")}`);
}

export function getVisual(id: string): Visual {
  return VISUALS[id] ?? diagram("pit-pull", "No visual for this exercise.");
}

import { useState, useEffect, useRef, useCallback } from "react";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

// ── Storage helpers (localStorage, works in Capacitor/Android) ────────────────
const store = {
  get: (key) => { try { return localStorage.getItem(key); } catch { return null; } },
  set: (key, val) => { try { localStorage.setItem(key, val); } catch {} },
};

const VERSION = "1.0.0";
const YT = q => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

const INFO = {
  "Shoulder CARs":["Controlled articular rotation. Arm straight, make the largest circle your shoulder allows — slow and deliberate.",YT("shoulder CARs controlled articular rotation")],
  "Wall Angel":["Back and arms fully against wall. Slide arms overhead maintaining full contact throughout.",YT("wall angel exercise shoulder mobility")],
  "Bodyweight Squat Hold":["Squat to parallel, pause 3 sec at the bottom. Heels down, chest up. Mobilizes hips and ankles before loading.",YT("bodyweight squat mobility hold")],
  "Hip Circle Rotations":["Standing, hands on hips. Draw large circles — 10 each direction. Opens hip capsule before squatting or hinging.",YT("hip circle rotation warm up")],
  "Arm Circles":["Arms extended, small to large circles. 10 each direction.",YT("arm circle warm up shoulder")],
  "Glute Bridge (warm-up)":["Feet flat, drive hips up through heels. Activates glutes before hinging so they fire correctly when loaded.",YT("glute bridge activation warm up")],
  "Leg Swing (front-to-back + side-to-side)":["Hold wall for balance. Relaxed leg swings in both planes. Mobilizes hip flexors and adductors.",YT("leg swing warm up hip mobility")],
  "Bodyweight RDL":["Hinge at hips, slight knee bend. Groove the pattern before adding weight.",YT("bodyweight RDL warm up hinge pattern")],
  "Chin Tuck":["Draw chin straight back — not down. Hold 5 seconds. Activates deep neck flexors.",YT("chin tuck deep neck flexor activation")],
  "Band Pull-Apart (warm-up)":["Shoulder-width grip, arms extended. Pull fully apart. Wakes up rear delts and rotator cuff.",YT("band pull apart warm up shoulder")],
  "Smith Machine Back Squat":["Bar on upper traps. Feet 6–12\" forward of bar. Squat to parallel, drive through heels.",YT("smith machine back squat form")],
  "Goblet Squat with Band":["🪜 PROGRESSION STEP toward barbell back squat. Hold DB or KB vertically at chest. Place light resistance band just above knees — actively push knees out against it throughout the entire movement. This simultaneously grooves squat pattern, activates glute medius, corrects knee tracking, and engages VMO. Use once cleared from acute knee pain. Feet shoulder-width, elbows track inside knees, chest tall.",YT("goblet squat resistance band knees out")],
  "Barbell Back Squat (Squat Rack)":["🔓 UNLOCK LATER — requires safety bars set at parallel height. Bar on upper traps, feet shoulder-width. Break at hips and knees simultaneously, chest up throughout. Safety bars catch the weight if you fail a rep.",YT("barbell back squat squat rack form")],
  "Smith Machine Front Squat":["Bar on front delts, elbows high, upright torso throughout.",YT("smith machine front squat form")],
  "Barbell Front Squat (Squat Rack)":["🔓 UNLOCK LATER — requires safety bars. Bar rests on front delts with elbows high. Safety bars essential as front squat is difficult to bail from safely.",YT("barbell front squat squat rack form")],
  "Leg Press (feet high)":["High feet loads glutes/hams more. Lower to 90° knee angle.",YT("leg press high feet placement form")],
  "Smith Machine Incline Press":["30–45° bench. Bar to upper chest, elbows ~45° from torso.",YT("smith machine incline press form")],
  "Barbell Incline Press (Squat Rack)":["🔓 UNLOCK LATER — use squat rack with j-hooks set at correct height. Requires a spotter for working sets. Bench at 30–45°, bar to upper chest.",YT("barbell incline bench press form spotter")],
  "Smith Machine Flat Press":["Natural arch, bar touches mid-chest, controlled descent.",YT("smith machine bench press form")],
  "Barbell Flat Press (Squat Rack)":["🔓 UNLOCK LATER — rack j-hooks at correct height. Always use a spotter or set safety bars just below chest height. Bar touches mid-chest, elbows ~45° from torso.",YT("barbell bench press form spotter")],
  "Dumbbell Incline Press":["Control descent, don't let dumbbells drift too wide.",YT("dumbbell incline press form")],
  "Chest Dip (lean forward, max 90°)":["Lean torso forward ~30°. Hard stop at 90° — deeper stresses the shoulder capsule.",YT("chest dip safe form shoulder")],
  "Bulgarian Split Squat (DB)":["Rear foot elevated. Descend straight down, front shin stays vertical.",YT("bulgarian split squat dumbbell form")],
  "Dumbbell Reverse Lunge":["Step back, lower rear knee toward floor, drive through front heel to return.",YT("dumbbell reverse lunge form")],
  "Step-Up onto bench (DB)":["Drive through the working heel only — don't push off the back foot.",YT("dumbbell step up exercise form")],
  "Dumbbell Shrug (slow + pause)":["Violin priority — targets the elongated left trapezius directly as a prime mover. Hold dumbbells at sides, elevate shoulders straight up, pause 2 sec at top, lower with full control over 3 sec. Do NOT roll shoulders. Train both sides but use slightly heavier weight on the left, or add an extra set on the left side.",YT("dumbbell shrug upper trapezius form")],
  "Single-Arm Farmer's Carry (left priority)":["Violin priority — carry a dumbbell in each hand but use a heavier weight in the left. Walk slowly for 20–30 metres or 30 sec. The left trapezius must resist the shoulder dropping under load — exactly the deficit identified by your physio. Keep both shoulders actively elevated and retracted, with particular focus on the left. Start light.",YT("single arm farmers carry trapezius form")],
  "Dumbbell Overhead Press (Unilateral)":["🔓 UNLOCK LATER — requires solid scapular stability first (3–6 months of current program minimum, physio clearance recommended for elongated left trapezius). Press both arms but lead with the left — can add an extra set on the left side if needed. Keep core braced, avoid arching lower back. The trapezius must upwardly rotate the scapula under load; this is therapeutic for an elongated trap once stability is established.",YT("dumbbell overhead press unilateral form")],
  "Barbell Overhead Press (Squat Rack)":["🔓 UNLOCK LATER — progress from unilateral dumbbell press first. Requires safety bars and ideally a spotter. Grip just outside shoulder width, bar starts at collarbone, press straight up. Demands full scapular stability from both sides simultaneously.",YT("barbell overhead press squat rack form")],
  "Dumbbell Lateral Raise":["Lead with elbows, raise to shoulder height only.",YT("dumbbell lateral raise proper form")],
  "Cable Lateral Raise":["Constant tension throughout.",YT("cable lateral raise form")],
  "Machine Lateral Raise":["Align resistance arm with your elbow. Control the eccentric fully.",YT("machine lateral raise form")],
  "Cable Tricep Pushdown":["Elbows pinned at sides. Extend fully, pause, slow return.",YT("cable tricep pushdown form")],
  "Overhead Cable Extension":["Elbows point forward, extend fully overhead.",YT("overhead cable tricep extension form")],
  "Dumbbell Skull Crusher":["Lower dumbbell to forehead with elbows pointing at ceiling.",YT("dumbbell skull crusher form")],
  "Tricep Dip (upright torso, max 90°)":["Stay upright to target triceps. Hard stop at 90°.",YT("tricep dip upright form")],
  "Cable Crunch":["Crunch elbows toward knees — flex the abs, don't pull with arms.",YT("cable crunch form")],
  "Ab Machine":["Full range of motion, slow eccentric.",YT("ab machine crunch form")],
  "Hanging Knee Raise (captain's chair)":["No swinging. Raise knees to at least hip height.",YT("hanging knee raise form")],
  "Plank":["Body straight, squeeze glutes and quads. Breathe steadily.",YT("plank proper form")],
  "RKC Plank (squeeze everything)":["Same as plank but actively squeeze every muscle.",YT("RKC plank tutorial")],
  "Ab Wheel Rollout":["Roll forward until near floor, pull abs in hard to return.",YT("ab wheel rollout form")],
  "Lat Pulldown":["Pull to upper chest. Think 'elbows into back pockets'.",YT("lat pulldown form")],
  "Assisted Pull-Up Machine":["Grip slightly wider than shoulders. Pull chest to bar.",YT("assisted pull up machine form")],
  "Single-Arm Cable Pulldown":["Lean slightly away. Drive elbow to hip.",YT("single arm cable pulldown form")],
  "Single-Arm Cable Serratus Punch":["Punch arm forward, actively driving scapula around ribcage at end range.",YT("serratus anterior cable punch exercise")],
  "Cable Serratus Press":["Press forward and push-plus — protract scapula maximally at end range.",YT("serratus anterior cable press exercise")],
  "Cable Pullover (cable set high, arc down)":["Arc arms down in a sweeping motion. Feel serratus and lat stretch.",YT("cable pullover serratus anterior form")],
  "Dumbbell Pullover (flat bench, controlled)":["Arc DB overhead in controlled stretch. Keep elbows slightly bent.",YT("dumbbell pullover form")],
  "Low Cable Row (elbows flared)":["Flare elbows 45° out to shift load to mid-trap. Retract scapula fully.",YT("cable row elbows flared mid trap")],
  "Seated Cable Row (wide grip)":["Wide overhand grip, pull to lower chest.",YT("seated cable row wide grip form")],
  "Dumbbell Chest-Supported Row":["Chest on incline bench, neutral grip. Pull elbows back and up.",YT("chest supported dumbbell row form")],
  "Dumbbell Curl":["Supinate wrist as you curl. Control the eccentric.",YT("dumbbell bicep curl form")],
  "Cable Curl":["Constant tension especially at the bottom.",YT("cable bicep curl form")],
  "Hammer Curl":["Neutral grip. Builds brachialis in addition to biceps.",YT("hammer curl form")],
  "Cable Face Pull (rope, eye height)":["Rope at eye level. Pull apart and toward face, thumbs rotating back. Elbows high. Most important violin exercise.",YT("cable face pull form Jeff Nippard")],
  "Cable Pull-Apart (low-to-high)":["Pull upward and apart in an arc.",YT("cable pull apart low to high form")],
  "Reverse Pec Deck Machine":["Face the machine, grip at ear height. Open arms in a wide arc.",YT("reverse pec deck rear delt form")],
  "Cable External Rotation (elbow at side)":["Elbow bent 90° and pinned at side. Rotate forearm outward only.",YT("cable external rotation shoulder form")],
  "Dumbbell Side-Lying External Rotation":["On side, elbow 90°. Rotate forearm toward ceiling. Very light weight.",YT("side lying external rotation rotator cuff form")],
  "Cable External Rotation (90° abducted)":["Arm abducted 90°, elbow bent. Rotate forearm up.",YT("cable external rotation 90 degrees")],
  "Y-T-W on Incline Bench (light DB)":["Y=arms at 135°, T=straight out, W=elbows 90°. 5–10 lbs max. Lower trap, not upper trap.",YT("YTW exercise lower trapezius incline bench")],
  "Cable Y-Raise":["Cable set low, raise arm in Y-pattern. Keep shoulder blade depressed.",YT("cable Y raise lower trapezius")],
  "Prone Y-T-W on incline bench":["Same as Y-T-W. Focus on mid/lower trap contracting.",YT("prone YTW exercise form lower trap")],
  "Pallof Press (cable, both sides)":["Stand perpendicular to cable. Press straight out and resist the pull.",YT("Pallof press anti rotation core")],
  "Pallof Press with Rotation":["Same setup — after pressing out, rotate torso away from cable.",YT("Pallof press with rotation exercise")],
  "Half-Kneeling Cable Chop":["Half-kneel perpendicular to cable. Chop high-to-low across body.",YT("half kneeling cable chop form")],
  "Romanian Deadlift (Smith or DB)":["Hinge at hips, slight knee bend. Lower until strong hamstring stretch, drive hips forward.",YT("romanian deadlift form tutorial")],
  "Smith Machine Conventional Deadlift":["Bar over mid-foot, flat back. Hips and shoulders rise together.",YT("smith machine deadlift form")],
  "Dumbbell Single-Leg RDL":["Hinge on one leg, hips square. Wall touch for balance if needed.",YT("single leg romanian deadlift dumbbell form")],
  "Resistance Band TKE":["Terminal Knee Extension. Anchor band at knee height behind you, loop around back of knee. Stand facing anchor, slight bend in knee. Extend knee to straight against band resistance — focus on the last 30° only. The safest VMO exercise for symptomatic knees as it is closed-chain.",YT("resistance band terminal knee extension TKE")],
  "Leg Extension Machine":["⚠ VMO REHAB SUBSTITUTE — use partial range (final 40° of extension only) if knee is symptomatic. Extend fully, hold 1 sec at peak.",YT("leg extension machine form")],
  "Smith Machine Split Squat (lighter, higher rep)":["Front foot far enough so knee doesn't pass toes.",YT("smith machine split squat form")],
  "Barbell Split Squat (Squat Rack)":["🔓 UNLOCK LATER — use squat rack with safety bars set at hip height. No spotter needed if bars are set correctly. Keep torso upright.",YT("barbell split squat squat rack form")],
  "Leg Curl Machine":["Hips down, curl fully, pause at peak, slow controlled return.",YT("leg curl machine proper form")],
  "Single-Leg Curl Machine":["Keep hips even — don't rotate to compensate.",YT("single leg curl machine form")],
  "Cable Woodchop (high-to-low)":["Cable set high. Rotate from high outside to low opposite hip.",YT("cable woodchop high to low form")],
  "Cable Woodchop (low-to-high)":["Cable set low. Drive upward in diagonal arc.",YT("cable woodchop low to high form")],
  "Landmine Rotation":["Hold barbell end with both hands. Rotate side to side. Very light weight.",YT("landmine rotation core exercise")],
  "Hip Abduction Machine":["Sit upright — do not lean back. Leaning shifts work to the TFL instead of glute medius and can worsen IT band issues. Pads on outside of knees. Push outward, control return.",YT("hip abduction machine form glute med")],
  "Cable Hip Abduction":["Cuff on ankle. Raise leg to side, keep torso still.",YT("cable hip abduction standing form")],
  "Side Plank":["One forearm on floor, body in straight line. Squeeze glutes and obliques.",YT("side plank form tutorial")],
  "Side Plank with Hip Dip":["From side plank, lower hip to just above floor and raise back.",YT("side plank hip dip exercise")],
  "Copenhagen Plank":["Top leg on bench, side plank position.",YT("Copenhagen plank form tutorial")],
  "Standing Calf Raise Machine":["Lower heel below platform for full stretch. No bouncing.",YT("standing calf raise machine form")],
  "Seated Calf Raise Machine":["Full range, trains soleus more than standing.",YT("seated calf raise machine form")],
  "Elliptical — Zone 2 (20 min)":["Conversational pace — somewhat effortful but can speak in full sentences. Moderate resistance. Legs will be tired after lifting so keep resistance lower than you'd expect.",YT("zone 2 cardio elliptical how to")],
  "Back Extension Machine (hyperextension)":["Hinge at hips, lower torso toward floor, extend back to neutral — do NOT hyperextend past straight. Added automatically when leg press replaces squat.",YT("back extension machine hyperextension form tutorial")],
  "Smith Machine Good Morning":["Bar on upper traps, slight knee bend. Hinge forward at hips until torso near parallel — spine neutral throughout. Drive hips forward to return.",YT("smith machine good morning exercise form")],
  "45-degree Back Extension (bodyweight)":["On the 45° bench, cross arms on chest. Lower until hamstring stretch, return to neutral. Add a plate to progress.",YT("45 degree back extension form tutorial")],
  "Serratus Wall Slide":["Place a resistance band or pillowcase loop between your hands at chest height — this horizontal tension cues serratus activation throughout the movement. Forearms on wall, actively push into wall. Slide arms overhead maintaining the push and keeping tension in the band/pillowcase. At the top, hold briefly before returning.",YT("serratus wall slide exercise scapula")],
  "Scapular Push-Up":["In plank. Let chest sink between arms (retract), then push chest away (protract).",YT("scapular push up serratus anterior")],
  "Bear Crawl Hold with scapular protraction":["Hands and knees, knees slightly off floor. Push hands into floor to protract scapulae.",YT("bear crawl hold scapular protraction")],
  "Floor Y-T-W (prone)":["Face down. Y=thumbs-up at 135°, T=straight out at shoulder height, W=elbows bent 90°. Lift with lower trap, not upper. For wall Y variation: stand facing wall, place hands in Y position on wall, then at the end position actively pull hands away from the wall to squeeze the muscles between the shoulder blades — hold 2–3 sec before returning.",YT("floor YTW prone lower trapezius exercise")],
  "Superman hold with Y-arms":["Face down, arms in Y overhead. Lift chest and arms, hold 2–3 seconds.",YT("superman hold Y arms lower trapezius")],
  "Band Pull-Apart":["Hold band/towel at shoulder width. Pull fully apart.",YT("band pull apart rear delt form")],
  "Side-Lying External Rotation (no weight)":["On side, elbow 90°. Rotate forearm toward ceiling.",YT("side lying external rotation no weight rotator cuff")],
  "Prone External Rotation":["Face down, arm off edge. Rotate forearm upward from hanging position.",YT("prone external rotation shoulder exercise")],
  "Push-Up":["Body rigid, lower chest to near floor. Protract scapulae at the top.",YT("perfect push up form tutorial")],
  "Decline Push-Up":["Feet elevated on chair. Shifts load to upper chest.",YT("decline push up form tutorial")],
  "Diamond Push-Up":["Hands close together. Elbows track back.",YT("diamond push up form triceps")],
  "Dead Bug":["Back flat on floor. Extend opposite arm and leg — keep low back pressed down.",YT("dead bug exercise core stability")],
  "Bird Dog":["On hands and knees. Extend opposite arm and leg, hold 2–3 sec. Hips level.",YT("bird dog exercise form core")],
  "Chin Tuck (supine on floor)":["On back. Draw chin straight back — not down. Hold 5 seconds.",YT("chin tuck supine deep neck flexor")],
  "Chin Tuck against wall":["Stand with back against wall. Draw chin back to touch wall.",YT("chin tuck wall forward head posture fix")],
  "Dumbbell Wrist Extension":["Forearm rested on thigh, palm down. Extend wrist upward. Balances chronic violin flexor overuse.",YT("wrist extension exercise musicians forearm")],
  "Reverse DB Curl":["Overhand grip curl. Trains wrist extensors through full range of motion.",YT("reverse curl dumbbell form")],
  "Wrist Extension (water bottle)":["Forearm rested, palm down. Extend wrist up.",YT("wrist extension home exercise musicians")],
  "Forearm pronation/supination":["Hold a light object at one end. Rotate forearm palm-up to palm-down and back.",YT("forearm pronation supination exercise musicians")],
  "Reverse Lunge (bodyweight)":["Step back, lower rear knee toward floor, drive through front heel.",YT("reverse lunge bodyweight form")],
  "Lateral Lunge":["Step wide to side, sit into that hip, opposite leg straight.",YT("lateral lunge form tutorial")],
  "Single-Leg Glute Bridge":["One foot on floor. Drive hips up through heel, squeeze glute at top.",YT("single leg glute bridge form")],
  "Side-Lying Hip Abduction":["Raise top leg to ~45°. Toes forward, slow and controlled.",YT("side lying hip abduction glute med form")],
  "Clamshell":["On side, knees bent 45°. Open like a clamshell, keep hips stable.",YT("clamshell exercise glute medius form")],
  "Upper Trap Stretch":["Tilt ear to shoulder, gentle hand pressure. Keep opposite shoulder down.",YT("upper trapezius stretch violinists musicians")],
  "Levator Scapulae Stretch":["Rotate head 45° toward armpit, then nod chin down. Most-stressed muscle in violin playing.",YT("levator scapulae stretch neck musicians pain")],
  "Pec Minor Stretch (doorway)":["Arm in goalpost against doorframe, step through. Feel stretch in front of shoulder.",YT("pec minor stretch doorway posture correction")],
  "Lat Stretch":["Choose one option — all target the same muscle. (1) Overhead anchor: grab a bar or doorframe overhead, shift hips away, 30–45 sec. (2) Wall kneeling: kneel facing wall, hands on wall at shoulder height, sit hips back toward heels, let chest drop, arms extended — 3–5 slow exhales. (3) Doorway: reach one arm overhead and grip the frame, side-bend away, shoulder packed, 30–45 sec each side.",YT("lat stretch doorway form")],
  "Open Book with Thoracic Rotation":["Lie on your side with knees stacked at 90°. Both arms extended forward at shoulder height. Keep lower arm on floor and lower knees stacked — do not let them separate. Slowly rotate upper arm up and over to the opposite side, following your hand with your eyes, letting your thoracic spine rotate. Lower arm and knees stay anchored. Return slowly. 8–10 reps each side.",YT("open book thoracic rotation stretch")],
  "Right Sidelying Supported Left Glute Med (PRI)":["Lie on right side, feet on wall, hips and knees at 90°, back rounded. Place 4–5 inch ball between knees. Push right foot into wall. Slide left hip back without arching. Press left knee down into ball — feel left inner thigh engage. Rotate left thigh inward by lifting left lower leg toward ceiling — feel left outer hip (glute med) engage. Hold for 4–5 slow breaths. Relax and repeat 4 more times.",YT("PRI sidelying glute med left AIC")],
  "Left Sidelying Right Glute Max (PRI)":["Lie on left side, feet on wall, hips and knees at 90°, back rounded. Small towel roll under ankles and left abdominals. Press left hip down — feel left abs lift away from towel roll. Shift right hip forward until you feel a stretch in left outer hip. Turn right knee out keeping left knee on mat, using wall as fulcrum. Turn knee as high as possible without moving right hip back — feel right outer hip (glute max) engage. Hold 4–5 slow breaths. Repeat 4 more times.",YT("PRI sidelying right glute max left AIC")],
  "First Rib Mobilization + Scalene Stretch":["Sit upright. Anchor right hand under chair seat to depress right shoulder. Side-bend head to right. PART 1 — First Rib Mob: rotate head slightly to look down-right. Take 3–5 slow exhales — the exhalation depresses the left first rib. PART 2 — Scalene Stretch: from same position, adjust head to look slightly up-right instead. Hold 30–45 sec with slow exhales to bias anterior and middle scalenes. Left side is primary (Left AIC pattern). Repeat on right side if needed.",YT("first rib mobilization scalene self")],
  "Wrist Flexor Stretch":["Arm extended, palm up, pull fingers back.",YT("wrist flexor stretch musicians violinists")],
  "Ulnar Nerve Glide":["Both sides — left is primary for bow arm. Arm at side, elbow straight. Step 1: extend wrist and fingers back (extension). Step 2: add wrist radial deviation (tilt toward thumb). Step 3: abduct shoulder slightly outward. Step 4: tilt head away from the gliding side. Move slowly through each step as a fluid sequence, pausing briefly at the end position. Do NOT push into pain or tingling — gentle tension only. 8–10 slow reps each side.",YT("ulnar nerve glide exercise")],
  "Median Nerve Glide":["Both sides — right (left hand) is primary for violin fretting hand. Arm at side, elbow straight. Step 1: extend wrist and fingers back. Step 2: extend and spread fingers. Step 3: supinate forearm (palm up). Step 4: abduct shoulder slightly. Step 5: tilt head away. Move as a slow fluid sequence. Gentle tension only — no pain, no strong tingling. 8–10 slow reps each side.",YT("median nerve glide exercise carpal tunnel")],
  "Tendon Gliding Sequence":["Both hands simultaneously. Move through each position 8–10 times before progressing to the next. 1-Straight: fingers fully extended. 2-Hook fist: MCP joints straight, bend only PIP and DIP joints so fingertips curl toward palm. 3-Full fist: close all joints into a full fist. 4-Tabletop: MCP joints bent 90°, PIP and DIP joints straight (fingers parallel to floor). 5-Straight fist: MCP and PIP bent, DIP straight. Return to straight. Move slowly and fully through each position.",YT("tendon gliding exercises hand therapy")],
  "Finger Extensor Band":["Both hands. Place a rubber band around all five fingers just below the fingernails. Spread fingers apart against the resistance, hold 2–3 sec, return slowly. Do all fingers together, then optionally isolate each finger pair. 15–20 reps each hand. Directly counters chronic flexor dominance from violin playing. Use a light band — this is endurance work, not strength.",YT("finger extensor rubber band exercise musicians")],
  "Radial Nerve Glide":["Both sides. Arm at side, make a fist with thumb inside fingers (thumb in palm). Step 1: flex wrist downward (fist pointing down). Step 2: pronate forearm (fist rotating inward). Step 3: extend elbow. Step 4: depress shoulder (push shoulder blade down). Step 5: tilt head away from the gliding side. Fluid sequence, gentle tension only, no sharp pain. 8–10 slow reps each side.",YT("radial nerve glide exercise")],
  "Wrist CARs":["Both wrists simultaneously. Move each wrist through the largest circle it can make under full active control — go slowly enough that you feel each position. Flexion, ulnar deviation, extension, radial deviation. 3–5 circles in each direction. The goal is active control throughout range, not passive mobility. If you find dead spots where control drops, slow down and work through them.",YT("wrist controlled articular rotation CARs")],
  "Thumb Opposition Sequence":["Both hands simultaneously. Touch thumb pad to each fingertip in sequence — index, middle, ring, pinky — then reverse back. Move deliberately, maintaining full contact at each position. 10 full sequences each hand. Then add: pinch each fingertip firmly against thumb and hold 2 sec. Maintains thenar coordination and intrinsic muscle activation relevant to bow thumb position.",YT("thumb opposition exercise hand coordination")],
  "Wrist Extensor Stretch":["Arm extended, palm down, pull fingers back toward you.",YT("wrist extensor stretch forearm musicians")],
  "Thoracic Rotation Stretch":["Seated, anchor one arm, rotate through mid-back only.",YT("thoracic rotation stretch mobility")],
  "Thread the Needle":["On hands and knees. Thread arm under body until shoulder touches floor.",YT("thread the needle thoracic mobility stretch")],
  "Hip Flexor Stretch (couch stretch)":["Rear shin against wall, front foot forward. Upright torso, squeeze rear glute.",YT("couch stretch hip flexor form")],
  "Hamstring Stretch (standing)":["Foot on bench, slight forward hinge from hip. Stretch from hip, not back rounding.",YT("standing hamstring stretch proper form")],
  "Piriformis Stretch (figure-4)":["On back, figure-4 position. Pull knee toward chest.",YT("figure four piriformis stretch form")],
  "Cat-Cow":["On hands and knees. Arch fully (cat), sag fully (cow). Slow and breath-driven.",YT("cat cow stretch spine mobility tutorial")],
  "Child's Pose":["Kneel, sit back on heels, arms extended. Full relaxation hold.",YT("child's pose yoga stretch form")],
  "Neck Side Bend":["Gently tilt ear toward shoulder. Hold — do not pull.",YT("neck side bend stretch tension relief")],
  // ── Lotus progression ──
  "Reclined Figure-4 (supine pigeon)":["On back, ankle crossed over opposite knee. Flex the top foot to protect the knee. Pull both legs toward chest. Gentlest entry point — if this is painful you are early in the progression.","https://www.youtube.com/results?search_query=reclined+figure+4+supine+pigeon+hip+stretch"],
  "Butterfly Stretch":["Soles of feet together, knees dropping toward floor. Sit tall — don\'t round the back. Gently press knees toward floor with forearms. The most direct hip external rotation opener for lotus.","https://www.youtube.com/results?search_query=butterfly+stretch+hip+external+rotation+yoga"],
  "Low Lunge (hip flexor focus)":["Back knee on floor, front foot forward. Sink hips toward floor. Keep torso upright. Releases hip flexors that resist the seated lotus position.","https://www.youtube.com/results?search_query=low+lunge+hip+flexor+stretch+yoga"],
  "Seated Forward Fold":["Legs straight, hinge from hips — not waist. Keep spine long. Lengthens hamstrings which resist lotus entry.","https://www.youtube.com/results?search_query=seated+forward+fold+hamstring+stretch+yoga"],
  "Thread the Needle (hip version)":["On back, thread arm between legs to clasp the shin. Deeper external rotation than reclined figure-4. Good bridge between early work and pigeon.","https://www.youtube.com/results?search_query=supine+thread+needle+hip+external+rotation+stretch"],
  "Pigeon Pose":["Front shin across mat, rear leg extended behind. Hips square toward floor. The single most effective hip external rotator stretch. If this is very painful, stay with reclined figure-4 longer.","https://www.youtube.com/results?search_query=pigeon+pose+hip+external+rotation+yoga+tutorial"],
  "Double Pigeon (fire log pose)":["Shins stacked, one directly on top of the other. Sit tall. Flex both feet to protect knees. More intense than pigeon — don\'t attempt until pigeon is fully comfortable.","https://www.youtube.com/results?search_query=double+pigeon+fire+log+pose+yoga+tutorial"],
  "Gomukhasana (cow face legs)":["One knee stacked directly on top of the other, shins pointing out to opposite sides. Sit tall. Intensely targets the deep external rotators. Excellent lotus prep that most people skip.","https://www.youtube.com/results?search_query=gomukhasana+cow+face+pose+legs+yoga+tutorial"],
  "Ankle Circles and Plantarflexion":["Seated, rotate each ankle slowly through full range. Then point foot fully (plantarflexion) and hold 10 sec. Lotus compresses the ankle — this prepares it.","https://www.youtube.com/results?search_query=ankle+mobility+exercises+yoga+lotus+prep"],
  "Half Lotus Prep (supported)":["Sit cross-legged on a folded blanket. Place one foot on the opposite thigh — only as far as comfortable. Never force it. If you feel knee strain, come out immediately. All rotation comes from the hip.","https://www.youtube.com/results?search_query=half+lotus+pose+preparation+beginners+yoga"],
  "Supported Half Lotus Hold":["Half lotus with back against wall or on folded blanket. The elevation makes hip rotation significantly easier. Work up to 3-minute holds each side.","https://www.youtube.com/results?search_query=half+lotus+supported+blanket+yoga+hip+opening"],
  "Half Lotus Seated Hold":["Full half lotus without support. Tall spine, both sitting bones on floor. Top knee should rest near the floor — if it points up, hips need more work. Work up to 3–5 min holds before attempting full lotus.","https://www.youtube.com/results?search_query=half+lotus+pose+hold+seated+yoga"],
  "Full Lotus Attempt (supported)":["Only attempt after comfortable half lotus on both sides. Sit on folded blanket. Bring one foot to opposite thigh, then second foot. If you feel ANY knee pain — stop immediately. All rotation must come from the hip.","https://www.youtube.com/results?search_query=full+lotus+pose+tutorial+safe+progression+yoga"],
  "Full Lotus Hold":["Once you can enter without discomfort, work up to 1-minute holds, then 3, then 5. Alternate which leg goes on top each session — both sides must be equal.","https://www.youtube.com/results?search_query=full+lotus+pose+meditation+hold+yoga"],
};

const WARMUP = {
  1:{note:"~12 min · complete before first working set",items:[
    {label:"5 min easy elliptical",note:"Raise temperature only — not Zone 2. Break a light sweat."},
    {label:"Hip Circle Rotations",note:"10 each direction — mobilize hip joint before squatting.",info:"Hip Circle Rotations"},
    {label:"Bodyweight Squat Hold",note:"8 reps × 3 sec hold at bottom — opens hips and ankles.",info:"Bodyweight Squat Hold"},
    {label:"Arm Circles",note:"10 each direction, small to large — raises shoulder temp before pressing.",info:"Arm Circles"},
    {label:"Wall Angel",note:"10 reps — primes serratus and lower trap before pressing.",info:"Wall Angel"},
    {label:"Warm-up sets on first squat exercise",note:"Set 1: 40–50% working weight × 10 · Set 2: 70% × 5"},
  ]},
  2:{note:"~12 min · shoulder warm-up is non-negotiable on this day",items:[
    {label:"5 min easy elliptical",note:"Raise temperature only."},
    {label:"Shoulder CARs",note:"5 slow full-range circles each arm — lubricates shoulder joint.",info:"Shoulder CARs"},
    {label:"Wall Angel",note:"10 reps — activates serratus and lower trap before cable work.",info:"Wall Angel"},
    {label:"Chin Tuck",note:"10 reps — activates deep neck flexors before face pulls.",info:"Chin Tuck"},
    {label:"Band Pull-Apart (warm-up)",note:"15 reps — wakes up rear delts and rotator cuff.",info:"Band Pull-Apart (warm-up)"},
    {label:"Warm-up sets on Lat Pulldown",note:"Set 1: 40–50% × 10 · Set 2: 70% × 5"},
  ]},
  3:{note:"~12 min · glute and hip activation critical before heavy hinging",items:[
    {label:"5 min easy elliptical",note:"Raise temperature only."},
    {label:"Hip Circle Rotations",note:"10 each direction.",info:"Hip Circle Rotations"},
    {label:"Glute Bridge (warm-up)",note:"15 reps — activates glutes before hinging.",info:"Glute Bridge (warm-up)"},
    {label:"Leg Swing (front-to-back + side-to-side)",note:"10 each plane — mobilizes hip flexors and adductors.",info:"Leg Swing (front-to-back + side-to-side)"},
    {label:"Bodyweight RDL",note:"10 reps — groove the hinge pattern before loading.",info:"Bodyweight RDL"},
    {label:"Warm-up sets on RDL",note:"Set 1: 40–50% × 10 · Set 2: 70% × 5"},
  ]},
};

const DURATION_LABEL = {1:"~70 min",2:"~68 min",3:"~69 min",4:"~40 min",5:"~30 min",6:"~45 min"};
const CARDIO_GROUP = {name:"Cardio — Zone 2",cardio:true,mode:"cardio",exercises:["Elliptical — Zone 2 (20 min)"]};
const LEG_PRESS_BACK_GROUP = {name:"Lower Back — Auto Added",autoAdded:true,mode:"log",sets:3,reps:"12–15",exercises:["Back Extension Machine (hyperextension)","Smith Machine Good Morning","45-degree Back Extension (bodyweight)"]};

const DAYS = {
  1:{type:"gym",label:"GYM DAY 1",subtitle:"Push + Squat + Core A + Cardio",color:"#AA2A0A",groups:[
    {name:"Squat Pattern",supersetId:"A",supersetRest:"90 sec",mode:"log",sets:3,reps:"6–8",topSet:true,
      restMobility:"Chin Tuck (wall) — retract chin, hold 5 sec × 5",
      exercises:["Smith Machine Back Squat","Smith Machine Front Squat","Leg Press (feet high)","Goblet Squat with Band","Barbell Back Squat (Squat Rack)","Barbell Front Squat (Squat Rack)"]},
    {name:"Horizontal Push",supersetId:"A",mode:"log",sets:3,reps:"6–8",topSet:true,
      restMobility:"Hip Flexor Stretch — lunge position, 20 sec each side",
      exercises:["Smith Machine Incline Press","Smith Machine Flat Press","Dumbbell Incline Press","Chest Dip (lean forward, max 90°)","Barbell Incline Press (Squat Rack)","Barbell Flat Press (Squat Rack)"]},
    {name:"Single-Leg Strength",supersetId:"B",supersetRest:"75 sec",mode:"log",sets:3,reps:"8–10",vmoLock:true,
      restMobility:"Ankle Circles — 10 each direction each foot",
      vmoExercises:["Resistance Band TKE","Poliquin Step-Up","Leg Extension Machine"],
      vmoReps:"15–20",vmoSets:3,
      exercises:["Bulgarian Split Squat (DB)","Dumbbell Reverse Lunge","Step-Up onto bench (DB)"]},
    {name:"Shoulder / Lateral",supersetId:"B",mode:"log",sets:3,reps:"12–15",
      restMobility:"Thoracic Rotation — seated, rotate 10× each side",
      exercises:["Cable Lateral Raise","Machine Lateral Raise","Dumbbell Lateral Raise","Dumbbell Overhead Press (Unilateral)","Barbell Overhead Press (Squat Rack)"]},
    {name:"Tricep",mode:"log",sets:2,reps:"12",
      restMobility:"Wrist Extensor Stretch — 20 sec each hand",
      exercises:["Cable Tricep Pushdown","Overhead Cable Extension","Dumbbell Skull Crusher","Tricep Dip (upright torso, max 90°)"]},
    {name:"Core — Anti-Extension",core:true,mode:"log",sets:2,reps:"45 sec",
      exercises:["Plank","RKC Plank (squeeze everything)","Ab Wheel Rollout"]},
    CARDIO_GROUP,
  ]},
  2:{type:"gym",label:"GYM DAY 2",subtitle:"Pull + Violin Priority + Core B",color:"#0A40AA",groups:[
    {name:"Vertical Pull",supersetId:"A",supersetRest:"90 sec",mode:"log",sets:3,reps:"6–8",topSet:true,
      restMobility:"Pec Minor Stretch — doorway, 20 sec each side",
      exercises:["Lat Pulldown","Assisted Pull-Up Machine","Single-Arm Cable Pulldown"]},
    {name:"Serratus Anterior",supersetId:"A",violin:true,mode:"log",sets:3,reps:"12–15",
      restMobility:"Chin Tuck (wall) — retract chin, hold 5 sec × 5",
      exercises:["Single-Arm Cable Serratus Punch","Cable Serratus Press","Cable Pullover (cable set high, arc down)","Dumbbell Pullover (flat bench, controlled)"]},
    {name:"Horizontal Pull — Mid Trap",supersetId:"B",violin:true,supersetRest:"75 sec",mode:"log",sets:3,reps:"10–12",topSet:true,
      restMobility:"Hip Flexor Stretch — lunge position, 20 sec each side",
      exercises:["Low Cable Row (elbows flared)","Seated Cable Row (wide grip)","Dumbbell Chest-Supported Row"]},
    {name:"Bicep",supersetId:"B",mode:"log",sets:2,reps:"12",
      restMobility:"Wrist Flexor Stretch — 20 sec each hand",
      exercises:["Cable Curl","Dumbbell Curl","Hammer Curl"]},
    {name:"Face Pull / Rear Delt",violin:true,nonneg:true,violinStraight:true,violinRest:"45–50 sec",mode:"log",sets:3,reps:"15",
      exercises:["Cable Face Pull (rope, eye height)","Cable Pull-Apart (low-to-high)","Reverse Pec Deck Machine"]},
    {name:"External Rotation — Rotator Cuff",violin:true,violinStraight:true,violinRest:"45–50 sec",mode:"log",sets:2,reps:"15",weeklyAlt:"A",
      exercises:["Cable External Rotation (elbow at side)","Cable External Rotation (90° abducted)","Dumbbell Side-Lying External Rotation"]},
    {name:"Lower Trap & Scapular Stability",violin:true,violinStraight:true,violinRest:"45–50 sec",mode:"log",sets:2,reps:"10 each",weeklyAlt:"B",
      exercises:["Cable Y-Raise","Y-T-W on Incline Bench (light DB)","Prone Y-T-W on incline bench"]},
    {name:"Upper Trap — Left Priority",violin:true,violinStraight:true,violinRest:"60 sec",mode:"log",sets:2,reps:"10–12",
      exercises:["Dumbbell Shrug (slow + pause)","Single-Arm Farmer's Carry (left priority)","Waiter's Carry — Left Arm (unlock after 8 wks Farmer's Carry)"]},
    {name:"Core — Anti-Rotation",core:true,mode:"log",sets:2,reps:"10 each",
      exercises:["Pallof Press (cable, both sides)","Pallof Press with Rotation","Half-Kneeling Cable Chop"]},
  ]},
  3:{type:"gym",label:"GYM DAY 3",subtitle:"Lower Body + Core C + Cardio",color:"#0A7A2A",groups:[
    {name:"Hip Hinge",supersetId:"A",supersetRest:"90 sec",mode:"log",sets:3,reps:"8–10",topSet:true,
      restMobility:"Thoracic Rotation — seated, rotate 10× each side",
      exercises:["Romanian Deadlift (Smith or DB)","Smith Machine Conventional Deadlift","Dumbbell Single-Leg RDL","Barbell Conventional Deadlift"]},
    {name:"Quad Accessory",supersetId:"A",mode:"log",sets:3,reps:"12–15",
      restMobility:"Ankle Circles — 10 each direction each foot",
      exercises:["Leg Extension Machine","Smith Machine Split Squat (lighter, higher rep)","Barbell Split Squat (Squat Rack)"]},
    {name:"Hamstring Isolation",supersetId:"B",supersetRest:"75 sec",mode:"log",sets:3,reps:"10–12",
      restMobility:"Hip Flexor Stretch — lunge position, 20 sec each side",
      exercises:["Leg Curl Machine","Single-Leg Curl Machine"]},
    {name:"Core — Rotation / Lateral",supersetId:"B",core:true,mode:"log",sets:2,reps:"12 each",weeklyAlt:"AB",
      altA:{name:"Core — Rotation",exercises:["Cable Woodchop (high-to-low)","Cable Woodchop (low-to-high)","Landmine Rotation"]},
      altB:{name:"Core — Lateral Stability",reps:"40 sec each",exercises:["Side Plank","Side Plank with Hip Dip","Copenhagen Plank"]},
      exercises:["Cable Woodchop (high-to-low)","Cable Woodchop (low-to-high)","Landmine Rotation"]},
    {name:"Hip Abduction / Glute Med",mode:"log",sets:3,reps:"15",
      restMobility:"Piriformis Stretch — figure-4, 20 sec each side",
      exercises:["Hip Abduction Machine","Cable Hip Abduction"]},
    {name:"Calf",mode:"log",sets:2,reps:"15–20",exercises:["Standing Calf Raise Machine","Seated Calf Raise Machine"]},
    CARDIO_GROUP,
  ]},
  4:{type:"home",label:"HOME DAY A",subtitle:"Violin Health + Flexibility",color:"#5A10AA",groups:[
    {name:"Serratus Anterior",violin:true,mode:"reps",sets:3,reps:"12",exercises:["Serratus Wall Slide","Scapular Push-Up","Bear Crawl Hold with scapular protraction"]},
    {name:"Lower & Mid Trapezius",violin:true,mode:"reps",sets:2,reps:"10 each",suppressIfDay:2,suppressNote:"Covered in Gym Day 2 — Lower Trap block",exercises:["Floor Y-T-W (prone)","Superman hold with Y-arms","Wall Angel"]},
    {name:"Rotator Cuff",violin:true,mode:"reps",sets:2,reps:"15–20",suppressIfDay:2,suppressNote:"Covered in Gym Day 2 — External Rotation block",exercises:["Band Pull-Apart","Side-Lying External Rotation (no weight)","Prone External Rotation"]},
    {name:"Hand & Nerve Care 🎻",violin:true,mode:"reps",sets:1,reps:"8–10 each side",exercises:["Ulnar Nerve Glide","Median Nerve Glide","Tendon Gliding Sequence","Finger Extensor Band"]},
    {name:"Forearm Extensors",violin:true,movedNote:true,mode:"reps",sets:3,reps:"15",exercises:["Dumbbell Wrist Extension","Reverse DB Curl","Wrist Extension (water bottle)","Forearm pronation/supination"]},
    {name:"Push Strength",mode:"reps",sets:3,reps:"max",suppressIfDay:1,suppressNote:"Chest/push trained in Gym Day 1",exercises:["Push-Up","Decline Push-Up","Diamond Push-Up"]},
    {name:"Core — Deep Stabilizers",core:true,mode:"reps",sets:2,reps:"8 each",exercises:["Dead Bug","Bird Dog"]},
    {name:"Deep Neck Flexors",violin:true,mode:"reps",sets:2,reps:"10",exercises:["Chin Tuck (supine on floor)","Chin Tuck against wall"]},
    {name:"Flexibility — Violin Priority 🎻",violin:true,mode:"check",duration:"30–45 sec each",exercises:["Upper Trap Stretch","Levator Scapulae Stretch","Pec Minor Stretch (doorway)","Wrist Flexor Stretch","Wrist Extensor Stretch"]},
    {name:"Flexibility — Upper Body",mode:"check",duration:"30–45 sec each",exercises:["Lat Stretch","Thoracic Rotation Stretch","Thread the Needle","Neck Side Bend"]},
  ]},
  5:{type:"home",label:"HOME DAY B",subtitle:"Active Recovery + PRI + Flexibility",color:"#AA6A00",groups:[
    {name:"Violin Mobility",violin:true,mode:"reps",sets:2,reps:"10 each",exercises:["Serratus Wall Slide","Floor Y-T-W (prone)","Chin Tuck against wall","Band Pull-Apart"]},
    {name:"Core — Deep Stabilizers",core:true,mode:"reps",sets:2,reps:"8 each",exercises:["Dead Bug","Bird Dog"]},
    {name:"PRI — Hip & Pelvis Reset 🔄",violin:true,mode:"reps",sets:1,reps:"5 breaths × 5 reps",exercises:["Right Sidelying Supported Left Glute Med (PRI)","Left Sidelying Right Glute Max (PRI)"]},
    {name:"First Rib + Scalene",violin:true,mode:"reps",sets:1,reps:"3–5 breaths each side",exercises:["First Rib Mobilization + Scalene Stretch"]},
    {name:"Hand & Nerve Care — Supplementary 🎻",violin:true,mode:"reps",sets:1,reps:"8–10 each side",exercises:["Radial Nerve Glide","Wrist CARs","Thumb Opposition Sequence"]},
    {name:"Lower Body",mode:"reps",sets:2,reps:"12 each",exercises:["Lateral Lunge","Single-Leg Glute Bridge","Side-Lying Hip Abduction","Clamshell"]},
    {name:"Flexibility — Violin & Upper Body 🎻",violin:true,mode:"check",duration:"45 sec each",exercises:["Upper Trap Stretch","Wrist Flexor Stretch","Wrist Extensor Stretch","Lat Stretch","Open Book with Thoracic Rotation"]},
    {name:"Flexibility — Lower Body",mode:"check",duration:"45 sec each",exercises:["Hip Flexor Stretch (couch stretch)","Hamstring Stretch (standing)","Piriformis Stretch (figure-4)"]},
    {name:"Flexibility — Full Body",mode:"check",duration:"30–45 sec",exercises:["Cat-Cow"]},
  ]},
  6:{type:"home",label:"HOME DAY C",subtitle:"Lotus Progression",color:"#AA2A0A",
    lotusPhases:[
      {phase:1,label:"Phase 1 — Foundation",note:"Months 1–2. Build the base. Do all of these before moving to Phase 2. Target: each stretch feels comfortable for 90 sec holds.",color:"#3A2A12",exercises:[
        {name:"Reclined Figure-4 (supine pigeon)",duration:"90 sec each side"},
        {name:"Butterfly Stretch",duration:"90 sec"},
        {name:"Low Lunge (hip flexor focus)",duration:"60 sec each side"},
        {name:"Seated Forward Fold",duration:"90 sec"},
        {name:"Ankle Circles and Plantarflexion",duration:"30 sec each foot"},
      ]},
      {phase:2,label:"Phase 2 — Building",note:"Months 2–4. Add these once Phase 1 is comfortable. Target: pigeon is relaxed and painless for 2 min.",color:"#AA2A0A",exercises:[
        {name:"Thread the Needle (hip version)",duration:"90 sec each side"},
        {name:"Pigeon Pose",duration:"2 min each side"},
        {name:"Gomukhasana (cow face legs)",duration:"90 sec each side"},
        {name:"Butterfly Stretch",duration:"2 min"},
      ]},
      {phase:3,label:"Phase 3 — Half Lotus",note:"Months 4–8. Only begin when pigeon is completely comfortable. Target: half lotus hold for 3+ min on both sides.",color:"#0A40AA",exercises:[
        {name:"Double Pigeon (fire log pose)",duration:"2 min each side"},
        {name:"Half Lotus Prep (supported)",duration:"2 min each side"},
        {name:"Supported Half Lotus Hold",duration:"3 min each side"},
        {name:"Half Lotus Seated Hold",duration:"3–5 min each side"},
      ]},
      {phase:4,label:"Phase 4 — Full Lotus",note:"Months 8+. Only attempt after equal, comfortable half lotus on both sides. There is no rush. Knee pain = stop.",color:"#0A7A2A",exercises:[
        {name:"Full Lotus Attempt (supported)",duration:"30–60 sec each leg on top"},
        {name:"Full Lotus Hold",duration:"Build to 5 min"},
      ]},
    ],
    groups:[]},
};

const CORE_MAP=[
  {label:"Flexion",day:"Day 1",color:"#AA2A0A"},
  {label:"Anti-Extension",day:"Day 1",color:"#AA2A0A"},
  {label:"Anti-Rotation",day:"Day 2",color:"#0A40AA"},
  {label:"Rotation",day:"Day 3",color:"#0A7A2A"},
  {label:"Lateral Stability",day:"Day 3",color:"#0A7A2A"},
  {label:"Deep Stabilizers",day:"Home A",color:"#5A10AA"},
];

// ── Muscle group relationships for seeding unlogged exercises ────────────────
const MUSCLE_MAP = {
  "Smith Machine Back Squat":       {m:["quad","glute","core"]},
  "Smith Machine Front Squat":      {m:["quad","core"], from:[["Smith Machine Back Squat",0.85]]},
  "Goblet Squat with Band":         {m:["quad","glute","glute_med"], from:[["Smith Machine Back Squat",0.35],["Leg Press (feet high)",0.25]]},
  "Leg Press (feet high)":          {m:["quad","glute","hamstring"], from:[["Smith Machine Back Squat",1.8]]},
  "Leg Extension Machine":          {m:["quad"], from:[["Smith Machine Back Squat",0.35],["Leg Press (feet high)",0.2]]},
  "Smith Machine Split Squat (lighter, higher rep)":{m:["quad","glute"], from:[["Smith Machine Back Squat",0.45]]},
  "Bulgarian Split Squat (DB)":     {m:["quad","glute"], from:[["Smith Machine Back Squat",0.3]]},
  "Dumbbell Reverse Lunge":         {m:["quad","glute"], from:[["Bulgarian Split Squat (DB)",0.9],["Smith Machine Back Squat",0.25]]},
  "Step-Up onto bench (DB)":        {m:["quad","glute"], from:[["Bulgarian Split Squat (DB)",0.8]]},
  "Romanian Deadlift (Smith or DB)":{m:["hamstring","glute","lower_back"]},
  "Smith Machine Conventional Deadlift":{m:["hamstring","glute","lower_back","quad"], from:[["Romanian Deadlift (Smith or DB)",1.15]]},
  "Leg Curl Machine":               {m:["hamstring"], from:[["Romanian Deadlift (Smith or DB)",0.45]]},
  "Single-Leg Curl Machine":        {m:["hamstring"], from:[["Leg Curl Machine",0.6]]},
  "Dumbbell Single-Leg RDL":        {m:["hamstring","glute"], from:[["Romanian Deadlift (Smith or DB)",0.35]]},
  "Hip Abduction Machine":          {m:["glute_med","glute"], from:[["Leg Press (feet high)",0.25],["Smith Machine Back Squat",0.35]]},
  "Cable Hip Abduction":            {m:["glute_med"], from:[["Hip Abduction Machine",0.3]]},
  "Smith Machine Incline Press":    {m:["chest_upper","front_delt","tricep"]},
  "Smith Machine Flat Press":       {m:["chest","front_delt","tricep"], from:[["Smith Machine Incline Press",1.1]]},
  "Dumbbell Incline Press":         {m:["chest_upper","front_delt","tricep"], from:[["Smith Machine Incline Press",0.75]]},
  "Chest Dip (lean forward, max 90°)":{m:["chest","tricep","front_delt"], from:[["Smith Machine Flat Press",0.5]]},
  "Dumbbell Lateral Raise":         {m:["mid_delt"], from:[["Smith Machine Incline Press",0.2]]},
  "Cable Lateral Raise":            {m:["mid_delt"], from:[["Dumbbell Lateral Raise",0.85]]},
  "Machine Lateral Raise":          {m:["mid_delt"], from:[["Dumbbell Lateral Raise",1.0]]},
  "Dumbbell Shrug (slow + pause)":  {m:["upper_trap"], from:[["Smith Machine Back Squat",0.4],["Romanian Deadlift (Smith or DB)",0.35]]},
  "Lat Pulldown":                   {m:["lat","bicep","mid_trap"]},
  "Assisted Pull-Up Machine":       {m:["lat","bicep"], from:[["Lat Pulldown",1.0]]},
  "Single-Arm Cable Pulldown":      {m:["lat","bicep"], from:[["Lat Pulldown",0.55]]},
  "Low Cable Row (elbows flared)":  {m:["mid_trap","rear_delt","bicep"], from:[["Lat Pulldown",0.85]]},
  "Seated Cable Row (wide grip)":   {m:["mid_trap","lat","bicep"], from:[["Lat Pulldown",0.9]]},
  "Dumbbell Chest-Supported Row":   {m:["mid_trap","rear_delt"], from:[["Lat Pulldown",0.45]]},
  "Dumbbell Curl":                  {m:["bicep"], from:[["Lat Pulldown",0.25]]},
  "Cable Curl":                     {m:["bicep"], from:[["Dumbbell Curl",0.9]]},
  "Hammer Curl":                    {m:["bicep","brachialis"], from:[["Dumbbell Curl",1.0]]},
  "Cable Tricep Pushdown":          {m:["tricep"], from:[["Smith Machine Flat Press",0.3]]},
  "Overhead Cable Tricep Extension":{m:["tricep"], from:[["Cable Tricep Pushdown",0.75]]},
  "Skull Crusher (EZ bar)":         {m:["tricep"], from:[["Cable Tricep Pushdown",0.8]]},
  "Standing Calf Raise Machine":    {m:["calf_gastro"]},
  "Seated Calf Raise Machine":      {m:["calf_soleus"], from:[["Standing Calf Raise Machine",0.6]]},
};

function getLoggedAvg(history,exName){
  const vals=[];
  for(const e of Object.values(history)){
    for(const [key,sets] of Object.entries(e.sets||{})){
      if(key===exName||key.endsWith(":"+exName)){
        const ws=Object.values(sets).map(s=>Number(s.weight)).filter(w=>w>0);
        if(ws.length)vals.push(ws.reduce((a,b)=>a+b)/ws.length);
      }
    }
  }
  return vals.length?vals.reduce((a,b)=>a+b)/vals.length:null;
}

function seedWeight(history,exName){
  const map=MUSCLE_MAP[exName];
  if(!map||!map.from)return null;
  const estimates=[];
  for(const [anchorEx,ratio] of map.from){
    const anchorAvg=getLoggedAvg(history,anchorEx);
    if(anchorAvg!=null){
      const raw=anchorAvg*ratio;
      const conservative=Math.max(5,Math.floor(raw/5)*5-5);
      estimates.push(conservative);
    }
  }
  if(!estimates.length)return null;
  return Math.min(...estimates);
}

function getPhase(cycle){
  // Linear progression throughout. Deload suggested after every 4th completed cycle.
  const count=cycle?.count||0;
  const isDeload=count>0&&count%4===0&&(!cycle.done||cycle.done.length===0);
  if(isDeload){
    return{phase:"deload",label:"DELOAD WEEK — Cycle "+count+" complete · use 55–60% of normal weight, focus on form"};
  }
  return{phase:"linear",label:null};
}

function getSuggestion(history,cycle,dayNum,groupName,repsStr,chosenEx){
  const repsMatch=repsStr?repsStr.match(/\d+/g):null;
  const baseMax=repsMatch?Math.max(...repsMatch.map(Number)):10;
  const baseMin=repsMatch&&repsMatch.length>1?Math.min(...repsMatch.map(Number)):Math.max(3,baseMax-2);
  const phase=getPhase(cycle);

  let repTarget=baseMax;
  let repTargetLabel=baseMin<baseMax?(baseMin+"–"+baseMax+" reps"):baseMax+" reps";

  const exKey=chosenEx?groupName+":"+chosenEx:groupName;
  const sessions=Object.entries(history).sort(([a],[b])=>Number(b)-Number(a))
    .filter(([,e])=>e.day===dayNum&&(e.sets?.[exKey]||e.sets?.[groupName]))
    .slice(0,3);

  if(!sessions.length){
    const seeded=chosenEx?seedWeight(history,chosenEx):null;
    if(seeded){
      return{weight:null,suggest:seeded,hitReps:false,phase,seeded:true,repTargetLabel,
        note:"Est. from similar exercises — conservative, adjust as needed"};
    }
    return null;
  }

  const [,last]=sessions[0];
  const sets=last.sets[exKey]||last.sets[groupName];
  const vals=Object.values(sets).filter(s=>s&&typeof s==="object"&&(s.weight||s.reps));
  const weights=vals.map(s=>Number(s.weight)).filter(w=>w>0);
  if(!weights.length)return null;
  // Use max weight logged (not average) to avoid rounding erasing progress
  const lastWeight=Math.max(...weights);
  const loggedReps=vals.map(s=>Number(s.reps)).filter(r=>r>0);
  // hitReps: at least half the sets have reps logged and all logged reps meet target
  const hitReps=loggedReps.length>=Math.ceil(vals.length/2)&&loggedReps.every(r=>r>=repTarget);
  // Consistent: if user hit target 2 sessions in a row, definitely increase
  let suggestIncrease=hitReps;
  if(sessions.length>=2&&!hitReps){
    const [,prev]=sessions[1];
    const prevSets=prev.sets[exKey]||prev.sets[groupName];
    if(prevSets){
      const prevReps=Object.values(prevSets).map(s=>Number(s?.reps)).filter(r=>r>0);
      const prevWeights=Object.values(prevSets).map(s=>Number(s?.weight)).filter(w=>w>0);
      const prevMax=prevWeights.length?Math.max(...prevWeights):0;
      if(prevMax===lastWeight&&prevReps.length>0&&prevReps.every(r=>r>=repTarget))suggestIncrease=true;
    }
  }

  if(phase.phase==="deload"){
    const deloadWeight=Math.max(5,Math.round(lastWeight*0.55/5)*5);
    return{weight:lastWeight,suggest:deloadWeight,hitReps:false,phase,
      repTargetLabel:baseMax+" reps (deload — light, perfect form)",
      note:"Deload week — 55% load, full ROM, no grind"};
  }
  // Linear: hit reps → +5lb, otherwise hold
  return{weight:lastWeight,suggest:suggestIncrease?lastWeight+5:lastWeight,hitReps:suggestIncrease,phase,repTargetLabel,
    note:suggestIncrease?"Hit target — add 5 lbs":"Target "+repTargetLabel};
}


function getLastReps(history,dayNum,groupName){
  for(const [,e] of Object.entries(history).sort(([a],[b])=>b-a)){
    if(e.day!==dayNum)continue;
    const sets=e.sets?.[groupName];if(!sets)continue;
    const r=Object.values(sets).map(s=>s.reps).filter(Boolean);
    if(r.length)return r[r.length-1];
  }
  return null;
}

function getCardioHistory(history,dayNum){
  for(const [,e] of Object.entries(history).sort(([a],[b])=>b-a)){
    if(e.day!==dayNum)continue;
    const c=e.sets?.["Cardio — Zone 2"];
    if(c?.minutes||c?.resistance)return c;
  }
  return null;
}

// ── VMO unlock status ────────────────────────────────────────────────────────
// Unlock Single-Leg Strength after 3 qualifying sessions:
// Goblet Squat with Band ≥20lb for 3×12, OR Leg Extension ≥30lb for 3×15
function getVmoUnlockStatus(history){
  // Requires BOTH: 3 qualifying Hip Abduction sessions AND 3 qualifying VMO isolation sessions
  const HIP_MIN_W=50, HIP_MIN_REPS=15, HIP_SETS=3;
  const VMO_MIN_W=30, VMO_MIN_REPS=15, VMO_SETS=3;
  const VMO_KEYS=["Leg Extension","Resistance Band TKE","Poliquin Step-Up"];
  let hipSessions=0, vmoSessions=0;
  for(const e of Object.values(history)){
    let hipQual=false, vmoQual=false;
    for(const [key,sets] of Object.entries(e.sets||{})){
      const vals=Object.values(sets).filter(s=>s&&typeof s==="object");
      if(key.includes("Hip Abduction")){
        const q=vals.filter(s=>Number(s.weight)>=HIP_MIN_W&&Number(s.reps)>=HIP_MIN_REPS);
        if(q.length>=HIP_SETS)hipQual=true;
      }
      if(VMO_KEYS.some(k=>key.includes(k))){
        const q=vals.filter(s=>(Number(s.weight)>=VMO_MIN_W||key.includes("TKE")||key.includes("Poliquin"))&&Number(s.reps)>=VMO_MIN_REPS);
        if(q.length>=VMO_SETS)vmoQual=true;
      }
    }
    if(hipQual)hipSessions++;
    if(vmoQual)vmoSessions++;
  }
  const needed=3;
  const unlocked=hipSessions>=needed&&vmoSessions>=needed;
  return{unlocked,hipCount:Math.min(hipSessions,needed),vmoCount:Math.min(vmoSessions,needed),needed,
    criteria:"Hip Abduction ≥50lb × 3×15 (×3 sessions) + VMO exercise ≥30lb × 3×15 (×3 sessions)"};
}

// ── Cross-day suppression: check if a gym day was done this cycle ─────────────
function isDayDoneThisCycle(history,cycle,dayNum){
  if(!cycle||!cycle.start)return false;
  return Object.values(history).some(e=>e.day===dayNum&&
    new Date(e.date)>= new Date(cycle.start));
}

// ── Weekly alternation: which alt to show this week ──────────────────────────
function getWeeklyAlt(history){
  const dates=Object.values(history).map(e=>e.date).filter(Boolean).sort();
  if(!dates.length)return "A";
  const firstDate=new Date(dates[0]);
  const weeks=Math.floor((Date.now()-firstDate)/(1000*60*60*24*7));
  return weeks%2===0?"A":"B";
}

// ── Recovery score ─────────────────────────────────────────────────────────────
function calcRecoveryScore(sleep,soreness,motivation){
  return Math.round((sleep/8*40)+((6-soreness)/5*30)+(motivation/5*30));
}

function buildRenderUnits(groups){
  const units=[];let i=0;
  while(i<groups.length){
    const g=groups[i];
    if(g.cardio){units.push({type:"cardio",group:g});i++;continue;}
    if(g.supersetId&&!g.violinStraight){
      const pair=[g];
      if(i+1<groups.length&&groups[i+1].supersetId===g.supersetId&&!groups[i+1].violinStraight){pair.push(groups[i+1]);i+=2;}
      else{i++;}
      if(pair.length===1){units.push({type:"straight",group:pair[0]});}
      else{units.push({type:"superset",label:g.supersetId,rest:g.supersetRest,groups:pair});}
    } else if(g.violinStraight){
      const vGroups=[g];i++;
      while(i<groups.length&&groups[i].violinStraight){vGroups.push(groups[i]);i++;}
      units.push({type:"violinSection",groups:vGroups});
    } else {
      units.push({type:"straight",group:g});i++;
    }
  }
  return units;
}

export default function WorkoutTracker(){
  const [currentDay,setCurrentDay]=useState(1);
  const [sessionData,setSessionData]=useState({});
  const [recoveryData,setRecoveryData]=useState({sleep:7,soreness:2,motivation:3});
  const [recoveryDone,setRecoveryDone]=useState(false);
  const [showRecovery,setShowRecovery]=useState(false);
  const [recoveryScore,setRecoveryScore]=useState(null);
  const [history,setHistory]=useState({});
  const [view,setView]=useState("home");
  const [loading,setLoading]=useState(true);
  const [savedMsg,setSavedMsg]=useState("");
  const [selectedEx,setSelectedEx]=useState({});
  const [openGroup,setOpenGroup]=useState(null);
  const [showCore,setShowCore]=useState(false);
  const [showWarmup,setShowWarmup]=useState(true);
  const [infoEx,setInfoEx]=useState(null);
  const [openVMO,setOpenVMO]=useState(false);

  const [cycle, setCycle] = useState({start:null, done:[], count:0});
  const [lotusLast, setLotusLast] = useState(null);

  // ── Rest timer ────────────────────────────────────────────────────────────
  const [timer, setTimer] = useState(null); // {seconds, total, label, running}
  const timerRef = useRef(null);

  const vibrate = useCallback(async (type) => {
    try {
      if (type === 'warning') {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      } else if (type === 'done') {
        // One long sustained buzz via rapid sequential impacts
        for(let i=0;i<6;i++){
          await Haptics.impact({ style: ImpactStyle.Heavy });
          await new Promise(r => setTimeout(r, 50));
        }
      }
    } catch {
      try { if(navigator.vibrate) navigator.vibrate(type === 'done' ? [800] : 120); } catch {}
    }
  }, []);

  const startTimer = useCallback((seconds, label, mobility) => {
    clearInterval(timerRef.current);
    setTimer({seconds, total:seconds, label, mobility, running:true});
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if(!t||!t.running) return t;
        if(t.seconds <= 1) {
          clearInterval(timerRef.current);
          vibrate('done');
          return {...t, seconds:0, running:false};
        }
        if(t.seconds <= 5 && t.seconds >= 1) {
          vibrate('warning');
        }
        return {...t, seconds:t.seconds-1};
      });
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    clearInterval(timerRef.current);
    setTimer(null);
  }, []);

  useEffect(() => () => clearInterval(timerRef.current), []);

  // Parse rest string like "90 sec", "45–50 sec" -> seconds
  const parseRest = (restStr) => {
    if(!restStr) return 90;
    if(/min/i.test(restStr)){
      const m = restStr.match(/([0-9]+)/);
      return m ? parseInt(m[1]) * 60 : 90;
    }
    const m = restStr.match(/([0-9]+)/);
    return m ? parseInt(m[1]) : 90;
  };

  useEffect(()=>{
    (async()=>{
      try{
        const d=await store.get("cur_day_v8");
        const h=await store.get("hist_v8");
        const c=await store.get("cycle_v1");
        const ll=await store.get("lotus_last_v1");
        if(d)setCurrentDay(Number(d));
        if(h)setHistory(JSON.parse(h));
        if(ll)setLotusLast(Number(ll));
        if(c){
          const parsed=JSON.parse(c);
          const elapsed=(Date.now()-parsed.start)/(1000*60*60*24);
          if(parsed.done.length>=5||elapsed>=10){
            const fresh={start:null,done:[]};
            setCycle(fresh);
            await store.set("cycle_v1",JSON.stringify(fresh));
          } else {
            setCycle(parsed);
          }
        }
      }catch{}
      setLoading(false);
    })();
  },[]);

  const updateSet=(g,i,field,val)=>setSessionData(p=>({...p,[g]:{...p[g],[i]:{...(p[g]?.[i]||{}),[field]:val}}}));
  const updateReps=(g,i,val)=>setSessionData(p=>({...p,[g]:{...p[g],[i]:{reps:val}}}));
  const toggleCheck=(g,ex)=>setSessionData(p=>({...p,[g]:{...p[g],[ex]:!p[g]?.[ex]}}));
  const updateCardio=(field,val)=>setSessionData(p=>({...p,["Cardio — Zone 2"]:{...(p["Cardio — Zone 2"]||{}),[field]:val}}));

  const saveWorkout=()=>{
    const entry={day:currentDay,date:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),exercises:selectedEx,sets:sessionData};
    const newHist={...history,[Date.now()]:entry};
    setHistory(newHist);
    store.set("hist_v8",JSON.stringify(newHist));

    if(currentDay===6){
      // Lotus tracked independently
      const now=Date.now();
      setLotusLast(now);
      store.set("lotus_last_v1",String(now));
    } else {
      // Update main cycle
      const newDone=[...new Set([...cycle.done, currentDay])];
      const cycleStart=cycle.start||Date.now();
      const elapsed=(Date.now()-cycleStart)/(1000*60*60*24);
      let newCycle;
      if(newDone.length>=5||elapsed>=10){
        // Cycle complete — reset, increment count
        newCycle={start:null,done:[],count:(cycle.count||0)+1};
      } else {
        newCycle={start:cycleStart,done:newDone};
      }
      setCycle(newCycle);
      store.set("cycle_v1",JSON.stringify(newCycle));
      // Start cycle clock on first workout if not started
      if(!cycle.start){
        const started={...newCycle,start:cycleStart};
        setCycle(started);
        store.set("cycle_v1",JSON.stringify(started));
      }
    }

    const next=currentDay===6?1:currentDay+1;
    setCurrentDay(next);
    store.set("cur_day_v8",String(next));
    setSavedMsg(DAYS[next].label);
    setTimeout(()=>{setSavedMsg("");setView("home");},1600);
  };

  const day=DAYS[currentDay];

  const renderTimerButton = (restStr, label, mobility) => {
    const secs = parseRest(restStr);
    const active = timer && timer.label === label;
    return (
      <button
        onClick={()=> active ? stopTimer() : startTimer(secs, label, mobility)}
        style={{
          background: active ? (timer.running ? "#AA6800" : "#0A7A2A") : "#BFB298",
          border: `1px solid ${active ? (timer.running ? "#AA6800" : "#0A7A2A") : "#BFB298"}`,
          color: active ? "#000" : "#5A4A2E",
          padding:"5px 12px",
          fontFamily:"'Space Mono',monospace",
          fontSize:10,
          cursor:"pointer",
          letterSpacing:".08em",
          display:"flex",
          alignItems:"center",
          gap:6,
          flexShrink:0,
        }}>
        {active
          ? (timer.running
              ? `⏱ ${timer.seconds}s`
              : "✓ DONE — tap to clear")
          : `⏱ REST ${restStr||"90 sec"}`}
      </button>
    );
  };
  if(loading)return <div style={{background:"#E8DFCD",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"monospace",color:"#6A5A3A",letterSpacing:".3em",fontSize:11}}>LOADING...</div>;

  const renderGroupContent=(group)=>{
    const chosen=selectedEx[group.name]||group.exercises[0];
    const exInfo=INFO[chosen];
    const weekAlt=getWeeklyAlt(history);
    // Recovery modifiers
    const recAmber=recoveryScore!==null&&recoveryScore>=50&&recoveryScore<70;
    const recRed=recoveryScore!==null&&recoveryScore<50;
    const effectiveSets=group.sets; // set count unchanged; top set dropped via skipTopSet flag
    const skipTopSet=(recRed||recAmber)&&activeGroup.topSet;
    const weightMod=recRed?0.85:1.0; // amber: back-offs unchanged (top set removal is the reduction); red: back-offs at 85% of normal

    // Cross-day suppress check
    if(group.suppressIfDay&&isDayDoneThisCycle(history,cycle,group.suppressIfDay)){
      return(
        <div style={{padding:"10px 14px",fontFamily:"'Space Mono',monospace",fontSize:10,
          color:"#6A5A3A",background:"#D4C9A0",borderTop:"1px solid #C8BBA0",
          fontStyle:"italic"}}>
          ⤵ {group.suppressNote||"Covered in recent gym session — skipping"}
        </div>
      );
    }

    // VMO lock check — when locked, render VMO prereq exercises instead
    if(group.vmoLock){
      const vmo=getVmoUnlockStatus(history);
      if(!vmo.unlocked){
        const vmoGroup={
          ...group,
          name:group.name,
          exercises:group.vmoExercises||["Resistance Band TKE","Poliquin Step-Up","Leg Extension Machine"],
          reps:group.vmoReps||"15–20",
          sets:group.vmoSets||3,
          vmoLock:false, // prevent recursion
        };
        const vmoChosen=selectedEx[group.name]||vmoGroup.exercises[0];
        const vmoInfo=INFO[vmoChosen];
        return(
          <div style={{paddingBottom:4}}>
            <div style={{padding:"8px 14px 6px",background:"#AA2A0A10",borderBottom:"1px solid #AA2A0A20"}}>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"#AA2A0A",letterSpacing:".12em",marginBottom:3}}>
                🔒 PRE-UNLOCK: BUILD VMO + GLUTE MED FIRST
              </div>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"#5A4A2E",lineHeight:1.6}}>
                Hip Abduction {vmo.hipCount}/{vmo.needed} · VMO {vmo.vmoCount}/{vmo.needed} · {vmo.criteria}
              </div>
            </div>
            {/* Exercise selector */}
            <div style={{display:"flex",gap:5,flexWrap:"wrap",padding:"10px 0 6px"}}>
              {vmoGroup.exercises.map(ex=>(
                <button key={ex} onClick={()=>setSelectedEx(p=>({...p,[group.name]:ex}))}
                  style={{background:vmoChosen===ex?"#AA2A0A":"#D4C9B0",border:`1px solid ${vmoChosen===ex?"#AA2A0A":"#C8BBA0"}`,
                    color:vmoChosen===ex?"#fff":"#3A2A12",padding:"4px 10px",cursor:"pointer",
                    fontFamily:"'Space Mono',monospace",fontSize:9,letterSpacing:".05em"}}>
                  {ex}
                </button>
              ))}
            </div>
            {vmoInfo&&(
              <div style={{background:"#D4C9B0",border:"1px solid #C8BBA0",padding:"8px 10px",marginBottom:8}}>
                <div style={{color:"#3A2A12",fontSize:9,fontFamily:"'Space Mono',monospace",lineHeight:1.55,marginBottom:6}}>{vmoInfo[0]}</div>
                <a href={vmoInfo[1]} target="_blank" rel="noreferrer"
                  style={{color:"#AA2A0A",fontSize:9,fontFamily:"'Space Mono',monospace",textDecoration:"none",border:"1px solid #AA2A0A40",padding:"2px 8px"}}>▶ WATCH</a>
              </div>
            )}
            <div style={{display:"grid",gridTemplateColumns:"28px 1fr 1fr",gap:5,marginBottom:6}}>
              {["SET","WEIGHT (lbs)","REPS"].map(h=><div key={h} style={{color:"#6A5A3A",fontSize:9,letterSpacing:".1em",fontFamily:"'Space Mono',monospace"}}>{h}</div>)}
            </div>
            {Array.from({length:Math.max(1,vmoGroup.sets-(recRed?2:recAmber?1:0))}).map((_,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"28px 1fr 1fr",gap:5,marginBottom:4,alignItems:"center"}}>
                <div style={{color:"#6A5A3A",fontSize:11,textAlign:"center",fontFamily:"'Space Mono',monospace"}}>{i+1}</div>
                <input style={{background:"#C8BBA0",border:"1px solid #1c1c1c",color:"#0A0806",padding:"8px 10px",fontFamily:"'Space Mono',monospace",fontSize:13,width:"100%",outline:"none"}}
                  type="number" placeholder="—"
                  value={sessionData[group.name+":VMO:"+vmoChosen]?.[i]?.weight||""}
                  onChange={e=>updateSet(group.name+":VMO:"+vmoChosen,i,"weight",e.target.value)}/>
                <input style={{background:"#C8BBA0",border:"1px solid #1c1c1c",color:"#0A0806",padding:"8px 10px",fontFamily:"'Space Mono',monospace",fontSize:13,width:"100%",outline:"none"}}
                  type="number" placeholder={vmoGroup.reps.split(/[–—]/)[0]}
                  value={sessionData[group.name+":VMO:"+vmoChosen]?.[i]?.reps||""}
                  onChange={e=>updateSet(group.name+":VMO:"+vmoChosen,i,"reps",e.target.value)}/>
              </div>
            ))}
          </div>
        );
      }
    }

    // Weekly alternation — override exercises if weeklyAlt set
    let activeGroup=group;
    if(group.weeklyAlt==="A"&&weekAlt==="B"){
      // This group skips this week — show note
      return(
        <div style={{padding:"10px 14px",fontFamily:"'Space Mono',monospace",fontSize:10,
          color:"#6A5A3A",background:"#D4C9A0",borderTop:"1px solid #C8BBA0",fontStyle:"italic"}}>
          ↻ Week B — skipped this week (alternating with Lower Trap block)
        </div>
      );
    }
    if(group.weeklyAlt==="B"&&weekAlt==="A"){
      return(
        <div style={{padding:"10px 14px",fontFamily:"'Space Mono',monospace",fontSize:10,
          color:"#6A5A3A",background:"#D4C9A0",borderTop:"1px solid #C8BBA0",fontStyle:"italic"}}>
          ↻ Week A — skipped this week (alternating with External Rotation block)
        </div>
      );
    }
    // Core Day 3 weekly alt between rotation and lateral
    if(group.weeklyAlt==="AB"){
      const useAlt=weekAlt==="B"&&group.altB;
      if(useAlt)activeGroup={...group,...group.altB,exercises:group.altB.exercises,reps:group.altB.reps||group.reps};
      else if(group.altA)activeGroup={...group,...group.altA,exercises:group.altA.exercises};
    }

    return(
      <div style={{paddingBottom:4}}>
        {/* Top-set banner */}
        {activeGroup.topSet&&(
          <div style={{padding:"5px 0",fontFamily:"'Space Mono',monospace",fontSize:9,
            letterSpacing:".1em",color:"#AA6800",marginBottom:8}}>
            📈 TOP SET + BACK-OFF: Set 1 → work up to heavy 3–5 reps. Sets 2–{effectiveSets} → drop to 70–75%, 8–10 reps.
          </div>
        )}
        {(recRed||recAmber)&&group.mode==="log"&&!group.cardio&&(
          <div style={{padding:"5px 10px",fontFamily:"'Space Mono',monospace",fontSize:9,
            letterSpacing:".08em",marginBottom:8,
            background:recRed?"#AA2A0A12":"#FFB83318",
            borderLeft:`2px solid ${recRed?"#AA2A0A":"#AA6800"}`,
            color:recRed?"#AA2A0A":"#AA6800"}}>
            {recRed
              ?"↓ LOW READINESS: top set skipped · back-offs at 85% of normal · skip if needed"
              :"↓ MODERATE: top set skipped · back-offs at normal weight"}
          </div>
        )}
        {group.mode!=="check"&&!group.cardio&&(
          <div style={{marginBottom:12}}>
            <div style={{color:"#6A5A3A",fontSize:9,letterSpacing:".2em",fontFamily:"'Space Mono',monospace",marginBottom:6}}>SELECT EXERCISE</div>
            {group.exercises.map(ex=>(
              <div key={ex} style={{display:"flex",gap:5,marginBottom:3}}>
                <button style={{background:"none",border:`1px solid ${chosen===ex?day.color+"50":"#BFB298"}`,color:chosen===ex?day.color:INFO[ex]&&INFO[ex][0].startsWith("🔓")?"#9A8A6A":"#3c3c3c",padding:"8px 11px",fontFamily:"'Space Mono',monospace",fontSize:10,cursor:"pointer",flex:1,textAlign:"left",marginBottom:0,opacity:INFO[ex]&&INFO[ex][0].startsWith("🔓")&&chosen!==ex?0.55:1}}
                  onClick={()=>setSelectedEx(p=>({...p,[group.name]:ex}))}>
                  {chosen===ex?"▶  ":"    "}{INFO[ex]&&INFO[ex][0].startsWith("🔓")?"🔓 ":INFO[ex]&&INFO[ex][0].startsWith("⚠")?"⚠ ":""}{ex}
                </button>
                <button onClick={()=>setInfoEx(ex)} style={{background:"none",border:"1px solid #181818",color:"#6A5A3A",width:28,cursor:"pointer",fontSize:11,flexShrink:0,fontFamily:"'Space Mono',monospace"}}
                  onMouseEnter={e=>{e.currentTarget.style.color="#2A1E0E";e.currentTarget.style.borderColor="#6A5A3A"}}
                  onMouseLeave={e=>{e.currentTarget.style.color="#6A5A3A";e.currentTarget.style.borderColor="#BFB298"}}>ℹ</button>
              </div>
            ))}
          </div>
        )}
        {group.mode!=="check"&&!group.cardio&&exInfo&&(
          <div style={{background:"#D4C9B0",border:"1px solid #1a1a1a",padding:"10px 12px",marginBottom:12}}>
            <div style={{color:"#3A2A12",fontSize:10,fontFamily:"'Space Mono',monospace",lineHeight:1.6,marginBottom:7}}>{exInfo[0]}</div>
            <a style={{background:"none",border:"1px solid #900",color:"#c00",padding:"4px 10px",fontFamily:"'Space Mono',monospace",fontSize:10,cursor:"pointer",textDecoration:"none",display:"inline-block"}}
              href={exInfo[1]} target="_blank" rel="noreferrer">▶ WATCH</a>
          </div>
        )}
        {group.mode==="log"&&!group.cardio&&(()=>{
          const sug=getSuggestion(history,cycle,currentDay,group.name,group.reps,chosen);
          const isTopSet=activeGroup.topSet&&!skipTopSet;
          const storeKey=chosen?group.name+":"+chosen:group.name;
          const topSetWeight=Number(sessionData[storeKey]?.[0]?.weight)||0;
          const backOffSuggest=topSetWeight?Math.round(topSetWeight*0.72/5)*5:null;
          return(<>
            {sug&&(
              <div style={{marginBottom:10}}>
                {sug.phase?.phase==="deload"&&<div style={{padding:"4px 10px",fontFamily:"'Space Mono',monospace",fontSize:9,letterSpacing:".1em",background:"#FFB83318",borderLeft:"2px solid #AA6800",color:"#AA6800",marginBottom:4}}>DELOAD WEEK</div>}
                <div style={{padding:"6px 10px",fontFamily:"'Space Mono',monospace",fontSize:10,background:sug.seeded?"#0A40AA10":sug.hitReps?"#3DD67A18":"#FFB8331a",borderLeft:`2px solid ${sug.seeded?"#0A40AA":sug.hitReps?"#0A7A2A":"#AA6800"}`,color:sug.seeded?"#0A40AA":sug.hitReps?"#0A7A2A":"#AA6800"}}>
                  {sug.seeded?"💡":"→"} {isTopSet?"Back-off target: ":""}{sug.suggest} lbs · {sug.repTargetLabel} · {sug.note}
                </div>
              </div>
            )}
            {isTopSet&&(
              <div style={{padding:"8px 10px",marginBottom:10,background:"#AA680010",borderLeft:"3px solid #AA6800"}}>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"#AA6800",letterSpacing:".1em",marginBottom:5}}>HOW TO FIND YOUR TOP SET</div>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"#5A4A2E",lineHeight:1.7}}>
                  1. After warm-up, load a weight you could do for ~6 reps.<br/>
                  2. Do 3–5 reps. If easy, rest 2 min and add 5–10 lbs.<br/>
                  3. Repeat until the last rep is genuinely hard but form holds.<br/>
                  4. That is your top set. Log it below — back-off weight auto-calculates at 72%.
                </div>
              </div>
            )}
            {/* Top set row (set 1) */}
            {isTopSet&&(
              <div style={{marginBottom:8}}>
                <div style={{display:"grid",gridTemplateColumns:"28px 1fr 1fr",gap:5,marginBottom:4}}>
                  {["","WEIGHT (lbs)","REPS"].map(h=><div key={h} style={{color:"#6A5A3A",fontSize:9,letterSpacing:".1em",fontFamily:"'Space Mono',monospace"}}>{h}</div>)}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"28px 1fr 1fr",gap:5,alignItems:"center"}}>
                  <div style={{color:"#AA6800",fontSize:10,textAlign:"center",fontFamily:"'Bebas Neue',sans-serif",letterSpacing:".05em"}}>TOP</div>
                  <input style={{background:"#E8D8B0",border:"2px solid #AA6800",color:"#0A0806",padding:"8px 10px",fontFamily:"'Space Mono',monospace",fontSize:13,width:"100%",outline:"none"}}
                    type="number" placeholder={sug?String(Math.round(sug.suggest*weightMod/5)*5):"—"}
                    value={sessionData[storeKey]?.[0]?.weight||""}
                    onChange={e=>updateSet(storeKey,0,"weight",e.target.value)}/>
                  <input style={{background:"#E8D8B0",border:"2px solid #AA6800",color:"#0A0806",padding:"8px 10px",fontFamily:"'Space Mono',monospace",fontSize:13,width:"100%",outline:"none"}}
                    type="number" placeholder="3–5"
                    value={sessionData[storeKey]?.[0]?.reps||""}
                    onChange={e=>updateSet(storeKey,0,"reps",e.target.value)}/>
                </div>
              </div>
            )}
            {/* Back-off sets (sets 2–N) or all sets if not topSet */}
            {isTopSet&&backOffSuggest&&(
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,color:"#AA6800",letterSpacing:".08em",marginBottom:6}}>
                ↓ BACK-OFF: {backOffSuggest} lbs (72% of {topSetWeight} lbs) · 8–10 reps
              </div>
            )}
            <div style={{display:"grid",gridTemplateColumns:"28px 1fr 1fr",gap:5,marginBottom:6}}>
              {[isTopSet?"":"SET","WEIGHT (lbs)","REPS"].map(h=><div key={h} style={{color:"#6A5A3A",fontSize:9,letterSpacing:".1em",fontFamily:"'Space Mono',monospace"}}>{h}</div>)}
            </div>
            {Array.from({length:isTopSet?effectiveSets-1:effectiveSets}).map((_,i)=>{
              const setIdx=isTopSet?i+1:i;
              return(
              <div key={setIdx} style={{display:"grid",gridTemplateColumns:"28px 1fr 1fr",gap:5,marginBottom:4,alignItems:"center"}}>
                <div style={{color:"#6A5A3A",fontSize:11,textAlign:"center",fontFamily:"'Space Mono',monospace"}}>{setIdx+1}</div>
                <input style={{background:"#C8BBA0",border:"1px solid #1c1c1c",color:"#0A0806",padding:"8px 10px",fontFamily:"'Space Mono',monospace",fontSize:13,width:"100%",outline:"none"}}
                  type="number"
                  placeholder={isTopSet?(backOffSuggest?String(Math.round(backOffSuggest*weightMod/5)*5):"—"):(sug?String(Math.round(sug.suggest*weightMod/5)*5):"—")}
                  value={sessionData[storeKey]?.[setIdx]?.weight||""}
                  onChange={e=>updateSet(storeKey,setIdx,"weight",e.target.value)}/>
                <input style={{background:"#C8BBA0",border:"1px solid #1c1c1c",color:"#0A0806",padding:"8px 10px",fontFamily:"'Space Mono',monospace",fontSize:13,width:"100%",outline:"none"}}
                  type="number"
                  placeholder={isTopSet?"8–10":group.reps.split(/[–—]/)[0]}
                  value={sessionData[storeKey]?.[setIdx]?.reps||""}
                  onChange={e=>updateSet(storeKey,setIdx,"reps",e.target.value)}/>
              </div>
            )})}
          </>);
        })()}
        {group.mode==="reps"&&(()=>{
          const lr=getLastReps(history,currentDay,group.name);
          return(<>
            {lr&&<div style={{color:"#6A5A3A",fontSize:10,fontFamily:"'Space Mono',monospace",marginBottom:7}}>↑ last: {lr} reps</div>}
            <div style={{display:"grid",gridTemplateColumns:"28px 1fr",gap:5,marginBottom:6}}>
              {["SET","REPS"].map(h=><div key={h} style={{color:"#6A5A3A",fontSize:9,letterSpacing:".1em",fontFamily:"'Space Mono',monospace"}}>{h}</div>)}
            </div>
            {Array.from({length:effectiveSets}).map((_,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"28px 1fr",gap:5,marginBottom:4,alignItems:"center"}}>
                <div style={{color:"#6A5A3A",fontSize:11,textAlign:"center",fontFamily:"'Space Mono',monospace"}}>{i+1}</div>
                <input style={{background:"#C8BBA0",border:"1px solid #1c1c1c",color:"#0A0806",padding:"8px 10px",fontFamily:"'Space Mono',monospace",fontSize:13,width:"100%",outline:"none"}}
                  type="number" placeholder={group.reps.split(/[–—]/)[0]} value={sessionData[group.name]?.[i]?.reps||""} onChange={e=>updateReps(group.name,i,e.target.value)}/>
              </div>
            ))}
          </>);
        })()}
        {group.mode==="check"&&(
          <div>
            <div style={{color:"#6A5A3A",fontSize:9,letterSpacing:".2em",fontFamily:"'Space Mono',monospace",marginBottom:9}}>MARK COMPLETE · {group.duration}</div>
            {group.exercises.map(ex=>{
              const done=!!(sessionData[group.name]?.[ex]);
              const exI=INFO[ex];
              return(
                <div key={ex} style={{borderBottom:"1px solid #0f0f0f",paddingBottom:9,marginBottom:9}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:9}}>
                    <div style={{width:17,height:17,border:`1px solid ${done?day.color:"#262626"}`,background:done?day.color+"22":"#D4C9B0",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}
                      onClick={()=>toggleCheck(group.name,ex)}>
                      {done&&<span style={{color:day.color,fontSize:10}}>✓</span>}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
                        <span style={{color:done?"#5A4A2E":"#120E08",fontSize:11,fontFamily:"'Space Mono',monospace",textDecoration:done?"line-through":"none"}}>{ex}</span>
                        {exI&&<button onClick={()=>setInfoEx(ex)} style={{background:"none",border:"1px solid #181818",color:"#6A5A3A",padding:"1px 6px",cursor:"pointer",fontSize:10,fontFamily:"'Space Mono',monospace"}}
                          onMouseEnter={e=>{e.currentTarget.style.color="#2A1E0E"}} onMouseLeave={e=>{e.currentTarget.style.color="#6A5A3A"}}>ℹ</button>}
                      </div>
                      {exI&&<div style={{color:"#6A5A3A",fontSize:10,fontFamily:"'Space Mono',monospace",marginTop:3,lineHeight:1.5}}>{exI[0]}</div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {group.vmoAlt&&(
          <div style={{marginTop:10,borderTop:"1px solid #C8BBA0",paddingTop:10}}>
            <button onClick={()=>setOpenVMO(p=>!p)}
              style={{background:"none",border:"1px solid #AA2A0A40",color:"#AA2A0A",padding:"6px 12px",cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:9,letterSpacing:".15em",width:"100%",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span>⚠ ALT FOR VMO WEAKNESS</span>
              <span>{openVMO?"▲":"▼"}</span>
            </button>
            {openVMO&&(
              <div style={{marginTop:8,padding:"10px 12px",background:"#D4C9B0",border:"1px solid #AA2A0A30"}}>
                <div style={{color:"#AA2A0A",fontSize:9,letterSpacing:".15em",fontFamily:"'Space Mono',monospace",marginBottom:8}}>SUBSTITUTE THESE FOR SINGLE-LEG EXERCISES WHILE VMO IS WEAK</div>
                {["Resistance Band TKE","Leg Extension Machine"].map(ex=>(
                  <div key={ex} style={{display:"flex",gap:5,marginBottom:6,alignItems:"flex-start"}}>
                    <div style={{flex:1}}>
                      <div style={{color:"#3A2A12",fontSize:10,fontFamily:"'Space Mono',monospace",marginBottom:3}}>{ex}</div>
                      {INFO[ex]&&<div style={{color:"#6A5A3A",fontSize:9,fontFamily:"'Space Mono',monospace",lineHeight:1.5,marginBottom:4}}>{INFO[ex][0]}</div>}
                    </div>
                    <button onClick={()=>setInfoEx(ex)} style={{background:"none",border:"1px solid #C8BBA0",color:"#6A5A3A",width:26,height:26,cursor:"pointer",fontSize:10,flexShrink:0,fontFamily:"'Space Mono',monospace"}}>ℹ</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderGroupHeader=(group,isOpen,onToggle)=>(
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",cursor:"pointer"}} onClick={onToggle}>
      <div style={{flex:1,paddingRight:8}}>
        <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap",marginBottom:2}}>
          <span style={{fontSize:11,fontFamily:"'Space Mono',monospace",color:group.cardio?"#0A7A2A":group.core?"#AA6800":group.violin?"#0A40AA":"#120E08",fontWeight:(group.core||group.cardio)?700:400}}>{group.name}</span>
          {group.nonneg&&<span style={{display:"inline-block",padding:"2px 7px",fontSize:9,letterSpacing:".12em",fontFamily:"'Space Mono',monospace",background:"#FFB83330",color:"#AA6800"}}>🎻 MUST DO</span>}
          {group.autoAdded&&<span style={{display:"inline-block",padding:"2px 7px",fontSize:9,letterSpacing:".12em",fontFamily:"'Space Mono',monospace",background:"#FFB83330",color:"#AA6800"}}>⚠ AUTO-ADDED</span>}
          {group.violin&&!group.nonneg&&<span style={{display:"inline-block",padding:"2px 7px",fontSize:9,letterSpacing:".12em",fontFamily:"'Space Mono',monospace",background:"#4A95FF20",color:"#0A40AA"}}>🎻</span>}
          {group.vmoAlt&&<span style={{display:"inline-block",padding:"2px 7px",fontSize:9,letterSpacing:".12em",fontFamily:"'Space Mono',monospace",background:"#AA2A0A18",color:"#AA2A0A",border:"1px solid #AA2A0A30"}}>VMO ALT</span>}
          {group.core&&<span style={{display:"inline-block",padding:"2px 7px",fontSize:9,letterSpacing:".12em",fontFamily:"'Space Mono',monospace",background:"#FFB83318",color:"#AA6800"}}>CORE</span>}
          {group.cardio&&<span style={{display:"inline-block",padding:"2px 7px",fontSize:9,letterSpacing:".12em",fontFamily:"'Space Mono',monospace",background:"#3DD67A22",color:"#0A7A2A"}}>♥ CARDIO</span>}
          {group.mode==="check"&&<span style={{display:"inline-block",padding:"2px 7px",fontSize:9,letterSpacing:".12em",fontFamily:"'Space Mono',monospace",background:"#ffffff08",color:"#5A4A2E"}}>STRETCH</span>}
          {group.movedNote&&<span style={{display:"inline-block",padding:"2px 7px",fontSize:9,letterSpacing:".12em",fontFamily:"'Space Mono',monospace",background:"#C07AFF22",color:"#5A10AA"}}>↓ moved from gym</span>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          <div style={{color:"#6A5A3A",fontSize:10,fontFamily:"'Space Mono',monospace"}}>
            {group.cardio?"20 min · Zone 2":group.mode==="check"?group.duration:`${group.sets}×${group.reps}`}
            {group.violinRest&&<span style={{color:"#1A5A1A",marginLeft:8}}>· rest {group.violinRest}</span>}
          </div>
          {!group.cardio&&!group.violinStraight&&!group.supersetId&&group.mode!=="check"&&group.sets>1&&(
            group.topSet
              ? <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {renderTimerButton("2 min", group.name+" — top set", group.restMobility)}
                  {renderTimerButton("60 sec", group.name+" — back-off", group.restMobility)}
                </div>
              : renderTimerButton("90 sec", group.name, group.restMobility)
          )}
        </div>
      </div>
      <div style={{color:"#6A5A3A",fontSize:12}}>{isOpen?"▲":"▼"}</div>
    </div>
  );

  const renderUnit=(unit,idx)=>{
    if(unit.type==="autoBack"){
      const g=unit.group;const isOpen=openGroup===g.name;
      return(
        <div key={idx} style={{border:"1px solid #E8A82E40",marginBottom:10,position:"relative",background:"#D4C9A0"}}>
          <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:"#AA6800"}}/>
          <div style={{padding:"8px 14px 4px 14px",display:"flex",alignItems:"center",gap:9,flexWrap:"wrap"}}>
            <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:13,color:"#AA6800",letterSpacing:".1em"}}>⚠ AUTO-ADDED</span>
            <span style={{color:"#5a4a10",fontSize:10,fontFamily:"'Space Mono',monospace"}}>Leg press selected — lower back has no isometric load today. Do this to compensate.</span>
          </div>
          <div style={{borderTop:"1px solid #E8A82E20",padding:"0 14px"}}>
            {renderGroupHeader(g,isOpen,()=>setOpenGroup(isOpen?null:g.name))}
            {isOpen&&<div style={{paddingBottom:14}}>{renderGroupContent(g)}</div>}
          </div>
        </div>
      );
    }
    if(unit.type==="superset"){
      const [g1,g2]=unit.groups;const o1=openGroup===g1.name,o2=openGroup===g2.name;
      return(
        <div key={idx} style={{border:`1px solid ${day.color}28`,marginBottom:10,position:"relative"}}>
          <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:day.color,opacity:.5}}/>
          <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 14px 4px 14px"}}>
            <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:13,color:day.color,letterSpacing:".12em"}}>SUPERSET {unit.label}</span>
            <span style={{color:"#6A5A3A",fontSize:10,fontFamily:"'Space Mono',monospace"}}>↕ alternate · rest {unit.rest}</span>
          </div>
          <div style={{borderTop:`1px solid ${day.color}18`,padding:"0 14px"}}>
            {renderGroupHeader(g1,o1,()=>setOpenGroup(o1?null:g1.name))}
            {o1&&renderGroupContent(g1)}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,padding:"4px 14px",background:day.color+"0a"}}>
            <div style={{flex:1,height:1,background:day.color+"30"}}/>
            <span style={{color:day.color,fontSize:10,fontFamily:"'Space Mono',monospace",letterSpacing:".1em"}}>↕ then</span>
            <div style={{flex:1,height:1,background:day.color+"30"}}/>
          </div>
          <div style={{padding:"0 14px"}}>
            {renderGroupHeader(g2,o2,()=>setOpenGroup(o2?null:g2.name))}
            {o2&&renderGroupContent(g2)}
          </div>
          <div style={{padding:"8px 14px",borderTop:`1px solid ${day.color}18`,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
            <span style={{color:"#6A5A3A",fontSize:10,fontFamily:"'Space Mono',monospace"}}>Rest {unit.rest} · then repeat · {g1.sets} rounds total</span>
            {(g1.topSet||g2.topSet)
              ? <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {renderTimerButton("2 min", `${g1.name} / ${g2.name} — top set`, g1.restMobility||g2.restMobility)}
                  {renderTimerButton("60 sec", `${g1.name} / ${g2.name} — back-off`, g1.restMobility||g2.restMobility)}
                </div>
              : renderTimerButton(unit.rest, `${g1.name} / ${g2.name}`, g1.restMobility||g2.restMobility)
            }
          </div>
        </div>
      );
    }
    if(unit.type==="violinSection"){
      return(
        <div key={idx} style={{border:"1px solid #2E7DE828",marginBottom:10,position:"relative"}}>
          <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:"#0A40AA",opacity:.6}}/>
          <div style={{padding:"8px 14px 4px 14px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
              <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:13,color:"#0A40AA",letterSpacing:".1em"}}>🎻 VIOLIN PRIORITY — STRAIGHT SETS</span>
              <span style={{color:"#1A3A6A",fontSize:10,fontFamily:"'Space Mono',monospace"}}>45–50 sec rest between sets</span>
            </div>
            {renderTimerButton("45 sec", "Violin sets")}
          </div>
          {unit.groups.map(g=>{
            const isOpen=openGroup===g.name;
            return(
              <div key={g.name} style={{borderTop:"1px solid #2E7DE818",padding:"0 14px"}}>
                {renderGroupHeader(g,isOpen,()=>setOpenGroup(isOpen?null:g.name))}
                {isOpen&&renderGroupContent(g)}
              </div>
            );
          })}
        </div>
      );
    }
    if(unit.type==="straight"){
      const g=unit.group;const isOpen=openGroup===g.name;
      return(
        <div key={idx} style={{borderBottom:"1px solid #0f0f0f"}}>
          {renderGroupHeader(g,isOpen,()=>setOpenGroup(isOpen?null:g.name))}
          {isOpen&&<div style={{paddingBottom:14}}>{renderGroupContent(g)}</div>}
        </div>
      );
    }
    if(unit.type==="cardio"){
      const g=unit.group;const isOpen=openGroup===g.name;
      const last=getCardioHistory(history,currentDay);
      const cur=sessionData["Cardio — Zone 2"]||{};
      const ci=INFO["Elliptical — Zone 2 (20 min)"];
      return(
        <div key={idx} style={{borderBottom:"1px solid #0f0f0f"}}>
          {renderGroupHeader(g,isOpen,()=>setOpenGroup(isOpen?null:g.name))}
          {isOpen&&(
            <div style={{paddingBottom:14}}>
              <div style={{background:"#D4C9B0",border:"1px solid #1a1a1a",padding:"10px 12px",marginBottom:12}}>
                <div style={{color:"#0A7A2A",fontSize:9,letterSpacing:".15em",fontFamily:"'Space Mono',monospace",marginBottom:5}}>ZONE 2 TARGET</div>
                <div style={{color:"#3A2A12",fontSize:10,fontFamily:"'Space Mono',monospace",lineHeight:1.6,marginBottom:8}}>{ci[0]}</div>
                <a style={{background:"none",border:"1px solid #2EBD6B",color:"#0A7A2A",padding:"4px 10px",fontFamily:"'Space Mono',monospace",fontSize:10,cursor:"pointer",textDecoration:"none",display:"inline-block"}}
                  href={ci[1]} target="_blank" rel="noreferrer">▶ WATCH</a>
              </div>
              {last&&<div style={{color:"#6A5A3A",fontSize:10,fontFamily:"'Space Mono',monospace",marginBottom:9}}>Last: {last.minutes||"—"} min · resistance {last.resistance||"—"}</div>}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:9}}>
                <div>
                  <div style={{color:"#6A5A3A",fontSize:9,letterSpacing:".1em",fontFamily:"'Space Mono',monospace",marginBottom:5}}>MINUTES</div>
                  <input style={{background:"#C8BBA0",border:"1px solid #1c1c1c",color:"#0A0806",padding:"8px 10px",fontFamily:"'Space Mono',monospace",fontSize:13,width:"100%",outline:"none"}}
                    type="number" placeholder="20" value={cur.minutes||""} onChange={e=>updateCardio("minutes",e.target.value)}/>
                </div>
                <div>
                  <div style={{color:"#6A5A3A",fontSize:9,letterSpacing:".1em",fontFamily:"'Space Mono',monospace",marginBottom:5}}>RESISTANCE</div>
                  <input style={{background:"#C8BBA0",border:"1px solid #1c1c1c",color:"#0A0806",padding:"8px 10px",fontFamily:"'Space Mono',monospace",fontSize:13,width:"100%",outline:"none"}}
                    type="number" placeholder="—" value={cur.resistance||""} onChange={e=>updateCardio("resistance",e.target.value)}/>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const renderWarmup=()=>{
    const wu=WARMUP[currentDay];if(!wu)return null;
    return(
      <div style={{border:`1px solid ${day.color}30`,marginBottom:16,background:"#DDD4BC"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",cursor:"pointer"}} onClick={()=>setShowWarmup(p=>!p)}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:2}}>
              <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:15,color:day.color,letterSpacing:".12em"}}>WARM-UP</span>
              <span style={{display:"inline-block",padding:"2px 7px",fontSize:9,letterSpacing:".12em",fontFamily:"'Space Mono',monospace",background:day.color+"18",color:day.color}}>DO FIRST</span>
            </div>
            <div style={{color:"#6A5A3A",fontSize:10,fontFamily:"'Space Mono',monospace"}}>{wu.note}</div>
          </div>
          <div style={{color:"#6A5A3A",fontSize:13,marginLeft:10}}>{showWarmup?"▲":"▼"}</div>
        </div>
        {showWarmup&&(
          <div style={{borderTop:`1px solid ${day.color}18`}}>
            {wu.items.map((item,i)=>{
              const done=!!(sessionData["__warmup__"]?.[i]);
              return(
                <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 14px",borderBottom:"1px solid #111"}}>
                  <div style={{width:17,height:17,border:`1px solid ${done?day.color:"#BFB298"}`,background:done?day.color+"22":"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}
                    onClick={()=>setSessionData(p=>({...p,["__warmup__"]:{...(p["__warmup__"]||{}),[i]:!p["__warmup__"]?.[i]}}))}>
                    {done&&<span style={{color:day.color,fontSize:10}}>✓</span>}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:7}}>
                      <span style={{color:done?"#5A4A2E":"#120E08",fontSize:11,fontFamily:"'Space Mono',monospace",textDecoration:done?"line-through":"none"}}>{item.label}</span>
                      {item.info&&INFO[item.info]&&<button onClick={()=>setInfoEx(item.info)} style={{background:"none",border:"1px solid #181818",color:"#6A5A3A",padding:"1px 6px",cursor:"pointer",fontSize:10,fontFamily:"'Space Mono',monospace"}}
                        onMouseEnter={e=>{e.currentTarget.style.color="#2A1E0E"}} onMouseLeave={e=>{e.currentTarget.style.color="#6A5A3A"}}>ℹ</button>}
                    </div>
                    <div style={{color:"#6A5A3A",fontSize:10,fontFamily:"'Space Mono',monospace",marginTop:2}}>{item.note}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderUnits=day.groups?buildRenderUnits(day.groups):[];
  const squatChoice=selectedEx["Squat Pattern"]||day.groups?.[0]?.exercises?.[0];
  if(currentDay===1&&squatChoice==="Leg Press (feet high)"){
    renderUnits.splice(1,0,{type:"autoBack",group:LEG_PRESS_BACK_GROUP});
  }

  return(
    <div style={{background:"#E8DFCD",minHeight:"100vh",fontFamily:"'Courier New',monospace",color:"#0A0806",paddingBottom:40}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:#D8CFBA}::-webkit-scrollbar-thumb{background:#B5A88E}
        input[type=number]{-moz-appearance:textfield}input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
      `}</style>

      {/* ── Floating rest timer overlay ── */}
      {timer&&(
        <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:50,padding:"0 16px 20px"}}>
          <div style={{
            maxWidth:590,margin:"0 auto",
            background: timer.running ? "#0f0d00" : "#C8D4BC",
            border: `2px solid ${timer.running ? (timer.seconds<=5?"#AA2A0A":"#AA6800") : "#0A7A2A"}`,
            padding:"14px 18px",
            display:"flex",alignItems:"center",gap:16,
          }}>
            {/* Progress arc */}
            <div style={{position:"relative",width:52,height:52,flexShrink:0}}>
              <svg width="52" height="52" style={{transform:"rotate(-90deg)"}}>
                <circle cx="26" cy="26" r="22" fill="none" stroke="#B5A88E" strokeWidth="3"/>
                <circle cx="26" cy="26" r="22" fill="none"
                  stroke={timer.running?(timer.seconds<=5?"#AA2A0A":"#AA6800"):"#0A7A2A"}
                  strokeWidth="3"
                  strokeDasharray={`${2*Math.PI*22}`}
                  strokeDashoffset={`${2*Math.PI*22*(1-timer.seconds/timer.total)}`}
                  style={{transition:"stroke-dashoffset 1s linear,stroke .3s"}}/>
              </svg>
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",
                fontFamily:"'Bebas Neue',sans-serif",fontSize:17,
                color:timer.running?(timer.seconds<=5?"#AA2A0A":"#AA6800"):"#0A7A2A"}}>
                {timer.seconds}
              </div>
            </div>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,letterSpacing:".2em",
                color:timer.running?"#5a4a00":"#1A5A1A",marginBottom:3}}>
                {timer.running?"REST TIMER":"REST COMPLETE"}
              </div>
              <div style={{fontFamily:"'Space Mono',monospace",fontSize:11,
                color:timer.running?(timer.seconds<=5?"#AA2A0A":"#2A1E0E"):"#0A7A2A"}}>
                {timer.running
                  ?(timer.seconds<=5?"Get ready...":timer.label)
                  :"Start your next set"}
              </div>
              {timer.mobility&&(
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,
                  color:timer.running?"#5A10AA":"#3A0A7A",marginTop:4,letterSpacing:".08em",
                  opacity:timer.running?0.85:1}}>
                  💜 {timer.running?"DURING REST: ":"DO NOW: "}{timer.mobility}
                </div>
              )}
            </div>
            <button onClick={stopTimer} style={{background:"none",border:"1px solid #B5A88E",
              color:"#6A5A3A",padding:"6px 10px",cursor:"pointer",
              fontFamily:"'Space Mono',monospace",fontSize:10,flexShrink:0,
              transition:"color .15s,border-color .15s"}}
              onMouseEnter={e=>{e.currentTarget.style.color="#2A1E0E";e.currentTarget.style.borderColor="#3A2A12"}}
              onMouseLeave={e=>{e.currentTarget.style.color="#6A5A3A";e.currentTarget.style.borderColor="#6A5A3A"}}>
              {timer.running?"SKIP":"CLEAR"}
            </button>
          </div>
        </div>
      )}

      {infoEx&&(
        <div style={{position:"fixed",inset:0,background:"#000b",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={()=>setInfoEx(null)}>
          <div style={{background:"#C8BBA0",border:"1px solid #B5A88E",padding:20,maxWidth:420,width:"100%"}} onClick={e=>e.stopPropagation()}>
            <div style={{fontFamily:"'Space Mono',monospace",fontSize:12,color:"#0A0806",marginBottom:10,fontWeight:700}}>{infoEx}</div>
            <div style={{color:"#2A1E0E",fontSize:11,fontFamily:"'Space Mono',monospace",lineHeight:1.6,marginBottom:14}}>{INFO[infoEx]?.[0]||"Form cues coming soon."}</div>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <a style={{background:"none",border:"1px solid #c00",color:"#c00",padding:"5px 12px",fontFamily:"'Space Mono',monospace",fontSize:10,cursor:"pointer",textDecoration:"none",display:"inline-block"}}
                href={INFO[infoEx]?.[1]||"#"} target="_blank" rel="noreferrer">▶ WATCH ON YOUTUBE</a>
              <button onClick={()=>setInfoEx(null)} style={{background:"none",border:"none",color:"#5A4A2E",cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:11,marginLeft:"auto"}}>✕ close</button>
            </div>
          </div>
        </div>
      )}

      <div style={{borderBottom:"1px solid #121212",padding:"13px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,background:"#E8DFCD",zIndex:10}}>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:19,letterSpacing:".2em",color:"#0A0806"}}>🎻 GYM LOG <span style={{fontSize:9,fontFamily:"'Space Mono',monospace",color:"#9A8A6A",letterSpacing:".1em",verticalAlign:"middle"}}>v{VERSION}</span></div>
        <div style={{display:"flex"}}>
          {[["home","HOME"],["history","LOG"]].map(([v,l])=>(
            <button key={v} onClick={()=>setView(v)} style={{background:"none",border:"none",cursor:"pointer",padding:"10px 14px",fontFamily:"'Space Mono',monospace",fontSize:10,letterSpacing:".2em",textTransform:"uppercase",color:view===v?"#fff":"#6A5A3A",borderBottom:view===v?`2px solid ${day.color}`:"2px solid transparent"}}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{maxWidth:590,margin:"0 auto",padding:"22px 16px"}}>
        {view==="home"&&(
          <div>
            <div style={{marginBottom:24}}>
              <div style={{color:"#6A5A3A",fontSize:10,letterSpacing:".25em",fontFamily:"'Space Mono',monospace",marginBottom:7}}>NEXT SESSION</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:46,color:DAYS[currentDay].color,lineHeight:.9,marginBottom:4}}>{DAYS[currentDay].label}</div>
              <div style={{color:"#5A4A2E",fontSize:11,fontFamily:"'Space Mono',monospace"}}>{DAYS[currentDay].subtitle}</div>
            </div>
            {/* Cycle progress bar */}
            {cycle.done.length>0&&(()=>{
              const pct=cycle.done.length/5*100;
              const elapsed=cycle.start?Math.floor((Date.now()-cycle.start)/(1000*60*60*24)):0;
              const daysLeft=cycle.start?Math.max(0,10-elapsed):10;
              return(
                <div style={{marginBottom:16,padding:"12px 14px",border:"1px solid #1c1c1c",background:"#DDD4BC"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <span style={{color:"#5A4A2E",fontSize:10,fontFamily:"'Space Mono',monospace",letterSpacing:".15em"}}>CURRENT CYCLE</span>
                    <span style={{color:"#6A5A3A",fontSize:10,fontFamily:"'Space Mono',monospace"}}>{cycle.done.length}/5 done &middot; resets in {daysLeft}d</span>
                  </div>
                  <div style={{height:3,background:"#BFB298",borderRadius:2}}>
                    <div style={{height:3,background:"#0A7A2A",borderRadius:2,width:`${pct}%`,transition:"width .4s"}}/>
                  </div>
                </div>
              );
            })()}
            <div style={{display:"grid",gap:7,marginBottom:22}}>
              {[1,2,3,4,5,6].map(d=>{
                const isDone=d<=5&&cycle.done.includes(d);
                const isLotus=d===6;
                const lotusDaysAgo=lotusLast?Math.floor((Date.now()-lotusLast)/(1000*60*60*24)):null;
                return(
                  <div key={d} onClick={()=>{setCurrentDay(d);setSessionData({});setSelectedEx({});setOpenGroup(null);setShowWarmup(true);setRecoveryDone(false);setShowRecovery(true);setView("workout");}}
                    style={{border:`1px solid ${currentDay===d?DAYS[d].color+"38":isDone?"#1e2a1e":"#BFB298"}`,padding:"15px 17px",cursor:"pointer",position:"relative",overflow:"hidden",background:isDone?"#DDD4BC":"transparent",opacity:isDone?0.72:1}}>
                    <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:isDone?"#0A7A2A":DAYS[d].color,opacity:isDone?0.8:currentDay===d?1:0.12}}/>
                    {isDone&&<div style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",color:"#0A7A2A",fontSize:18}}>🎉</div>}
                    <div style={{paddingLeft:13,paddingRight:isDone?32:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3,flexWrap:"wrap"}}>
                        <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:17,color:isDone?"#0A7A2A":DAYS[d].color,letterSpacing:".07em"}}>{DAYS[d].label}</span>
                        {isDone
                          ?<span style={{display:"inline-block",padding:"2px 7px",fontSize:9,letterSpacing:".12em",fontFamily:"'Space Mono',monospace",background:"#3DD67A22",color:"#0A7A2A"}}>DONE</span>
                          :<span style={{display:"inline-block",padding:"2px 7px",fontSize:9,letterSpacing:".12em",fontFamily:"'Space Mono',monospace",background:"#ffffff06",color:"#5A4A2E",border:"1px solid #1a1a1a"}}>{DAYS[d].type==="home"?"HOME":"GYM"}</span>
                        }
                        {!isDone&&DAYS[d].type==="gym"&&d!==2&&<span style={{display:"inline-block",padding:"2px 7px",fontSize:9,letterSpacing:".12em",fontFamily:"'Space Mono',monospace",background:"#3DD67A18",color:"#0A7A2A",border:"1px solid #2EBD6B20"}}>CARDIO</span>}
                        {!isDone&&DAYS[d].type==="gym"&&<span style={{display:"inline-block",padding:"2px 7px",fontSize:9,letterSpacing:".12em",fontFamily:"'Space Mono',monospace",background:DAYS[d].color+"10",color:DAYS[d].color,border:`1px solid ${DAYS[d].color}20`}}>SUPERSETS</span>}
                        {isLotus&&<span style={{display:"inline-block",padding:"2px 7px",fontSize:9,letterSpacing:".12em",fontFamily:"'Space Mono',monospace",background:"#FF6B4A20",color:"#AA2A0A"}}>LOTUS</span>}
                        {currentDay===d&&!isDone&&<span style={{display:"inline-block",padding:"2px 7px",fontSize:9,letterSpacing:".12em",fontFamily:"'Space Mono',monospace",background:DAYS[d].color+"18",color:DAYS[d].color}}>NEXT UP</span>}
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{color:isDone?"#1A4A1A":"#5A4A2E",fontSize:11,fontFamily:"'Space Mono',monospace"}}>
                          {isLotus
                            ?(lotusDaysAgo===null?"Never completed":lotusDaysAgo===0?"Last done: today":`Last done: ${lotusDaysAgo}d ago`)
                            :(isDone?"Completed this cycle":DAYS[d].subtitle||"4-Phase Hip Mobility Progression")}
                        </div>
                        <div style={{color:"#6A5A3A",fontSize:10,fontFamily:"'Space Mono',monospace",marginLeft:"auto"}}>{DURATION_LABEL[d]}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{border:"1px solid #141414",marginBottom:20}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 15px",cursor:"pointer"}} onClick={()=>setShowCore(p=>!p)}>
                <span style={{color:"#6A5A3A",fontSize:10,letterSpacing:".2em",fontFamily:"'Space Mono',monospace"}}>CORE COVERAGE MAP</span>
                <span style={{color:"#BFB298",fontSize:12}}>{showCore?"▲":"▼"}</span>
              </div>
              {showCore&&(
                <div style={{padding:"0 15px 13px",display:"grid",gap:5}}>
                  {CORE_MAP.map(c=>(
                    <div key={c.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 9px",background:"#D4C9B0",border:`1px solid ${c.color}18`}}>
                      <span style={{fontSize:11,color:"#3A2A12",fontFamily:"'Space Mono',monospace"}}>{c.label}</span>
                      <span style={{display:"inline-block",padding:"2px 7px",fontSize:9,letterSpacing:".12em",fontFamily:"'Space Mono',monospace",background:c.color+"18",color:c.color}}>{c.day}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {Object.keys(history).length>0&&(
              <div>
                <div style={{color:"#6A5A3A",fontSize:10,letterSpacing:".2em",fontFamily:"'Space Mono',monospace",marginBottom:8}}>RECENT</div>
                {Object.entries(history).sort(([a],[b])=>b-a).slice(0,4).map(([ts,e])=>(
                  <div key={ts} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #0e0e0e"}}>
                    <div style={{display:"flex",alignItems:"center",gap:9}}>
                      <div style={{width:3,height:14,background:DAYS[e.day].color}}/>
                      <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:15,color:DAYS[e.day].color,letterSpacing:".07em"}}>{DAYS[e.day].label}</span>
                    </div>
                    <span style={{color:"#6A5A3A",fontSize:10,fontFamily:"'Space Mono',monospace"}}>{e.date}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view==="workout"&&(
          <div>
            <div style={{display:"flex",alignItems:"center",gap:13,marginBottom:20}}>
              <button onClick={()=>setView("home")} style={{background:"none",border:"none",color:"#6A5A3A",cursor:"pointer",fontSize:22,padding:0}}>←</button>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:34,color:day.color,lineHeight:.9,letterSpacing:".05em"}}>{day.label}</div>
                <div style={{color:"#5A4A2E",fontSize:11,fontFamily:"'Space Mono',monospace",marginTop:3}}>{day.subtitle}</div>
              </div>
              <div style={{color:"#6A5A3A",fontSize:11,fontFamily:"'Space Mono',monospace"}}>{DURATION_LABEL[currentDay]}</div>
            </div>

            {/* Deload banner */}
            {getPhase(cycle).label&&(
              <div style={{padding:"7px 12px",fontFamily:"'Space Mono',monospace",fontSize:9,letterSpacing:".12em",
                background:"#FFB83318",borderLeft:"3px solid #AA6800",color:"#AA6800",marginBottom:14}}>
                {getPhase(cycle).label}
              </div>
            )}

            {/* Recovery check-in */}
            {!recoveryDone&&(
              <div style={{border:"1px solid #B5A88E",marginBottom:16,background:"#DDD4BC"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",cursor:"pointer"}}
                  onClick={()=>setShowRecovery(p=>!p)}>
                  <div>
                    <span style={{fontFamily:"'Space Mono',monospace",fontSize:10,letterSpacing:".15em",color:"#5A4A2E"}}>PRE-SESSION CHECK-IN</span>
                    {(()=>{const score=calcRecoveryScore(recoveryData.sleep,recoveryData.soreness,recoveryData.motivation);
                      return<span style={{marginLeft:10,fontFamily:"'Space Mono',monospace",fontSize:10,
                        color:score>=70?"#0A7A2A":score>=50?"#AA6800":"#AA2A0A"}}>
                        {score>=70?"✓ GOOD TO GO":score>=50?"⚠ MODERATE — consider lighter":score<50?"↓ DELOAD RECOMMENDED":""}</span>;})()}
                  </div>
                  <span style={{color:"#6A5A3A",fontSize:12}}>{showRecovery?"▲":"▼"}</span>
                </div>
                {showRecovery&&(
                  <div style={{borderTop:"1px solid #C8BBA0",padding:"10px 14px"}}>
                    {[
                      {key:"sleep",label:"Sleep (hrs)",min:4,max:10,step:0.5},
                      {key:"soreness",label:"Soreness (0=none, 5=high)",min:0,max:5,step:1},
                      {key:"motivation",label:"Motivation (1–5)",min:1,max:5,step:1},
                    ].map(({key,label,min,max,step})=>(
                      <div key={key} style={{marginBottom:10}}>
                        <div style={{color:"#6A5A3A",fontSize:9,letterSpacing:".1em",fontFamily:"'Space Mono',monospace",marginBottom:4}}>{label}</div>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <input type="range" min={min} max={max} step={step}
                            value={recoveryData[key]}
                            onChange={e=>setRecoveryData(p=>({...p,[key]:Number(e.target.value)}))}
                            style={{flex:1,accentColor:"#5A10AA"}}/>
                          <span style={{fontFamily:"'Space Mono',monospace",fontSize:12,color:"#2A1E0E",width:28,textAlign:"right"}}>{recoveryData[key]}</span>
                        </div>
                      </div>
                    ))}
                    <button onClick={()=>{setRecoveryDone(true);setShowRecovery(false);setRecoveryScore(calcRecoveryScore(recoveryData.sleep,recoveryData.soreness,recoveryData.motivation));}}
                      style={{background:"#5A10AA",border:"none",color:"#fff",padding:"8px 18px",
                        fontFamily:"'Bebas Neue',sans-serif",fontSize:16,letterSpacing:".1em",cursor:"pointer",marginTop:4}}>
                      CONFIRM
                    </button>
                  </div>
                )}
              </div>
            )}

            {currentDay===6&&day.lotusPhases&&(
              <div>
                <div style={{border:"1px solid #E84A2E30",background:"#D4C4A0",padding:"14px 16px",marginBottom:18}}>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:14,color:"#AA2A0A",letterSpacing:".12em",marginBottom:6}}>🪷 LOTUS PROGRESSION</div>
                  <div style={{color:"#3A2A12",fontSize:10,fontFamily:"'Space Mono',monospace",lineHeight:1.7}}>
                    Work each phase until the exercises feel relaxed and comfortable before moving on. Never force range. Any knee discomfort means stop — rotation must come from the hip, not the knee. Both sides must be equal before advancing.
                  </div>
                </div>
                {day.lotusPhases.map(phase=>{
                  const phaseKey=`__lotus_phase_${phase.phase}__`;
                  const isOpen=openGroup===phaseKey;
                  const checkedCount=phase.exercises.filter(e=>sessionData[phaseKey]?.[e.name]).length;
                  return(
                    <div key={phase.phase} style={{border:`1px solid ${phase.color}35`,marginBottom:10,position:"relative"}}>
                      <div style={{position:"absolute",left:0,top:0,bottom:0,width:3,background:phase.color}}/>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",cursor:"pointer"}} onClick={()=>setOpenGroup(isOpen?null:phaseKey)}>
                        <div style={{paddingLeft:2}}>
                          <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:3,flexWrap:"wrap"}}>
                            <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:phase.color,letterSpacing:".08em"}}>{phase.label}</span>
                            <span style={{display:"inline-block",padding:"2px 7px",fontSize:9,letterSpacing:".12em",fontFamily:"'Space Mono',monospace",background:phase.color+"18",color:phase.color}}>{checkedCount}/{phase.exercises.length} done</span>
                          </div>
                          <div style={{color:"#6A5A3A",fontSize:10,fontFamily:"'Space Mono',monospace"}}>{phase.note}</div>
                        </div>
                        <div style={{color:"#6A5A3A",fontSize:12,marginLeft:10}}>{isOpen?"▲":"▼"}</div>
                      </div>
                      {isOpen&&(
                        <div style={{borderTop:`1px solid ${phase.color}18`}}>
                          {phase.exercises.map(ex=>{
                            const done=!!(sessionData[phaseKey]?.[ex.name]);
                            const exI=INFO[ex.name];
                            return(
                              <div key={ex.name} style={{display:"flex",alignItems:"flex-start",gap:11,padding:"12px 14px",borderBottom:`1px solid ${phase.color}10`}}>
                                <div style={{width:18,height:18,border:`1px solid ${done?phase.color:"#B5A88E"}`,background:done?phase.color+"25":"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}
                                  onClick={()=>setSessionData(p=>({...p,[phaseKey]:{...(p[phaseKey]||{}),[ex.name]:!p[phaseKey]?.[ex.name]}}))}>
                                  {done&&<span style={{color:phase.color,fontSize:11}}>✓</span>}
                                </div>
                                <div style={{flex:1}}>
                                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:3}}>
                                    <span style={{color:done?"#6A5A3A":"#120E08",fontSize:11,fontFamily:"'Space Mono',monospace",textDecoration:done?"line-through":"none"}}>{ex.name}</span>
                                    <span style={{color:phase.color,fontSize:10,fontFamily:"'Space Mono',monospace",opacity:.7}}>{ex.duration}</span>
                                    {exI&&<button onClick={()=>setInfoEx(ex.name)} style={{background:"none",border:"1px solid #1e1e1e",color:"#6A5A3A",padding:"1px 6px",cursor:"pointer",fontSize:10,fontFamily:"'Space Mono',monospace"}}
                                      onMouseEnter={e=>{e.currentTarget.style.color="#2A1E0E"}} onMouseLeave={e=>{e.currentTarget.style.color="#6A5A3A"}}>i</button>}
                                  </div>
                                  {exI&&<div style={{color:"#6A5A3A",fontSize:10,fontFamily:"'Space Mono',monospace",lineHeight:1.55}}>{exI[0]}</div>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div style={{marginTop:24}}>
                  <button onClick={saveWorkout} style={{border:"none",padding:"17px 28px",fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:".12em",cursor:"pointer",width:"100%",background:savedMsg?"#0A7A2A":"#AA2A0A",color:"#000"}}>
                    {savedMsg?`✓  SAVED — NEXT: ${savedMsg}`:"FINISH & SAVE SESSION"}
                  </button>
                </div>
              </div>
            )}

            {currentDay!==6&&(
              <div>
                {day.type==="gym"&&renderWarmup()}
                {day.type==="gym"&&(
                  <div style={{display:"flex",gap:12,marginBottom:14,flexWrap:"wrap"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <div style={{width:3,height:14,background:day.color,opacity:.5}}/>
                      <span style={{color:"#6A5A3A",fontSize:10,fontFamily:"'Space Mono',monospace"}}>Superset — alternate A↕8, rest after both</span>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <div style={{width:3,height:14,background:"#0A40AA",opacity:.6}}/>
                      <span style={{color:"#6A5A3A",fontSize:10,fontFamily:"'Space Mono',monospace"}}>🎻 Violin — straight sets, 45–50 sec rest</span>
                    </div>
                  </div>
                )}
                {renderUnits.map((unit,i)=>renderUnit(unit,i))}
                <div style={{marginTop:24}}>
                  <button onClick={saveWorkout} style={{border:"none",padding:"17px 28px",fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:".12em",cursor:"pointer",width:"100%",background:savedMsg?"#0A7A2A":day.color,color:"#000"}}>
                    {savedMsg?`✓  SAVED — NEXT: ${savedMsg}`:"FINISH & SAVE WORKOUT"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {view==="history"&&(
          <div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:34,color:"#0A0806",letterSpacing:".08em",marginBottom:18}}>SESSION LOG</div>
            {!Object.keys(history).length
              ?<div style={{color:"#6A5A3A",fontSize:12,fontFamily:"'Space Mono',monospace"}}>No sessions logged yet.</div>
              :Object.entries(history).sort(([a],[b])=>b-a).map(([ts,e])=>(
                <div key={ts} style={{border:"1px solid #131313",marginBottom:9}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",borderBottom:"1px solid #0f0f0f"}}>
                    <div style={{display:"flex",alignItems:"center",gap:9}}>
                      <div style={{width:3,height:17,background:DAYS[e.day].color}}/>
                      <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:DAYS[e.day].color,letterSpacing:".07em"}}>{DAYS[e.day].label}</span>
                    </div>
                    <span style={{color:"#6A5A3A",fontSize:11,fontFamily:"'Space Mono',monospace"}}>{e.date}</span>
                  </div>
                  <div style={{padding:"11px 14px"}}>
                    {e.sets?.["Cardio — Zone 2"]&&(e.sets["Cardio — Zone 2"].minutes||e.sets["Cardio — Zone 2"].resistance)&&(
                      <div style={{marginBottom:10}}>
                        <div style={{color:"#0A7A2A",fontSize:10,fontFamily:"'Space Mono',monospace",marginBottom:4}}>♥ Zone 2 Cardio</div>
                        <div style={{display:"flex",gap:7}}>
                          {e.sets["Cardio — Zone 2"].minutes&&<span style={{background:"#D4C9B0",border:"1px solid #161616",padding:"3px 9px",fontSize:11,color:"#3A2A18",fontFamily:"'Space Mono',monospace"}}>{e.sets["Cardio — Zone 2"].minutes} min</span>}
                          {e.sets["Cardio — Zone 2"].resistance&&<span style={{background:"#D4C9B0",border:"1px solid #161616",padding:"3px 9px",fontSize:11,color:"#3A2A18",fontFamily:"'Space Mono',monospace"}}>resistance {e.sets["Cardio — Zone 2"].resistance}</span>}
                        </div>
                      </div>
                    )}
                    {DAYS[e.day].groups?.filter(g=>!g.cardio).map(group=>{
                      const gs=e.sets?.[group.name];if(!gs)return null;
                      if(group.mode==="check"){
                        const done=Object.entries(gs).filter(([,v])=>v).map(([k])=>k);
                        if(!done.length)return null;
                        return(<div key={group.name} style={{marginBottom:9}}>
                          <div style={{color:"#5A4A2E",fontSize:10,fontFamily:"'Space Mono',monospace",marginBottom:4}}>{group.name}</div>
                          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                            {done.map(ex=><span key={ex} style={{background:"#D4C9B0",border:"1px solid #161616",padding:"2px 8px",fontSize:10,color:"#3A2A12",fontFamily:"'Space Mono',monospace"}}>✓ {ex}</span>)}
                          </div>
                        </div>);
                      }
                      const rows=Object.values(gs).filter(s=>s.weight||s.reps);
                      if(!rows.length)return null;
                      return(<div key={group.name} style={{marginBottom:10}}>
                        <div style={{color:"#5A4A2E",fontSize:10,fontFamily:"'Space Mono',monospace",marginBottom:2}}>{group.name}</div>
                        <div style={{color:"#6A5A3A",fontSize:10,fontFamily:"'Space Mono',monospace",fontStyle:"italic",marginBottom:5}}>{e.exercises?.[group.name]||group.exercises[0]}</div>
                        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                          {rows.map((s,i)=>(
                            <span key={i} style={{background:"#D4C9B0",border:"1px solid #161616",padding:"3px 8px",fontSize:11,color:"#3A2A18",fontFamily:"'Space Mono',monospace"}}>
                              {s.weight?`${s.weight}lb`:"BW"} × {s.reps||"—"}
                            </span>
                          ))}
                        </div>
                      </div>);
                    })}
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useCallback } from "react";

// ─── นิยามตัวละคร ────────────────────────────────────────────────────────────
const ROLES = [
  // ทีมหมาป่า
  { id: "werewolf", name: "หมาป่า", team: "werewolf", icon: "🐺", description: "แต่ละคืน ตื่นพร้อมฝูงเพื่อเลือกเหยื่อที่จะกำจัด", nightAction: "เลือกเหยื่อที่จะฆ่า" },
  { id: "alpha_wolf", name: "อัลฟ่าวูล์ฟ", team: "werewolf", icon: "🐺👑", description: "หมาป่าที่สามารถเปลี่ยนชาวบ้านให้กลายเป็นหมาป่าแทนการฆ่าได้หนึ่งครั้งต่อเกม", nightAction: "ฆ่าเหยื่อ หรือ เปลี่ยนชาวบ้านให้เป็นหมาป่า (1 ครั้งต่อเกม)" },
  { id: "wolf_cub", name: "ลูกหมาป่า", team: "werewolf", icon: "🐺🐾", description: "หากถูกกำจัด หมาป่าจะได้ฆ่าเพิ่มอีกหนึ่งคนในคืนถัดไป", nightAction: "เลือกเหยื่อพร้อมฝูง" },
  { id: "cursed_wolf_father", name: "บิดาหมาป่าสาป", team: "werewolf", icon: "🐺💀", description: "หนึ่งครั้งต่อเกม สามารถสาปเหยื่อแทนการฆ่า ทำให้เหยื่อกลายเป็นหมาป่า", nightAction: "ฆ่า หรือ สาปผู้เล่นให้เข้าร่วมฝูง (1 ครั้งต่อเกม)" },
  { id: "dream_wolf", name: "ดรีมวูล์ฟ", team: "werewolf", icon: "🐺💤", description: "ไม่ตื่นพร้อมหมาป่าจนกว่าหมาป่าตัวอื่นจะถูกกำจัด ชาวบ้านไม่รู้ตัวตน", nightAction: "ตื่นพร้อมฝูงหลังจากหมาป่าตัวอื่นตาย" },
  { id: "moon_wolf", name: "มูนวูล์ฟ", team: "werewolf", icon: "🐺🌕", description: "ตื่นก่อนฝูง สามารถเลือกปกป้องผู้เล่นหนึ่งคนจากการถูกฆ่าในคืนนั้น", nightAction: "เลือกปกป้องผู้เล่น หรือ ปล่อยให้ฝูงฆ่าตามปกติ" },
  { id: "human_werewolf", name: "มนุษย์หมาป่า", team: "werewolf", icon: "🧑‍🐺", description: "ดูภายนอกเหมือนชาวบ้านธรรมดา — หมอดูและออราเคิลจะเห็นว่าเป็น 'ชาวบ้าน' แต่แท้จริงอยู่ทีมหมาป่า ตื่นพร้อมฝูงและร่วมเลือกเหยื่อทุกคืน", nightAction: "เลือกเหยื่อพร้อมฝูง (ดูเหมือนชาวบ้านต่อหมอดู)", seerAppears: "village" },

  // ทีมชาวบ้าน
  { id: "villager", name: "ชาวบ้าน", team: "village", icon: "👤", description: "ชาวบ้านธรรมดา ไม่มีพลังพิเศษ ชนะโดยกำจัดหมาป่าทั้งหมด", nightAction: null },
  { id: "seer", name: "หมอดู", team: "village", icon: "🔮", description: "แต่ละคืน ล่วงรู้ว่าผู้เล่นที่เลือกเป็นหมาป่าหรือไม่", nightAction: "ตรวจสอบผู้เล่นหนึ่งคน — รู้ว่าเป็นหมาป่าหรือไม่" },
  { id: "apprentice_seer", name: "ลูกศิษย์หมอดู", team: "village", icon: "🔮🌱", description: "หากหมอดูตาย ลูกศิษย์จะรับพลังหมอดูต่อ", nightAction: "หากหมอดูตาย: ตรวจสอบผู้เล่นหนึ่งคน" },
  { id: "oracle", name: "ออราเคิล", team: "village", icon: "🌀", description: "แต่ละคืน ล่วงรู้บทบาทที่แท้จริงของผู้เล่นหนึ่งคน", nightAction: "ตรวจสอบผู้เล่นหนึ่งคน — รู้บทบาทที่แท้จริง" },
  { id: "bodyguard", name: "บอดี้การ์ด", team: "village", icon: "🛡️", description: "แต่ละคืน คุ้มครองผู้เล่นหนึ่งคนจากการถูกโจมตี ไม่สามารถปกป้องคนเดิมสองคืนติดกัน", nightAction: "เลือกผู้เล่นที่จะปกป้อง (ไม่ใช่คนเดิมจากคืนก่อน)" },
  { id: "doctor", name: "หมอ", team: "village", icon: "💉", description: "แต่ละคืน สามารถช่วยชีวิตผู้เล่นหนึ่งคน (รวมถึงตัวเอง อย่างมากหนึ่งครั้ง)", nightAction: "เลือกผู้เล่นที่จะช่วยชีวิตคืนนี้" },
  { id: "witch", name: "แม่มด", team: "village", icon: "🧙‍♀️", description: "มียาวิเศษ (ช่วยเหยื่อหมาป่า) และยาพิษ (ฆ่าใครก็ได้) ใช้ได้คนละครั้งต่อเกม", nightAction: "รู้ว่าใครถูกโจมตี ใช้ยาวิเศษหรือยาพิษได้" },
  { id: "hunter", name: "นักล่า", team: "village", icon: "🏹", description: "เมื่อถูกกำจัด (กลางวันหรือกลางคืน) ยิงผู้เล่นหนึ่งคนทันที", nightAction: null, deathAction: "ยิงผู้เล่นหนึ่งคนทันทีเมื่อตาย" },
  { id: "sheriff", name: "นายอำเภอ", team: "village", icon: "⭐", description: "คะแนนโหวตนับเป็นสอง ส่งต่อตำแหน่งให้ผู้เล่นอื่นเมื่อตาย", nightAction: null },
  { id: "mayor", name: "นายกเทศมนตรี", team: "village", icon: "🎖️", description: "เปิดเผยตัวตนได้หนึ่งครั้ง โหวตนับสองคะแนน ภูมิคุ้มกันยาพิษแม่มด", nightAction: null },
  { id: "mason", name: "ช่างก่อสร้าง", team: "village", icon: "🧱", description: "ช่างก่อสร้างตื่นพร้อมกันและรู้จักกันเอง", nightAction: "ตื่นและยืนยันตัวตนกับเพื่อนช่าง" },
  { id: "pi", name: "นักสืบเอกชน", team: "village", icon: "🕵️", description: "แต่ละคืน สืบความสัมพันธ์ระหว่างผู้เล่นสองคนว่าอยู่ทีมเดียวกันหรือไม่", nightAction: "เลือกผู้เล่นสองคน — รู้ว่าอยู่ทีมเดียวกันหรือเปล่า" },
  { id: "cupid", name: "คิวปิด", team: "village", icon: "💘", description: "คืนแรก เชื่อมผู้เล่นสองคนเป็นคู่รัก หากคนหนึ่งตาย อีกคนตายตามด้วยใจสลาย", nightAction: "คืนที่ 1 เท่านั้น: เลือกสองคนให้เป็นคู่รัก" },
  { id: "lovers", name: "คู่รัก (เป้าหมายของคิวปิด)", team: "village", icon: "💕", description: "ผูกพันโดยคิวปิด เงื่อนไขชนะเปลี่ยน: คู่รักทั้งคู่ต้องรอดชีวิต", nightAction: null },
  { id: "little_girl", name: "เด็กหญิง", team: "village", icon: "👧", description: "แอบเปิดตาดูระหว่างคืนหมาป่าได้ หากถูกจับได้ หมาป่าอาจเลือกฆ่าเธอแทน", nightAction: "แอบดูระหว่างเฟสหมาป่า (เสี่ยงถูกจับ)" },
  { id: "troublemaker", name: "ตัวป่วน", team: "village", icon: "😈", description: "หนึ่งครั้งต่อเกม สลับการ์ดบทบาทของผู้เล่นสองคน (ไม่บอกให้รู้)", nightAction: "สลับการ์ดบทบาทของผู้เล่นสองคน (1 ครั้งต่อเกม)" },
  { id: "cursed", name: "คนถูกสาป", team: "village", icon: "☠️", description: "หมอดูมองว่าเป็นชาวบ้าน หากถูกหมาป่าโจมตี กลายเป็นหมาป่าแทนการตาย", nightAction: null },
  { id: "doppelganger", name: "ดอปเปิลแกงเกอร์", team: "village", icon: "👥", description: "คืนที่ 1 แอบดูบทบาทของผู้เล่นหนึ่งคน หากคนนั้นตาย จะรับบทบาทนั้นแทน", nightAction: "คืนที่ 1: เลือกผู้เล่นที่จะเลียนแบบ — รับบทบาทเมื่อเขาตาย" },
  { id: "medium", name: "ทรงเจ้า", team: "village", icon: "🕯️", description: "หนึ่งครั้งต่อเกม ปรึกษาผู้เล่นที่ตายไปแล้วเพื่อถามบทบาทหรือคำถามใช่/ไม่ใช่", nightAction: "ปรึกษาผู้ตายหนึ่งคน (1 ครั้งต่อเกม)" },
  { id: "priest", name: "นักบวช", team: "village", icon: "✝️", description: "แต่ละคืน อวยพรผู้เล่นหนึ่งคน หากถูกหมาป่าฆ่า ผู้ได้รับพรจะกลายเป็นวิญญาณหลอกหลอนหมาป่า", nightAction: "เลือกผู้เล่นที่จะอวยพร" },
  { id: "tough_guy", name: "คนเหนียว", team: "village", icon: "💪", description: "รอดจากการโจมตีของหมาป่าครั้งแรก แต่จะตายในคืนถัดไปหากไม่ได้รับการรักษา", nightAction: null },
  { id: "drunk", name: "คนเมา", team: "village", icon: "🍺", description: "ไม่รู้บทบาทที่แท้จริง คืนที่ 3 จะตื่นและสลับการ์ดกับการ์ดบนดาดฟ้า", nightAction: "คืนที่ 3: สลับการ์ดกับการ์ดบนสุดของสำรับ" },
  { id: "pacifist", name: "สันติวิธี", team: "village", icon: "☮️", description: "หนึ่งครั้งต่อเกม ยับยั้งการโหวตกลางวัน ป้องกันไม่ให้มีการกำจัดผู้เล่น", nightAction: null },
  { id: "vigilante", name: "ศาลเตี้ย", team: "village", icon: "🔫", description: "หนึ่งครั้งต่อเกม ยิงผู้เล่นระหว่างกลางวัน หากเป้าหมายเป็นชาวบ้าน จะเสียพลังนี้ไป", nightAction: null },
  { id: "aura_seer", name: "ผู้มองออร่า", team: "village", icon: "✨", description: "แต่ละคืน มองออร่าผู้เล่นหนึ่งคน รู้ว่ามีพลังกลางคืนหรือไม่ (ไม่รู้ทีม)", nightAction: "เลือกผู้เล่น — รู้ว่ามีพลังกลางคืนหรือเปล่า" },
  { id: "old_hag", name: "แม่บ้านแก่", team: "village", icon: "👵", description: "หนึ่งครั้งต่อเกม ขับไล่ผู้เล่นออกจากการพูดคุยในรอบถัดไป", nightAction: "ขับไล่ผู้เล่นออกจากการพูดคุยรอบถัดไป (1 ครั้งต่อเกม)" },
  { id: "village_idiot", name: "คนโง่หมู่บ้าน", team: "village", icon: "🃏", description: "หากถูกโหวตออกกลางวัน จะเปิดเผยตัวตนว่าเป็นคนโง่และไม่ถูกกำจัด แต่เสียสิทธิ์โหวต", nightAction: null },

  // ฝ่ายกลาง / บุคคลที่สาม
  { id: "jester", name: "ตัวตลก", team: "neutral", icon: "🎭", description: "ชนะคนเดียวหากถูกโหวตออกโดยชาวบ้านกลางวัน ไม่ชนะร่วมกับทีมอื่น", nightAction: null },
  { id: "arsonist", name: "วางเพลิง", team: "neutral", icon: "🔥", description: "แต่ละคืน ราดน้ำมันผู้เล่น สามารถจุดไฟเผาผู้ที่ถูกราดทั้งหมดในครั้งเดียว ภูมิคุ้มกันหมาป่า ชนะคนเดียว", nightAction: "ราดน้ำมันผู้เล่น หรือ จุดไฟเผาทุกคนที่ถูกราด" },
  { id: "serial_killer", name: "นักฆ่าต่อเนื่อง", team: "neutral", icon: "🔪", description: "แต่ละคืน ฆ่าผู้เล่นหนึ่งคน ภูมิคุ้มกันหมาป่า ชนะคนเดียวเมื่อเป็นคนสุดท้าย", nightAction: "ฆ่าผู้เล่นหนึ่งคน" },
  { id: "vampire", name: "แวมไพร์", team: "neutral", icon: "🧛", description: "แต่ละคืน เปลี่ยนผู้เล่นหนึ่งคนให้เป็นแวมไพร์ ชนะเมื่อเปลี่ยนทุกคนในหมู่บ้าน", nightAction: "เปลี่ยนผู้เล่นหนึ่งคนให้เป็นแวมไพร์" },
  { id: "survivor", name: "ผู้รอดชีวิต", team: "neutral", icon: "🏕️", description: "ชนะโดยรอดชีวิตถึงจบเกม ไม่ว่าทีมใดจะชนะ มีเสื้อกันกระสุนป้องกันหนึ่งครั้ง", nightAction: null },
  { id: "amnesiac", name: "ผู้สูญเสียความทรงจำ", team: "neutral", icon: "🌫️", description: "ไม่รู้บทบาทของตัวเอง หนึ่งครั้งต่อเกม สามารถอ้างบทบาทใดก็ได้และรับพลังนั้น", nightAction: "อ้างบทบาทและรับพลังนั้น (1 ครั้งต่อเกม)" },
  { id: "executioner", name: "เพชฌฆาต", team: "neutral", icon: "⚖️", description: "ชนะคนเดียวหากเป้าหมายที่กำหนดถูกโหวตออกกลางวัน เป้าหมายถูกสุ่ม", nightAction: null },
  { id: "plague_bearer", name: "ผู้แพร่โรค", team: "neutral", icon: "🦠", description: "แต่ละคืน แพร่โรคให้ผู้เล่นหนึ่งคน เมื่อทุกคนที่มีชีวิตได้รับโรค ผู้แพร่โรคชนะคนเดียว", nightAction: "แพร่โรคให้ผู้เล่นหนึ่งคน" },
];

const TEAM_COLORS = {
  werewolf: { bg: "#3d1111", accent: "#c0392b", text: "#ff6b6b", badge: "#7f1d1d" },
  village: { bg: "#0d2618", accent: "#27ae60", text: "#5eead4", badge: "#14532d" },
  neutral: { bg: "#1a1a2e", accent: "#8e44ad", text: "#c084fc", badge: "#3b0764" },
};

// ─── แอปหลัก ─────────────────────────────────────────────────────────────────
export default function WerewolfModerator() {
  const [screen, setScreen] = useState("setup");
  const [playerCount, setPlayerCount] = useState(8);
  const [players, setPlayers] = useState([]);
  const [roleAssignments, setRoleAssignments] = useState({});
  const [phase, setPhase] = useState("night");
  const [round, setRound] = useState(1);
  const [nightLog, setNightLog] = useState({});
  const [eliminated, setEliminated] = useState([]);
  const [nightTarget, setNightTarget] = useState(null);
  const [currentRoleAction, setCurrentRoleAction] = useState(0);
  const [voteTargets, setVoteTargets] = useState({});
  const [gameLog, setGameLog] = useState([]);
  const [witchUsedHeal, setWitchUsedHeal] = useState(false);
  const [witchUsedPoison, setWitchUsedPoison] = useState(false);
  const [alphaUsedConvert, setAlphaUsedConvert] = useState(false);
  const [lastBodyguard, setLastBodyguard] = useState(null);
  const [roleActionResults, setRoleActionResults] = useState({});
  const [pendingActions, setPendingActions] = useState({});
  const [showRoleRef, setShowRoleRef] = useState(false);
  const [roleRefTab, setRoleRefTab] = useState("werewolf");
  const [setupTab, setSetupTab] = useState("players");

  const initPlayers = useCallback(() => {
    setPlayers(Array.from({ length: playerCount }, (_, i) => ({ id: i, name: `ผู้เล่น ${i + 1}`, alive: true })));
    setRoleAssignments({});
  }, [playerCount]);

  const startGame = () => {
    if (Object.keys(roleAssignments).length !== playerCount) {
      alert("กรุณากำหนดบทบาทให้ผู้เล่นทุกคนก่อนเริ่มเกม!");
      return;
    }
    setScreen("game");
    setPhase("night");
    setRound(1);
    setEliminated([]);
    setGameLog([`🌕 เกมเริ่มต้นด้วยผู้เล่น ${playerCount} คน คืนที่ 1 เริ่มแล้ว`]);
    setNightTarget(null);
    setNightLog({});
    setRoleActionResults({});
    setPendingActions({});
  };

  const assignRole = (playerId, roleId) => {
    setRoleAssignments(prev => ({ ...prev, [playerId]: roleId }));
  };

  const getRoleForPlayer = (playerId) => ROLES.find(r => r.id === roleAssignments[playerId]);
  const getAlivePlayers = () => players.filter(p => p.alive);
  const getPlayersByRole = (roleId) => players.filter(p => roleAssignments[p.id] === roleId && p.alive);

  const getRolesWithNightActions = () => {
    const aliveRoleIds = new Set(players.filter(p => p.alive).map(p => roleAssignments[p.id]));
    return ROLES.filter(r => r.nightAction && aliveRoleIds.has(r.id))
      .sort((a, b) => {
        const order = ["mason", "cupid", "doppelganger", "seer", "oracle", "aura_seer", "pi", "apprentice_seer", "bodyguard", "doctor", "witch", "little_girl", "troublemaker", "medium", "priest", "arsonist", "serial_killer", "vampire", "plague_bearer", "moon_wolf", "alpha_wolf", "dream_wolf", "cursed_wolf_father", "wolf_cub", "werewolf"];
        return order.indexOf(a.id) - order.indexOf(b.id);
      });
  };

  const recordNightAction = (roleId, targetId, type = "primary") => {
    setPendingActions(prev => ({ ...prev, [roleId]: { ...(prev[roleId] || {}), [type]: targetId } }));
  };

  const resolveNight = () => {
    const wolfKill = pendingActions["werewolf"]?.primary ?? pendingActions["alpha_wolf"]?.primary ?? pendingActions["cursed_wolf_father"]?.primary;
    const doctorSave = pendingActions["doctor"]?.primary;
    const bodyguardSave = pendingActions["bodyguard"]?.primary;
    const witchHeal = pendingActions["witch"]?.heal;
    const witchPoison = pendingActions["witch"]?.poison;
    const skKill = pendingActions["serial_killer"]?.primary;

    let deaths = [], saved = [], log = [];

    if (wolfKill !== undefined) {
      const target = players[wolfKill];
      if (doctorSave === wolfKill || bodyguardSave === wolfKill || witchHeal === wolfKill) {
        saved.push(wolfKill);
        log.push(`🛡️ ${target?.name} ถูกหมาป่าโจมตีแต่รอดชีวิต!`);
      } else {
        deaths.push(wolfKill);
        log.push(`🐺 ${target?.name} ถูกหมาป่าฆ่าตาย`);
      }
    }

    if (witchPoison !== undefined && !witchUsedPoison) {
      deaths.push(witchPoison);
      log.push(`🧪 ${players[witchPoison]?.name} ถูกแม่มดวางยาพิษ`);
      setWitchUsedPoison(true);
    }

    if (skKill !== undefined && !deaths.includes(skKill) && !saved.includes(skKill)) {
      deaths.push(skKill);
      log.push(`🔪 ${players[skKill]?.name} ถูกนักฆ่าต่อเนื่องสังหาร`);
    }

    if (pendingActions["arsonist"]?.ignite) {
      (pendingActions["arsonist"]?.doused || []).forEach(id => {
        if (!deaths.includes(id)) { deaths.push(id); log.push(`🔥 ${players[id]?.name} ถูกเผาในกองไฟ!`); }
      });
    }

    const uniqueDeaths = [...new Set(deaths)];
    setPlayers(prev => prev.map(p => uniqueDeaths.includes(p.id) ? { ...p, alive: false } : p));
    setEliminated(prev => [...prev, ...uniqueDeaths.map(id => ({ id, round, cause: "night" }))]);
    if (bodyguardSave !== undefined) setLastBodyguard(bodyguardSave);

    setGameLog(prev => [
      ...prev,
      `── คืนที่ ${round} สิ้นสุด ──`,
      ...log,
      uniqueDeaths.length === 0 && saved.length === 0 ? "🌙 คืนสงบ... ไม่มีใครตาย" : ""
    ].filter(Boolean));

    setNightLog({ deaths: uniqueDeaths, saved });
    setRoleActionResults({});
    setPendingActions({});
    setPhase("day");
  };

  const castVote = (voterId, targetId) => setVoteTargets(prev => ({ ...prev, [voterId]: targetId }));

  const tallyVotes = () => {
    const tally = {};
    Object.values(voteTargets).forEach(id => { if (id !== null) tally[id] = (tally[id] || 0) + 1; });
    const maxVotes = Math.max(...Object.values(tally), 0);
    const leaders = Object.entries(tally).filter(([, v]) => v === maxVotes).map(([k]) => parseInt(k));
    return { tally, leaders };
  };

  const eliminateByVote = (playerId) => {
    setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, alive: false } : p));
    setEliminated(prev => [...prev, { id: playerId, round, cause: "vote" }]);
    setGameLog(prev => [...prev, `⚖️ ${players[playerId]?.name} ถูกโหวตออกในวันที่ ${round}`]);
    setVoteTargets({});
    setRound(r => r + 1);
    setPhase("night");
  };

  const checkWin = () => {
    const alive = players.filter(p => p.alive);
    const wolves = alive.filter(p => ["werewolf","alpha_wolf","wolf_cub","cursed_wolf_father","dream_wolf","moon_wolf","human_werewolf"].includes(roleAssignments[p.id]));
    const villagers = alive.filter(p => !["werewolf","alpha_wolf","wolf_cub","cursed_wolf_father","dream_wolf","moon_wolf","human_werewolf"].includes(roleAssignments[p.id]));
    if (wolves.length === 0) return "village";
    if (wolves.length >= villagers.length) return "werewolf";
    return null;
  };

  const winner = screen === "game" ? checkWin() : null;
  const rolesByTeam = (team) => ROLES.filter(r => r.team === team);

  if (screen === "setup") return <SetupScreen
    playerCount={playerCount} setPlayerCount={setPlayerCount}
    players={players} setPlayers={setPlayers}
    roleAssignments={roleAssignments} assignRole={assignRole}
    initPlayers={initPlayers} startGame={startGame}
    setupTab={setupTab} setSetupTab={setSetupTab}
    showRoleRef={showRoleRef} setShowRoleRef={setShowRoleRef}
    roleRefTab={roleRefTab} setRoleRefTab={setRoleRefTab}
    rolesByTeam={rolesByTeam}
  />;

  return <GameScreen
    players={players} setPlayers={setPlayers}
    roleAssignments={roleAssignments}
    phase={phase} setPhase={setPhase}
    round={round} setRound={setRound}
    nightLog={nightLog} eliminated={eliminated}
    nightTarget={nightTarget} setNightTarget={setNightTarget}
    currentRoleAction={currentRoleAction} setCurrentRoleAction={setCurrentRoleAction}
    voteTargets={voteTargets} setVoteTargets={setVoteTargets} castVote={castVote} tallyVotes={tallyVotes}
    eliminateByVote={eliminateByVote} gameLog={gameLog}
    witchUsedHeal={witchUsedHeal} setWitchUsedHeal={setWitchUsedHeal}
    witchUsedPoison={witchUsedPoison} setWitchUsedPoison={setWitchUsedPoison}
    alphaUsedConvert={alphaUsedConvert} setAlphaUsedConvert={setAlphaUsedConvert}
    lastBodyguard={lastBodyguard}
    roleActionResults={roleActionResults} setRoleActionResults={setRoleActionResults}
    pendingActions={pendingActions} setPendingActions={setPendingActions}
    recordNightAction={recordNightAction} resolveNight={resolveNight}
    getRolesWithNightActions={getRolesWithNightActions}
    getAlivePlayers={getAlivePlayers}
    getPlayersByRole={getPlayersByRole}
    getRoleForPlayer={getRoleForPlayer}
    winner={winner} setScreen={setScreen}
    showRoleRef={showRoleRef} setShowRoleRef={setShowRoleRef}
    roleRefTab={roleRefTab} setRoleRefTab={setRoleRefTab}
    rolesByTeam={rolesByTeam}
  />;
}

// ═══════════════════════════════════════════════════════════════════════════════
// หน้าตั้งค่า
// ═══════════════════════════════════════════════════════════════════════════════

function SetupScreen({ playerCount, setPlayerCount, players, setPlayers, roleAssignments, assignRole, initPlayers, startGame, setupTab, setSetupTab, showRoleRef, setShowRoleRef, roleRefTab, setRoleRefTab, rolesByTeam }) {
  const handleCountChange = (n) => {
    setPlayerCount(n);
    setPlayers(Array.from({ length: n }, (_, i) => ({ id: i, name: `ผู้เล่น ${i + 1}`, alive: true })));
  };

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.moonIcon}>🌕</div>
        <div>
          <h1 style={styles.title}>หมาป่า</h1>
          <p style={styles.subtitle}>ศูนย์บัญชาการผู้ดำเนินเกม</p>
        </div>
        <button style={styles.btnGhost} onClick={() => setShowRoleRef(!showRoleRef)}>📖 ดูบทบาท</button>
      </header>

      {showRoleRef && <RoleReference rolesByTeam={rolesByTeam} tab={roleRefTab} setTab={setRoleRefTab} onClose={() => setShowRoleRef(false)} />}

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>⚙️ ตั้งค่าเกม</h2>

        <div style={styles.section}>
          <label style={styles.label}>จำนวนผู้เล่น</label>
          <div style={styles.countRow}>
            {[5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,22,24,26,28,30,32,34,36,38,40,42,45].map(n => (
              <button key={n}
                style={{ ...styles.countBtn, ...(playerCount === n ? styles.countBtnActive : {}) }}
                onClick={() => handleCountChange(n)}>{n}</button>
            ))}
          </div>
        </div>

        <div style={styles.tabs}>
          {["players","roles"].map(t => (
            <button key={t} style={{ ...styles.tab, ...(setupTab === t ? styles.tabActive : {}) }}
              onClick={() => setSetupTab(t)}>
              {t === "players" ? "👤 ผู้เล่น & บทบาท" : "🎭 บทบาททั้งหมด"}
            </button>
          ))}
        </div>

        {setupTab === "players" && (
          <div>
            <p style={styles.hint}>กำหนดชื่อและบทบาทให้ผู้เล่นแต่ละคน:</p>
            {/* Wolf summary banner */}
            {(() => {
              const wolfRoleIds = ["werewolf","alpha_wolf","wolf_cub","cursed_wolf_father","dream_wolf","moon_wolf"];
              const wolfPlayers = Array.from({ length: playerCount }, (_, i) => i)
                .filter(i => wolfRoleIds.includes(roleAssignments[i]));
              if (wolfPlayers.length === 0) return null;
              return (
                <div style={{
                  background: "linear-gradient(135deg, #3d1111 0%, #1a0808 100%)",
                  border: "1px solid #c0392b", borderRadius: 10,
                  padding: "10px 14px", marginBottom: 12,
                  display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap"
                }}>
                  <span style={{ fontSize: 18 }}>🐺</span>
                  <span style={{ color: "#ff6b6b", fontWeight: 700, fontSize: 13 }}>
                    หมาป่าในเกม ({wolfPlayers.length} ตัว):
                  </span>
                  {wolfPlayers.map(i => {
                    const role = ROLES.find(r => r.id === roleAssignments[i]);
                    const name = players[i]?.name || `ผู้เล่น ${i + 1}`;
                    return (
                      <span key={i} style={{
                        background: "#7f1d1d", color: "#fca5a5",
                        padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600
                      }}>
                        {role?.icon} {name} ({role?.name})
                      </span>
                    );
                  })}
                </div>
              );
            })()}
            <div style={styles.playerGrid}>
              {Array.from({ length: playerCount }, (_, i) => (
                <PlayerSetupRow key={i} index={i}
                  name={players[i]?.name || `ผู้เล่น ${i + 1}`}
                  onNameChange={(name) => setPlayers(prev => prev.map(p => p.id === i ? { ...p, name } : p))}
                  roleId={roleAssignments[i]}
                  onRoleChange={(roleId) => assignRole(i, roleId)}
                />
              ))}
            </div>
            <div style={styles.centerRow}>
              <div style={styles.assignedCount}>กำหนดบทบาทแล้ว {Object.keys(roleAssignments).length}/{playerCount} คน</div>
              <button style={styles.btnPrimary} onClick={startGame}>🌙 เริ่มกลางคืน</button>
            </div>
          </div>
        )}

        {setupTab === "roles" && <RoleList rolesByTeam={rolesByTeam} />}
      </div>
    </div>
  );
}

function PlayerSetupRow({ index, name, onNameChange, roleId, onRoleChange }) {
  const role = ROLES.find(r => r.id === roleId);
  const teamColor = role ? TEAM_COLORS[role.team] : null;
  return (
    <div style={{ ...styles.playerRow, ...(teamColor ? { borderColor: teamColor.accent } : {}) }}>
      <span style={styles.playerNum}>{index + 1}</span>
      <input style={styles.nameInput} value={name} onChange={e => onNameChange(e.target.value)} />
      <select style={styles.roleSelect} value={roleId || ""} onChange={e => onRoleChange(e.target.value)}>
        <option value="">— เลือกบทบาท —</option>
        {["werewolf","village","neutral"].map(team => (
          <optgroup key={team} label={team === "werewolf" ? "🐺 ทีมหมาป่า" : team === "village" ? "🏘️ ทีมชาวบ้าน" : "⚗️ ฝ่ายกลาง"}>
            {ROLES.filter(r => r.team === team).map(r => (
              <option key={r.id} value={r.id}>{r.icon} {r.name}</option>
            ))}
          </optgroup>
        ))}
      </select>
      {role && <span style={{ ...styles.teamBadge, background: teamColor.badge, color: teamColor.text }}>{role.icon}</span>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// หน้าเกม
// ═══════════════════════════════════════════════════════════════════════════════

function GameScreen(props) {
  const { players, phase, round, eliminated, winner, setScreen, gameLog, getAlivePlayers, getRoleForPlayer, roleAssignments, showRoleRef, setShowRoleRef, roleRefTab, setRoleRefTab, rolesByTeam } = props;
  const alive = getAlivePlayers();

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={{ fontSize: 28 }}>{phase === "night" || phase === "werewolf" || phase === "roleActions" ? "🌕" : "☀️"}</div>
        <div>
          <h1 style={styles.title}>หมาป่า</h1>
          <p style={styles.subtitle}>{phase === "night" || phase === "werewolf" || phase === "roleActions" ? `คืนที่ ${round}` : `วันที่ ${round}`} • เหลือ {alive.length} คน</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={styles.btnGhost} onClick={() => setShowRoleRef(!showRoleRef)}>📖 บทบาท</button>
          <button style={{ ...styles.btnGhost, color: "#ff6b6b" }} onClick={() => setScreen("setup")}>↩ ตั้งค่า</button>
        </div>
      </header>

      {showRoleRef && <RoleReference rolesByTeam={rolesByTeam} tab={roleRefTab} setTab={setRoleRefTab} onClose={() => setShowRoleRef(false)} />}
      {winner && <WinBanner winner={winner} players={players} roleAssignments={roleAssignments} onNewGame={() => setScreen("setup")} />}

      <div style={styles.gameLayout}>
        <div style={styles.sidebar}>
          <PlayerBoard players={players} eliminated={eliminated} roleAssignments={roleAssignments} getRoleForPlayer={getRoleForPlayer} />
        </div>
        <div style={styles.main}>
          <PhasePanel {...props} />
        </div>
        <div style={styles.sidebar}>
          <LogPanel log={gameLog} />
        </div>
      </div>
    </div>
  );
}

function PhasePanel(props) {
  const { phase } = props;
  if (phase === "night") return <NightIntroPanel {...props} />;
  if (phase === "werewolf") return <WerewolfPhasePanel {...props} />;
  if (phase === "roleActions") return <RoleActionsPanel {...props} />;
  if (phase === "day") return <DayPanel {...props} />;
  if (phase === "vote") return <VotePanel {...props} />;
  return null;
}

function NightIntroPanel({ setPhase }) {
  return (
    <div style={styles.phaseCard}>
      <div style={styles.phaseIcon}>🌙</div>
      <h2 style={styles.phaseTitle}>กลางคืนมาถึง</h2>
      <p style={styles.phaseDesc}>ผู้เล่นทุกคนหลับตา เริ่มช่วงกลางคืน ดำเนินการตามบทบาทของแต่ละคนตามลำดับ</p>
      <div style={styles.btnRow}>
        <button style={styles.btnPrimary} onClick={() => setPhase("werewolf")}>🐺 เฟสหมาป่า →</button>
      </div>
    </div>
  );
}

function WerewolfPhasePanel({ players, roleAssignments, pendingActions, setPendingActions, setPhase, getAlivePlayers, alphaUsedConvert, setAlphaUsedConvert }) {
  const alive = getAlivePlayers();
  const wolfRoles = ["werewolf","alpha_wolf","wolf_cub","cursed_wolf_father","dream_wolf","moon_wolf","human_werewolf"];
  const wolves = players.filter(p => wolfRoles.includes(roleAssignments[p.id]) && p.alive);
  const wolfKill = pendingActions["werewolf"]?.primary;
  const alphaConvert = pendingActions["alpha_wolf"]?.convert;

  const setKill = (id) => setPendingActions(prev => ({ ...prev, werewolf: { primary: id } }));
  const setConvert = (id) => { setPendingActions(prev => ({ ...prev, alpha_wolf: { convert: id } })); setAlphaUsedConvert(true); };

  return (
    <div style={styles.phaseCard}>
      <div style={styles.phaseIcon}>🐺</div>
      <h2 style={styles.phaseTitle}>เฟสหมาป่า</h2>
      <div style={styles.infoBox}>
        <strong>หมาป่าที่ยังมีชีวิต:</strong> {wolves.map(w => {
          const r = ROLES.find(r => r.id === roleAssignments[w.id]);
          return `${r?.icon || ""} ${w.name}`;
        }).join(", ") || "ไม่มี"}
      </div>

      <p style={styles.label}>☠️ เลือกเหยื่อคืนนี้:</p>
      <div style={styles.targetGrid}>
        {alive.filter(p => !wolfRoles.includes(roleAssignments[p.id])).map(p => (
          <button key={p.id}
            style={{ ...styles.targetBtn, ...(wolfKill === p.id ? styles.targetBtnSelected : {}) }}
            onClick={() => setKill(p.id)}>{p.name}</button>
        ))}
      </div>

      {wolves.some(w => roleAssignments[w.id] === "alpha_wolf") && !alphaUsedConvert && (
        <div style={{ marginTop: 16 }}>
          <p style={styles.label}>👑 อัลฟ่าวูล์ฟ: เปลี่ยนแทนการฆ่า (1 ครั้งต่อเกม):</p>
          <div style={styles.targetGrid}>
            {alive.filter(p => !wolfRoles.includes(roleAssignments[p.id])).map(p => (
              <button key={p.id}
                style={{ ...styles.targetBtn, background: alphaConvert === p.id ? "#7f1d1d" : undefined }}
                onClick={() => setConvert(p.id)}>{p.name}</button>
            ))}
          </div>
        </div>
      )}

      <div style={styles.btnRow}>
        <button style={styles.btnSecondary} onClick={() => setPhase("night")}>← ย้อนกลับ</button>
        <button style={styles.btnPrimary} onClick={() => setPhase("roleActions")}>ถัดไป: การกระทำของบทบาท →</button>
      </div>
    </div>
  );
}

function RoleActionsPanel(props) {
  const { getRolesWithNightActions, getAlivePlayers, players, roleAssignments, pendingActions, setPendingActions, witchUsedHeal, witchUsedPoison, lastBodyguard, resolveNight, roleActionResults, setRoleActionResults } = props;
  const [step, setStep] = useState(0);
  const roles = getRolesWithNightActions().filter(r => !["werewolf","alpha_wolf","cursed_wolf_father"].includes(r.id));
  const alive = getAlivePlayers();
  const current = roles[step];

  const record = (type, id) => {
    setPendingActions(prev => ({ ...prev, [current.id]: { ...(prev[current.id] || {}), [type]: id } }));
  };

  const revealResult = (result) => setRoleActionResults(prev => ({ ...prev, [current.id]: result }));

  const next = () => {
    if (step < roles.length - 1) setStep(s => s + 1);
    else resolveNight();
  };

  if (roles.length === 0) {
    return (
      <div style={styles.phaseCard}>
        <h2 style={styles.phaseTitle}>ไม่มีการกระทำของบทบาท</h2>
        <p style={styles.phaseDesc}>ไม่มีบทบาทที่ใช้งานพลังกลางคืนในรอบนี้</p>
        <button style={styles.btnPrimary} onClick={resolveNight}>☀️ สิ้นสุดกลางคืน</button>
      </div>
    );
  }

  const roleData = current;
  const team = TEAM_COLORS[roleData?.team] || TEAM_COLORS.village;

  return (
    <div style={styles.phaseCard}>
      <div style={{ ...styles.roleActionHeader, background: team.bg, borderColor: team.accent }}>
        <span style={{ fontSize: 32 }}>{roleData?.icon}</span>
        <div>
          <div style={{ color: team.text, fontWeight: 800, fontSize: 18 }}>{roleData?.name}</div>
          <div style={{ color: "#aaa", fontSize: 13 }}>{step + 1} จาก {roles.length}</div>
        </div>
      </div>

      <p style={{ ...styles.label, marginTop: 12 }}>{roleData?.nightAction}</p>

      <RoleActionControls
        role={roleData} alive={alive} players={players} roleAssignments={roleAssignments}
        pendingActions={pendingActions} record={record}
        witchUsedHeal={witchUsedHeal} witchUsedPoison={witchUsedPoison}
        lastBodyguard={lastBodyguard} revealResult={revealResult}
        result={roleActionResults[current?.id]}
        setPendingActions={setPendingActions}
      />

      <div style={styles.btnRow}>
        {step > 0 && <button style={styles.btnSecondary} onClick={() => setStep(s => s - 1)}>← ก่อนหน้า</button>}
        <button style={styles.btnPrimary} onClick={next}>
          {step < roles.length - 1 ? "บทบาทถัดไป →" : "☀️ สิ้นสุดกลางคืน"}
        </button>
      </div>
    </div>
  );
}

function RoleActionControls({ role, alive, players, roleAssignments, pendingActions, record, witchUsedHeal, witchUsedPoison, lastBodyguard, revealResult, result, setPendingActions }) {
  if (!role) return null;
  const act = pendingActions[role.id] || {};
  const wolfTarget = pendingActions["werewolf"]?.primary;
  const wolfVictim = wolfTarget !== undefined ? players[wolfTarget]?.name : "ไม่ทราบ";

  if (["seer","oracle","aura_seer","apprentice_seer"].includes(role.id)) {
    const wolfRoleIds = ["werewolf","alpha_wolf","wolf_cub","cursed_wolf_father","dream_wolf","moon_wolf","human_werewolf"];
    const targetRole = act.primary !== undefined ? ROLES.find(r => r.id === roleAssignments[act.primary]) : null;
    const targetIsWolf = targetRole ? wolfRoleIds.includes(targetRole.id) : false;
    // human_werewolf appears as villager to seer/oracle
    const targetAppearsVillage = targetRole?.seerAppears === "village";

    return (
      <div>
        <p style={styles.hint}>เลือกผู้เล่นที่จะตรวจสอบ:</p>
        <div style={styles.targetGrid}>
          {alive.map(p => (
            <button key={p.id}
              style={{ ...styles.targetBtn, ...(act.primary === p.id ? styles.targetBtnSelected : {}) }}
              onClick={() => {
                record("primary", p.id);
                const tr = ROLES.find(r => r.id === roleAssignments[p.id]);
                const isWolf = tr ? wolfRoleIds.includes(tr.id) : false;
                const appearsVillage = tr?.seerAppears === "village";
                if (role.id === "seer" || role.id === "apprentice_seer") {
                  // human_werewolf appears as villager to seer
                  revealResult((isWolf && !appearsVillage) ? "🐺 หมาป่า" : "✅ ไม่ใช่หมาป่า");
                } else if (role.id === "oracle") {
                  // oracle sees real role, but human_werewolf appears as villager
                  if (appearsVillage) {
                    revealResult("👤 ชาวบ้าน");
                  } else if (isWolf) {
                    revealResult(`${tr.icon} ${tr.name}`);
                  } else {
                    revealResult(tr ? `${tr.icon} ${tr.name}` : "ไม่ทราบ");
                  }
                } else if (role.id === "aura_seer") {
                  // human_werewolf has nightAction so shows as having power
                  revealResult(tr?.nightAction ? "✨ มีพลังกลางคืน" : "❌ ไม่มีพลังกลางคืน");
                }
              }}>{p.name}</button>
          ))}
        </div>
        {act.primary !== undefined && result && (
          <div style={styles.revealBox}>
            <p style={{ color: "#aaa", marginBottom: 8, fontSize: 13 }}>
              ผลสำหรับ {role.name} — {players[act.primary]?.name}:
            </p>
            <div style={{
              ...styles.resultTag,
              background: result.includes("หมาป่า") ? "#7f1d1d" : "#1e3a5f",
              border: result.includes("หมาป่า") ? "1px solid #c0392b" : "1px solid #4a90d9",
              color: result.includes("หมาป่า") ? "#fca5a5" : "#e0f0ff",
              fontSize: 15,
            }}>{result}</div>
            {/* Moderator-only note: show true identity when role disguises itself */}
            {targetAppearsVillage && (role.id === "seer" || role.id === "apprentice_seer" || role.id === "oracle") && (
              <div style={{
                marginTop: 10, padding: "8px 12px", borderRadius: 8,
                background: "#1a0a00", border: "1px solid #b45309",
                color: "#fcd34d", fontSize: 13
              }}>
                🎭 <strong>[ผู้ดำเนินเกมเท่านั้น]</strong> บทบาทจริงคือ {targetRole?.icon} {targetRole?.name} — ซ่อนตัวเป็นชาวบ้าน
              </div>
            )}
            {/* Moderator-only note for regular wolves shown to seer */}
            {targetIsWolf && !targetAppearsVillage && (role.id === "seer" || role.id === "apprentice_seer") && (
              <div style={{
                marginTop: 10, padding: "8px 12px", borderRadius: 8,
                background: "#1a0808", border: "1px solid #7f1d1d",
                color: "#fca5a5", fontSize: 13
              }}>
                ⚠️ <strong>บอกผู้เล่น:</strong> "🐺 หมาป่า"
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (role.id === "witch") {
    return (
      <div>
        <div style={styles.infoBox}>เหยื่อหมาป่าคืนนี้: <strong style={{ color: "#ff6b6b" }}>{wolfVictim}</strong></div>
        {!witchUsedHeal && (
          <div>
            <p style={styles.hint}>💊 ยาวิเศษ — ช่วยเหยื่อหมาป่าไหม?</p>
            <div style={styles.btnRow}>
              <button style={{ ...styles.btnSecondary, color: "#5eead4" }} onClick={() => record("heal", wolfTarget)}>✅ ช่วย {wolfVictim}</button>
              <button style={styles.btnSecondary} onClick={() => record("heal", null)}>❌ ไม่ช่วย</button>
            </div>
          </div>
        )}
        {!witchUsedPoison && (
          <div style={{ marginTop: 12 }}>
            <p style={styles.hint}>☠️ ยาพิษ — จะวางยาใคร?</p>
            <div style={styles.targetGrid}>
              {alive.map(p => (
                <button key={p.id}
                  style={{ ...styles.targetBtn, ...(act.poison === p.id ? { background: "#7f1d1d" } : {}) }}
                  onClick={() => record("poison", p.id)}>{p.name}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (role.id === "bodyguard") {
    return (
      <div>
        <p style={styles.hint}>เลือกผู้เล่นที่จะปกป้อง {lastBodyguard !== null ? `(ไม่สามารถปกป้องผู้เล่นคนเดิม)` : ""}:</p>
        <div style={styles.targetGrid}>
          {alive.filter(p => p.id !== lastBodyguard).map(p => (
            <button key={p.id}
              style={{ ...styles.targetBtn, ...(act.primary === p.id ? styles.targetBtnSelected : {}) }}
              onClick={() => record("primary", p.id)}>{p.name}</button>
          ))}
        </div>
      </div>
    );
  }

  if (role.id === "pi") {
    return (
      <div>
        <p style={styles.hint}>เลือกผู้เล่นสองคนเพื่อเปรียบเทียบทีม:</p>
        <div style={styles.targetGrid}>
          {alive.map(p => (
            <button key={p.id}
              style={{ ...styles.targetBtn, ...(act.primary === p.id || act.secondary === p.id ? styles.targetBtnSelected : {}) }}
              onClick={() => {
                if (!act.primary) record("primary", p.id);
                else if (!act.secondary && act.primary !== p.id) record("secondary", p.id);
              }}>{p.name}</button>
          ))}
        </div>
        {act.primary !== undefined && act.secondary !== undefined && (
          <div style={styles.revealBox}>
            <p style={{ color: "#aaa", marginBottom: 8 }}>{players[act.primary]?.name} กับ {players[act.secondary]?.name} อยู่ทีมเดียวกันไหม?</p>
            <div style={styles.btnRow}>
              <button style={styles.btnSecondary} onClick={() => revealResult("✅ ทีมเดียวกัน")}>✅ ทีมเดียวกัน</button>
              <button style={styles.btnSecondary} onClick={() => revealResult("❌ ต่างทีมกัน")}>❌ ต่างทีมกัน</button>
            </div>
            {result && <div style={styles.resultTag}>{result}</div>}
          </div>
        )}
      </div>
    );
  }

  if (role.id === "arsonist") {
    const doused = act.doused || [];
    return (
      <div>
        <p style={styles.hint}>🪣 ราดน้ำมันผู้เล่น หรือ 🔥 จุดไฟเผาทุกคนที่ถูกราด:</p>
        <div style={styles.targetGrid}>
          {alive.map(p => (
            <button key={p.id}
              style={{ ...styles.targetBtn, ...(doused.includes(p.id) ? { background: "#7f3010" } : {}) }}
              onClick={() => {
                const next = doused.includes(p.id) ? doused.filter(id => id !== p.id) : [...doused, p.id];
                record("doused", next);
              }}>{p.name} {doused.includes(p.id) ? "🔥" : ""}</button>
          ))}
        </div>
        <button style={{ ...styles.btnPrimary, background: "#c0392b", marginTop: 12 }}
          onClick={() => record("ignite", true)}>
          🔥 จุดไฟ — เผาผู้เล่น {doused.length} คนที่ถูกราด
        </button>
      </div>
    );
  }

  return (
    <div>
      <p style={styles.hint}>เลือกเป้าหมาย:</p>
      <div style={styles.targetGrid}>
        {alive.map(p => (
          <button key={p.id}
            style={{ ...styles.targetBtn, ...(act.primary === p.id ? styles.targetBtnSelected : {}) }}
            onClick={() => record("primary", p.id)}>{p.name}</button>
        ))}
      </div>
    </div>
  );
}

function DayPanel({ nightLog, players, setPhase, round }) {
  const { deaths = [], saved = [] } = nightLog || {};
  return (
    <div style={styles.phaseCard}>
      <div style={styles.phaseIcon}>☀️</div>
      <h2 style={styles.phaseTitle}>วันที่ {round} — รุ่งเช้า</h2>
      <div style={styles.nightReport}>
        <h3 style={{ color: "#fcd34d", marginBottom: 12 }}>🌅 รายงานคืนที่ผ่านมา</h3>
        {deaths.length === 0 && saved.length === 0 && <p style={{ color: "#aaa" }}>🌙 คืนสงบ ไม่มีใครตาย</p>}
        {deaths.map(id => <div key={id} style={styles.deathRow}>💀 <strong style={{ color: "#ff6b6b" }}>{players[id]?.name}</strong> ถูกกำจัดในคืนนี้</div>)}
        {saved.map(id => <div key={id} style={styles.saveRow}>🛡️ <strong style={{ color: "#5eead4" }}>{players[id]?.name}</strong> รอดชีวิต!</div>)}
      </div>
      <p style={styles.phaseDesc}>ผู้เล่นพูดคุยและถกเถียง เมื่อพร้อมแล้วดำเนินการโหวต</p>
      <button style={styles.btnPrimary} onClick={() => setPhase("vote")}>⚖️ เริ่มโหวต →</button>
    </div>
  );
}

function VotePanel({ players, roleAssignments, voteTargets, setVoteTargets, castVote, tallyVotes, eliminateByVote, setPhase, setRound }) {
  const alive = players.filter(p => p.alive);
  const { tally, leaders } = tallyVotes();

  return (
    <div style={styles.phaseCard}>
      <div style={styles.phaseIcon}>⚖️</div>
      <h2 style={styles.phaseTitle}>โหวตกลางวัน</h2>

      <div style={styles.voteGrid}>
        {alive.map(voter => (
          <div key={voter.id} style={styles.voteRow}>
            <span style={styles.voterName}>{voter.name}</span>
            <span style={{ color: "#888", fontSize: 12, margin: "0 6px" }}>→</span>
            <select style={styles.voteSelect} value={voteTargets[voter.id] ?? ""}
              onChange={e => castVote(voter.id, e.target.value === "" ? null : parseInt(e.target.value))}>
              <option value="">ไม่โหวต</option>
              {alive.filter(p => p.id !== voter.id).map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <div style={styles.tallyBox}>
        <h3 style={{ color: "#fcd34d", marginBottom: 8 }}>📊 สรุปคะแนนโหวต</h3>
        {Object.entries(tally).sort(([,a],[,b]) => b - a).map(([id, count]) => (
          <div key={id} style={styles.tallyRow}>
            <span>{players[parseInt(id)]?.name}</span>
            <div style={styles.tallyBar}>
              <div style={{ ...styles.tallyFill, width: `${(count / alive.length) * 100}%` }} />
            </div>
            <span style={{ color: "#fcd34d" }}>{count}</span>
          </div>
        ))}
      </div>

      {leaders.length > 0 && (
        <div>
          <p style={{ color: "#ff6b6b", fontWeight: 700, marginBottom: 8 }}>
            {leaders.length === 1
              ? `☠️ ${players[leaders[0]]?.name} จะถูกกำจัด`
              : `⚠️ คะแนนเท่ากัน: ${leaders.map(id => players[id]?.name).join(", ")}`}
          </p>
          {leaders.map(id => (
            <button key={id} style={{ ...styles.btnPrimary, background: "#7f1d1d", marginRight: 8 }}
              onClick={() => eliminateByVote(id)}>☠️ กำจัด {players[id]?.name}</button>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
        <button style={styles.btnSecondary} onClick={() => setPhase("day")}>← กลับไปถกเถียง</button>
        <button style={{
          background: "linear-gradient(135deg, #1a2e1a, #0d1f0d)",
          border: "1px solid #27ae60", color: "#5eead4",
          padding: "8px 18px", borderRadius: 8, cursor: "pointer",
          fontSize: 13, fontWeight: 700, fontFamily: "inherit",
          display: "flex", alignItems: "center", gap: 6
        }} onClick={() => {
          setVoteTargets && setVoteTargets({});
          setRound(r => r + 1);
          setPhase("night");
        }}>
          ⏭️ ข้ามการโหวต (ไม่มีใครออก)
        </button>
      </div>
    </div>
  );
}

// ─── กระดานผู้เล่น ────────────────────────────────────────────────────────────

function PlayerBoard({ players, eliminated, roleAssignments, getRoleForPlayer }) {
  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>👥 ผู้เล่น</h3>
      <div>
        {players.map(p => {
          const role = getRoleForPlayer(p.id);
          const team = role ? TEAM_COLORS[role.team] : null;
          const elim = eliminated.find(e => e.id === p.id);
          return (
            <div key={p.id} style={{ ...styles.playerCard, ...(p.alive ? {} : styles.playerCardDead), ...(team && p.alive ? { borderColor: team.accent } : {}) }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>{p.alive ? (role?.icon || "👤") : "💀"}</span>
                <div>
                  <div style={{ fontWeight: 700, color: p.alive ? "#f0f0f0" : "#666", fontSize: 14 }}>{p.name}</div>
                  {role && <div style={{ fontSize: 11, color: team ? team.text : "#aaa" }}>{role.name}</div>}
                  {elim && <div style={{ fontSize: 10, color: "#555" }}>ออกรอบ {elim.cause === "night" ? "กลางคืน" : "โหวต"} R{elim.round}</div>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LogPanel({ log }) {
  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>📜 บันทึกเกม</h3>
      <div style={styles.logBox}>
        {[...log].reverse().map((entry, i) => (
          <div key={i} style={styles.logEntry}>{entry}</div>
        ))}
      </div>
    </div>
  );
}

// ─── อ้างอิงบทบาท ─────────────────────────────────────────────────────────────

function RoleReference({ rolesByTeam, tab, setTab, onClose }) {
  return (
    <div style={styles.roleRefOverlay}>
      <div style={styles.roleRefModal}>
        <div style={styles.roleRefHeader}>
          <h2 style={{ margin: 0, color: "#f0f0f0" }}>📖 คู่มือบทบาท</h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={styles.tabs}>
          {["werewolf","village","neutral"].map(t => (
            <button key={t} style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }} onClick={() => setTab(t)}>
              {t === "werewolf" ? "🐺 หมาป่า" : t === "village" ? "🏘️ ชาวบ้าน" : "⚗️ ฝ่ายกลาง"}
            </button>
          ))}
        </div>
        <div style={styles.roleRefGrid}>
          {rolesByTeam(tab).map(role => {
            const tc = TEAM_COLORS[role.team];
            return (
              <div key={role.id} style={{ ...styles.roleCard, borderColor: tc.accent }}>
                <div style={styles.roleCardHeader}>
                  <span style={{ fontSize: 24 }}>{role.icon}</span>
                  <strong style={{ color: tc.text }}>{role.name}</strong>
                  <span style={{ ...styles.teamBadge, background: tc.badge, color: tc.text, fontSize: 10 }}>
                    {tab === "werewolf" ? "หมาป่า" : tab === "village" ? "ชาวบ้าน" : "กลาง"}
                  </span>
                </div>
                <p style={{ color: "#bbb", fontSize: 13, margin: "6px 0" }}>{role.description}</p>
                {role.nightAction && <div style={styles.actionTag}>🌙 {role.nightAction}</div>}
                {role.deathAction && <div style={{ ...styles.actionTag, background: "#3d1111", color: "#ff6b6b" }}>💀 {role.deathAction}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RoleList({ rolesByTeam }) {
  return (
    <div>
      {["werewolf","village","neutral"].map(team => (
        <div key={team}>
          <h3 style={{ color: TEAM_COLORS[team].text, margin: "16px 0 8px" }}>
            {team === "werewolf" ? "🐺 ทีมหมาป่า" : team === "village" ? "🏘️ ทีมชาวบ้าน" : "⚗️ ฝ่ายกลาง / บุคคลที่สาม"}
          </h3>
          <div style={styles.roleRefGrid}>
            {rolesByTeam(team).map(role => {
              const tc = TEAM_COLORS[role.team];
              return (
                <div key={role.id} style={{ ...styles.roleCard, borderColor: tc.accent }}>
                  <div style={styles.roleCardHeader}>
                    <span style={{ fontSize: 20 }}>{role.icon}</span>
                    <strong style={{ color: tc.text, fontSize: 14 }}>{role.name}</strong>
                  </div>
                  <p style={{ color: "#bbb", fontSize: 12, margin: "4px 0" }}>{role.description}</p>
                  {role.nightAction && <div style={{ ...styles.actionTag, fontSize: 11 }}>🌙 {role.nightAction}</div>}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── แบนเนอร์ชนะ ──────────────────────────────────────────────────────────────

function WinBanner({ winner, players, roleAssignments, onNewGame }) {
  return (
    <div style={styles.winOverlay}>
      <div style={styles.winModal}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>{winner === "werewolf" ? "🐺" : "🏘️"}</div>
        <h1 style={{ color: winner === "werewolf" ? "#ff6b6b" : "#5eead4", fontSize: 36, margin: "0 0 8px" }}>
          {winner === "werewolf" ? "หมาป่าชนะ!" : "ชาวบ้านชนะ!"}
        </h1>
        <p style={{ color: "#aaa", marginBottom: 24 }}>
          {winner === "werewolf" ? "หมาป่ากลืนกินหมู่บ้านทั้งหมดแล้ว" : "หมาป่าทุกตัวถูกกำจัดแล้ว!"}
        </p>
        <button style={styles.btnPrimary} onClick={onNewGame}>🌙 เริ่มเกมใหม่</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// สไตล์
// ═══════════════════════════════════════════════════════════════════════════════

const styles = {
  app: {
    minHeight: "100vh", background: "#0a0a0f", color: "#f0f0f0",
    fontFamily: "'Sarabun', 'Noto Sans Thai', 'Tahoma', sans-serif",
    backgroundImage: "radial-gradient(ellipse at top, #1a0a2e 0%, #0a0a0f 70%)",
  },
  header: {
    display: "flex", alignItems: "center", gap: 16, padding: "16px 24px",
    borderBottom: "1px solid #1e1e2e", background: "rgba(10,10,20,0.8)",
    backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 100,
  },
  moonIcon: { fontSize: 36 },
  title: { margin: 0, fontSize: 22, fontWeight: 900, letterSpacing: 4, color: "#f0f0f0" },
  subtitle: { margin: 0, fontSize: 12, color: "#888", letterSpacing: 1 },
  btnGhost: {
    background: "none", border: "1px solid #333", color: "#aaa",
    padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontFamily: "inherit",
  },
  btnPrimary: {
    background: "linear-gradient(135deg, #1e3a5f, #2d5a8e)",
    border: "1px solid #4a90d9", color: "#e0f0ff",
    padding: "10px 20px", borderRadius: 8, cursor: "pointer",
    fontSize: 14, fontWeight: 700, fontFamily: "inherit", letterSpacing: 0.5,
  },
  btnSecondary: {
    background: "#1a1a2e", border: "1px solid #333", color: "#aaa",
    padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "inherit",
  },
  btnRow: { display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" },
  card: {
    background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 12,
    padding: 20, marginBottom: 16,
  },
  cardTitle: { margin: "0 0 16px", fontSize: 16, color: "#d0d0f0", fontWeight: 700, letterSpacing: 0.5 },
  section: { marginBottom: 20 },
  label: { fontSize: 13, color: "#aaa", marginBottom: 8, display: "block" },
  hint: { fontSize: 13, color: "#888", marginBottom: 10 },
  countRow: { display: "flex", flexWrap: "wrap", gap: 8 },
  countBtn: {
    background: "#1a1a2e", border: "1px solid #333", color: "#888",
    padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontFamily: "inherit",
  },
  countBtnActive: { background: "#1e3a5f", border: "1px solid #4a90d9", color: "#e0f0ff" },
  tabs: { display: "flex", gap: 4, marginBottom: 16 },
  tab: {
    background: "none", border: "1px solid #222", color: "#666",
    padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: 13,
  },
  tabActive: { background: "#1e1e30", border: "1px solid #444", color: "#d0d0f0" },
  playerGrid: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 },
  playerRow: {
    display: "flex", alignItems: "center", gap: 8, padding: "10px 12px",
    background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 8, borderLeft: "3px solid #333",
  },
  playerNum: { color: "#555", fontSize: 13, minWidth: 20, textAlign: "center" },
  nameInput: {
    background: "#1a1a2e", border: "1px solid #333", color: "#f0f0f0",
    padding: "6px 10px", borderRadius: 6, fontSize: 13, fontFamily: "inherit", flex: 1,
  },
  roleSelect: {
    background: "#1a1a2e", border: "1px solid #333", color: "#f0f0f0",
    padding: "6px 10px", borderRadius: 6, fontSize: 13, fontFamily: "inherit", flex: 2,
  },
  teamBadge: { padding: "2px 8px", borderRadius: 12, fontSize: 12, fontWeight: 700 },
  centerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 },
  assignedCount: { color: "#888", fontSize: 13 },
  gameLayout: { display: "flex", gap: 16, padding: 16, minHeight: "calc(100vh - 80px)" },
  sidebar: { width: 220, flexShrink: 0 },
  main: { flex: 1 },
  phaseCard: {
    background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 16,
    padding: 28, textAlign: "center",
  },
  phaseIcon: { fontSize: 48, marginBottom: 12 },
  phaseTitle: { margin: "0 0 12px", fontSize: 24, color: "#f0f0f0", fontWeight: 900 },
  phaseDesc: { color: "#999", marginBottom: 20, lineHeight: 1.8 },
  infoBox: {
    background: "#1a1a2e", border: "1px solid #2d2d40", borderRadius: 8,
    padding: "10px 14px", marginBottom: 16, fontSize: 14, color: "#ccc", textAlign: "left",
  },
  targetGrid: { display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 12 },
  targetBtn: {
    background: "#1a1a2e", border: "1px solid #333", color: "#ccc",
    padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: 13,
  },
  targetBtnSelected: { background: "#1e3a5f", border: "1px solid #4a90d9", color: "#e0f0ff" },
  roleActionHeader: {
    display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
    borderRadius: 10, border: "1px solid", marginBottom: 4, textAlign: "left",
  },
  revealBox: {
    background: "#12121f", border: "1px solid #2d2d40", borderRadius: 8,
    padding: 14, marginTop: 12, textAlign: "left",
  },
  resultTag: {
    background: "#1e3a5f", border: "1px solid #4a90d9", color: "#e0f0ff",
    padding: "6px 14px", borderRadius: 20, fontSize: 14, fontWeight: 700,
    display: "inline-block", marginTop: 10,
  },
  nightReport: {
    background: "#12121f", border: "1px solid #1e1e2e", borderRadius: 10,
    padding: 16, marginBottom: 20, textAlign: "left",
  },
  deathRow: { color: "#ff6b6b", fontSize: 14, marginBottom: 6 },
  saveRow: { color: "#5eead4", fontSize: 14, marginBottom: 6 },
  voteGrid: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 16, textAlign: "left" },
  voteRow: { display: "flex", alignItems: "center", gap: 8 },
  voterName: { minWidth: 90, fontSize: 13, color: "#ccc" },
  voteSelect: {
    background: "#1a1a2e", border: "1px solid #333", color: "#f0f0f0",
    padding: "5px 10px", borderRadius: 6, fontSize: 13, fontFamily: "inherit", flex: 1,
  },
  tallyBox: {
    background: "#12121f", border: "1px solid #1e1e2e", borderRadius: 10,
    padding: 16, marginBottom: 16, textAlign: "left",
  },
  tallyRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 6 },
  tallyBar: { flex: 1, height: 8, background: "#1a1a2e", borderRadius: 4, overflow: "hidden" },
  tallyFill: { height: "100%", background: "linear-gradient(90deg, #c0392b, #ff6b6b)", borderRadius: 4 },
  playerCard: {
    padding: "8px 10px", marginBottom: 6, borderRadius: 8,
    background: "#12121f", border: "1px solid #1e1e2e", borderLeft: "3px solid #333",
  },
  playerCardDead: { opacity: 0.4, borderLeft: "3px solid #333" },
  logBox: { maxHeight: 400, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 },
  logEntry: { fontSize: 12, color: "#999", padding: "4px 0", borderBottom: "1px solid #1a1a2a", lineHeight: 1.6 },
  roleRefOverlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
    zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center",
    backdropFilter: "blur(4px)",
  },
  roleRefModal: {
    background: "#0f0f1a", border: "1px solid #2d2d40", borderRadius: 16,
    padding: 24, maxWidth: 900, width: "90vw", maxHeight: "80vh", overflowY: "auto",
  },
  roleRefHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  closeBtn: { background: "none", border: "none", color: "#888", fontSize: 20, cursor: "pointer" },
  roleRefGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12, marginTop: 8 },
  roleCard: { background: "#12121f", border: "1px solid", borderRadius: 10, padding: 14 },
  roleCardHeader: { display: "flex", alignItems: "center", gap: 10, marginBottom: 4 },
  actionTag: {
    background: "#1a1a2e", border: "1px solid #2d2d40", color: "#93c5fd",
    padding: "4px 10px", borderRadius: 6, fontSize: 12, marginTop: 6, textAlign: "left",
  },
  winOverlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)",
    zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center",
    backdropFilter: "blur(8px)",
  },
  winModal: {
    textAlign: "center", padding: 48, background: "#0f0f1a",
    border: "1px solid #2d2d40", borderRadius: 20,
  },
};

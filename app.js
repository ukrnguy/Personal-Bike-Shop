const { useState, useEffect, useCallback, useRef } = React;
const FONT = "https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&family=Inter:wght@400;500;600&display=swap";
const BG = "#0E0F10";
const CARD = "#17181A";
const BORDER = "#26282A";
const TEXT = "#F0F0EC";
const MUTED = "#8A8C8A";
const FAINT = "#5A5C5A";
const ACCENT = "#8FD8C9";
const ACCENT_INK = "#0A2521";
const DANGER = "#E0432A";
const CATEGORIES = ["Drivetrain", "Brakes", "Wheels", "Cockpit", "Frame hardware", "Other"];
const TYPES = [
  { id: "chain", label: "Chain", cat: "Drivetrain", km: 3e3, wear: true },
  { id: "cassette", label: "Cassette", cat: "Drivetrain", km: 9e3, wear: true },
  { id: "chainrings", label: "Chainrings", cat: "Drivetrain", km: 15e3, wear: true },
  { id: "crankset", label: "Crankset", cat: "Drivetrain", km: 2e4, wear: false },
  { id: "bb", label: "Bottom bracket", cat: "Drivetrain", km: 12e3, wear: true },
  { id: "fd", label: "Front derailleur", cat: "Drivetrain", km: 0, wear: false },
  { id: "rd", label: "Rear derailleur", cat: "Drivetrain", km: 0, wear: false },
  { id: "shiftcable", label: "Shift cables & housing", cat: "Drivetrain", km: 6e3, wear: true },
  { id: "pedals", label: "Pedals", cat: "Drivetrain", km: 0, wear: false },
  { id: "calipers", label: "Brake calipers", cat: "Brakes", km: 0, wear: false },
  { id: "pads_f", label: "Brake pads (front)", cat: "Brakes", km: 2e3, wear: true },
  { id: "pads_r", label: "Brake pads (rear)", cat: "Brakes", km: 2e3, wear: true },
  { id: "rotor_f", label: "Rotor (front)", cat: "Brakes", km: 1e4, wear: false },
  { id: "rotor_r", label: "Rotor (rear)", cat: "Brakes", km: 1e4, wear: false },
  { id: "brakecable", label: "Brake cables & housing", cat: "Brakes", km: 6e3, wear: true },
  { id: "hub_f", label: "Front hub", cat: "Wheels", km: 15e3, wear: false },
  { id: "hub_r", label: "Rear hub", cat: "Wheels", km: 15e3, wear: false },
  { id: "wheel_f", label: "Front wheel / rim", cat: "Wheels", km: 0, wear: false },
  { id: "wheel_r", label: "Rear wheel / rim", cat: "Wheels", km: 0, wear: false },
  { id: "tire_f", label: "Tire (front)", cat: "Wheels", km: 4e3, wear: true },
  { id: "tire_r", label: "Tire (rear)", cat: "Wheels", km: 3e3, wear: true },
  { id: "tube", label: "Tube / sealant", cat: "Wheels", km: 2e3, wear: true },
  { id: "axle", label: "Thru-axle", cat: "Wheels", km: 0, wear: false },
  { id: "bar", label: "Handlebar", cat: "Cockpit", km: 0, wear: false },
  { id: "stem", label: "Stem", cat: "Cockpit", km: 0, wear: false },
  { id: "headset", label: "Headset", cat: "Cockpit", km: 5e3, wear: true },
  { id: "bartape", label: "Bar tape / grips", cat: "Cockpit", km: 5e3, wear: true },
  { id: "seatpost", label: "Seatpost", cat: "Cockpit", km: 0, wear: false },
  { id: "saddle", label: "Saddle", cat: "Cockpit", km: 0, wear: false },
  { id: "bolt", label: "Bolt / hardware", cat: "Frame hardware", km: 0, wear: false },
  { id: "hanger", label: "Derailleur hanger", cat: "Frame hardware", km: 0, wear: false },
  { id: "custom", label: "Custom part", cat: "Other", km: 0, wear: false }
];
const LOG_TYPES = [
  { id: "service", label: "Service", icon: "ti-tool" },
  { id: "maintenance", label: "Maintenance", icon: "ti-adjustments" },
  { id: "accident", label: "Accident", icon: "ti-alert-triangle" },
  { id: "note", label: "Note", icon: "ti-note" }
];
function typeOf(id) {
  return TYPES.find((t) => t.id === id) || TYPES[TYPES.length - 1];
}
function uid() {
  return Math.random().toString(36).slice(2, 10);
}
function fmt(n) {
  if (n === null || n === void 0 || Number.isNaN(n)) return "\u2014";
  return Math.round(n).toLocaleString();
}
function today() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
function daysSince(dateStr) {
  if (!dateStr) return null;
  const d = Math.round((Date.now() - new Date(dateStr).getTime()) / 864e5);
  return d;
}
function compressImage(file, maxDim = 800, quality = 0.55) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
    };
    reader.onerror = reject;
    img.onload = () => {
      let { width, height } = img;
      if (width > height && width > maxDim) {
        height = Math.round(height * maxDim / width);
        width = maxDim;
      } else if (height > maxDim) {
        width = Math.round(width * maxDim / height);
        height = maxDim;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    reader.readAsDataURL(file);
  });
}
const EMPTY_BIKE = { name: "", brand: "", frameSize: "", mileage: 0, purchaseDate: "", purchasePrice: "", warranty: "", notes: "" };
const SEED_BIKE = {
  name: "Prologue Britannia",
  brand: "Prologue Britannia CX",
  frameSize: "58",
  mileage: 0,
  purchaseDate: "",
  purchasePrice: "",
  warranty: "",
  notes: 'Self-built from a shop-provided frame. 100% Toray carbon, UD weave. BSA-68mm threaded BB, flat mount brakes, 1-1/8"\u20131-1/2" tapered integrated headset. Thru-axles: F 12x100mm or 15x100mm, R 12x142mm. Seatpost 27.2mm, clamp 31.8mm. Cables exit the front of the frame and run externally into the shifters under the bar tape (not fully internal).'
};
function seedPart(typeId, label, brand, extra = {}) {
  const t = typeOf(typeId);
  return {
    id: uid(),
    typeId,
    cat: t.cat,
    label,
    brand,
    wearTracked: t.wear,
    intervalKm: t.km,
    installMileage: 0,
    installDate: today(),
    cost: 0,
    weight: 0,
    purchaseDate: "",
    ...extra
  };
}
const SEED_PARTS = [
  seedPart("chain", "Chain", "Shimano Deore, 12-speed"),
  seedPart("cassette", "Cassette", "Shimano 105, 11-34T"),
  seedPart("chainrings", "Chainrings", "Shimano 105, 52/36T"),
  seedPart("crankset", "Crankset", "Shimano 105, 172.5mm"),
  seedPart("bb", "Bottom bracket", "Shimano BBR60, English/BSA-68mm"),
  seedPart("fd", "Front derailleur", "Shimano 105 R7100 mechanical"),
  seedPart("rd", "Rear derailleur", "Shimano 105 R7100 mechanical"),
  seedPart("shiftcable", "Shift cables & housing", "Shimano"),
  seedPart("pedals", "Pedals", "Shimano 105"),
  seedPart("calipers", "Brake calipers", "Shimano 105, hydraulic disc"),
  seedPart("pads_f", "Brake pads (front)", "Shimano L05A"),
  seedPart("pads_r", "Brake pads (rear)", "Shimano L05A"),
  seedPart("rotor_f", "Rotor (front)", "Shimano 105"),
  seedPart("rotor_r", "Rotor (rear)", "Shimano 105"),
  seedPart("brakecable", "Brake cables & housing (hydraulic)", "Shimano"),
  seedPart("hub_f", "Front hub", "RHUS"),
  seedPart("hub_r", "Rear hub", "RHUS"),
  seedPart("wheel_f", "Front wheel", "RHUS, 45mm carbon, 24 flat spokes"),
  seedPart("wheel_r", "Rear wheel", "RHUS, 45mm carbon, 24 flat spokes"),
  seedPart("tire_f", "Tire (front)", "Pirelli P Zero Race TLR, 32c"),
  seedPart("tire_r", "Tire (rear)", "Pirelli P Zero Race TLR, 32c"),
  seedPart("tube", "Tubes", "25-30C, 60mm butyl valve"),
  seedPart("axle", "Thru-axles", "F 12x100/15x100mm, R 12x142mm"),
  seedPart("bar", "Handlebar", "Carbon (integrated w/ stem)"),
  seedPart("stem", "Stem", "Carbon (integrated w/ bar)"),
  seedPart("headset", "Headset", 'Integrated, 1-1/8"\u20131-1/2" tapered'),
  seedPart("bartape", "Bar tape", "Zipp Course Service"),
  seedPart("seatpost", "Seatpost", "Carbon, 27.2mm"),
  seedPart("saddle", "Saddle", "Selle Italia Novus Boost TLM, 145mm")
];
const EMPTY = { bike: EMPTY_BIKE, parts: [], logs: [] };
const SEEDED = { bike: SEED_BIKE, parts: SEED_PARTS, logs: [] };
function Garage() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("home");
  const [saveState, setSaveState] = useState("idle");
  const [logStep, setLogStep] = useState(null);
  const [logType, setLogType] = useState(null);
  const [addingPart, setAddingPart] = useState(false);
  const [openPart, setOpenPart] = useState(null);
  const [openLog, setOpenLog] = useState(null);
  const [historyFilter, setHistoryFilter] = useState("all");
  const [editingBike, setEditingBike] = useState(false);
  const [settingUp, setSettingUp] = useState(false);
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONT;
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);
  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("garage_v1", false);
        setData(res ? JSON.parse(res.value) : SEEDED);
      } catch {
        setData(SEEDED);
      }
    })();
  }, []);
  const persist = useCallback(async (next) => {
    setData(next);
    setSaveState("saving");
    try {
      await window.storage.set("garage_v1", JSON.stringify(next), false);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 800);
    } catch {
      setSaveState("error");
    }
  }, []);
  if (!data) {
    return /* @__PURE__ */ React.createElement("div", { style: { padding: "3rem 1rem", textAlign: "center", color: MUTED, fontFamily: "Inter, sans-serif" } }, "Loading garage\\u2026");
  }
  const bikeSet = !!data.bike.name;
  const totalPartsCost = data.parts.reduce((s, p) => s + (Number(p.cost) || 0), 0);
  const totalLogCost = data.logs.reduce((s, l) => s + (Number(l.cost) || 0), 0);
  const totalCost = totalPartsCost + totalLogCost;
  const totalWeight = data.parts.reduce((s, p) => s + (Number(p.weight) || 0), 0);
  const costPerKm = data.bike.mileage > 0 ? totalCost / data.bike.mileage : 0;
  const lastService = data.logs.filter((l) => l.type === "service").sort((a, b) => b.date.localeCompare(a.date))[0];
  const yearCost = data.logs.filter((l) => l.date.slice(0, 4) === String((/* @__PURE__ */ new Date()).getFullYear())).reduce((s, l) => s + (Number(l.cost) || 0), 0) + data.parts.filter((p) => (p.purchaseDate || "").slice(0, 4) === String((/* @__PURE__ */ new Date()).getFullYear())).reduce((s, p) => s + (Number(p.cost) || 0), 0);
  function wearInfo(part) {
    const used = data.bike.mileage - (Number(part.installMileage) || 0);
    const interval = Number(part.intervalKm) || 0;
    const ratio = interval > 0 ? used / interval : 0;
    return { used, interval, ratio, remaining: interval - used };
  }
  function saveBike(bike) {
    persist({ ...data, bike });
    setEditingBike(false);
    setSettingUp(false);
  }
  function addPart(part) {
    persist({ ...data, parts: [...data.parts, part] });
    setAddingPart(false);
  }
  function updatePart(id, patch) {
    persist({ ...data, parts: data.parts.map((p) => p.id === id ? { ...p, ...patch } : p) });
  }
  function deletePart(id) {
    persist({ ...data, parts: data.parts.filter((p) => p.id !== id), logs: data.logs.filter((l) => !(l.partIds || []).includes(id)) });
    setOpenPart(null);
  }
  function addLog(log) {
    let next = { ...data, logs: [log, ...data.logs] };
    if (log.resetIds && log.resetIds.length) {
      next = { ...next, parts: next.parts.map((p) => log.resetIds.includes(p.id) ? { ...p, installMileage: data.bike.mileage, installDate: log.date } : p) };
    }
    persist(next);
    setLogStep(null);
    setLogType(null);
  }
  function deleteLog(id) {
    persist({ ...data, logs: data.logs.filter((l) => l.id !== id) });
    setOpenLog(null);
  }
  if (!bikeSet && !settingUp) {
    return /* @__PURE__ */ React.createElement(Shell, { saveState }, /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", padding: "3rem 1rem" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 20, color: TEXT, marginBottom: 8 } }, "Set up your bike"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: MUTED, marginBottom: 20, lineHeight: 1.5 } }, "Add your bike's basics to start tracking parts, services, and cost."), /* @__PURE__ */ React.createElement("button", { className: "g-btn g-solid", onClick: () => setSettingUp(true) }, "+ add your bike")));
  }
  if (!bikeSet && settingUp) {
    return /* @__PURE__ */ React.createElement(Shell, { saveState }, /* @__PURE__ */ React.createElement(BikeForm, { bike: data.bike, onSave: saveBike, onCancel: () => setSettingUp(false) }));
  }
  return /* @__PURE__ */ React.createElement(Shell, { saveState, tab, setTab, onLog: () => setLogStep("type") }, tab === "home" && /* @__PURE__ */ React.createElement(HomeTab, { data, wearInfo, lastService, yearCost, onEditMileage: () => setEditingBike("mileage"), onOpenPart: setOpenPart }), tab === "build" && /* @__PURE__ */ React.createElement(BuildTab, { data, wearInfo, adding: addingPart, setAdding: setAddingPart, onAdd: addPart, onOpen: setOpenPart }), tab === "history" && /* @__PURE__ */ React.createElement(HistoryTab, { data, filter: historyFilter, setFilter: setHistoryFilter, onOpen: setOpenLog }), tab === "profile" && /* @__PURE__ */ React.createElement(ProfileTab, { data, totalCost, totalWeight, costPerKm, onEdit: () => setEditingBike("full") }), editingBike && /* @__PURE__ */ React.createElement(Overlay, { onClose: () => setEditingBike(false), title: editingBike === "mileage" ? "Update odometer" : "Edit bike" }, editingBike === "mileage" ? /* @__PURE__ */ React.createElement(QuickMileage, { value: data.bike.mileage, onSave: (v) => saveBike({ ...data.bike, mileage: v }) }) : /* @__PURE__ */ React.createElement(BikeForm, { bike: data.bike, onSave: saveBike, onCancel: () => setEditingBike(false) })), openPart && /* @__PURE__ */ React.createElement(Overlay, { onClose: () => setOpenPart(null), title: openPart.label }, /* @__PURE__ */ React.createElement(
    PartDetail,
    {
      part: openPart,
      bike: data.bike,
      logs: data.logs.filter((l) => (l.partIds || []).includes(openPart.id)),
      onUpdate: (patch) => {
        updatePart(openPart.id, patch);
        setOpenPart({ ...openPart, ...patch });
      },
      onDelete: () => deletePart(openPart.id)
    }
  )), openLog && /* @__PURE__ */ React.createElement(Overlay, { onClose: () => setOpenLog(null), title: LOG_TYPES.find((t) => t.id === openLog.type)?.label || "Entry" }, /* @__PURE__ */ React.createElement(LogDetail, { log: openLog, parts: data.parts, onDelete: () => deleteLog(openLog.id) })), logStep === "type" && /* @__PURE__ */ React.createElement(Overlay, { onClose: () => setLogStep(null), title: "Log something" }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 } }, LOG_TYPES.map((t) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: t.id,
      onClick: () => {
        setLogType(t.id);
        setLogStep("form");
      },
      style: { background: CARD, border: `0.5px solid ${BORDER}`, borderRadius: 12, padding: "20px 10px", color: TEXT, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer" }
    },
    /* @__PURE__ */ React.createElement("i", { className: `ti ${t.icon}`, style: { fontSize: 22, color: ACCENT }, "aria-hidden": "true" }),
    /* @__PURE__ */ React.createElement("span", { style: { fontSize: 13, fontWeight: 600 } }, t.label)
  )))), logStep === "form" && /* @__PURE__ */ React.createElement(Overlay, { onClose: () => {
    setLogStep(null);
    setLogType(null);
  }, title: LOG_TYPES.find((t) => t.id === logType)?.label }, /* @__PURE__ */ React.createElement(LogForm, { type: logType, bike: data.bike, parts: data.parts, onSave: addLog, onCancel: () => {
    setLogStep(null);
    setLogType(null);
  } })));
}
function Shell({ children, saveState, tab, setTab, onLog }) {
  return /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "Inter, sans-serif", background: BG, minHeight: 480, borderRadius: 18, maxWidth: 430, margin: "0 auto", position: "relative", paddingBottom: tab ? 78 : 0 } }, /* @__PURE__ */ React.createElement("style", null, `
        .g-mono { font-family:'Manrope',sans-serif; font-variant-numeric: tabular-nums; }
        .g-h { font-family:'Manrope',sans-serif; font-weight:800; color:${TEXT}; }
        .g-btn { font-family:'Inter',sans-serif; border:1px solid ${BORDER}; background:transparent; color:${TEXT}; padding:10px 16px; border-radius:10px; font-size:13px; font-weight:600; cursor:pointer; }
        .g-solid { background:${ACCENT}; color:${ACCENT_INK}; border:none; }
        .g-danger { color:${DANGER}; border-color:${DANGER}55; }
        .g-input, .g-select, .g-textarea { font-family:'Inter',sans-serif; border:1px solid ${BORDER}; background:${CARD}; color:${TEXT}; padding:9px 11px; border-radius:8px; font-size:14px; width:100%; box-sizing:border-box; }
        .g-input:focus, .g-select:focus, .g-textarea:focus { outline:none; border-color:${ACCENT}88; }
        .g-input::placeholder, .g-textarea::placeholder { color:${FAINT}; }
        .g-label { font-size:11px; color:${MUTED}; margin-bottom:4px; font-weight:500; }
      `), /* @__PURE__ */ React.createElement("div", { style: { padding: "16px 16px 4px", display: "flex", justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("span", { className: "g-mono", style: { fontSize: 10, color: MUTED, opacity: saveState === "idle" ? 0 : 1, transition: "opacity .3s" } }, saveState === "saving" ? "saving\u2026" : saveState === "saved" ? "saved" : "")), /* @__PURE__ */ React.createElement("div", { style: { padding: "0 16px" } }, children), tab && /* @__PURE__ */ React.createElement("div", { style: { position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: 14, width: "calc(100% - 32px)", maxWidth: 398 } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-around", background: CARD, border: `0.5px solid ${BORDER}`, borderRadius: 18, padding: "10px 6px" } }, /* @__PURE__ */ React.createElement(NavIcon, { icon: "ti-home", active: tab === "home", onClick: () => setTab("home") }), /* @__PURE__ */ React.createElement(NavIcon, { icon: "ti-tool", active: tab === "build", onClick: () => setTab("build") }), /* @__PURE__ */ React.createElement("div", { onClick: onLog, style: { width: 46, height: 46, borderRadius: "50%", background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", marginTop: -24, boxShadow: `0 0 0 5px ${BG}`, cursor: "pointer" } }, /* @__PURE__ */ React.createElement("i", { className: "ti ti-plus", style: { fontSize: 22, color: ACCENT_INK }, "aria-hidden": "true" })), /* @__PURE__ */ React.createElement(NavIcon, { icon: "ti-history", active: tab === "history", onClick: () => setTab("history") }), /* @__PURE__ */ React.createElement(NavIcon, { icon: "ti-user", active: tab === "profile", onClick: () => setTab("profile") }))));
}
function NavIcon({ icon, active, onClick }) {
  return /* @__PURE__ */ React.createElement("i", { className: `ti ${icon}`, onClick, style: { fontSize: 20, color: active ? TEXT : FAINT, cursor: "pointer", padding: 8 }, "aria-hidden": "true" });
}
function Overlay({ children, title, onClose }) {
  return /* @__PURE__ */ React.createElement("div", { style: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50 }, onClick: onClose }, /* @__PURE__ */ React.createElement("div", { onClick: (e) => e.stopPropagation(), style: { background: BG, borderRadius: "18px 18px 0 0", border: `0.5px solid ${BORDER}`, borderBottom: "none", width: "100%", maxWidth: 430, maxHeight: "85vh", overflowY: "auto", padding: "18px 16px 28px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 } }, /* @__PURE__ */ React.createElement("div", { className: "g-h", style: { fontSize: 16 } }, title), /* @__PURE__ */ React.createElement("i", { className: "ti ti-x", onClick: onClose, style: { color: MUTED, fontSize: 18, cursor: "pointer" }, "aria-hidden": "true" })), children));
}
function wearColor(ratio) {
  if (ratio >= 1) return DANGER;
  if (ratio >= 0.75) return ACCENT;
  return "#5A5C5A";
}
function HomeTab({ data, wearInfo, lastService, yearCost, onEditMileage, onOpenPart }) {
  const wearParts = data.parts.filter((p) => p.wearTracked);
  const dueSoon = wearParts.map((p) => ({ p, w: wearInfo(p) })).sort((a, b) => b.w.ratio - a.w.ratio);
  const dueCount = dueSoon.filter((d) => d.w.ratio >= 0.75).length;
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: MUTED, fontWeight: 500, letterSpacing: "0.03em" } }, "YOUR BIKE"), /* @__PURE__ */ React.createElement("div", { className: "g-h", style: { fontSize: 18 } }, data.bike.name))), /* @__PURE__ */ React.createElement("div", { style: { background: CARD, border: `0.5px solid ${BORDER}`, borderRadius: 16, padding: "16px 18px", marginBottom: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: MUTED, fontWeight: 500 } }, "total distance"), /* @__PURE__ */ React.createElement("div", { className: "g-mono g-h", style: { fontSize: 34, margin: "2px 0 8px" } }, fmt(data.bike.mileage), " ", /* @__PURE__ */ React.createElement("span", { style: { fontSize: 15, color: MUTED, fontWeight: 500 } }, "km")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, alignItems: "center" } }, dueCount > 0 && /* @__PURE__ */ React.createElement("span", { style: { background: ACCENT, color: ACCENT_INK, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 } }, dueCount, " part", dueCount > 1 ? "s" : "", " due"), /* @__PURE__ */ React.createElement("button", { className: "g-btn", style: { padding: "5px 12px", fontSize: 12 }, onClick: onEditMileage }, "update"))), dueSoon.length > 0 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 8 } }, "Due soon"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, overflowX: "auto", marginBottom: 18, paddingBottom: 4 } }, dueSoon.slice(0, 6).map(({ p, w }) => /* @__PURE__ */ React.createElement("div", { key: p.id, onClick: () => onOpenPart(p), style: { minWidth: 138, background: CARD, border: `0.5px solid ${BORDER}`, borderRadius: 12, padding: 12, flexShrink: 0, cursor: "pointer" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 8 } }, p.label), /* @__PURE__ */ React.createElement("div", { style: { height: 6, background: BORDER, borderRadius: 3, overflow: "hidden", marginBottom: 6 } }, /* @__PURE__ */ React.createElement("div", { style: { width: `${Math.min(w.ratio, 1) * 100}%`, height: "100%", background: wearColor(w.ratio) } })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: MUTED } }, w.ratio >= 1 ? `overdue ${fmt(Math.abs(w.remaining))} km` : `${fmt(w.remaining)} km left`))))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10 } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1, background: CARD, border: `0.5px solid ${BORDER}`, borderRadius: 12, padding: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: MUTED, marginBottom: 2 } }, "spent this year"), /* @__PURE__ */ React.createElement("div", { className: "g-mono", style: { fontSize: 17, fontWeight: 700, color: TEXT } }, yearCost ? `\u20AC${fmt(yearCost)}` : "\u2014")), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, background: CARD, border: `0.5px solid ${BORDER}`, borderRadius: 12, padding: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: MUTED, marginBottom: 2 } }, "last service"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 700, color: TEXT } }, lastService ? `${daysSince(lastService.date)}d ago` : "\u2014"))));
}
function BuildTab({ data, wearInfo, adding, setAdding, onAdd, onOpen }) {
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "g-h", style: { fontSize: 18, marginBottom: 12 } }, "Build"), CATEGORIES.map((cat) => {
    const parts = data.parts.filter((p) => p.cat === cat);
    if (!parts.length) return null;
    return /* @__PURE__ */ React.createElement("div", { key: cat, style: { marginBottom: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: MUTED, fontWeight: 600, marginBottom: 6, letterSpacing: "0.02em" } }, cat.toUpperCase()), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, parts.map((p) => {
      const w = wearInfo(p);
      return /* @__PURE__ */ React.createElement("div", { key: p.id, onClick: () => onOpen(p), style: { background: CARD, border: `0.5px solid ${BORDER}`, borderRadius: 10, padding: "10px 12px", cursor: "pointer" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: p.wearTracked ? 6 : 0 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, fontWeight: 600, color: TEXT } }, p.label), p.brand && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: MUTED } }, p.brand)), p.wearTracked ? /* @__PURE__ */ React.createElement("div", { className: "g-mono", style: { fontSize: 11, fontWeight: 700, color: wearColor(w.ratio), textAlign: "right" } }, w.ratio >= 1 ? `overdue ${fmt(Math.abs(w.remaining))}km` : `${fmt(w.remaining)}km left`) : /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: MUTED } }, p.installDate)), p.wearTracked && /* @__PURE__ */ React.createElement("div", { style: { height: 5, background: BORDER, borderRadius: 3, overflow: "hidden" } }, /* @__PURE__ */ React.createElement("div", { style: { width: `${Math.min(w.ratio, 1) * 100}%`, height: "100%", background: wearColor(w.ratio) } })));
    })));
  }), !data.parts.length && !adding && /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", color: MUTED, fontSize: 13, padding: "1.5rem 0" } }, "No parts logged yet."), !adding ? /* @__PURE__ */ React.createElement("button", { className: "g-btn", style: { width: "100%" }, onClick: () => setAdding(true) }, "+ add part") : /* @__PURE__ */ React.createElement(AddPartForm, { bikeMileage: 0, onCancel: () => setAdding(false), onSave: onAdd }));
}
function AddPartForm({ onCancel, onSave }) {
  const [typeId, setTypeId] = useState(TYPES[0].id);
  const t = typeOf(typeId);
  const [label, setLabel] = useState("");
  const [brand, setBrand] = useState("");
  const [wearTracked, setWearTracked] = useState(t.wear);
  const [intervalKm, setIntervalKm] = useState(t.km);
  const [installMileage, setInstallMileage] = useState("");
  const [cost, setCost] = useState("");
  const [weight, setWeight] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(today());
  function pickType(id) {
    setTypeId(id);
    const nt = typeOf(id);
    setWearTracked(nt.wear);
    setIntervalKm(nt.km);
  }
  return /* @__PURE__ */ React.createElement("div", { style: { background: CARD, border: `0.5px solid ${BORDER}`, borderRadius: 12, padding: 12, marginTop: 4 } }, /* @__PURE__ */ React.createElement("div", { className: "g-label" }, "Category"), /* @__PURE__ */ React.createElement("select", { className: "g-select", value: typeId, onChange: (e) => pickType(e.target.value), style: { marginBottom: 8 } }, CATEGORIES.map((c) => /* @__PURE__ */ React.createElement("optgroup", { key: c, label: c }, TYPES.filter((t2) => t2.cat === c).map((t2) => /* @__PURE__ */ React.createElement("option", { key: t2.id, value: t2.id }, t2.label))))), /* @__PURE__ */ React.createElement("input", { className: "g-input", placeholder: "Custom label (optional)", value: label, onChange: (e) => setLabel(e.target.value), style: { marginBottom: 8 } }), /* @__PURE__ */ React.createElement("input", { className: "g-input", placeholder: "Brand / model", value: brand, onChange: (e) => setBrand(e.target.value), style: { marginBottom: 8 } }), /* @__PURE__ */ React.createElement("label", { style: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: TEXT, marginBottom: 8 } }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: wearTracked, onChange: (e) => setWearTracked(e.target.checked) }), "Track wear by distance"), wearTracked && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { className: "g-label" }, "Interval (km)"), /* @__PURE__ */ React.createElement("input", { className: "g-input", type: "number", value: intervalKm, onChange: (e) => setIntervalKm(e.target.value) })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { className: "g-label" }, "Installed at (km)"), /* @__PURE__ */ React.createElement("input", { className: "g-input", type: "number", placeholder: "0", value: installMileage, onChange: (e) => setInstallMileage(e.target.value) }))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { className: "g-label" }, "Cost"), /* @__PURE__ */ React.createElement("input", { className: "g-input", type: "number", value: cost, onChange: (e) => setCost(e.target.value) })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { className: "g-label" }, "Weight (g)"), /* @__PURE__ */ React.createElement("input", { className: "g-input", type: "number", value: weight, onChange: (e) => setWeight(e.target.value) }))), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 10 } }, /* @__PURE__ */ React.createElement("div", { className: "g-label" }, "Purchase date"), /* @__PURE__ */ React.createElement("input", { className: "g-input", type: "date", value: purchaseDate, onChange: (e) => setPurchaseDate(e.target.value) })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { className: "g-btn g-solid", style: { flex: 1 }, onClick: () => onSave({
    id: uid(),
    typeId,
    cat: t.cat,
    label: label || t.label,
    brand,
    wearTracked,
    intervalKm: Number(intervalKm) || 0,
    installMileage: Number(installMileage) || 0,
    installDate: purchaseDate,
    cost: Number(cost) || 0,
    weight: Number(weight) || 0,
    purchaseDate
  }) }, "Add part"), /* @__PURE__ */ React.createElement("button", { className: "g-btn", style: { flex: 1 }, onClick: onCancel }, "Cancel")));
}
function PartDetail({ part, bike, logs, onUpdate, onDelete }) {
  const [editCost, setEditCost] = useState(part.cost || "");
  const used = bike.mileage - (Number(part.installMileage) || 0);
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: MUTED, marginBottom: 10 } }, part.cat, " \\u00b7 installed ", part.installDate, " at ", fmt(part.installMileage), " km"), part.wearTracked && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 12, color: MUTED, marginBottom: 10 } }, fmt(used), " / ", fmt(part.intervalKm), " km since install"), logs.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { className: "g-label" }, "Related entries"), logs.map((l) => /* @__PURE__ */ React.createElement("div", { key: l.id, style: { fontSize: 12, display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${BORDER}` } }, /* @__PURE__ */ React.createElement("span", { style: { color: TEXT } }, l.note), /* @__PURE__ */ React.createElement("span", { className: "g-mono", style: { color: MUTED } }, l.date)))), /* @__PURE__ */ React.createElement("div", { className: "g-label" }, "Cost"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 14 } }, /* @__PURE__ */ React.createElement("input", { className: "g-input", type: "number", value: editCost, onChange: (e) => setEditCost(e.target.value) }), /* @__PURE__ */ React.createElement("button", { className: "g-btn", onClick: () => onUpdate({ cost: Number(editCost) || 0 }) }, "Save")), /* @__PURE__ */ React.createElement("button", { className: "g-btn g-danger", style: { width: "100%" }, onClick: onDelete }, "Delete part"));
}
function HistoryTab({ data, filter, setFilter, onOpen }) {
  const filtered = filter === "all" ? data.logs : data.logs.filter((l) => l.type === filter);
  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "g-h", style: { fontSize: 18, marginBottom: 12 } }, "History"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, overflowX: "auto", marginBottom: 14 } }, ["all", ...LOG_TYPES.map((t) => t.id)].map((f) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: f,
      onClick: () => setFilter(f),
      style: { flexShrink: 0, fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 20, border: `1px solid ${f === filter ? ACCENT : BORDER}`, background: f === filter ? ACCENT : "transparent", color: f === filter ? ACCENT_INK : MUTED, cursor: "pointer" }
    },
    f === "all" ? "All" : LOG_TYPES.find((t) => t.id === f).label
  ))), !sorted.length && /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", color: MUTED, fontSize: 13, padding: "1.5rem 0" } }, "Nothing logged here yet."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8 } }, sorted.map((l) => {
    const lt = LOG_TYPES.find((t) => t.id === l.type);
    return /* @__PURE__ */ React.createElement("div", { key: l.id, onClick: () => onOpen(l), style: { background: CARD, border: `0.5px solid ${BORDER}`, borderRadius: 10, padding: "10px 12px", display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer" } }, /* @__PURE__ */ React.createElement("i", { className: `ti ${lt?.icon}`, style: { fontSize: 16, color: ACCENT, marginTop: 2 }, "aria-hidden": "true" }), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 600, color: TEXT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, l.note || lt?.label), /* @__PURE__ */ React.createElement("div", { className: "g-mono", style: { fontSize: 11, color: MUTED } }, l.date, " \\u00b7 ", fmt(l.mileage), "km", l.cost ? ` \xB7 \u20AC${fmt(l.cost)}` : "")), l.photo && /* @__PURE__ */ React.createElement("i", { className: "ti ti-photo", style: { fontSize: 14, color: MUTED }, "aria-hidden": "true" }));
  })));
}
function LogDetail({ log, parts, onDelete }) {
  const linked = parts.filter((p) => (log.partIds || []).includes(p.id));
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "g-mono", style: { fontSize: 12, color: MUTED, marginBottom: 10 } }, log.date, " \\u00b7 ", fmt(log.mileage), " km", log.cost ? ` \xB7 \u20AC${fmt(log.cost)}` : ""), log.shopName && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: TEXT, marginBottom: 8 } }, "Shop: ", log.shopName), log.severity && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: DANGER, marginBottom: 8 } }, "Severity: ", log.severity), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 14, color: TEXT, marginBottom: 12, lineHeight: 1.5 } }, log.note), linked.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { className: "g-label" }, "Parts"), linked.map((p) => /* @__PURE__ */ React.createElement("div", { key: p.id, style: { fontSize: 13, color: TEXT } }, p.label))), log.photo && /* @__PURE__ */ React.createElement("img", { src: log.photo, alt: "Log entry", style: { width: "100%", borderRadius: 10, marginBottom: 12 } }), /* @__PURE__ */ React.createElement("button", { className: "g-btn g-danger", style: { width: "100%" }, onClick: onDelete }, "Delete entry"));
}
function LogForm({ type, bike, parts, onSave, onCancel }) {
  const [date, setDate] = useState(today());
  const [mileage, setMileage] = useState(bike.mileage);
  const [note, setNote] = useState("");
  const [cost, setCost] = useState("");
  const [shopName, setShopName] = useState("");
  const [severity, setSeverity] = useState("minor");
  const [partIds, setPartIds] = useState([]);
  const [resetIds, setResetIds] = useState([]);
  const [photo, setPhoto] = useState(null);
  const fileRef = useRef(null);
  async function handleFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    const dataUrl = await compressImage(f);
    setPhoto(dataUrl);
  }
  function togglePart(id) {
    setPartIds((cur) => cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
  }
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { className: "g-label" }, "Date"), /* @__PURE__ */ React.createElement("input", { className: "g-input", type: "date", value: date, onChange: (e) => setDate(e.target.value) })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { className: "g-label" }, "Mileage (km)"), /* @__PURE__ */ React.createElement("input", { className: "g-input", type: "number", value: mileage, onChange: (e) => setMileage(e.target.value) }))), type === "service" && /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 8 } }, /* @__PURE__ */ React.createElement("div", { className: "g-label" }, 'Shop (or "self")'), /* @__PURE__ */ React.createElement("input", { className: "g-input", value: shopName, onChange: (e) => setShopName(e.target.value), placeholder: "Self" })), type === "accident" && /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 8 } }, /* @__PURE__ */ React.createElement("div", { className: "g-label" }, "Severity"), /* @__PURE__ */ React.createElement("select", { className: "g-select", value: severity, onChange: (e) => setSeverity(e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "minor" }, "Minor"), /* @__PURE__ */ React.createElement("option", { value: "moderate" }, "Moderate"), /* @__PURE__ */ React.createElement("option", { value: "severe" }, "Severe"))), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 8 } }, /* @__PURE__ */ React.createElement("div", { className: "g-label" }, type === "note" ? "What's up" : "What did you do"), /* @__PURE__ */ React.createElement("textarea", { className: "g-textarea", rows: 3, value: note, onChange: (e) => setNote(e.target.value), placeholder: type === "note" ? "Creaking noise near the BB, couldn't source it" : "Replaced chain, cleaned drivetrain" })), (type === "service" || type === "maintenance" || type === "accident") && parts.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 8 } }, /* @__PURE__ */ React.createElement("div", { className: "g-label" }, "Parts involved (optional)"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 } }, parts.map((p) => /* @__PURE__ */ React.createElement(
    "span",
    {
      key: p.id,
      onClick: () => togglePart(p.id),
      style: { fontSize: 12, padding: "5px 10px", borderRadius: 16, border: `1px solid ${partIds.includes(p.id) ? ACCENT : BORDER}`, background: partIds.includes(p.id) ? ACCENT : "transparent", color: partIds.includes(p.id) ? ACCENT_INK : MUTED, cursor: "pointer" }
    },
    p.label
  )))), type === "maintenance" && partIds.filter((id) => parts.find((p) => p.id === id)?.wearTracked).length > 0 && /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 8 } }, partIds.filter((id) => parts.find((p) => p.id === id)?.wearTracked).map((id) => {
    const p = parts.find((x) => x.id === id);
    return /* @__PURE__ */ React.createElement("label", { key: id, style: { display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: TEXT, marginBottom: 4 } }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: resetIds.includes(id), onChange: (e) => setResetIds((cur) => e.target.checked ? [...cur, id] : cur.filter((x) => x !== id)) }), "Reset wear clock for ", p.label, " (replaced, not adjusted)");
  })), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 8 } }, /* @__PURE__ */ React.createElement("div", { className: "g-label" }, "Cost (optional)"), /* @__PURE__ */ React.createElement("input", { className: "g-input", type: "number", value: cost, onChange: (e) => setCost(e.target.value) })), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 12 } }, /* @__PURE__ */ React.createElement("div", { className: "g-label" }, "Photo"), /* @__PURE__ */ React.createElement("input", { ref: fileRef, type: "file", accept: "image/*", onChange: handleFile, style: { display: "none" } }), photo ? /* @__PURE__ */ React.createElement("div", { style: { position: "relative" } }, /* @__PURE__ */ React.createElement("img", { src: photo, alt: "preview", style: { width: "100%", borderRadius: 10 } }), /* @__PURE__ */ React.createElement("button", { className: "g-btn", style: { position: "absolute", top: 8, right: 8, padding: "4px 8px", fontSize: 11 }, onClick: () => setPhoto(null) }, "Remove")) : /* @__PURE__ */ React.createElement("button", { className: "g-btn", style: { width: "100%" }, onClick: () => fileRef.current.click() }, /* @__PURE__ */ React.createElement("i", { className: "ti ti-camera", style: { marginRight: 6 }, "aria-hidden": "true" }), "Add photo")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { className: "g-btn g-solid", style: { flex: 1 }, onClick: () => onSave({
    id: uid(),
    type,
    date,
    mileage: Number(mileage) || 0,
    note,
    cost: Number(cost) || 0,
    shopName: type === "service" ? shopName || "Self" : void 0,
    severity: type === "accident" ? severity : void 0,
    partIds,
    resetIds,
    photo
  }) }, "Save entry"), /* @__PURE__ */ React.createElement("button", { className: "g-btn", style: { flex: 1 }, onClick: onCancel }, "Cancel")));
}
function ProfileTab({ data, totalCost, totalWeight, costPerKm, onEdit }) {
  const { bike } = data;
  const ageDays = bike.purchaseDate ? daysSince(bike.purchaseDate) : null;
  function exportData() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${bike.name || "bike"}-backup.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 } }, /* @__PURE__ */ React.createElement("div", { className: "g-h", style: { fontSize: 18 } }, bike.name), /* @__PURE__ */ React.createElement("button", { className: "g-btn", style: { padding: "5px 12px", fontSize: 12 }, onClick: onEdit }, "Edit")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 } }, /* @__PURE__ */ React.createElement(Metric, { label: "total distance", value: `${fmt(bike.mileage)} km` }), /* @__PURE__ */ React.createElement(Metric, { label: "bike age", value: ageDays !== null ? `${Math.floor(ageDays / 30)} mo` : "\u2014" }), /* @__PURE__ */ React.createElement(Metric, { label: "total spent", value: `\u20AC${fmt(totalCost)}` }), /* @__PURE__ */ React.createElement(Metric, { label: "cost / km", value: costPerKm ? `\u20AC${costPerKm.toFixed(2)}` : "\u2014" }), /* @__PURE__ */ React.createElement(Metric, { label: "total weight", value: totalWeight ? `${(totalWeight / 1e3).toFixed(2)} kg` : "\u2014" }), /* @__PURE__ */ React.createElement(Metric, { label: "frame size", value: bike.frameSize || "\u2014" })), /* @__PURE__ */ React.createElement("div", { style: { background: CARD, border: `0.5px solid ${BORDER}`, borderRadius: 12, padding: 14, marginBottom: 16 } }, /* @__PURE__ */ React.createElement("div", { className: "g-label" }, "Ownership"), /* @__PURE__ */ React.createElement(Row, { k: "Brand / model", v: bike.brand || "\u2014" }), /* @__PURE__ */ React.createElement(Row, { k: "Purchased", v: bike.purchaseDate || "\u2014" }), /* @__PURE__ */ React.createElement(Row, { k: "Purchase price", v: bike.purchasePrice ? `\u20AC${fmt(bike.purchasePrice)}` : "\u2014" }), /* @__PURE__ */ React.createElement(Row, { k: "Warranty", v: bike.warranty || "\u2014" })), bike.notes && /* @__PURE__ */ React.createElement("div", { style: { background: CARD, border: `0.5px solid ${BORDER}`, borderRadius: 12, padding: 14, marginBottom: 16 } }, /* @__PURE__ */ React.createElement("div", { className: "g-label" }, "Notes"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: TEXT, lineHeight: 1.5 } }, bike.notes)), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 8 } }, "Full build sheet"), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 20 } }, data.parts.length === 0 && /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, color: MUTED } }, "No parts added yet \\u2014 add them in Build."), data.parts.map((p) => /* @__PURE__ */ React.createElement("div", { key: p.id, style: { display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${BORDER}`, fontSize: 13 } }, /* @__PURE__ */ React.createElement("span", { style: { color: TEXT } }, p.label), /* @__PURE__ */ React.createElement("span", { style: { color: MUTED } }, p.brand || "\u2014")))), /* @__PURE__ */ React.createElement("button", { className: "g-btn", style: { width: "100%" }, onClick: exportData }, /* @__PURE__ */ React.createElement("i", { className: "ti ti-download", style: { marginRight: 6 }, "aria-hidden": "true" }), "Export backup"));
}
function Metric({ label, value }) {
  return /* @__PURE__ */ React.createElement("div", { style: { background: CARD, border: `0.5px solid ${BORDER}`, borderRadius: 12, padding: 12 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, color: MUTED, marginBottom: 2 } }, label), /* @__PURE__ */ React.createElement("div", { className: "g-mono", style: { fontSize: 17, fontWeight: 700, color: TEXT } }, value));
}
function Row({ k, v }) {
  return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 13 } }, /* @__PURE__ */ React.createElement("span", { style: { color: MUTED } }, k), /* @__PURE__ */ React.createElement("span", { style: { color: TEXT } }, v));
}
function QuickMileage({ value, onSave }) {
  const [v, setV] = useState(value);
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("input", { className: "g-input", type: "number", autoFocus: true, value: v, onChange: (e) => setV(e.target.value), style: { marginBottom: 12, fontSize: 20, textAlign: "center" } }), /* @__PURE__ */ React.createElement("button", { className: "g-btn g-solid", style: { width: "100%" }, onClick: () => onSave(Number(v) || 0) }, "Save"));
}
function BikeForm({ bike, onSave, onCancel }) {
  const [f, setF] = useState(bike);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "g-label" }, "Name"), /* @__PURE__ */ React.createElement("input", { className: "g-input", value: f.name, onChange: set("name"), placeholder: "Prologue Britannia", style: { marginBottom: 8 } }), /* @__PURE__ */ React.createElement("div", { className: "g-label" }, "Brand / model"), /* @__PURE__ */ React.createElement("input", { className: "g-input", value: f.brand, onChange: set("brand"), style: { marginBottom: 8 } }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { className: "g-label" }, "Frame size"), /* @__PURE__ */ React.createElement("input", { className: "g-input", value: f.frameSize, onChange: set("frameSize") })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { className: "g-label" }, "Current km"), /* @__PURE__ */ React.createElement("input", { className: "g-input", type: "number", value: f.mileage, onChange: set("mileage") }))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, marginBottom: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { className: "g-label" }, "Purchase date"), /* @__PURE__ */ React.createElement("input", { className: "g-input", type: "date", value: f.purchaseDate, onChange: set("purchaseDate") })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1 } }, /* @__PURE__ */ React.createElement("div", { className: "g-label" }, "Purchase price"), /* @__PURE__ */ React.createElement("input", { className: "g-input", type: "number", value: f.purchasePrice, onChange: set("purchasePrice") }))), /* @__PURE__ */ React.createElement("div", { className: "g-label" }, "Warranty notes"), /* @__PURE__ */ React.createElement("input", { className: "g-input", value: f.warranty, onChange: set("warranty"), style: { marginBottom: 8 } }), /* @__PURE__ */ React.createElement("div", { className: "g-label" }, "Notes"), /* @__PURE__ */ React.createElement("textarea", { className: "g-textarea", rows: 3, value: f.notes, onChange: set("notes"), style: { marginBottom: 12 } }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, /* @__PURE__ */ React.createElement("button", { className: "g-btn g-solid", style: { flex: 1 }, disabled: !f.name, onClick: () => onSave({ ...f, mileage: Number(f.mileage) || 0 }) }, "Save"), onCancel && /* @__PURE__ */ React.createElement("button", { className: "g-btn", style: { flex: 1 }, onClick: onCancel }, "Cancel")));
}
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(Garage));

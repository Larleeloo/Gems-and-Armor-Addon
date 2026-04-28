import { world, system, EquipmentSlot } from "@minecraft/server";

const SHRUNK_KEY = "gaa:shrunk";
const SHRUNK_SCALE = 0.111;
const NORMAL_SCALE = 1;

const REQUIRED_ARMOR = [
  [EquipmentSlot.Head, "gaa:shrinking_helmet"],
  [EquipmentSlot.Chest, "gaa:shrinking_chestplate"],
  [EquipmentSlot.Legs, "gaa:shrinking_leggings"],
  [EquipmentSlot.Feet, "gaa:shrinking_boots"]
];

function hasFullSet(player) {
  const equippable = player.getComponent("minecraft:equippable");
  if (!equippable) return false;
  for (const [slot, id] of REQUIRED_ARMOR) {
    const item = equippable.getEquipment(slot);
    if (!item || item.typeId !== id) return false;
  }
  return true;
}

function setScale(player, scale) {
  player.runCommand(`attribute @s minecraft:scale base set ${scale}`);
}

function shrink(player) {
  setScale(player, SHRUNK_SCALE);
  player.setDynamicProperty(SHRUNK_KEY, true);
  player.sendMessage("§dYou shrink down to gem size!");
}

function unshrink(player) {
  setScale(player, NORMAL_SCALE);
  player.setDynamicProperty(SHRUNK_KEY, false);
  player.sendMessage("§dYou return to normal size.");
}

world.afterEvents.itemUse.subscribe((ev) => {
  const player = ev.source;
  const item = ev.itemStack;
  if (!item || item.typeId !== "gaa:raw_shrinking_gem") return;
  if (player.typeId !== "minecraft:player") return;

  const isShrunk = player.getDynamicProperty(SHRUNK_KEY) === true;

  if (isShrunk) {
    unshrink(player);
    return;
  }

  if (!hasFullSet(player)) {
    player.sendMessage("§7You need the full Shrinking armor set to shrink.");
    return;
  }

  shrink(player);
});

world.afterEvents.playerSpawn.subscribe((ev) => {
  const player = ev.player;
  if (player.getDynamicProperty(SHRUNK_KEY) === true) {
    setScale(player, SHRUNK_SCALE);
  }
});

system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    if (player.getDynamicProperty(SHRUNK_KEY) === true && !hasFullSet(player)) {
      unshrink(player);
    }
  }
}, 20);

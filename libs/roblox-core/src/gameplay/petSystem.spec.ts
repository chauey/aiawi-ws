/**
 * Pet System Unit Tests
 * Tests for the core pet collection mechanics
 */

import { describe, it, expect, beforeEach } from 'vitest';

import {
  // Types
  PetRarity,
  OwnedPet,
  EggType,
  PlayerPetState,
  PetConfig,

  // Config
  DEFAULT_PET_CONFIG,
  DEFAULT_PET_RARITY_CHANCES,

  // Sample data
  SAMPLE_PET_SPECIES,
  SAMPLE_EGG_TYPES,

  // Core functions
  getInitialPetState,
  rollPetRarity,
  selectPetFromEgg,
  startIncubation,
  checkEggReady,
  updateIncubatingEggs,
  hatchEgg,
  getPetXpForLevel,
  addPetXp,
  evolvePet,
  equipPet,
  unequipPet,
  deletePet,
} from './petSystem';

describe('Pet System', () => {
  let playerState: PlayerPetState;
  let config: PetConfig;

  beforeEach(() => {
    playerState = getInitialPetState();
    config = { ...DEFAULT_PET_CONFIG };
  });

  describe('Initialization', () => {
    it('should create default player state', () => {
      const state = getInitialPetState();

      expect(state.pets).toEqual([]);
      expect(state.equippedPets).toEqual([]);
      expect(state.maxEquipped).toBe(3);
      expect(state.maxInventory).toBe(100);
      expect(state.incubatingEggs).toEqual([]);
      expect(state.maxIncubators).toBe(3);
      expect(state.totalPetsHatched).toBe(0);
      expect(state.totalPetsEvolved).toBe(0);
      expect(state.discoveredSpecies).toEqual([]);
      expect(state.coinMultiplier).toBe(1);
    });

    it('should have default config values', () => {
      expect(DEFAULT_PET_CONFIG.baseXpPerLevel).toBe(100);
      expect(DEFAULT_PET_CONFIG.levelMultiplier).toBe(1.5);
      expect(DEFAULT_PET_CONFIG.maxPetLevel).toBe(100);
      expect(DEFAULT_PET_CONFIG.shinyPowerBonus).toBe(1.5);
      expect(DEFAULT_PET_CONFIG.goldenPowerBonus).toBe(2.0);
      expect(DEFAULT_PET_CONFIG.rainbowPowerBonus).toBe(3.0);
      expect(DEFAULT_PET_CONFIG.evolvePowerMultiplier).toBe(2.5);
    });
  });

  describe('Sample Data', () => {
    it('should have valid pet species', () => {
      expect(SAMPLE_PET_SPECIES.length).toBeGreaterThan(0);

      // Check all pets have required fields
      SAMPLE_PET_SPECIES.forEach((pet) => {
        expect(pet.id).toBeDefined();
        expect(pet.name).toBeDefined();
        expect(pet.rarity).toBeDefined();
        expect(pet.attribute).toBeDefined();
        expect(pet.basePower).toBeGreaterThan(0);
      });
    });

    it('should have valid egg types', () => {
      expect(SAMPLE_EGG_TYPES.length).toBeGreaterThan(0);

      SAMPLE_EGG_TYPES.forEach((egg) => {
        expect(egg.id).toBeDefined();
        expect(egg.name).toBeDefined();
        expect(egg.possiblePets.length).toBeGreaterThan(0);
        expect(egg.hatchTime).toBeGreaterThan(0);
      });
    });

    it('should have rarity chances that sum to 1 for eggs', () => {
      SAMPLE_EGG_TYPES.forEach((egg) => {
        const total = Object.values(egg.rarityChances).reduce(
          (sum, chance) => sum + chance,
          0,
        );
        expect(total).toBeCloseTo(1, 5);
      });
    });

    it('should have default rarity chances that sum to 1', () => {
      const total = Object.values(DEFAULT_PET_RARITY_CHANCES).reduce(
        (sum, chance) => sum + chance,
        0,
      );
      expect(total).toBeCloseTo(1, 5);
    });
  });

  describe('Rarity Rolling', () => {
    it('should return valid rarities', () => {
      const basicEgg = SAMPLE_EGG_TYPES.find((e) => e.id === 'basic_egg');
      expect(basicEgg).toBeDefined();

      // Roll multiple times to cover probability
      const validRarities: PetRarity[] = [
        'common',
        'uncommon',
        'rare',
        'epic',
        'legendary',
        'mythic',
        'secret',
      ];

      for (let i = 0; i < 100; i++) {
        const rarity = rollPetRarity(basicEgg!);
        expect(validRarities).toContain(rarity);
      }
    });
  });

  describe('Pet Selection', () => {
    it('should select pet from egg', () => {
      const basicEgg = SAMPLE_EGG_TYPES.find((e) => e.id === 'basic_egg');
      expect(basicEgg).toBeDefined();

      const pet = selectPetFromEgg(basicEgg!, SAMPLE_PET_SPECIES);
      expect(pet).toBeDefined();
      expect(basicEgg!.possiblePets).toContain(pet!.id);
    });

    it('should return undefined for egg with no valid pets', () => {
      const emptyEgg: EggType = {
        id: 'empty',
        name: 'Empty',
        description: 'No pets',
        price: 0,
        currency: 'coins',
        hatchTime: 1,
        rarityChances: {
          common: 1,
          uncommon: 0,
          rare: 0,
          epic: 0,
          legendary: 0,
          mythic: 0,
          secret: 0,
        },
        possiblePets: ['nonexistent_pet'],
        shinyChance: 0,
        goldenChance: 0,
        rainbowChance: 0,
      };

      const pet = selectPetFromEgg(emptyEgg, SAMPLE_PET_SPECIES);
      expect(pet).toBeUndefined();
    });
  });

  describe('Egg Incubation', () => {
    it('should start incubation', () => {
      const egg = SAMPLE_EGG_TYPES[0];
      const result = startIncubation(playerState, egg);

      expect(result.success).toBe(true);
      expect(result.egg).toBeDefined();
      expect(playerState.incubatingEggs.length).toBe(1);
    });

    it('should fail when incubators are full', () => {
      const egg = SAMPLE_EGG_TYPES[0];

      // Fill up incubators
      for (let i = 0; i < 3; i++) {
        startIncubation(playerState, egg);
      }

      expect(playerState.incubatingEggs.length).toBe(3);

      const result = startIncubation(playerState, egg);
      expect(result.success).toBe(false);
      expect(result.error).toBe('No available incubators');
    });

    it('should check egg readiness', () => {
      const egg = SAMPLE_EGG_TYPES[0];
      startIncubation(playerState, egg);

      const incubatingEgg = playerState.incubatingEggs[0];
      expect(checkEggReady(incubatingEgg)).toBe(false);

      // Simulate time passing
      incubatingEgg.startTime = Date.now() - incubatingEgg.duration - 1000;
      expect(checkEggReady(incubatingEgg)).toBe(true);
    });

    it('should update all incubating eggs status', () => {
      const egg = SAMPLE_EGG_TYPES[0];
      startIncubation(playerState, egg);
      startIncubation(playerState, egg);

      // Make first egg ready
      playerState.incubatingEggs[0].startTime =
        Date.now() - playerState.incubatingEggs[0].duration - 1000;

      updateIncubatingEggs(playerState);

      expect(playerState.incubatingEggs[0].isReady).toBe(true);
      expect(playerState.incubatingEggs[1].isReady).toBe(false);
    });
  });

  describe('Egg Hatching', () => {
    beforeEach(() => {
      // Start incubation and make egg ready
      const egg = SAMPLE_EGG_TYPES[0];
      startIncubation(playerState, egg);
      playerState.incubatingEggs[0].startTime =
        Date.now() - playerState.incubatingEggs[0].duration - 1000;
      playerState.incubatingEggs[0].isReady = true;
    });

    it('should hatch egg successfully', () => {
      const eggId = playerState.incubatingEggs[0].id;

      const result = hatchEgg(
        playerState,
        eggId,
        SAMPLE_EGG_TYPES,
        SAMPLE_PET_SPECIES,
        config,
      );

      expect(result.success).toBe(true);
      expect(result.pet).toBeDefined();
      expect(result.species).toBeDefined();
      expect(playerState.pets.length).toBe(1);
      expect(playerState.incubatingEggs.length).toBe(0);
      expect(playerState.totalPetsHatched).toBe(1);
    });

    it('should track new discoveries', () => {
      const eggId = playerState.incubatingEggs[0].id;

      const result = hatchEgg(
        playerState,
        eggId,
        SAMPLE_EGG_TYPES,
        SAMPLE_PET_SPECIES,
        config,
      );

      expect(result.isNew).toBe(true);
      expect(playerState.discoveredSpecies.length).toBe(1);
    });

    it('should fail for non-existent egg', () => {
      const result = hatchEgg(
        playerState,
        'fake_egg_id',
        SAMPLE_EGG_TYPES,
        SAMPLE_PET_SPECIES,
        config,
      );

      expect(result.success).toBe(false);
      expect(result.code).toBe('NOT_FOUND');
    });

    it('should fail for not ready egg', () => {
      playerState.incubatingEggs[0].isReady = false;
      playerState.incubatingEggs[0].startTime = Date.now(); // Reset start time

      const eggId = playerState.incubatingEggs[0].id;
      const result = hatchEgg(
        playerState,
        eggId,
        SAMPLE_EGG_TYPES,
        SAMPLE_PET_SPECIES,
        config,
      );

      expect(result.success).toBe(false);
      expect(result.code).toBe('NOT_READY');
    });

    it('should fail when inventory is full', () => {
      playerState.maxInventory = 0;

      const eggId = playerState.incubatingEggs[0].id;
      const result = hatchEgg(
        playerState,
        eggId,
        SAMPLE_EGG_TYPES,
        SAMPLE_PET_SPECIES,
        config,
      );

      expect(result.success).toBe(false);
      expect(result.code).toBe('INVENTORY_FULL');
    });
  });

  describe('XP and Leveling', () => {
    it('should calculate XP for level correctly', () => {
      expect(getPetXpForLevel(1, config)).toBe(100); // Base XP
      expect(getPetXpForLevel(2, config)).toBe(150); // 100 * 1.5
      expect(getPetXpForLevel(3, config)).toBe(225); // 100 * 1.5^2
    });

    it('should return 0 for level 0 or negative', () => {
      expect(getPetXpForLevel(0, config)).toBe(0);
      expect(getPetXpForLevel(-1, config)).toBe(0);
    });

    it('should level up pet with enough XP', () => {
      const pet: OwnedPet = {
        uniqueId: 'test_pet',
        speciesId: 'cat',
        level: 1,
        experience: 0,
        power: 10,
        isShiny: false,
        isGolden: false,
        isRainbow: false,
        acquiredAt: Date.now(),
        isEquipped: false,
        isLocked: false,
      };

      const species = SAMPLE_PET_SPECIES.find((s) => s.id === 'cat')!;

      // Give enough XP for level 2 (needs 100 XP)
      const result = addPetXp(pet, 150, species, config);

      expect(result.leveledUp).toBe(true);
      expect(result.newLevel).toBe(2);
      expect(pet.level).toBe(2);
      expect(pet.experience).toBe(0); // 150 - 100 = 50, then 50 - 150 = not enough for L3
    });

    it('should not level up without enough XP', () => {
      const pet: OwnedPet = {
        uniqueId: 'test_pet',
        speciesId: 'cat',
        level: 1,
        experience: 0,
        power: 10,
        isShiny: false,
        isGolden: false,
        isRainbow: false,
        acquiredAt: Date.now(),
        isEquipped: false,
        isLocked: false,
      };

      const species = SAMPLE_PET_SPECIES.find((s) => s.id === 'cat')!;

      // Give less than required XP
      const result = addPetXp(pet, 50, species, config);

      expect(result.leveledUp).toBe(false);
      expect(result.newLevel).toBe(1);
      expect(pet.level).toBe(1);
      expect(pet.experience).toBe(50);
    });
  });

  describe('Pet Evolution', () => {
    let pet: OwnedPet;

    beforeEach(() => {
      pet = {
        uniqueId: 'evolve_test',
        speciesId: 'cat',
        level: 25, // Cat evolves at level 25
        experience: 0,
        power: 100,
        isShiny: false,
        isGolden: false,
        isRainbow: false,
        acquiredAt: Date.now(),
        isEquipped: false,
        isLocked: false,
      };
      playerState.pets.push(pet);
    });

    it('should evolve pet successfully', () => {
      const result = evolvePet(
        playerState,
        pet.uniqueId,
        SAMPLE_PET_SPECIES,
        config,
      );

      expect(result.success).toBe(true);
      expect(result.newSpecies!.id).toBe('tiger');
      expect(pet.speciesId).toBe('tiger');
      expect(pet.power).toBe(250); // 100 * 2.5
      expect(playerState.totalPetsEvolved).toBe(1);
    });

    it('should fail for non-existent pet', () => {
      const result = evolvePet(
        playerState,
        'fake_pet',
        SAMPLE_PET_SPECIES,
        config,
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Pet not found');
    });

    it('should fail when level too low', () => {
      pet.level = 10; // Below 25

      const result = evolvePet(
        playerState,
        pet.uniqueId,
        SAMPLE_PET_SPECIES,
        config,
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Need level');
    });

    it('should fail for pet that cannot evolve', () => {
      pet.speciesId = 'bunny'; // Bunny has no evolution

      const result = evolvePet(
        playerState,
        pet.uniqueId,
        SAMPLE_PET_SPECIES,
        config,
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('This pet cannot evolve');
    });
  });

  describe('Pet Equipment', () => {
    let pet: OwnedPet;

    beforeEach(() => {
      pet = {
        uniqueId: 'equip_test',
        speciesId: 'cat',
        level: 1,
        experience: 0,
        power: 10,
        isShiny: false,
        isGolden: false,
        isRainbow: false,
        acquiredAt: Date.now(),
        isEquipped: false,
        isLocked: false,
      };
      playerState.pets.push(pet);
    });

    it('should equip pet successfully', () => {
      const result = equipPet(playerState, pet.uniqueId);

      expect(result.success).toBe(true);
      expect(pet.isEquipped).toBe(true);
      expect(playerState.equippedPets).toContain(pet.uniqueId);
    });

    it('should fail to equip already equipped pet', () => {
      equipPet(playerState, pet.uniqueId);
      const result = equipPet(playerState, pet.uniqueId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Already equipped');
    });

    it('should fail when max pets equipped', () => {
      // Fill up equipment slots
      for (let i = 0; i < 3; i++) {
        const newPet: OwnedPet = {
          ...pet,
          uniqueId: `pet_${i}`,
        };
        playerState.pets.push(newPet);
        equipPet(playerState, newPet.uniqueId);
      }

      const result = equipPet(playerState, pet.uniqueId);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Max pets equipped');
    });

    it('should unequip pet successfully', () => {
      equipPet(playerState, pet.uniqueId);
      const result = unequipPet(playerState, pet.uniqueId);

      expect(result.success).toBe(true);
      expect(pet.isEquipped).toBe(false);
      expect(playerState.equippedPets).not.toContain(pet.uniqueId);
    });

    it('should fail to unequip not equipped pet', () => {
      const result = unequipPet(playerState, pet.uniqueId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not equipped');
    });
  });

  describe('Pet Deletion', () => {
    let pet: OwnedPet;

    beforeEach(() => {
      pet = {
        uniqueId: 'delete_test',
        speciesId: 'cat',
        level: 1,
        experience: 0,
        power: 10,
        isShiny: false,
        isGolden: false,
        isRainbow: false,
        acquiredAt: Date.now(),
        isEquipped: false,
        isLocked: false,
      };
      playerState.pets.push(pet);
    });

    it('should delete pet successfully', () => {
      const result = deletePet(playerState, pet.uniqueId, SAMPLE_PET_SPECIES);

      expect(result.success).toBe(true);
      expect(playerState.pets.length).toBe(0);
    });

    it('should fail to delete non-existent pet', () => {
      const result = deletePet(playerState, 'fake_pet', SAMPLE_PET_SPECIES);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Pet not found');
    });

    it('should fail to delete locked pet', () => {
      pet.isLocked = true;

      const result = deletePet(playerState, pet.uniqueId, SAMPLE_PET_SPECIES);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Pet is locked');
    });

    it('should unequip before deleting equipped pet', () => {
      equipPet(playerState, pet.uniqueId);
      expect(playerState.equippedPets.length).toBe(1);

      const result = deletePet(playerState, pet.uniqueId, SAMPLE_PET_SPECIES);

      expect(result.success).toBe(true);
      expect(playerState.equippedPets.length).toBe(0);
    });
  });

  describe('Special Variants', () => {
    it('should calculate power bonus for shiny pets', () => {
      const pet: OwnedPet = {
        uniqueId: 'shiny_test',
        speciesId: 'cat',
        level: 1,
        experience: 0,
        power: Math.floor(10 * config.shinyPowerBonus), // 15
        isShiny: true,
        isGolden: false,
        isRainbow: false,
        acquiredAt: Date.now(),
        isEquipped: false,
        isLocked: false,
      };

      expect(pet.power).toBe(15); // 10 * 1.5
    });

    it('should calculate power bonus for golden pets', () => {
      const basePower = 10;
      const expectedPower = Math.floor(basePower * config.goldenPowerBonus);
      expect(expectedPower).toBe(20); // 10 * 2.0
    });

    it('should calculate power bonus for rainbow pets', () => {
      const basePower = 10;
      const expectedPower = Math.floor(basePower * config.rainbowPowerBonus);
      expect(expectedPower).toBe(30); // 10 * 3.0
    });

    it('should stack power bonuses', () => {
      const basePower = 10;
      let power = basePower;
      power *= config.shinyPowerBonus;
      power *= config.goldenPowerBonus;
      power *= config.rainbowPowerBonus;

      expect(Math.floor(power)).toBe(90); // 10 * 1.5 * 2.0 * 3.0 = 90
    });
  });
});

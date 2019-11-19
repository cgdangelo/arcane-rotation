import { Attribute, Resource } from "../enum";

export const castAttempt = (abilityName: string) => ({
  type: "CAST_ATTEMPT" as const,
  payload: {
    timestamp: Date.now(),
    abilityName
  }
});

export const triggerGcd = (gcdLength = 1500) => ({
  type: "TRIGGER_GCD" as const,
  payload: gcdLength
});

export const updateGcdLock = (lock = true) => ({
  type: "GCD" as const,
  payload: lock
});

export const spellCastStart = (abilityName: string, castTime: number = 0) => ({
  type: "SPELL_CAST_START" as const,
  payload: {
    timestamp: Date.now(),
    abilityName,
    castTime
  }
});

export const spellCastFailed = (abilityName: string) => ({
  type: "SPELL_CAST_FAILED" as const,
  payload: {
    timestamp: Date.now(),
    abilityName
  }
});

export const spellCastSuccess = (abilityName: string) => ({
  type: "SPELL_CAST_SUCCESS" as const,
  payload: {
    timestamp: Date.now(),
    abilityName
  }
});

export const setResourceValue = (resource: Resource, value: number) => ({
  type: "SET_RESOURCE_VALUE" as const,
  payload: {
    timestamp: Date.now(),
    resource,
    value
  }
});

export const setAttributeValue = (attribute: Attribute, value: number) => ({
  type: "SET_ATTRIBUTE_VALUE" as const,
  payload: {
    timestamp: Date.now(),
    attribute,
    value
  }
});

export const triggerDamage = (abilityName: string, value: number) => ({
  type: "SPELL_DAMAGE" as const,
  payload: {
    timestamp: Date.now(),
    abilityName,
    value
  }
});

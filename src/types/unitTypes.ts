export interface UnitStats {
    type: string;
    maxSpeed: number;
    maxForce: number;
    mass: number;
    hp: number;
    range: number;
    color: number;
}

export const UNIT_CLASSES: Record<string, UnitStats> = {
    SCOUT: {
        type: 'SCOUT',
        maxSpeed: 4.0,
        maxForce: 0.2,
        mass: 0.8,
        hp: 50,
        range: 150,
        color: 0x00ffff
    },
    FIGHTER: {
        type: 'FIGHTER',
        maxSpeed: 2.5,
        maxForce: 0.1,
        mass: 1.0,
        hp: 100,
        range: 200,
        color: 0x00ff00
    },
    HEAVY: {
        type: 'HEAVY',
        maxSpeed: 1.2,
        maxForce: 0.05,
        mass: 2.5,
        hp: 300,
        range: 350,
        color: 0xffff00
    },
    FRIGATE: {
        type: 'FRIGATE',
        maxSpeed: 0.8,
        maxForce: 0.03,
        mass: 5.0,
        hp: 1000,
        range: 500,
        color: 0xff00ff
    }
};

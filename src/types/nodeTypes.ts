export const NodeTeam = {
    NEUTRAL: 'NEUTRAL',
    PLAYER: 'PLAYER',
    ENEMY: 'ENEMY'
} as const;

export type NodeTeam = typeof NodeTeam[keyof typeof NodeTeam];

export interface NodeStats {
    captureRate: number;
    spawnRate: number;
    maxUnits: number;
    health: number;
    color: Record<NodeTeam, number>;
}

export const NODE_CONFIG: NodeStats = {
    captureRate: 0.2,
    spawnRate: 3000, // ms
    maxUnits: 50,
    health: 1000,
    color: {
        [NodeTeam.NEUTRAL]: 0x888888,
        [NodeTeam.PLAYER]: 0x00ff00,
        [NodeTeam.ENEMY]: 0xff0000
    }
};

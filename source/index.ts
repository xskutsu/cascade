export interface IShape {
	density: number;
	mass: number;
	inverseMass: number;
	inertia: number;
	inverseInertia: number;
	staticFriction: number;
	dynamicFriction: number;
	restitution: number;
	updateWeight(): void;
}

export class CircleShape implements IShape {
	public radius: number;
	public density: number;
	public mass: number = 0;
	public inverseMass: number = 0;
	public inertia: number = 0;
	public inverseInertia: number = 0;
	public staticFriction: number = 0.5;
	public dynamicFriction: number = 0.3;
	public restitution: number = 0.2;
	constructor(radius: number, density: number) {
		this.radius = radius;
		this.density = density;
		this.updateWeight();
	}

	public updateWeight(): void {
		const radiusSquared: number = this.radius * this.radius;
		const mass: number = Math.PI * radiusSquared * this.density
		this.inverseMass = 1 / mass;
		const inertia: number = 0.5 * mass * radiusSquared;
		this.inertia = inertia;
		this.inverseInertia = 1 / inertia;
	}
}

export class PolygonShape implements IShape {
	public vertices: number[];
	public density: number;
	public mass: number = 0;
	public inverseMass: number = 0;
	public inertia: number = 0;
	public inverseInertia: number = 0;
	public staticFriction: number = 0.5;
	public dynamicFriction: number = 0.3;
	public restitution: number = 0.2;
	constructor(vertices: number[], density: number) {
		this.vertices = vertices;
		this.density = density;
		this.updateWeight();
	}

	public updateWeight(): void {
		const vertices: number[] = this.vertices;
		const verticesLength: number = vertices.length;
		let areaSquared: number = 0;
		let areaX: number = 0;
		let areaY: number = 0;
		let integral: number = 0;
		let xi = vertices[verticesLength - 2];
		let yi = vertices[verticesLength - 1];
		let xj = vertices[0];
		let yj = vertices[1];
		let cross = xi * yj - xj * yi;
		areaSquared += cross;
		areaX += (xi + xj) * cross;
		areaY += (yi + yj) * cross;
		integral += (xi * xi + xi * xj + xj * xj + yi * yi + yi * yj + yj * yj) * cross;
		for (let i = 0; i < verticesLength - 2; i += 2) {
			xi = vertices[i];
			yi = vertices[i + 1];
			xj = vertices[i + 2];
			yj = vertices[i + 3];
			cross = xi * yj - xj * yi;
			areaSquared += cross;
			areaX += (xi + xj) * cross;
			areaY += (yi + yj) * cross;
			integral += (xi * xi + xi * xj + xj * xj + yi * yi + yi * yj + yj * yj) * cross;
		}
		const signedArea: number = areaSquared * 0.5;
		const signedAreaSextic = signedArea * 6;
		const centerX: number = areaX / signedAreaSextic;
		const centerY: number = areaY / signedAreaSextic;
		const density: number = this.density;
		const mass: number = density * signedArea;
		this.mass = mass;
		this.inverseMass = mass > 0 ? 1 / mass : 0;
		const inertia = (density * integral) / 12 - mass * (centerX * centerX + centerY * centerY);
		this.inertia = inertia;
		this.inverseInertia = 1 / inertia;
	}
}

export class Entity {
	private static _identifierTicker: number = 0;

	public readonly identifier: number = Entity._identifierTicker++;
	public readonly shape: IShape;
	public positionX: number;
	public positionY: number;
	public angle: number = 0;
	public velocityX: number = 0;
	public velocityY: number = 0;
	public angularVelocity: number = 0;
	public linearDamping: number = 0.05;
	public angularDamping: number = 0.1;
	public minX: number = 0;
	public minY: number = 0;
	public maxX: number = 0;
	public maxY: number = 0;
	constructor(shape: IShape, positionX: number, positionY: number) {
		this.shape = shape;
		this.positionX = positionX;
		this.positionY = positionY;
	}

	public update(deltaTime: number): void {
		const linearDecay: number = Math.exp(-this.linearDamping * deltaTime);
		const velocityX: number = this.velocityX * linearDecay;
		this.velocityX = velocityX;
		this.positionX += velocityX * deltaTime;
		const velocityY: number = this.velocityY * linearDecay;
		this.velocityY = velocityY;
		this.positionY += velocityX * deltaTime;
		const angularVelocity: number = this.angularVelocity * Math.exp(-this.angularDamping * deltaTime);
		this.angularVelocity = angularVelocity;
		this.angle += angularVelocity * deltaTime;
	}
}

export type CollisionProcessorFn = (entityA: Entity, entityB: Entity): void;

export interface IPartitioner {
	addEntity(entity: Entity): void;
	query(minX: number, minY: number, maxX: number, maxY: number): Entity[];
	queryPoint(pointX: number, pointY: number): Entity[];
	collisions(callback: CollisionProcessorFn): void;
	clear(): void;
}

export class HashGrid implements IPartitioner {
	private _cellSize: number;
	private _cells: Map<number, Entity[]> = new Map<number, Entity[]>();
	constructor(cellSize: number) {
		this._cellSize = cellSize;
	}

	public addEntity(entity: Entity): void {
		const cellSize: number = this._cellSize;
		const cells: Map<number, Entity[]> = this._cells;
		const minX: number = entity.minX >> cellSize;
		const minY: number = entity.minY >> cellSize;
		const maxX: number = entity.maxX >> cellSize;
		const maxY: number = entity.maxY >> cellSize;
		if (minX === maxX) {
			if (minY === maxY) {
				const key: number = (minX << 16) | maxY;
				const cell: Entity[] | undefined = cells.get(key);
				if (cell === undefined) {
					cells.set(key, [entity]);
				} else {
					cell.push(entity);
				}
			} else {
				const keyX: number = minX << 16;
				for (let i: number = minY; i <= maxY; i++) {
					const key: number = keyX | i;
					const cell: Entity[] | undefined = cells.get(key);
					if (cell === undefined) {
						cells.set(key, [entity]);
					} else {
						cell.push(entity);
					}
				}
			}
		} else if (minY === maxY) {
			for (let i: number = minX; i <= maxX; i++) {
				const key: number = (i << 16) | minY;
				const cell: Entity[] | undefined = cells.get(key);
				if (cell === undefined) {
					cells.set(key, [entity]);
				} else {
					cell.push(entity);
				}
			}
		} else {
			for (let i: number = minX; i <= maxX; i++) {
				for (let j: number = minY; j <= maxY; j++) {
					const key: number = (i << 16) | j;
					const cell: Entity[] | undefined = cells.get(key);
					if (cell === undefined) {
						cells.set(key, [entity]);
					} else {
						cell.push(entity);
					}
				}
			}
		}
	}

	public query(minX: number, minY: number, maxX: number, maxY: number): Entity[] {

	}

	public queryPoint(pointX: number, pointY: number): Entity[] {
		const cellSize: number = this._cellSize;
		const cell: Entity[] | undefined = this._cells.get(((pointX >> cellSize) << 16) | (pointY >> cellSize));
		if (cell === undefined) {
			return [];
		} else {
			const result: Entity[] = [];
			let i: number = cell.length;
			while (i-- > 0) {
				const entity: Entity = cell[i];
				if (pointX >= entity.minX && pointY >= entity.minY && pointX <= entity.maxX && pointY <= entity.maxY) {
					result.push(entity);
				}
			}
			return result;
		}
	}

	public collisions(callback: CollisionProcessorFn): void {

	}

	public clear(): void {
		this._cells.clear();
	}
}
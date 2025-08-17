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
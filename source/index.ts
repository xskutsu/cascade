export interface IShape {
	density: number;
	mass: number;
	inverseMass: number;
	inertia: number;
	inverseInertia: number;
	staticFriction: number;
	dynamicFriction: number;
	restitution: number;
}

export class CircleShape implements IShape {
	public radius: number;
	public density: number;
	public mass: number;
	public inverseMass: number;
	public inertia: number;
	public inverseInertia: number;
	public staticFriction: number = 0.5;
	public dynamicFriction: number = 0.3;
	public restitution: number = 0.2;
	constructor(radius: number, density: number) {
		this.radius = radius;
		this.density = density;
		this.mass = Math.PI * radius * radius * density;
		this.inverseMass = 1 / this.mass;
		this.inertia = 0.5 * this.mass * radius * radius;
		this.inverseInertia = 1 / this.inertia;
	}

	public updateWeight(): void {
		this.mass = Math.PI * this.radius * this.radius * this.density;
		this.inverseMass = 1 / this.mass;
		this.inertia = 0.5 * this.mass * this.radius * this.radius;
		this.inverseInertia = 1 / this.inertia;
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
		this.velocityX *= Math.exp(-this.linearDamping * deltaTime);
		this.velocityY *= Math.exp(-this.linearDamping * deltaTime);
		this.angularVelocity *= Math.exp(-this.angularDamping * deltaTime);
		this.positionX += this.velocityX * deltaTime;
		this.positionY += this.velocityY * deltaTime;
		this.angle += this.angularVelocity * deltaTime;
	}
}
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

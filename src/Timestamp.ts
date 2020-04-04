import { pad } from './strUtils';

export class Timestamp {
	public hours: number;
	public minutes: number;
	public seconds: number;

	constructor(hours: number, minutes: number, seconds: number) {
		this.hours = hours + Math.floor(minutes / 60);
		this.minutes = (minutes % 60) + Math.floor(seconds / 60);
		this.seconds = seconds % 60;
	}

	get totalSeconds() {
		return this.hours * 3600 + this.minutes * 60 + this.seconds;
	}

	toString() {
		return `${pad(this.hours, 2)}h${pad(this.minutes, 2)}m${pad(this.seconds, 2)}s`;
	}
}

function* idGenerator() {
	let id = 0;
	while (true) {
		yield id++;
	}
}

const generateId = idGenerator();
const getId = () => generateId.next().value;

export default class GlobalEvent {

	static events = {};

	static getGlobalEvent (event) {
		if (!GlobalEvent.events[event]) {
			GlobalEvent.events[event] = new GlobalEvent(event);
		}
		return GlobalEvent.events[event];
	}

	static subscribe (event, callback) {
		const id = getId();
		// console.log('subscribe: id:', id);
		const globalEvent = GlobalEvent.getGlobalEvent(event);
		globalEvent.subscribers.set(id, callback);
		return id;
	}

	static unsubscribe (event, id) {
		const globalEvent = GlobalEvent.getGlobalEvent(event);
		// console.log('unsubscribe:', event, id, globalEvent.subscribers.get(id));
		if (!globalEvent) {
			console.warn('GlobalEvent not found', event);
		}
		else {
			if (globalEvent.subscribers.has(id)) {
				globalEvent.subscribers.delete(id);
				if (globalEvent.subscribers.size < 1) {
					globalEvent.removeEventListener();
					delete GlobalEvent.events[event];
				}
			}
			else {
				console.warn('- GlobalEvent: subscriber not found! event:', event, ', id:', id);
			}
		}
	}

	static clearEventListeners () {
		console.log('-- clearEventListeners:', Object.keys(GlobalEvent.events).length);
		Object.keys(GlobalEvent.events).forEach(event => {
			const globalEvent = GlobalEvent.events[event];
			globalEvent.removeEventListener();
		});
		GlobalEvent.events = {};
	}

	constructor (event) {
		this.event = event;
		this.subscribers = new Map();
		this.globalCallback = this.globalCallback.bind(this);
		document.addEventListener(event, this.globalCallback);
	}

	globalCallback (e) {
		// console.log('GlobalEvent:', this.event, 'subscribers:', this.subscribers.size);
		[...this.subscribers.values()].forEach(callback => callback(e));
	}

	removeEventListener () {
		// console.log('removeEventListener: event:', this.event);
		document.removeEventListener(this.event, this.globalCallback);
	}

}

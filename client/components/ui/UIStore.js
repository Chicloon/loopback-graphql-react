import { observable, action, computed, autorunAsync } from 'mobx';
import GlobalEvent from './GlobalEvent';
import { MENU_ITEMS } from '../../Menu';

const DB_NAME = 'smartoffice';
const DB_VERSION = 19;

const MAIN_STORE = 'mainStore';
const MOBILE_WIDTH = 960;
const ANIMATION_DURATION = 250;

const data = {
	store: 'ui',
	showDebugInfo: false,
	activeSubMenus: {},
	menuState: 1,
};

function* idGenerator() {
	let id = 0;
	while (true) {
		yield id++;
	}
}

const generateId = idGenerator();
const getId = () => generateId.next().value;

class UIStore {

	@observable canUseDb = false;
	@observable showDebugInfo = false;
	@observable menuState = 1;
	@observable activeSubMenus = {};
	@observable currentFilter = {};
	@observable clickTarget;
	@observable width = 0;
	@observable height = 0;
	@observable animation = false;
	@observable notifications = new Map();
	@observable lastNotification = (new Date()).getTime();

	@observable prevPath = null;
	@observable newPath = null;

	@observable bar;

	resizeSubscribers = new Map();

	constructor () {
		this.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
		this.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
		this.getStateFromDb();
		this.setWindowSize();
		this.onSetTitle = null;
	}

	@action getStateFromDb () {
		this.connectDB((canUseDb, msg) => {
			console.info('db:', msg, ', version:', this.db.version, ', can use:', canUseDb);
			this.canUseDb = canUseDb;
			if (!this.canUseDb) return;
			const objectStore = this.db.transaction([MAIN_STORE]).objectStore(MAIN_STORE);
			objectStore.get('ui').onsuccess = event => {
				const result = event.target.result;
				if (result) {
					this.setDebugInfo(result.showDebugInfo);
					this.setMenuState(this.isMobile() ? 0 : result.menuState);
					this.setActiveSubMenus(result.activeSubMenus);
				}
			};
		});
	}

	@action setDebugInfo (on) {
		this.showDebugInfo = on;
		// console.log('setDebugInfo:', this.showDebugInfo);
	}

	@action switchDebugInfo (on) {
		const objectStore = this.db.transaction([MAIN_STORE], 'readwrite').objectStore(MAIN_STORE);
		objectStore.get('ui').onsuccess = event => {
			const result = event.target.result;
			result.showDebugInfo = on;
			objectStore.put(result).onsuccess = () => {
				this.setDebugInfo(on);
				this.addNotification('showDebugInfo: ' + on);
			}
		};
	}

	addNotification (text) {
		// console.log('addNotification:', text);
		const time = (new Date()).getTime();
		this.notifications.set(time, { text, time, active: true });
		console.log(this.notifications);
		this.lastNotification = (new Date()).getTime();
		setTimeout(() => {
			this.hideNotification(time);
		}, 2000);
	}

	setBar (bar) {
		autorunAsync(() => {
			this.bar = bar;
		});
	}

	hideNotification (time) {
		// console.log('hideNotification:', this.notifications.get(time).text);
		const notification = this.notifications.get(time);
		notification.active = false;
		this.lastNotification = (new Date()).getTime();
	}

	subscribeToGlobalEvent (event, callback) {
		return GlobalEvent.subscribe(event, callback);
	}

	unsubscribeFromGlobalEvent (event, callback) {
		GlobalEvent.unsubscribe(event, callback);
	}

	clearEventListeners () {
		GlobalEvent.clearEventListeners();
	}

	setWindowSize () {
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		// console.info('windowSize:', this.width, this.height);
		// console.log('resizeSubscribers:', this.resizeSubscribers);
		[...this.resizeSubscribers.values()].forEach(callback => callback());
	}

	subscribeToResize (callback) {
		const id = getId();
		this.resizeSubscribers.set(id, callback);
		return id;
	}

	unsubscribeFromResize (id) {
		if (this.resizeSubscribers.has(id)) {
			this.resizeSubscribers.delete(id);
		}
	}

	isMobile () {
		return this.width < MOBILE_WIDTH;
	}

	@action setMenuState (state) {
		this.menuState = state;
		// console.log('setMenuState:', this.menuState);
	}

	@action switchMenuState (state) {
		if (!this.canUseDb) return;
		const objectStore = this.db.transaction([MAIN_STORE], 'readwrite').objectStore(MAIN_STORE);
		objectStore.get('ui').onsuccess = event => {
			const result = event.target.result;
			result.menuState = state;
			objectStore.put(result).onsuccess = () => {
				this.setMenuState(state);
			}
		};
	}

	@action setActiveSubMenus (obj) {
		this.activeSubMenus = obj;
		// console.log('setActiveSubMenus:', this.activeSubMenus);
	}

	@action switchSubMenu (submenu) {
		if (!this.canUseDb) return;
		const objectStore = this.db.transaction([MAIN_STORE], 'readwrite').objectStore(MAIN_STORE);
		objectStore.get('ui').onsuccess = event => {
			const result = event.target.result;
			let obj = result.activeSubMenus;
			if (obj[submenu]) {
				delete obj[submenu];
			}
			else {
				obj[submenu] = true;
			}
			result.activeSubMenus = obj;
			// console.log('result.activeSubMenus:', result.activeSubMenus);
			objectStore.put(result).onsuccess = () => {
				this.setActiveSubMenus(obj);
			}
		};
	}

	connectDB (callback) {
		const request = this.indexedDB.open(DB_NAME, DB_VERSION);

		console.info('connecting to db...');

		request.onerror = error => {
			console.error(error);
		};

		request.onsuccess = event => {
			this.db = event.target.result;
			callback(true, 'success');
		};

		request.onupgradeneeded = event => {
			MENU_ITEMS
				.filter(item => item.type === 'submenu' && item.opened)
				.map(item => item.id)
				.forEach(submenuId => data.activeSubMenus[submenuId] = true);

			console.warn('db upgrade needed', data);
			this.db = event.target.result;

			let mainStore = null;
			if (this.db.objectStoreNames.contains(MAIN_STORE)) {
				mainStore = event.target.transaction.objectStore([MAIN_STORE], 'readwrite');
			}
			else {
				mainStore = this.db.createObjectStore(MAIN_STORE, {
					keyPath: 'store',
				});
			}

			const request = mainStore.put(data);
			request.onerror = console.error;
			request.onsuccess = () => {
				callback(false, 'upgraded db');
			}
		};
	}

}

export default UIStore;

import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import App from './App';

import boardStore from './components/projects/Board/BoardStore';
import UIStore from './components/ui/UIStore';
import { loopback, Store } from './store';

import  tasksStore from './store/Tasks';
// initialize store
const store = new Store (loopback);

// only for debug purpose
window.store = store;

const uiStore = new UIStore ();

const handleSizeChange = (e) => {
	uiStore.setWindowSize();
};

window.addEventListener('resize', handleSizeChange, true);

const render = (Component) => {	
	ReactDOM.render(
		<AppContainer>
			<Component store={store} boardStore={boardStore} uiStore={uiStore} tasksStore = {tasksStore}/>
		</AppContainer>,
		document.getElementById('root')
	);
};

render(App);

// Hot Module Replacement API
if (module.hot) {
	module.hot.accept('./App', () => {
		render(App)
	});
}

import React, { Component } from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';

const scrollToTop = () => window.scrollTo(0,0);

export default class ModelRoute extends Component {
	constructor (props) {
		super (props);
	}

	render () {
		const { path, list, create, edit, show, remove, options } = this.props;
		let routes = [];

		list && routes.push ({path: `/${path}`, component: list});
		create && routes.push ({path: `/${path}/create`, component: create});
		edit && routes.push ({path: `/${path}/:id`, component: edit});

		return (
			<Switch>
				{routes.map ((route) => <Route exact key={route.path} path={route.path} component={route.component}/>)}
			</Switch>
		);
	}
}

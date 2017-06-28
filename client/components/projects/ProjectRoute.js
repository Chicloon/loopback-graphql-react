import React, { Component } from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import ProjectRoot from './Root';

export default class ProjectRoute extends Component {

	constructor (props) {
		super (props);
		this.props = props;
	}

	render () {
		const { path, list, create, admin } = this.props;
		let routes = [];

		list && routes.push ({path: `/${path}`, component: list});
		create && routes.push ({path: `/${path}/create`, component: create});
		admin && routes.push ({path: `/${path}/admin`, component: admin});

		return (
			<Switch>
				{routes.map ((route) => (
					<Route exact key={route.path} path={route.path} component={route.component}/>
				))}
				<Route path={`/${path}/:id`} component={ProjectRoot} />
			</Switch>
		);
	}
}


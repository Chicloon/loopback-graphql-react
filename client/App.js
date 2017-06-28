// require('./styles/bootstrap.css');
// require('./styles/fontello.css');
// require('./styles/fonts.css');
// require('./styles/App.scss');

import './styles/bootstrap.css';
import './styles/fontello.css';
import './styles/fonts.css';
import './styles/App.scss';

import './styles/antd.less';

import React, { Component } from 'react';
import { observable } from 'mobx';
import { Provider, observer } from 'mobx-react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import ModelRoute from './ModelRoute';
import { ProjectRoute } from './components/projects';

import Layout from './Layout';
import Login from './components/login/Login';
import * as Client from './components';
import * as Admin from './components/admin';
import UIDemo from './components/ui/UIDemo';

// Antd for ui components
import { LocaleProvider } from 'antd';
import enUS from 'antd/lib/locale-provider/en_US';
import ruRU from 'antd/lib/locale-provider/ru_RU';
// Apollo for gql
import ApolloClient, { createNetworkInterface } from 'apollo-client';
import { ApolloProvider } from 'react-apollo';

const networkInterface = createNetworkInterface({
	uri: '/graphql',
	opts: {
		credentials: 'same-origin',
	},
});

const client = new ApolloClient({
	// dataIdFromObject: o => o.id,
	networkInterface,
});

@observer
class App extends Component {

	constructor(props) {
		super(props);
		this.store = props.store;
		this.uiStore = props.uiStore;
		this.boardStore = props.boardStore;
		this.tasksStore = props.tasksStore;
	}

	componentWillUnmount() {
		this.uiStore.clearEventListeners();
	}

	render() {
		console.log('isAuthorized:', this.store.isAuthorized);
		return (			 
			<LocaleProvider locale={ruRU}> 
				<ApolloProvider client={client}>
					<Provider uiStore={this.uiStore} boardStore={this.boardStore} store={this.store} tasksStore={this.tasksStore}>
						<Router>
							{this.store.isInitialized && (
								this.store.isAuthorized ? (
									<Layout>
										<Route exact path="/" render={() => <div>Dashboard...</div>} />

										<ModelRoute path="tasks_gql" list={Client.TaskList_gql} edit={Client.TaskEdit_gql} create={Client.TaskCreate_gql} />

										<ProjectRoute path="projects" root={Client.ProjectRoot} dashboard={Client.ProjectDashboard} board={Client.ProjectBoard} edit={Client.ProjectEdit} list={Client.ProjectList} create={Client.ProjectCreate} />
										<ModelRoute path='tasks' list={Client.TaskList} edit={Client.TaskEdit} create={Client.TaskCreate} />
										<ModelRoute path='boardlists' list={Client.BoardListList} edit={Client.BoardListEdit} create={Client.BoardListCreate} />
										<ModelRoute path="clients" list={Client.ClientList} edit={Client.ClientEdit} create={Client.ClientCreate} />
										<ModelRoute path="persons" list={Client.PersonList} edit={Client.PersonEdit} create={Client.PersonCreate} />

										<ModelRoute path="budgets" list={Client.BudgetList} edit={Client.BudgetEdit} create={Client.BudgetCreate} />
										<ModelRoute path="budgetroles" list={Client.BudgetRoleList} edit={Client.BudgetRoleEdit} create={Client.BudgetRoleCreate} />
										<ModelRoute path='payments' list={Client.PaymentList} edit={Client.PaymentEdit} create={Client.PaymentCreate} />

										<ModelRoute path='labels' list={Client.LabelList} edit={Client.LabelEdit} create={Client.LabelCreate} />
										<ModelRoute path='projectroles' list={Client.ProjectRoleList} edit={Client.ProjectRoleEdit} create={Client.ProjectRoleCreate} />
										<ModelRoute path='users' list={Client.UserList} edit={Client.UserEdit} create={Client.UserCreate} />
										<ModelRoute path='acls' list={Client.ACLList} edit={Client.ACLEdit} create={Client.ACLCreate} />

										<ModelRoute path='admin/projects' list={Admin.ProjectList} edit={Admin.ProjectEdit} create={Admin.ProjectCreate} />
										<ModelRoute path='admin/projectmembers' list={Admin.ProjectMemberList} edit={Admin.ProjectMemberEdit} create={Admin.ProjectMemberCreate} />
										<ModelRoute path='admin/projectroles' list={Admin.ProjectRoleList} edit={Admin.ProjectRoleEdit} create={Admin.ProjectRoleCreate} />
										<ModelRoute path='admin/boardlists' list={Admin.BoardListList} edit={Admin.BoardListEdit} create={Admin.BoardListCreate} />
										<ModelRoute path="admin/budgetroles" list={Admin.BudgetRoleList} edit={Admin.BudgetRoleEdit} create={Admin.BudgetRoleCreate} />
										<ModelRoute path='admin/payments' list={Admin.PaymentList} edit={Admin.PaymentEdit} create={Admin.PaymentCreate} />
										<ModelRoute path='admin/labels' list={Admin.LabelList} edit={Admin.LabelEdit} create={Admin.LabelCreate} />
										<ModelRoute path='admin/users' list={Admin.UserList} edit={Admin.UserEdit} create={Admin.UserCreate} />
										<ModelRoute path='admin/roles' list={Admin.RoleList} edit={Admin.RoleEdit} create={Admin.RoleCreate} />
										<ModelRoute path='admin/acls' list={Admin.ACLList} edit={Admin.ACLEdit} create={Admin.ACLCreate} />
										<ModelRoute path='admin/rolemappings' list={Admin.RoleMappingList} edit={Admin.RoleMappingEdit} create={Admin.RoleMappingCreate} />

										<Route path="/uidemo" component={UIDemo} />

									</Layout>
								) : (
										<Route path="/" component={Login} />
									)
							)}
						</Router>
					</Provider>
				</ ApolloProvider>
			</LocaleProvider>
		);
	}

}

export default App;

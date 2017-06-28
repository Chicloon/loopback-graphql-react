import React from 'react';
import { inject, observer } from 'mobx-react';

import {
	List,
	TextField,
	DateField,
	BooleanField,
	NumberField,
} from '../ui/List';

import t from '../../../i18n';

@inject('store') @observer
class UserList extends React.PureComponent {

	constructor(props) {
		super(props);
		this.props = props;
		this.store = this.props.store;
	}

	render () {
		if (!this.store.isInitialized) {
			return <div>Loading...</div>;
		}

		return <List model={this.store.User}
		             defaultSort={{ field: 'id', order: -1 }}
		             title={t('users')}
		             {...this.props}>
			{/*<NumberField property='id' label={t('ID')} width='50px' className='left' headerClass='left' />*/}
			<TextField property='username' label={t('user.username')} />
			{/*<TextField property='realm' label={t('user.realm')} />*/}
			{/*<TextField property='credentials' label={t('user.credentials')} />*/}
			{/*<TextField property='challenges' label={t('user.challenges')} />*/}
			<TextField property='email' label={t('user.email')} />
			<BooleanField property='emailVerified' label={t('user.emailVerified')} />
			<TextField property='status' label={t('user.status')} />
			<DateField property='created' label={t('user.created')} />
			<DateField property='lastUpdated' label={t('user.lastUpdated')} />
		</List>;
	}
}

export default UserList;

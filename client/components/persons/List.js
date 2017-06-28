import React from 'react';
import { inject, observer } from 'mobx-react';

import {
	List,
	TextField,
	Field,
} from '../ui/List';

import { PersonAvatar } from '../ui';

import t from '../../../i18n';

@inject('store') @observer
class PersonList extends React.PureComponent {

	constructor(props) {
		super(props);
		this.props = props;
		this.store = this.props.store;
	}

	avatar(person) {
		return <PersonAvatar person={person} />;
	}

	fullName(person) {
		return (person.lastName || '') + ' ' + (person.firstName || '') + ' ' + (person.middleName || '');
	}

	render () {
		if (!this.store.isInitialized) {
			return <div>Loading...</div>;
		}

		return <List model={this.store.Person}
		             defaultSort={{ field: 'id', order: -1 }}
		             title={t('persons')}
		             className='middle'
		             {...this.props}>
			<Field computed={this.avatar} width="50px"/>
			<TextField computed={this.fullName} property='lastName' label={t('lastName')} />
			<TextField property='paymentInfo' label={t('paymentInfo')} />
			<TextField property='comment' label={t('comment')} />
		</List>;
	}
}

export default PersonList;

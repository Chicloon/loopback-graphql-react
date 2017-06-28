import React from 'react';
import { inject, observer } from 'mobx-react';

import {
	List,
	TextField,
	DateField,
	NumberField,
} from '../../ui/List';

import t from '../../../../i18n';

@inject('store') @observer
class RoleList extends React.PureComponent {

	constructor(props) {
		super(props);
		this.props = props;
		this.store = this.props.store;
	}

	render () {
		if (!this.store.isInitialized) {
			return <div>Loading...</div>;
		}

		return <List model={this.store.Role}
		             admin={true}
		             defaultSort={{ field: 'id', order: -1 }}
		             title={t('roles')}
		             {...this.props}>
			<NumberField property='id' label={t('ID')} className='id' headerClass='id' />
			<TextField property='name' label={t('name')} />
			<TextField property='description' label={t('description')} />
			<DateField property='created' label={t('role.created')} />
			<DateField property='modified' label={t('role.modified')} />
		</List>;
	}
}

export default RoleList;

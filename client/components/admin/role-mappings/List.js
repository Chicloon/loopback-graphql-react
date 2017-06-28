import React from 'react';
import { inject, observer } from 'mobx-react';

import {
	List,
	TextField,
	NumberField,
} from '../../ui/List';

import t from '../../../../i18n';

@inject('store') @observer
class RoleMappingList extends React.PureComponent {

	constructor(props) {
		super(props);
		this.props = props;
		this.store = this.props.store;
	}

	render () {
		if (!this.store.isInitialized) {
			return <div>Loading...</div>;
		}

		return <List model={this.store.RoleMapping}
		             admin={true}
		             defaultSort={{ field: 'id', order: -1 }}
		             title={t('roleMappings')}
		             {...this.props}>
			<NumberField property='id' label={t('ID')} className='id' headerClass='id' />
			<TextField property='principalType' label={t('principalType')} />
			<NumberField property='principalId' label={t('principalId')} />
			<TextField relation='role' property='name' label={t('role.title')} />
		</List>;
	}
}

export default RoleMappingList;

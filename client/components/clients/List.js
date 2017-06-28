import React from 'react';
import { inject, observer } from 'mobx-react';

import {
	List,
	TextField,
} from '../ui/List';

import t from '../../../i18n';

@inject('store') @observer
class ClientList extends React.PureComponent {

	constructor(props) {
		super(props);
		this.props = props;
		this.store = this.props.store;
	}

	render () {
		if (!this.store.isInitialized) {
			return <div>Loading...</div>;
		}

		return <List model={this.store.Client}
		             defaultSort={{ field: 'id', order: -1 }}
		             title={t('clients')}
		             {...this.props}>
			{/*<NumberField property='id' label={t('ID')} width='50px' className='left' headerClass='left' />*/}
			<TextField property='name' label={t('name')} />
			<TextField property='personName' label={t('personName')} />
			<TextField property='personRole' label={t('personRole')} />
			<TextField property='phone' label={t('phone')} />
			<TextField property='email' label={t('email.title')} />
			<TextField property='comment' label={t('comment')} />
		</List>;
	}
}

export default ClientList;

import React from 'react';
import { inject, observer } from 'mobx-react';

import {
	List,
	TextField,
	NumberField,
} from '../../ui/List';

import t from '../../../../i18n';

@inject('store') @observer
class LabelList extends React.PureComponent {

	constructor(props) {
		super(props);
		this.props = props;
		this.store = this.props.store;
	}

	render () {
		if (!this.store.isInitialized) {
			return <div>Loading...</div>;
		}

		return <List model={this.store.Label}
		             admin={true}
		             defaultSort={{ field: 'id', order: -1 }}
		             title={t('label')}
		             {...this.props}>
			<NumberField property='id' label={t('ID')} className='id' headerClass='id' />
			<TextField property='name' label={t('name')} />
			<TextField property='color' label={t('color')} />
			<TextField property='description' label={t('description')} />
			<NumberField property='priority' label={t('priority')} width='130px' />
		</List>;
	}
}

export default LabelList;

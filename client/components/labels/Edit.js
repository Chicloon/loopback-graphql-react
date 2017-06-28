import React from 'react';
import { inject, observer } from 'mobx-react';

import {
	Form,
	TextInput,
	NumberInput,
	DateInput,
	RelationInput,
	BooleanInput,
	ColorInput,
} from '../ui/Form';

import t from '../../../i18n';

@inject('store') @observer
class LabelEdit extends React.PureComponent {

	constructor (props) {
		super(props);
		this.store = props.store;
		this.props = props;
	}

	render() {
		if (!this.store.isInitialized) {
			return <div>Loading...</div>;
		}

		return (
			<Form model={this.store.Label} className="fixed-width" title={t('label.title')} {...this.props}>
				<TextInput property="name" label={t('name')}/>
				<ColorInput property="color" label={t('color')}/>
				<TextInput rows={5} property="description" label={t('description')}/>
				<NumberInput property="priority" label={t('priority')}/>
			</Form>
		);
	}
}

export default LabelEdit;

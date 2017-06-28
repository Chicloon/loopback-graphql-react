import React from 'react';
import { inject, observer } from 'mobx-react';

import {
	Form,
	TextInput,
} from '../../ui/Form';
import t from '../../../../i18n';

@inject('store') @observer
class ProjectRoleEdit extends React.PureComponent {

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
			<Form model={this.store.ProjectRole} className="fixed-width" title={t('projectRole.title')} {...this.props}>
				<TextInput rows={5} property="name" label={t('name')}/>
			</Form>
		);
	}
}

export default ProjectRoleEdit;

import React from 'react';
import { inject, observer } from 'mobx-react';
import { action, observable } from 'mobx';

import {
	Form,
	TextInput,
	NumberInput,
	RelationInput,
	ModelMultipleInput,
	BooleanInput,
} from '../../ui/Form';
import { PersonAvatar, Icon, ColorUtils } from '../../ui';
import t from '../../../../i18n';

@inject('store') @observer
class ProjectEdit extends React.PureComponent {

	@observable labels;

	constructor (props) {
		super(props);
		this.store = props.store;
		this.props = props;
		if (props.project) {
			this.labels = props.project.labels();
		}
	}

	isLabelSelected (label) {
		if (!this.labels) return false;
		return this.labels.list.findIndex(_label => _label.id === label.id) !== -1;
	}

	taskLabel (label) {
		const selected = this.isLabelSelected(label);
		return <div className={"label-item " + (selected ? 'selected' : '')}>
			<span className="label-color" style={{ background: label.color, color: ColorUtils.textColor(label.color) }}>
				{selected ? <Icon icon="ok"/> : ''}
			</span>
			<strong>{label.name}</strong>
			<em>{label.description}</em>
		</div>;
	}

	toggleLabel (label) {
		console.log('toggleLabel:', label, this.labels);
		const index = this.labels.list.findIndex(_label => _label.id === label.id);
		if (index === -1) {
			this.labels.add(label);
		}
		else {
			this.labels.remove(label);
		}

	}

	render() {
		const selectedLabels = (this.labels && this.labels.list.length > 0) ? <div className="selected-labels clearfix">
			{this.labels.list.map(label => {
				const style = { background: label.color, color: ColorUtils.textColor(label.color) };
				return <span className="label" key={label.id} style={style}>{label.name}</span>
			})}
		</div> : null;

		return (
			<Form model={this.store.Project} title={t('project.title')} className="fixed-width" returnTo={'projects'} {...this.props}>
				<TextInput property="name" label={t('name')}/>
				<TextInput rows={7} rich={true} property="description" label={t('description')}/>
				<ModelMultipleInput
					selectedView={selectedLabels}
					placeholder='Добавить метки'
					listModel={this.store.Label}
					computed={this.taskLabel.bind(this)}
					isSelected={this.isLabelSelected.bind(this)}
					onToggleItem={item => this.toggleLabel(item)}
					label={t('taskLabel.title')}
				/>
				<BooleanInput property="private" label={t('private')}/>
				<RelationInput relation="client" property="personName" label={t('client.title')}/>
			</Form>
		);
	}
}

export default ProjectEdit;

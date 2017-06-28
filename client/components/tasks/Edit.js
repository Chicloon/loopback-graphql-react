import React from 'react';
import { inject, observer } from 'mobx-react';
import { Link } from 'react-router-dom';
import { action, observable } from 'mobx';
import * as moment from 'moment';

import {
	Form,
	TextInput,
	DateInput,
	RelationInput,
	BooleanInput,
	ModelMultipleInput,
	Row,
} from '../ui/Form';

import { Field } from '../ui/List';
import { PersonAvatar, Icon, IconLink, Button, ColorUtils, Comments, RichText, InlineLabels } from '../ui';
import t from '../../../i18n';
import './style.scss';

@inject('store', 'uiStore') @observer
class TaskEdit extends React.Component {

	@observable labels;
	@observable editing = false;

	constructor (props) {
		super(props);
		this.store = props.store;
		this.uiStore = props.uiStore;
		this.props = props;

		this.id = props.match.params.id;
		console.log('id:', this.id);
		if (this.id) {
			this.task = this.store.Task.getById(this.id);
		}
		else {
			this.task = new this.store.Task();
		}

		this.labels = this.task.labels();
		props.uiStore.setBar(<h1>{t('task.title')}</h1>);
	}

	edit () {
		this.editing = true;
	}

	cancel (e) {
		e.preventDefault();
		this.editing = false;
	}

	person (person, size) {
		return <div className="task-person">
			<PersonAvatar person={person} size={size || 24} style={{ marginRight: 10 }}/>
			{(person.lastName || '') + ' ' + (person.firstName || '') + ' ' + (person.middleName || '')}
		</div>;
	}

	personLink (person, size) {
		return <Link className="task-person" to={'/persons/' + person.id}>
			<PersonAvatar person={person} size={size || 24} style={{ marginRight: 5 }}/>
			{(person.lastName || '') + ' ' + (person.firstName || '') + ' ' + (person.middleName || '')}
		</Link>;
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

	onTaskDelete (task) {
		console.log('onTaskDelete:', task.boardList.tasks());
		task.boardList.tasks().reload();
		// task.project.tasks().reload();
	}

	onTaskSave (task) {
		console.log('onTaskSave:', task);
		this.editing = false;
		// task.boardList.tasks().reload();
		// task.project.tasks().reload();
	}

	render () {
		// console.log('TaskEdit.render:', this.labels);
		if (this.task.isLoading) {
			return <div>Loading...</div>;
		}

		const selectedLabels = (this.labels && this.labels.list.length > 0) ? <div className="selected-labels clearfix">
			{this.labels.list.map(label => {
				const style = { background: label.color, color: ColorUtils.textColor(label.color) };
				return <span className="label" key={label.id} style={style}>{label.name}</span>
			})}
		</div> : null;

		const controls = <Button label={t('cancel')} onClick={e => this.cancel(e)}/>;

		const rightPart = <div>{this.task.person && <div className="task-person-div">
			<label>{t('task.person')}:</label>
			{this.personLink(this.task.person, 24)}
		</div>}
			<div className="task-labels">
				<div>
					<label>{t('taskLabel.labels')}</label>
					<InlineLabels record={this.task} foreignKey="taskId"/>
				</div>
			</div>
		</div>;


		return (
			<div className="fixed-width">
				{this.editing ?
					<Form model={this.store.Task}
					      record={this.task}
					      onDelete={task => this.onTaskDelete(task)}
					      onSave={task => this.onTaskSave(task)}
					      noCreate={true}
					      controls={controls}
					      {...this.props}>
						<TextInput className="task-name" placeholder="Название задачи" limit={7} property="name" label={t('name')}/>
						<div className="row">
							<Field className="plain col-lg-3" emptyField={t('noSelected')} relation="project" property="name" label={t('project.title')}/>
							<Field className="plain col-lg-3" emptyField={t('noSelected')} relation="boardList" property="name"
							       label={t('boardList.title')}/>
							<div />
						</div>
						<RelationInput className="col-lg-6" relation="person" computed={this.person} property="lastName" label={t('person.title')}/>

						<TextInput rows={5} rich={true} placeholder="Описание задачи" property="description" label={t('description')}/>
						<Row>
							<ModelMultipleInput
								selectedView={selectedLabels}
								placeholder='Добавить метки'
								listModel={this.store.Label}
								computed={this.taskLabel.bind(this)}
								isSelected={this.isLabelSelected.bind(this)}
								onToggleItem={item => this.toggleLabel(item)}
								label={t('taskLabel.title')}
							/>
						</Row>
						<Row>
							<DateInput property="startDate" label={t('startDate')}/>
							<DateInput property="dueDate" label={t('dueDate')}/>
							<BooleanInput property="private" label={t('private')}/>
							<div />
						</Row>
					</Form>

					:

					<div className="task-show">
						<div className="row">
							<div className="task-name col-xs-12 col-sm-12 col-md-12 col-lg-8">
								<RichText content={this.task.name}/>
							</div>
						</div>
						<div className="task-info">
							<IconLink icon="pencil" className="task-edit-btn" label={t('edit')} onClick={e => this.edit(e)}/>
							{this.task.project &&
							<div className="block">
								{t('project.title')}: <Link to={'/projects/' + this.task.project.id}>
								{this.task.project.name} [ {this.task.boardList.name} ]
							</Link>
							</div>}

							{(this.task.startDate || this.task.dueDate) && <Icon icon="calendar"/>}
							{this.task.startDate && <em>{moment(this.task.startDate).format('DD.MM.YY')}</em>}
							{this.task.dueDate && <em> - {moment(this.task.dueDate).format('DD.MM.YY')}</em>}
						</div>

						{this.uiStore.isMobile() ?
							<div>
								<div className="row">
									<div className="col-xs-12 col-sm-12 col-md-8 col-lg-8">
										{this.task.description && <RichText content={this.task.description} className="task-description"/>}
									</div>
									<div className="task-right col-xs-12 col-sm-12 col-md-4 col-lg-4">
										{rightPart}
									</div>
								</div>
								<div className="row">
									<div className="col-xs-12 col-sm-12 col-md-12 col-lg-8">
										<Comments foreignKey='taskId' record={this.task}/>
									</div>
								</div>
							</div>
							:
							<div className="row">
								<div className="col-xs-12 col-sm-12 col-md-8 col-lg-8">
									{this.task.description && <RichText content={this.task.description} className="task-description"/>}
									<Comments foreignKey='taskId' record={this.task}/>
								</div>
								<div className="task-right col-xs-12 col-sm-12 col-md-4 col-lg-4">
									{rightPart}
								</div>
							</div>
						}
					</div>
				}
			</div>
		);
	}
}

export default TaskEdit;

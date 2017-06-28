import React from 'react';
import PropTypes from 'prop-types';
import { computed, observable, extendObservable, action, autorun } from 'mobx';
import { inject, observer } from 'mobx-react';

import defaultListColor from './BoardList';
import { LabelSmall } from './Labels';
import { Icon, PersonAvatar } from '../../ui';

const fullName = person => ((person.firstName || '') + ' ' + (person.middleName || '') + ' ' + (person.lastName || ''));

@inject('store', 'uiStore', 'boardStore') @observer
class TaskCard extends React.PureComponent {

	@observable labels;

	constructor(props) {
		super(props);
		this.task = props.task;
		this.labels = this.task.labels();
	}

	@computed get sortedTaskLabels() {
		return this.labels.list;
		// return this.tasklabels.list.sort((a, b) => b.label.priority - a.label.priority);
	}

	shouldComponentUpdate(nextProps) {
		if (nextProps.isDraggable) {
			return false;
		}
	    if (nextProps.dragTask && nextProps.dragTask.id !== this.task.id) {
			return false;
	    }
	    if (this.props.dragTask && !nextProps.dragTask && this.props.dragTask.id !== this.task.id) {
			return false;
	    }
		return true;
	}

	isDragging() {
		return !this.props.isDraggable && this.props.dragTask && this.props.dragTask.id === this.task.id;
	}

	handleOnClick(e) {
		if (!this.isDragging()) this.props.onClick(e, this.task);
	}

	render() {
		// console.log('Task render:', this.task.id, this.props.isDraggable ? ' - draggable' : '');
		// console.log('tasklabels:', this.task.id, this.labels.list.totalCount);

		const name = this.task.name.split("\n").map((line, i) => <div key={i}>{line}</div>);

		const labels = (!this.labels.isLoading && this.labels.list.length > 0) ?
		<div className="labels">
			{this.sortedTaskLabels.map((tasklabel,i) => <LabelSmall key={i} label={tasklabel} />)}
		</div> : '';

		const avatar = this.task.person ?
			<PersonAvatar className="avatar" person={this.task.person} size={26} />
			: null;

		return (
			<div className={'task-card ' + (this.isDragging() ? 'is-dragging' : '')}
			     draggable="true"
			     ref={node => this.props.getRef && this.props.getRef(node)}
			     onMouseMove={e => this.props.onMouseMove(e, this.task)}
			     onClick={e => this.handleOnClick(e)}
			     onDragStart={e => this.props.onDragStart(e, this.task)}
			     onTouchStart={e => this.props.onTouchStart(e, this.task)}
				>
				<div className="task-content" style={{borderLeftColor: this.task.boardList.color || defaultListColor}}>
					{this.props.showDebugInfo && (<div className="debug-info">
						id: {this.task.id},
						priority: {parseFloat(this.task.priority).toFixed(5)},
					</div>)}
					{avatar}
					{name}
					{labels}
					<div className="task-info">
						{this.task.description && <Icon icon="tasks-list" title="У этой задачи есть описание"/>}
					</div>
				</div>
			</div>
		)
	}

}

TaskCard.propTypes = {
	onDragStart: PropTypes.func,
	onTouchStart: PropTypes.func,
	onTouchEnd: PropTypes.func,
	getRef: PropTypes.func,
	onMouseMove: PropTypes.func,
};

export default TaskCard;

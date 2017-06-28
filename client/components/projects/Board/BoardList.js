import React from 'react';
import PropTypes from 'prop-types';
import { computed, observable, extendObservable, action, autorun } from 'mobx';
import { inject, observer } from 'mobx-react';
import { Scrollbars } from 'react-custom-scrollbars';

import TaskCard from './TaskCard';

import {
	defaultTaskPriority,
	transformEasing,
	transformTime,
} from './Board';

import { IconLink } from '../../ui';
import t from '../../../../i18n';

export const defaultListColor = '#ccc';

@inject('store', 'uiStore', 'boardStore') @observer
class BoardList extends React.PureComponent {

	constructor (props) {
		super(props);
		this.props = props;

		this.store = props.store;
		this.uiStore = props.uiStore;
		this.board = props.boardStore;
		this.list = props.list;
		this.project = this.list.project;
		this.isDraggable = props.isDraggable;

		this.taskNodes = {};
		this.bounds = {};
		this.autoScrollTimer = null;
		this.autoScrollRunning = false;

		this.tasks = this.list.tasks();
	}

	componentWillUpdate () {
		this.saveBounds();
	}

	@computed get sortedBoardLists () {
		return this.project.boardLists().list.sort((a, b) => b.priority - a.priority);
	}

	saveBounds () {
		// console.log('saveBounds:', this.list.tasks().totalCount);
		this.list.tasks().list.forEach(task => {
			if (this.taskNodes[task.id]) {
				this.bounds['task' + task.id] = this.taskNodes[task.id].getBoundingClientRect();
			}
		});
		if (this.listHeaderNode) this.bounds['listHeader'] = this.listHeaderNode.getBoundingClientRect();
		if (this.listWrapperNode) this.bounds['listWrapper'] = this.listWrapperNode.getBoundingClientRect();
		if (this.listNode) this.bounds['list'] = this.listNode.getBoundingClientRect();
	}

	isDragging () {
		return !this.isDraggable && this.board.dragList && this.board.dragList.id === this.list.id;
	}

	componentDidUpdate () {
		// console.log('update boardList:', this.list.tasks().totalCount);
		let wrapperDelta = 0;

		{
			const oldWrapperBox = this.bounds['listWrapper'];
			if (this.listWrapperNode && oldWrapperBox) {
				const newWrapperBox = this.listNode.getBoundingClientRect();
				const deltaX = oldWrapperBox.left - newWrapperBox.left;

				if (deltaX !== 0) {
					wrapperDelta = deltaX;

					requestAnimationFrame(() => {
						this.listWrapperNode.style.transform = `translate(${deltaX}px`;
						this.listWrapperNode.style.transition = `transform 0s`;
						this.listWrapperNode.style.zIndex = 10;

						requestAnimationFrame(() => {
							this.listWrapperNode.style.transform = '';
							this.listWrapperNode.style.transition = `transform ${transformTime} ${transformEasing}`;
							this.listWrapperNode.addEventListener('transitionend', () => {
								this.listWrapperNode.style.zIndex = 0;
							});
						});

					});
				}
			}

		}

		// animate list and tasks only if listWrapper has not been moved (no list deletion occured)
		if (wrapperDelta === 0) {

			/*
			 const oldListBox = this.bounds['list'];
			 let listInverseScaleY = 1;
			 if (this.listNode && oldListBox) {
			 const newListBox = this.listNode.getBoundingClientRect();
			 const deltaX = oldListBox.left - newListBox.left;
			 const deltaY = oldListBox.top - newListBox.top;
			 const scaleY = oldListBox.height / newListBox.height;
			 listInverseScaleY = 1 / scaleY;

			 if (deltaX !== 0 || deltaY !== 0 || scaleY != 1) {
			 // console.log('animating list bounds: deltaX:', deltaX, ', deltaY:', deltaY, ', scaleY:', scaleY);

			 requestAnimationFrame(() => {
			 if (this.listNode) {
			 this.listNode.style.transform = `translate(${deltaX}px, ${deltaY}px) scaleY(${scaleY})`;
			 this.listNode.style.transition = `transform 0s`;
			 this.listNode.style.zIndex = 15;

			 requestAnimationFrame(() => {
			 this.listNode.style.transform = '';
			 this.listNode.style.transition = `transform ${transformTime} ${transformEasing}`;
			 this.listNode.addEventListener('transitionend', () => {
			 this.listNode.style.zIndex = 0;
			 });
			 });
			 }

			 });
			 }
			 }
			 */

			this.list.tasks().list.forEach(task => {
				if (this.board.dragTask) {
					if (this.board.dragTask.id === task.id) {
						return;
					}
				}
				const taskNode = this.taskNodes[task.id];
				const oldBox = this.bounds['task' + task.id];
				if (taskNode && oldBox) {
					const newBox = taskNode.getBoundingClientRect();
					const deltaX = oldBox.left - newBox.left;
					const deltaY = this.board.dragTask ? oldBox.top - newBox.top : 0;
					const scaleY = oldBox.height / newBox.height;
					// console.log('task:', task.id, deltaX, deltaY, scaleY);

					// if (deltaX !== 0 || deltaY !== 0 || scaleY !== 1) {
					if (deltaX !== 0 || deltaY !== 0) {
						requestAnimationFrame(() => {
							taskNode.style.transform = `translate(${deltaX}px, ${deltaY}px) scaleY(${scaleY})`;
							taskNode.style.transition = 'transform 0s';

							requestAnimationFrame(() => {
								taskNode.style.transform = '';
								taskNode.style.transition = `transform ${transformTime} ${transformEasing}`;
							});

						});
					}
				}
			});

		}
	}

	handleAddTask (e) {
		e.preventDefault();
		e.stopPropagation();
		this.board.addTask(this.list.id);
		this.addTaskText.value = '';
		setTimeout(() => this.addTaskText.focus(), 0);
	}

	handleSubmitNewTask (e) {
		e.preventDefault();
		e.stopPropagation();
		const name = this.addTaskText.value.trim();
		if (name.length > 0) {
			const newTask = new this.store.Task({
				projectId: this.project.id,
				private: true,
				boardListId: this.list.id,
				name: name,
				priority: this.tasks.list.length > 0 ? this.tasks.list[0].priority + 1 : defaultTaskPriority,
			});
			console.log('newTask:', newTask);
			this.board.endEditing();
			newTask.save().then(result => {
				console.log('saved new Task:', result.data);
				newTask.id = result.data.id;
				this.tasks.list.splice(0, 0, newTask);
				// this.list.project.tasks().reload();
			})
		}
		else {
			this.addTaskText.focus();
		}
	}

	handleCancelAddTask (e) {
		e.preventDefault();
		e.stopPropagation();
		this.board.endEditing();
	}

	calcMouseCoordsInTask (e, task) {
		const taskX = this.taskNodes[task.id].getBoundingClientRect().left;
		const taskY = this.taskNodes[task.id].getBoundingClientRect().top;

		const x = e.clientX - taskX;
		const y = e.clientY - taskY;

		return { x, y };
	}

	calcTouchCoordsInTask (e, task) {
		const taskX = this.taskNodes[task.id].getBoundingClientRect().left;
		const taskY = this.taskNodes[task.id].getBoundingClientRect().top;

		const x = e.targetTouches[0].clientX - taskX;
		const y = e.targetTouches[0].clientY - taskY;

		return { x, y };
	}

	calcMouseCoordsInList (e) {
		const listX = this.listWrapperNode.getBoundingClientRect().left;
		const listY = this.listWrapperNode.getBoundingClientRect().top;

		const x = e.clientX - listX;
		const y = e.clientY - listY;

		return { x, y };
	}

	handleListHeaderMouseEnter () {
		if (this.board.dragTask) {
			this.tasksListWrapper.scrollToTop();
			const tasks = this.tasks.list;
			const priority = tasks.length > 0 ? tasks[0].priority + 100 : defaultTaskPriority;
			this.board.updateListAndPriority({
				boardList: this.list,
				newIndex: 0,
				priority: priority,
			});
		}
	}

	handleListWrapperEnter (e) {
		if (this.board.dragTask && this.tasksListWrapper.refs.container) {
			// console.log('handleListWrapperEnter');

			const listY = this.tasksListWrapper.refs.container.getBoundingClientRect().top;

			const y = e.clientY - listY;

			const tasksList = this.tasksListWrapper.refs.container.getElementsByClassName('tasks-list')[0];

			if (y > tasksList.offsetHeight) {
				// console.log('handleListWrapperEnter:', {x, y}, tasksList.offsetHeight);
				if (this.board.dragTask && this.board.dragTask.boardListId !== this.list.id) {
					const tasks = this.tasks.list;
					const priority = tasks.length > 0 ? tasks[tasks.length - 1].priority / 2 : defaultTaskPriority;
					const newIndex = tasks.length > 0 ? tasks.length : 0;
					this.board.updateListAndPriority({
						boardList: this.list,
						newIndex: newIndex,
						priority: priority,
					});
				}
			}
		}
	}

	handleListMouseLeave () {
		if (this.autoScrollRunning) {
			this.autoScrollRunning = false;
			clearInterval(this.autoScrollTimer);
		}
	}

	handleListMouseUp () {
		if (this.autoScrollRunning) {
			this.autoScrollRunning = false;
			clearInterval(this.autoScrollTimer);
		}
	}


	handleTaskMouseMove (e, task) {
		if (this.board.dragTask && this.board.dragTask.id !== task.id) {

			const listTasks = this.tasks.list;

			const { y } = this.calcMouseCoordsInTask(e, task);
			let upperHalf = y < this.taskNodes[task.id].getBoundingClientRect().height / 2;


			let changed = false;

			const dir = upperHalf ? -1 : 1;

			const currentTaskIndex = listTasks.findIndex(_task => _task.id === task.id);
			const nextIndex = currentTaskIndex + dir;
			const nextTask = nextIndex < listTasks.length ? listTasks[nextIndex] : null;
			const sameList = this.list.id === this.board.dragTask.boardListId;

			let priority = this.board.dragTask.priority;
			let newIndex = 0;

			// console.info('handleTaskMouseMove:', task.id, {x, y}, upperHalf ? 'upper' : 'lower', ', nextTask:', nextTask && nextTask.id);

			if (upperHalf) {
				if (nextTask) {
					if (nextTask.id !== this.board.dragTask.id) {
						// some OTHER task -> calc new priority and newIndex = this.task.index
						changed = true;
						priority = task.priority + (nextTask.priority - task.priority) / 2;
						newIndex = currentTaskIndex;
					}
				}
				else {
					// no next task -> dragTask is now the FIRST task in list
					changed = true;
					priority = task.priority + 100;
					newIndex = 0;
				}
			}
			else {
				if (nextTask) {
					if (nextTask.id !== this.board.dragTask.id) {
						// some other task -> calc new priority and newIndex = this.task.index
						changed = true;
						priority = nextTask.priority + (task.priority - nextTask.priority) / 2;
						newIndex = sameList ? currentTaskIndex : currentTaskIndex + 1;
					}
				}
				else {
					// no next task -> dragTask is now the LAST task in list
					changed = true;
					priority = task.priority / 2;
					newIndex = sameList ? currentTaskIndex : listTasks.length;
				}
			}
			if (changed) {
				// console.log(upperHalf ? 'upperHalf' : 'lowerHalf', ' of ', task.id, ', list:', task.boardListId, ', newIndex:' + newIndex + ', priority:' + priority);
				if (newIndex === undefined) console.error('newIndex undefined!');

				this.board.updateListAndPriority({
					boardList: task.boardList,
					newIndex: newIndex,
					priority: priority,
				});
			}

		}

	}

	handleWrapperMouseMove (e) {
		// console.log('handleWrapperMouseMove');
		if (this.board.dragList && this.board.dragList.id !== this.list.id) {
			const {x} = this.calcMouseCoordsInList(e);
			let leftHalf = x < this.listWrapperNode.getBoundingClientRect().width / 2;
			let changed = false;
			let priority;

			if (leftHalf) {
				const nextList = this.getNextList(this.list, 1);
				if (nextList) {
					if (nextList.id !== this.board.dragList.id) {
						// console.log('leftHalf of ', this.list.id, ' > there is next list:', nextList.id, ', priority:', nextList.priority);
						changed = true;
						priority = this.list.priority + (nextList.priority - this.list.priority) / 2;
					}
				}
				else {
					// console.log('leftHalf of ', this.list.id, '> no next list: priority+1');
					changed = true;
					priority = this.list.priority + 100;
				}
			}
			else {
				const nextList = this.getNextList(this.list, -1);
				if (nextList) {
					if (nextList.id !== this.board.dragList.id) {
						// console.log('rightHalf of ', this.list.id, ' > there is next list:', nextList.id, ', priority:', nextList.priority);
						changed = true;
						priority = nextList.priority + (this.list.priority - nextList.priority) / 2;
					}
				}
				else {
					// console.log('rightHalf of ', this.list.id, ' > no next list: priority/2');
					changed = true;
					priority = this.list.priority / 2;
				}
			}

			if (changed) {
				this.board.updateDraggedList({
					boardList: this.list,
					leftHalf,
					priority
				});
			}
		}

		if (this.board.dragTask && this.board.dragTask.boardListId !== this.list.id) {
			const tasks = this.tasks.list;
			const priority = tasks.length > 0 ? tasks[tasks.length - 1].priority / 2 : defaultTaskPriority;
			this.board.updateListAndPriority({
				boardList: this.list,
				newIndex: tasks.length,
				priority: priority,
			});
		}
	}

	getNextList (list, dir) {
		let lists = this.sortedBoardLists;

		if (dir > 0) {
			const newArr = lists.filter(l => l.priority > list.priority);
			return newArr.length > 0 ? newArr[newArr.length - 1] : null;
		}
		else {
			const newArr = lists.filter(l => l.priority < list.priority);
			return newArr.length > 0 ? newArr[0] : null;
		}
	}

	handleListDragStart (e) {
		console.log('------------------------------------------------');
		e.preventDefault();
		this.board.endEditing();
		const { x, y } = this.calcMouseCoordsInList(e);
		const payload = {
			list: this.list,
			dragListData: {
				priority: this.list.priority,
				taskId: this.list.id,
				clickX: x - 10,
				clickY: y,
			}
		};
		this.board.startListDrag(payload);
	}

	handleListNameHover (e) {
		// e.target.style.color = this.list.color || defaultListColor;
	}

	handleListClick (e) {
		e.preventDefault();
		if (!this.board.dragList) {
			this.props.onListEdit(this.list);
		}
	}

	handleTouchStart (e, task) {
		console.log((new Date().getTime()), 'handleTaskDragStart:', task.id, this.tasksListWrapper.getScrollTop());
		e.preventDefault();
		this.board.endEditing();

		const { x, y } = this.calcTouchCoordsInTask(e, task);
		const payload = {
			task,
			dragTaskData: {
				boardListId: task.boardListId,
				priority: task.priority,
				taskId: task.id,
				clickX: x,
				clickY: y,
				width: this.taskNodes[task.id].offsetWidth,
				height: this.taskNodes[task.id].offsetHeight,
			}
		};
		this.board.startTaskDrag(payload);
	}

	handleTaskDragStart (e, task) {
		console.log((new Date().getTime()), 'handleTaskDragStart:', task.id, this.tasksListWrapper.getScrollTop());
		e.preventDefault();
		this.board.endEditing();

		const { x, y } = this.calcMouseCoordsInTask(e, task);
		const payload = {
			task,
			dragTaskData: {
				boardListId: task.boardListId,
				priority: task.priority,
				taskId: task.id,
				clickX: x,
				clickY: y,
				width: this.taskNodes[task.id].offsetWidth,
				height: this.taskNodes[task.id].offsetHeight,
			}
		};
		this.board.startTaskDrag(payload);
	}

	handleTaskClick (e, task) {
		console.log('handleTaskClick:', task.id);
		e.preventDefault();
		if (!this.board.dragTask) {
			this.props.history.push('/tasks/' + task.id);
		}
	}

	handleListMouseMove (e) {
		const wrapperHeight = this.tasksListWrapper.getClientHeight();
		const listHeight = this.listNode.offsetHeight;

		if (this.board.dragTask && listHeight > wrapperHeight && this.tasksListWrapper.refs.container) {
			const container = document.getElementsByClassName('board-lists-container')[0];
			const listTop = this.tasksListWrapper.refs.container.offsetTop;
			const containerOffY = container.getBoundingClientRect().top;
			const height = wrapperHeight;
			const y = e.clientY - listTop - containerOffY;

			const percent = y * 100 / height;
			const listScroll = this.tasksListWrapper.getScrollTop();

			if (percent < 30 && listScroll > 0) {
				if (!this.autoScrollRunning) {
					this.autoScrollRunning = true;
					this.autoScrollTimer = setInterval(() => {
						this.tasksListWrapper.scrollTop(this.tasksListWrapper.getScrollTop() - 1);
					}, 5);
				}
			}
			else if (percent >= 30 && percent <= 70) {
				if (this.autoScrollRunning) {
					this.autoScrollRunning = false;
					clearInterval(this.autoScrollTimer);
				}
			}
			else if (percent > 70) {
				if (!this.autoScrollRunning) {
					this.autoScrollRunning = true;
					this.autoScrollTimer = setInterval(() => {
						this.tasksListWrapper.scrollTop(this.tasksListWrapper.getScrollTop() + 1);
					}, 5);
				}
			}
		}
	}

	// handleDeleteList(e) {
	// 	e.preventDefault();
	// 	this.props.onListDelete(this.list);
	// }

	fakeDelete (e) {
		e.preventDefault();
		e.stopPropagation();
		this.board.fakeDeleteList(this.list);
	}

	handleScrollUpdate (values) {
		const { shadowTop, shadowBottom } = this.refs;
		const { scrollTop, scrollHeight, clientHeight } = values;
		const shadowTopOpacity = 1 / 20 * Math.min(scrollTop, 20);
		const bottomScrollTop = scrollHeight - clientHeight;
		const shadowBottomOpacity = 1 / 20 * (bottomScrollTop - Math.max(scrollTop, bottomScrollTop - 20));
		shadowTop.style.opacity = shadowTopOpacity;
		shadowBottom.style.opacity = shadowBottomOpacity;
		if (this.tasksListWrapper.refs && this.tasksListWrapper.refs.container) {
			shadowTop.style.top = this.tasksListWrapper.refs.container.offsetTop + 'px';
		}
	}

	render () {
		const items = this.tasks.list.map(task =>
			<TaskCard task={task}
			          key={task.id ? task.id : 'newTask'}
			          getRef={node => this.taskNodes[task.id] = node}
			          onMouseMove={e => this.handleTaskMouseMove(e, task)}
			          onClick={e => this.handleTaskClick(e, task)}
			          onDragStart={e => this.handleTaskDragStart(e, task)}
			          onTouchStart={e => this.handleTouchStart(e, task)}
			          dragTask={this.board.dragTask}
			          showDebugInfo={this.uiStore.showDebugInfo}
			/>
		);

		// console.log('List render:', this.list.id, ', items:', items.length);

		const borderStyle = { borderLeftColor: this.list.color || defaultListColor };

		return (
			<div className={"board-list-wrapper" + (this.isDragging() ? ' is-dragging' : '')}
			     ref={node => this.listWrapperNode = node}>
				<div className="board-list"
				     onMouseMove={e => this.handleWrapperMouseMove(e)}
				     onMouseUp={e => this.handleListMouseUp()}>

					<div className="board-list-header"
					     draggable="true"
					     ref={node => this.listHeaderNode = node}
					     style={{ borderLeftColor: this.list.color || defaultListColor }}
					     onDragStart={e => this.handleListDragStart(e)}
					     onMouseEnter={e => this.handleListHeaderMouseEnter()}>

						<a className="board-list-name" href="#"
						   onMouseOver={e => this.handleListNameHover(e)}
						   onClick={e => this.handleListClick(e)}>{this.list.name}</a>

						<div className="board-list-controls">
							{this.list.tasks().list.length}
							<IconLink className={"add-task-link " + (this.board.newTaskListId === this.list.id ? 'disabled' : '')}
							          icon='plus' href="#"
					                  onClick={e => this.handleAddTask(e)}
					                  style={borderStyle}/>
						</div>

						{this.uiStore.showDebugInfo && (<div className="debug-info">
							id: {this.list.id},
							priority: {this.list.priority.toFixed(4)},
							&nbsp;<a href="#" onClick={e => this.fakeDelete(e)}>fakeDelete</a>
						</div>)}
					</div>

					<div className={'add-task ' + (this.board.newTaskListId === this.list.id && !this.isDraggable ? 'active' : '')}>
						<div className="edit-new-task"
						     style={borderStyle}
						     onMouseUp={e => e.stopPropagation()}>
							<textarea rows="2" ref={node => this.addTaskText = node}/>
							<a className="btn btn-primary" href="#" onClick={e => this.handleSubmitNewTask(e)}>Добавить</a>
							<a className="btn btn-default" href="#" onClick={e => this.handleCancelAddTask(e)}>Отмена</a>
						</div>
					</div>

					<Scrollbars ref={node => this.tasksListWrapper = node}
					            onMouseEnter={e => this.handleListWrapperEnter(e)}
					            renderView={props => <div {...props} className="tasks-list-wrapper"/>}
					            autoHide={true}
					            autoHideTimeout={1000}
					            autoHideDuration={1000}
					            onUpdate={values => this.handleScrollUpdate(values)}>
						<div className={"tasks-list"}
						     ref={node => this.listNode = node}
						     onMouseLeave={e => this.handleListMouseLeave()}
						     onMouseMove={e => this.handleListMouseMove(e)}>
							{items}
						</div>
					</Scrollbars>

					<div className="shadow-top" ref="shadowTop"/>
					<div className="shadow-bottom" ref="shadowBottom"/>

				</div>
			</div>
		);
	}

}

BoardList.propTypes = {
	list: PropTypes.object.isRequired,
	onListDelete: PropTypes.func,
	onListEdit: PropTypes.func,
};

export default BoardList;

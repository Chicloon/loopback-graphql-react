import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { observable } from 'mobx';
import { Link } from 'react-router-dom';

import { PersonAvatar } from '../ui';

const ITEM_SIZE = 26;
const MARGIN = 10;
const OUTER_WIDTH = ITEM_SIZE + MARGIN;

@inject('uiStore') @observer
class ProjectMembers extends React.Component {

	@observable showMembers = null;
	@observable hiddenMembers = 0;

	constructor (props) {
		super (props);
		this.uiStore = props.uiStore;
		this.project = props.project;
		this.members = props.project.members();
		this.onResize = this.onResize.bind(this);
	}

	componentDidMount () {
		this.uiStore.subscribeToResize(this.onResize);
		this.calc();
	}

	componentWillUpdate () {
		this.calc();
	}

	componentWillUnmount () {
		this.uiStore.unsubscribeFromResize(this.onResize);
	}

	onResize () {
		// console.log('onResize');
		this.calc();
	}

	calc () {
		this.showMembers = this.members.list.length;
		if (this.node) {
			const hiddenWidth = this.node.scrollWidth - this.node.clientWidth;
			// console.log('calc', this.node.scrollWidth, this.node.clientWidth, hiddenWidth);
			const anyoneHidden = Math.ceil(hiddenWidth / OUTER_WIDTH) > 0;
			this.hiddenMembers = anyoneHidden ? Math.ceil(hiddenWidth / OUTER_WIDTH) + 1 : 0;
			this.showMembers -= this.hiddenMembers;
		}
	}

	render () {
		// console.log('ProjectMembers render: show:', this.showMembers);

		if (this.members.isLoading) {
			return <div>...</div>;
		}

		if (this.members.totalCount === 0) {
			return <div>-</div>;
		}

		const membersMoreX = this.showMembers * OUTER_WIDTH + MARGIN;

		const members = this.members.list.map((member, i) => {
			const count = member.person.tasks().totalCount;
			const badge = count > 0 ? { className: 'blue', label: count } : null;
			const className = i < this.showMembers ? '' : 'no-fit';
			return <PersonAvatar className={className} key={member.id} person={member.person} size={ITEM_SIZE} badge={badge}/>;
		});

		return <div className="project-members-wrapper"
					ref={node => this.node = node}>
			<div className="project-members-content">
				{members}
				<Link className={"more " + (this.hiddenMembers > 0 ? 'visible' : '')}
				      style={{ left: membersMoreX }}
				      to={'/projects/' + this.project.id + '/dashboard'}>
					+{this.hiddenMembers}
				</Link>
			</div>
		</div>;
	}

}

ProjectMembers.propTypes = {
	project: PropTypes.object,
};

export default ProjectMembers;


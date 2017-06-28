import React from 'react';
import PropTypes from 'prop-types';
import { inject, observer } from 'mobx-react';
import { observable } from 'mobx';
import { Link } from 'react-router-dom';

import { LabelSmall } from './Board/Labels';

const ITEM_SIZE = 16;
const MARGIN = 7;
const OUTER_WIDTH = ITEM_SIZE + MARGIN;

@inject('uiStore') @observer
class ProjectLabels extends React.Component {

	@observable showLabels = null;
	@observable hiddenLabels = 0;

	constructor (props) {
		super (props);
		this.uiStore = props.uiStore;
		this.project = props.project;
		this.labels = props.project.labels();
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
		this.showLabels = this.labels.list.length;
		if (this.node) {
			const hiddenWidth = this.node.scrollWidth - this.node.clientWidth;
			console.log('calc', this.node.scrollWidth, this.node.clientWidth, hiddenWidth);
			const anyoneHidden = Math.ceil(hiddenWidth / OUTER_WIDTH) > 0;
			this.hiddenLabels = anyoneHidden ? Math.ceil(hiddenWidth / OUTER_WIDTH) + 1 : 0;
			this.showLabels -= this.hiddenLabels;
			// console.log('labelsNode:', this.node.clientWidth, this.node.scrollWidth, hiddenWidth > 0, this.showLabels, this.hiddenLabels);
		}
	}

	render () {
		console.log('ProjectLabels render');

		if (this.labels.isLoading) {
			return <div>...</div>;
		}

		if (this.labels.totalCount === 0) {
			return <div>-</div>;
		}

		const labelsMoreX = this.showLabels * OUTER_WIDTH + MARGIN;

		const labels = this.labels.list.map((label, i) => {
			const className = i < this.showLabels ? '' : 'no-fit';
			return <LabelSmall className={className} key={i} label={label}/>
		});

		return <div className="project-labels-wrapper"
		            ref={node => this.node = node}>
			<div className="project-labels-content">
				{labels}
				<Link className={"more " + (this.hiddenLabels > 0 ? 'visible' : '')}
				      style={{ left: labelsMoreX }}
				      to={'/projects/' + this.project.id + '/edit'}>
					+{this.labels.list.length - this.showLabels}
				</Link>
			</div>
		</div>;
	}

}

ProjectLabels.propTypes = {
	project: PropTypes.object,
};

export default ProjectLabels;


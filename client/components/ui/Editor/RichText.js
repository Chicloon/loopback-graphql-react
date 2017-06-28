import React from 'react';
import PropTypes from 'prop-types';
import { ContentState, convertFromRaw } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';

import './Rich.scss';

class RichText extends React.Component {

	constructor (props) {
		super(props);
		try {
			this.contentState = convertFromRaw(JSON.parse(this.props.content));
		}
		catch (e) {
			this.contentState = ContentState.createFromText(this.props.content || '')
		}
		this.html = stateToHTML(this.contentState);
	}

	componentDidMount() {
		this.node.innerHTML = this.html;
	}

	render () {
		return <div className={"rich-text " + (this.props.className || '')} ref={node => this.node = node} />;
	}

}

RichText.propTypes = {
	content: PropTypes.any,
	className: PropTypes.string,
};

RichText.defaultProps = {
};

export default RichText;


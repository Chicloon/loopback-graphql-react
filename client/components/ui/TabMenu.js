import React from 'react';

class TabMenu extends React.Component {

	componentDidMount () {
		this.leftGradient.style.opacity = 0;
	}

	handleScroll (e) {
		const leftX = e.target.scrollLeft;
		const width = e.target.clientWidth;
		const rightX = this.tabsContainer.scrollWidth - width - leftX;
		// console.log('handleScroll:', leftX, rightX, width, this.tabsContainer.scrollWidth);
		this.leftGradient.style.opacity = Math.min(leftX, this.leftGradient.offsetWidth) / this.leftGradient.offsetWidth;
		this.rightGradient.style.opacity = Math.min(rightX, this.rightGradient.offsetWidth) / this.rightGradient.offsetWidth;
	}

	render () {
		return (
			<div className="tab-menu" ref={node => this.node = node} onScroll={e => this.handleScroll(e)}>
				<div className="tabs" ref={node => this.tabsContainer = node}>
					{this.props.children}
				</div>
				<div className="gradient-left" ref={node => this.leftGradient = node} />
				<div className="gradient-right" ref={node => this.rightGradient = node} />
			</div>
		);
	}
}

export default TabMenu;

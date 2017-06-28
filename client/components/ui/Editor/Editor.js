import React from 'react';
import PropTypes from 'prop-types';
import { observable, action, autorunAsync } from 'mobx';
import { inject, observer } from 'mobx-react';
import { Editor as DraftJSEditor, EditorState, ContentState, RichUtils, convertFromRaw, convertToRaw } from 'draft-js';

import './Rich.scss';

@inject('store', 'uiStore') @observer
class Editor extends React.Component {

	// @observable value = null;
	@observable active = false;
	@observable editorState = null;

	constructor (props) {
		super(props);
		this.store = props.store;
		this.uiStore = props.uiStore;
		this.value = this.props.value;
	}

	componentDidMount () {
		this.getEditorState();
		console.log('Editor: componentDidMount');
		if (this.props.autoFocus) {
			autorunAsync(() => {
				this.focus();
			});
		}
	}

	componentWillUpdate (nextProps) {
		if (!!this.props.value && !nextProps.value) {
			this.empty();
		}
	}

	componentDidUpdate () {
		// console.log('componentDidUpdate', this.props.value);
		this.getEditorState();
	}

	getEditorState () {
		// console.log('getEditorState:', this.value);
		if (!this.editorState) {
			if (this.value) {
				try {
					this.editorState = EditorState.createWithContent(convertFromRaw(JSON.parse(this.value)));
				}
				catch (e) {
					this.editorState = EditorState.createWithContent(ContentState.createFromText(this.value))
				}
			}
			else {
				this.editorState = EditorState.createEmpty();
			}
		}
	}

	empty () {
		this.editorState = EditorState.createEmpty();
	}

	focus () {
		this.editor.focus();
		this.active = true;
	}

	blur () {
		this.active = false;
		const content = this.editorState.getCurrentContent();
		if (this.props.onChange) {
			const plain = content.getPlainText();
			let text = this.props.rich ? JSON.stringify(convertToRaw(content)) : plain;
			if (plain.length < 1) {
				// console.log('empty text -> convert to plain');
				text = '';
			}
			this.props.onChange(text);
		}
	}

	onEditorChange (editorState) {
		this.editorState = editorState;
	}

	handleKeyCommand (command) {
		const newState = RichUtils.handleKeyCommand(this.editorState, command);
		if (newState) {
			this.onEditorChange(newState);
			return true;
		}
		return false;
	}

	onTab (e) {
		const maxDepth = 4;
		this.onEditorChange(RichUtils.onTab(e, this.editorState, maxDepth));
	}

	toggleBlockType (blockType) {
		this.onEditorChange(
			RichUtils.toggleBlockType(
				this.editorState,
				blockType
			)
		);
	}

	toggleInlineStyle (inlineStyle) {
		this.onEditorChange(
			RichUtils.toggleInlineStyle(
				this.editorState,
				inlineStyle
			)
		);
	}

	getStyleMap () {
		return {
			CODE: {
				backgroundColor: 'rgba(0, 0, 0, 0.05)',
				fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
				fontSize: 13,
				padding: 2,
			},
		};
	}

	getBlockStyle (block) {
		switch (block.getType()) {
			case 'blockquote':
				return 'RichEditor-blockquote';
			default:
				return null;
		}
	}


	render () {
		if (!this.editorState) {
			return <div>Initializing...</div>;
		}

		let className = 'RichEditor-editor';
		var contentState = this.editorState.getCurrentContent();
		if (!contentState.hasText()) {
			if (contentState.getBlockMap().first().getType() !== 'unstyled') {
				className += ' RichEditor-hidePlaceholder';
			}
		}
		className += this.props.rich ? ' rich' : ' simple';
		if (this.props.multiline) className += ' multiline';

		const editorStyle = {
			minHeight: this.props.rows * this.props.lineHeight,
			lineHeight: this.props.lineHeight + 'px',
		};

		return <div className={"RichEditor-root" + (this.props.inline ? ' inline' : '') + (this.active ? ' active' : '')}
			onBlur={e => this.blur(e)}>
			{this.props.rich && <div className="rich-controls">
				<InlineStyleControls editorState={this.editorState} onToggle={this.toggleInlineStyle.bind(this)}/>
				<BlockStyleControls editorState={this.editorState} onToggle={this.toggleBlockType.bind(this)}/>
			</div>}
			<div className={className} style={editorStyle} onClick={e => this.focus(e)}>
				<DraftJSEditor
					blockStyleFn={this.getBlockStyle}
					customStyleMap={this.getStyleMap()}
					editorState={this.editorState}
					handleKeyCommand={this.handleKeyCommand.bind(this)}
					onChange={this.onEditorChange.bind(this)}
					onTab={this.onTab.bind(this)}
					placeholder={this.props.placeholder}
					ref={node => {
						this.editor = node;
						if (this.props.inputRef) this.props.inputRef(node);
					}}
					spellCheck={!this.props.inline || this.props.spellCheck}/>
			</div>
		</div>;

	}

}

Editor.propTypes = {
	value: PropTypes.any,
	placeholder: PropTypes.string,
	className: PropTypes.string,
	onBlur: PropTypes.func,
	inputRef: PropTypes.func,
	onChange: PropTypes.func,
	spellCheck: PropTypes.bool,
	autoFocus: PropTypes.bool,
	multiline: PropTypes.bool,
	inline: PropTypes.bool,
	rich: PropTypes.bool,
	rows: PropTypes.number,
	lineHeight: PropTypes.number,
};

Editor.defaultProps = {
	spellCheck: true,
	multiline: false,
	inline: false,
	rich: true,
	autoFocus: false,
	rows: 1,
	lineHeight: 21,
};

export default Editor;


/**
 *
 *  Editor helper
 *
 */

export class StyleButton extends React.Component {
	constructor () {
		super();
		this.onToggle = (e) => {
			e.preventDefault();
			this.props.onToggle(this.props.style);
		};
	}

	render () {
		let className = 'RichEditor-styleButton ' + (this.props.className || '');
		if (this.props.active) {
			className += ' RichEditor-activeButton';
		}

		return (
			<span className={className} onClick={this.onToggle}>
              {this.props.label}
            </span>
		);
	}
}

const BLOCK_TYPES = [
	// { label: 'H1', style: 'header-one' },
	// { label: 'H2', style: 'header-two' },
	// { label: 'H3', style: 'header-three' },
	// { label: 'H4', style: 'header-four' },
	// { label: 'H5', style: 'header-five' },
	// { label: 'H6', style: 'header-six' },
	{ label: 'Blockquote', style: 'blockquote', className: 'block-quote' },
	{ label: 'UL', style: 'unordered-list-item', className: 'block-ul' },
	{ label: 'OL', style: 'ordered-list-item', className: 'block-ol' },
	{ label: 'Code Block', style: 'code-block', className: 'block-code' },
];

export const BlockStyleControls = (props) => {
	const { editorState } = props;
	// console.log('BlockStyleControls:', editorState);
	const selection = editorState.getSelection();
	const blockType = editorState
		.getCurrentContent()
		.getBlockForKey(selection.getStartKey())
		.getType();

	return (
		<div className="RichEditor-controls">
			{BLOCK_TYPES.map((type) =>
				<StyleButton
					key={type.label}
					active={type.style === blockType}
					className={type.className}
					onToggle={props.onToggle}
					style={type.style}
				/>
			)}
		</div>
	);
};

var INLINE_STYLES = [
	{ label: 'B', style: 'BOLD', className: 'rich-bold' },
	{ label: 'I', style: 'ITALIC', className: 'rich-italic' },
	{ label: 'U', style: 'UNDERLINE', className: 'rich-underline' },
	{ label: 'Mono', style: 'CODE', className: 'rich-monospace' },
];

export const InlineStyleControls = (props) => {
	var currentStyle = props.editorState.getCurrentInlineStyle();
	return (
		<div className="RichEditor-controls">
			{INLINE_STYLES.map(type =>
				<StyleButton
					key={type.label}
					active={currentStyle.has(type.style)}
					className={type.className}
					label={type.label}
					onToggle={props.onToggle}
					style={type.style}
				/>
			)}
		</div>
	);
};

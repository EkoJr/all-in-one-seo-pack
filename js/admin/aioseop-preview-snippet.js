/**
 * Handles the Preview Snippet on the Edit screen.
 *
 * @since 3.3.0
 * 
 * @package all-in-one-seo-pack
 * @package xregexp
 */

jQuery(function($){

	"use strict";

	let docTitle                 = '';
	let snippetTitle             = $('#aiosp_snippet_title');
	let snippetDescription       = $('#aioseop_snippet_description');
	let aioseopTitle             = $('input[name="aiosp_title"]');
	let aioseopDescription       = $('textarea[name="aiosp_description"]');
	let timeout                  = 0;
	let autogenerateDescriptions = aioseop_preview_snippet.autogenerateDescriptions;
	let skipExcerpt              = aioseop_preview_snippet.skipExcerpt;
	let isGutenbergEditor        = aioseopIsGutenbergEditor();

	$(window).on("load", function() {
		aioseopInitPreviewSnippet();
	});

	/**
	 * Defines the relevant fields and adds the relevant event listeners based on which editor is active.
	 * 
	 * @since 3.3.0
	 * @since 3.3.4 Add support for text tab in Classic Editor.
	 * @since 3.3.5 Run preview snippet only after Classic Editor content iframe is loaded - #3097.
	 */
	function aioseopInitPreviewSnippet() {
		let inputFields = [aioseopTitle, aioseopDescription];

		if (!isGutenbergEditor) {
			docTitle = $('#title');
			let postExcerpt = $('#excerpt');

			inputFields.push(docTitle, postExcerpt);
			aioseopAddPreviewSnippetEventListeners(inputFields);

			aioseopSetClassicEditorTabSwitchEventListener(aioseopUpdatePreviewSnippet);
			aioseopSetClassicEditorEventListener(aioseopUpdatePreviewSnippet);
		
			$('#content_ifr').load(function() {
				aioseopUpdatePreviewSnippet();
			});
		}
		else {
			aioseopSetGutenbergEditorEventListener(aioseopUpdatePreviewSnippet);	
			aioseopAddPreviewSnippetEventListeners(inputFields);
			aioseopUpdatePreviewSnippet();
		}
	}

	/**
	 * Adds event listeners to input fields that need to update the preview snippet on change.
	 * 
	 * @since 3.3.5
	 * 
	 * @param 	Array 	inputFields 	All input fields that need to update the preview snippet on change.
	 */
	function aioseopAddPreviewSnippetEventListeners(inputFields) {
		inputFields.forEach(addEvent);
		function addEvent(item) {
			item.on('keyup', function () {
				aioseopUpdatePreviewSnippet();
			});
		}
	}

	/**
	 * Updates the preview snippet and input field placeholders in the meta box when a change happens.
	 *
	 * @uses wp.data.select().getEditedPostAttribute()
	 * @link https://developer.wordpress.org/block-editor/data/data-core-editor/#getEditedPostAttribute
	 *
	 * @since 3.3.0
	 */
	function aioseopUpdatePreviewSnippet() {
		let postTitle   = '';
		let postContent = '';
		let postExcerpt = '';

		if (aioseopEditorUndefined) {
			return;
		}
		
		if (!isGutenbergEditor) {
			postTitle   = aioseopStripMarkup($.trim($('#title').val()));
			postContent = aioseopGetDescription(aioseopGetClassicEditorContent());
			postExcerpt = aioseopGetDescription($.trim($('#excerpt').val()));
		}
		else {
			postTitle   = aioseopStripMarkup($.trim($('#post-title-0').val()));
			postContent = aioseopGetDescription(wp.data.select('core/editor').getEditedPostAttribute('content'));
			postExcerpt = aioseopGetDescription(wp.data.select('core/editor').getEditedPostAttribute('excerpt'));
		}

		let metaboxTitle       = aioseopStripMarkup($.trim($('input[name="aiosp_title').val()));
		let metaboxDescription = aioseopStripMarkup($.trim($('textarea[name="aiosp_description"]').val()));

		snippetTitle.text(postTitle);
		aioseopTitle.attr('placeholder', postTitle);

		if ('' !== metaboxTitle) {
			snippetTitle.text(metaboxTitle);
		}

		if ('on' === autogenerateDescriptions) {
			snippetDescription.text(postContent);
			aioseopDescription.attr('placeholder', postContent);

			if ('on' !== skipExcerpt & '' !== postExcerpt) {
				snippetDescription.text(postExcerpt);
				aioseopDescription.attr('placeholder', postExcerpt);
			}
		} else {
			snippetDescription.text("");
			aioseopDescription.attr('placeholder', "");
		}

		if ('' !== metaboxDescription) {
			snippetDescription.text(metaboxDescription);
			aioseopDescription.attr('placeholder', metaboxDescription);
		}
	}

	/**
	 * Shortens the description to 160 characters without truncation.
	 * 
	 * @since 3.3.0
	 * @since 3.3.4 Shorten post content to improve performance.
	 * 
	 * @param string postContent
	 * @return string description
	 */
	function aioseopGetDescription(postContent) {
		// Shorten content first to avoid performance drops.
		let description = postContent.substring(0, 5000);

		description = aioseopStripMarkup(description);
		if (160 < description.length) {
			let excessLength = description.length - 160;
			let regex = new XRegExp("[^\\pZ\\pP]*.{" + excessLength + "}$");
			description = XRegExp.replace(description, regex, '');
			description = description + " ...";
		}
		return description;
	}

	/**
	 * Strips all editor markup from a string.
	 * 
	 * @since 3.3.0
	 * 
	 * @param string content
	 * @return string 
	  */
	function aioseopStripMarkup(content) {
		// Remove all HTML tags.
		content = content.replace(/(<[^ >][^>]*>)?/gm, '');
		// Remove all line breaks.
		content = content.replace(/[\r\n]+/gm, ' ');
		return aioseopDecodeHtmlEntities(content.trim());
	}

	/**
	 * Decodes HTML entities to characters.
	 * 
	 * @since 3.3.0
	 * 
	 * @param string encodedString
	 * @return string
	 */
	function aioseopDecodeHtmlEntities(encodedString) {
		let textArea = document.createElement('textarea');
		textArea.innerHTML = encodedString;
		return textArea.value;
	}

});

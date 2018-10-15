<template>
	<div class="result">
		<div class="error" v-if="hasError" v-html="message"></div>
		<div class="success" v-if="hasSuccess" v-html="message"></div>
	</div>
</template>
<script>
export default {
	name: "FormError",
	computed: {
		hasSuccess() {
			return this.$store.getters["form/resultIsSuccess"];
		},
		hasError() {
			return this.$store.getters["form/resultIsError"];
		},
		message() {
			return simpleMarkdownRenderer( this.$store.getters["form/resultMessage"] );
		},
	},
	beforeMount() {
		this.unsubscriber = this.$store.subscribe( ( mutation, state ) => {
			if ( mutation.type === "form/result" ) {
				if ( state.form.result.redirect ) {
					location.href = state.form.result.redirect;
				}
			}
		} );
	},
	beforeDestroy() {
		this.unsubscriber();
	},
};

/**
 * Considers provided text to be some very simple markdown converting it into
 * HTML code.
 *
 * Features following parts of markdown syntax:
 *  * paragraphs
 *  * headings
 *  * inline links
 *  * unordered lists (single level, only)
 *  * ordered lists
 *
 * @param {string} markdown markdown text
 * @returns {string} HTML code
 */
function simpleMarkdownRenderer( markdown ) {
	let lastListType = null;

	return markdown.trim()
		.split( /\s*(?:\r?\n){2}\s*/ )
		.map( paragraph => {
			const blocks = [];
			let block = null;

			paragraph.split( /\r?\n/ )
				.forEach( line => {
					const heading = line.match( /^\s*(#{1,6})\s*(.+)\s*$/ );
					if ( heading ) {
						if ( block && block.type !== "heading" ) {
							blocks.push( block );
							block = null;
						}

						blocks.push( { type: "heading", level: heading[1].length, lines: [heading[2]] } );

						return;
					}

					const listItem = line.match( /^\s*(?:([-*])|(\d+\.))\s*(.+)\s*$/ );
					if ( listItem ) {
						const listType = listItem[1] ? "unordered" : "ordered";

						if ( block ) {
							blocks.push( block );
						}

						block = {
							type: "list",
							listType,
							lines: [listItem[3]],
						};

						return;
					}

					if ( line.match( /^\s\s+/ ) ) {
						if ( block && block.type === "list" ) {
							block.lines.push( line.trim() );
						} else {
							if ( !block ) {
								block = { type: "paragraph", lines: [] };
							}

							block.lines.push( line.trim() );
						}

						return;
					}

					if ( block && block.type !== "paragraph" ) {
						blocks.push( block );
						block = null;
					}
					if ( !block ) {
						block = { type: "paragraph", lines: [] };
					}

					block.lines.push( line.trim() );
				} );

			if ( block ) {
				blocks.push( block );
			}

			return blocks;
		} )
		.reduce( ( blocks, chunks ) => blocks.concat( chunks ), [] )
		.map( ( { type, level, listType, lines } ) => {
			let text = lines.join( " " )
				.replace( /</g, "&lt;" )
				.replace( />/g, "&gt;" )
				.replace( /&/g, "&amp;" )
				.replace( /\[([^\]]+)]\s*\(([^)]+)\)/g, ( _, label, href ) => `<a href="${href}">${label}</a>` );

			switch ( type ) {
				case "heading" :
					text = `<h${level}>${text}</h${level}>`;
					if ( lastListType ) {
						text = ( lastListType === "ordered" ? "</ol>" : "</ul>" ) + text;
						lastListType = null;
					}
					break;

				case "paragraph" :
					text = `<p>${text}</p>`;
					if ( lastListType ) {
						text = ( lastListType === "ordered" ? "</ol>" : "</ul>" ) + text;
						lastListType = null;
					}
					break;

				case "list" : {
					let opener = "";
					let closer = "";

					if ( lastListType && lastListType !== listType ) {
						closer = ( lastListType === "ordered" ? "</ol>" : "</ul>" );
						lastListType = null;
					}

					if ( !lastListType ) {
						opener = ( listType === "ordered" ? "<ol>" : "<ul>" );
						lastListType = listType;
					}

					text = `${closer}${opener}<li>${text}</li>`;
					break;
				}
			}

			return text;
		} )
		.join( "\n" ) + ( lastListType ? lastListType === "ordered" ? "</ol>" : "</ul>" : "" );
}
</script>

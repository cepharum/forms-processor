/**
 * (c) 2018 cepharum GmbH, Berlin, http://cepharum.de
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2018 cepharum GmbH
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * @author: cepharum
 */

/**
 * Implements a renderer for simple markdown
 */
export default class Markdown {
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
	static toHtml( markdown ) {
		let lastListType = null;

		if ( markdown == null ) {
			return "";
		}

		return String( markdown ).trim()
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
}

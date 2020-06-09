/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

type Builder = {
	<K extends keyof HTMLElementTagNameMap>(type: K, ...children: (string | HTMLElement)[]): HTMLElementTagNameMap[K]
	(type: string, ...children: (string | HTMLElement)[]): HTMLElement
}

export const $: Builder = (type: string, ...children: (string | HTMLElement)[]) => {
	const el = document.createElement(type)
	for (const child of children) {
		el.appendChild(typeof child === 'string' ? document.createTextNode(child) : child)
	}
	return el
}

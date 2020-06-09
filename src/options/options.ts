/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { getConfig, setConfig } from '../common/storage'
import { defaultConfig } from '../common/defaultConfig'

const save_options = async () => {
	await setConfig(JSON.parse((document.getElementById('edit-area') as any).value))
	const status = document.getElementById('status')!
	status.textContent = 'Saved.'
	setTimeout(() => (status.textContent = ''), 750)
}

const reset_options = async () => {
	;(document.getElementById('edit-area') as any).value = JSON.stringify(defaultConfig, null, 2)
	await setConfig(JSON.parse((document.getElementById('edit-area') as any).value))
	const status = document.getElementById('status')!
	status.textContent = 'Reset.'
	setTimeout(() => (status.textContent = ''), 750)
}

document.getElementById('save')!.addEventListener('click', save_options)
document.getElementById('reset')!.addEventListener('click', reset_options)
document.addEventListener(
	'DOMContentLoaded',
	async () => ((document.getElementById('edit-area') as any).value = JSON.stringify(await getConfig(), null, 2)),
)

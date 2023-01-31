'use strict';
import * as vscode from 'vscode';

import {
	countUniqueAsc,
	countUniqueDesc,
	countUniqueFilterAsc,
	countUniqueFilterDesc,
	countUniqueCustom
} from './exten_func';

export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(vscode.commands.registerCommand('countunique.CountUnique', async () => {
		const options: { [key: string]: (context: vscode.ExtensionContext) => Promise<void> } = {
			countUniqueAsc,
			countUniqueDesc,
			countUniqueFilterAsc,
			countUniqueFilterDesc,
			countUniqueCustom,
		};
		const quickPick = vscode.window.createQuickPick();
		quickPick.items = Object.keys(options).map(label => ({ label }));
		quickPick.onDidChangeSelection(selection => {
			if (selection[0]) {
				options[selection[0].label](context)
					.catch(console.error);
			}
		});
		quickPick.onDidHide(() => quickPick.dispose());
		quickPick.show();
	}));
}
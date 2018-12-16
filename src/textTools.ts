'use strict';

import * as vscode from 'vscode';
import Window = vscode.window;
import QuickPickItem = vscode.QuickPickItem;
import QuickPickOptions = vscode.QuickPickOptions;
import Document = vscode.TextDocument;
import Position = vscode.Position;
import Range = vscode.Range;
import Selection = vscode.Selection;
import TextDocument = vscode.TextDocument;
import TextEditor = vscode.TextEditor;
//import InputBoxOptions = InputBoxOptions;

var figlet = require('figlet');
import us = require('underscore.string');

class TextTools {

	// String Functions Helper//////////////////////////////
	public toUpper(e: TextEditor, d: TextDocument, sel: Selection[]) {
		e.edit(function (edit) {
			// itterate through the selections and convert all text to Upper
			for (var x = 0; x < sel.length; x++) {
				let txt: string = d.getText(new Range(sel[x].start, sel[x].end));
				edit.replace(sel[x], txt.toUpperCase());
			}
		});
	}

	public toLower(e: TextEditor, d: TextDocument, sel: Selection[]) {
		e.edit(function (edit) {
			// itterate through the selections and convert all text to Lower
			for (var x = 0; x < sel.length; x++) {
				let txt: string = d.getText(new Range(sel[x].start, sel[x].end));
				edit.replace(sel[x], txt.toLowerCase());
			}
		});

	}

	// This function takes a callback function for the text formatting 'formatCB', 
	// if there are any args pass an array as 'argsCB'
	public processSelection(e: TextEditor, d: TextDocument, sel: Selection[], formatCB, argsCB) {
		var replaceRanges: Selection[] = [];
		e.edit(function (edit) {
			// itterate through the selections
			for (var x = 0; x < sel.length; x++) {
				let txt: string = d.getText(new Range(sel[x].start, sel[x].end));
				if (argsCB.length > 0) {
					// in the case of figlet the params are test to change and font so this is hard coded
					// the idea of the array of parameters is to allow for a more general approach in the future
					txt = formatCB.apply(this, [txt, argsCB[0]]);
				} else {
					txt = formatCB(txt);
				}

				//replace the txt in the current select and work out any range adjustments
				edit.replace(sel[x], txt);
				let startPos: Position = new Position(sel[x].start.line, sel[x].start.character);
				let endPos: Position = new Position(sel[x].start.line + txt.split(/\r\n|\r|\n/).length - 1, sel[x].start.character + txt.length);
				replaceRanges.push(new Selection(startPos, endPos));
			}
		});
		e.selections = replaceRanges;
	}

	// Main menu /////////////////////////////////////

}
let textTools: TextTools = new TextTools();

function textFunctions() {

	if (!vscode.window.activeTextEditor) {
		vscode.window.showInformationMessage('Open a file first to manipulate text selections');
		return;
	}

	var opts: QuickPickOptions = { matchOnDescription: true, placeHolder: "What do you want to do to the selection(s)?" };
	var items: QuickPickItem[] = [];

	items.push({ label: "toUpper", description: "Convert [aBc] to [ABC]" });
	items.push({ label: "toLower", description: "Convert [aBc] to [abc]" });
	items.push({ label: "swapCase", description: "Convert [aBc] to [AbC]" });
	items.push({ label: "Titleize", description: "Convert [hello MD tools] to [Hello MD Tools]" });
	items.push({ label: "Camelize", description: "Convert [hello MD-tools] to [HelloMDTools]" });
	items.push({ label: "Clean String", description: "Convert [hello......world] to [hello world]" });
	items.push({ label: "Reverse", description: "Convert [hello world] to [world hello]" });
	items.push({ label: "Escape HTML", description: "Convert [<div>hello] to [&lt;div&gt;hello]" });
	items.push({ label: "UnEscape HTML", description: "Convert [&lt;div&gt;hello] to [<div>hello]" });
	items.push({ label: "Slugify", description: "Convert [txt for an URL] to [txt-for-an-url]" });
	items.push({ label: "ASCII Art", description: "Convert [hello] to ASCII Art" });

	Window.showQuickPick(items).then((selection) => {
		if (!selection) {
			return;
		}
		let e = Window.activeTextEditor;
		let d = e.document;
		let sel = e.selections;

		switch (selection.label) {
			case "toUpper":
				textTools.toUpper(e, d, sel);
				break;
			case "toLower":
				textTools.toLower(e, d, sel);
				break;
			case "swapCase":
				textTools.processSelection(e, d, sel, us.swapCase, []);
				break;
			case "Titleize":
				textTools.processSelection(e, d, sel, us.titleize, []);
				break;
			case "Clean String":
				textTools.processSelection(e, d, sel, us.clean, []);
				break;
			case "Reverse":
				textTools.processSelection(e, d, sel, us.reverse, []);
				break;
			case "Escape HTML":
				textTools.processSelection(e, d, sel, us.escapeHTML, []);
				break;
			case "UnEscape HTML":
				textTools.processSelection(e, d, sel, us.unescapeHTML, []);
				break;
			case "Camelize":
				textTools.processSelection(e, d, sel, us.camelize, []);
				break;
			case "Slugify":
				textTools.processSelection(e, d, sel, us.slugify, []);
				break;
			case "ASCII Art":
				// build a full list of the fonts for the drop down
				items = [];
				figlet.fontsSync().forEach(function (font) {
					items.push({ label: font, description: "User the " + font + " font" });
				}, this);

				Window.showQuickPick(items).then(function (selection) {
					if (!selection) {
						return;
					}
					textTools.processSelection(e, d, sel, figlet.textSync, [selection.label]);
				});
				break;
			default:
				console.log("hum this should not have happend - no selection");
				break;
		}
	});
}


export {textFunctions};

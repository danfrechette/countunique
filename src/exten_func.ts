import {window, Range} from 'vscode';

let outputChannel = window.createOutputChannel("My Extension");

export const printChannelOutput = (content: string, reveal = true): void => {
	outputChannel.appendLine(content);
	if (reveal) { outputChannel.show(true); }
};

async function showInputBox(message?: string, val?: string, ): Promise<string>{
    if(val === undefined) {val = ''; }
    if(message === undefined) { message = 'filter for...'; }

	const result = await window.showInputBox({
		value: '',
		placeHolder: message
	});

    return (result === undefined ? '' : result);
}

async function showQuickPick(message:string, options:Array<string> ): Promise<string> {
	let i = 0;
	const result = await window.showQuickPick(options, {
		placeHolder: message
	});

    return (result === undefined ? '' : result);
}

function addLeadingZeros(num: number, totalLength: number): string {
    return String(num).padStart(totalLength, '0');
}

function sortMapByValAsc(dict: Map<string, number>): Map<string, number>{
    return new Map([...dict.entries()].sort((a, b) => b[1] - a[1]));
}

function sortMapByValDesc(dict: Map<string, number>): Map<string, number>{
    return new Map([...dict.entries()].sort((a, b) => a[1] - b[1]));
}

export async function countUniqueAsc(){
	processPage({ ascSearch: false , filterby:''});
}

export async function countUniqueDesc(){
    processPage({ ascSearch: true , filterby:''});
}

export async function countUniqueFilterAsc(){
    var resfilter: string = await showInputBox();
    processPage({ ascSearch: false , filterby: resfilter});
}

export async function countUniqueFilterDesc(){
    var resfilter: string = await showInputBox();
    processPage({ ascSearch: true , filterby: resfilter});
}

export async function countUniqueCustom(){
    var ascSearch: boolean = (await showQuickPick("Sort Order Ascending?",["Yes","No"] ) === "Yes") ? false : true;
    var ignoreCase: boolean = (await showQuickPick("Ignore Case?",["Yes","No"] ) === "Yes") ? true : false;
    var trimboth: boolean = (await showQuickPick("Trim Leading and Trailing Spaces?",["Yes","No"] ) === "Yes") ? true : false;
    var filterby: string = await showInputBox("Filter criteria.");

    processPage({ ascSearch: ascSearch , filterby: filterby , ignoreCase: ignoreCase, trimboth: trimboth });
}

export async function processPage({ ascSearch=false, filterby='', ignoreCase = true, trimboth = true }: { ascSearch: boolean; filterby?: string; ignoreCase?: boolean, trimboth?:boolean}){
    outputChannel.clear();

    const editor = window.activeTextEditor;

    if(editor){
        let dictUniqueLines = new Map<string, number >();
        let cnt: number = 0;

        const document = editor.document;
        const selection = editor.selection;

        /* Get currently Selected items in the document */
        var word = document.getText(selection);

        if(selection.isEmpty){
            /* selects all text in document */
            var firstLine = editor.document.lineAt(0);
            var lastLine = editor.document.lineAt(editor.document.lineCount - 1);
            var textRange = new Range(firstLine.range.start, lastLine.range.end);
            word = document.getText(textRange);
        }

        var splitted = word.split("\n");

        splitted.forEach(function (value){
            var regexp:RegExp;

            if(ignoreCase){
                regexp = new RegExp(filterby , 'i');
            }else{
                regexp = new RegExp(filterby);
            }

            if (trimboth) { value = value.trim(); }

            var regtest = (filterby.trim() === '' ? true : regexp.test(value));

            if(regtest){
                if(dictUniqueLines.has(value)){
                    let cnt=  dictUniqueLines.get(value);
                    cnt = Number(cnt) + 1;
                    dictUniqueLines.set(value , cnt);
                }
                else {
                    dictUniqueLines.set(value, 1);
                }
            }
        });

        var paddedCount: number = Math.max(...dictUniqueLines.values()).toString().length + 1;

        for (let [key, value] of (ascSearch ? sortMapByValAsc(dictUniqueLines): sortMapByValDesc(dictUniqueLines))) {
            var msg = addLeadingZeros(value, paddedCount) + " => [" + key + "]";
            printChannelOutput (msg, true);
        }
    }
}
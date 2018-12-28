'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as path from 'path';
import { ProgressLocation,CancellationToken,Progress,ProgressOptions,MessageOptions,commands, Disposable, ExtensionContext, StatusBarAlignment, StatusBarItem, TextDocument, Uri, ViewColumn, WebviewPanel, WebviewPanelSerializer, window, workspace, languages, Hover, CodeAction, Command, CodeLens, scm, tasks } from 'vscode';
import { DepNodeProvider, Dependency } from './nodeDependencies';
import { JsonOutlineProvider } from './jsonOutline';
import { FtpExplorer } from './ftpExplorer';
import { FileExplorer } from './fileExplorer';
import { textFunctions } from './textTools';
const cats = {
    'Coding Cat': 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif',
    'Compiling Cat': 'https://media.giphy.com/media/mlvseq9yvZhba/giphy.gif',
    'Testing Cat': 'https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif'
};
// 激活扩展的时候会调用此方法
// 由package.json中定义的激活事件控制
export function activate(context: ExtensionContext) {

    console.log(tasks.taskExecutions);
    
    // 注册一个悬停提供程函数
    // languages.registerHoverProvider('typescript',{
    //     provideHover(document,position,token){
    //         return new Hover('I am a hover');
    //     }
    // });
    // languages.registerCodeActionsProvider({language:'typescript'},{
    //     provideCodeActions(document,range,context,token):Thenable<CodeAction[]>{
    //         console.log(context);
            
    //         return null;
    //     }
    // });
    
    /* // 注册一个CodeLens
    // 在编辑器中代码附近显示可执行命令的标记
    languages.registerCodeLensProvider({scheme:'file',language:'typescript'},{
        provideCodeLenses(document,token):Thenable<CodeLens[]>{
            let position = document.positionAt(1);
            let range = document.getWordRangeAtPosition(position);
            console.log(document.getText(range));
            let codeLens = new CodeLens(range,{command:'HelloWorld',title:'test codelens'})
            return Promise.resolve([codeLens]);
        }
    }); */
    commands.registerCommand('HelloWorld',()=>{
        
        // var  progress:ProgressOptions = {
        //     cancellable:true,
        //     location:ProgressLocation.Notification,
        //     title:"testProgress"
        // };
        // window.withProgress(progress,(progress:Progress<{message:string,increment:number}>,token: CancellationToken):Thenable<{}>=>{
        //     return new Promise((resolve, reject)=>{
        //         progress.report({message:"ttttt",increment:10});
        //         setTimeout(function(){
        //             resolve({test:1});
        //         },5000)
        //     });
        // }).then(function(d){
        //     console.log(d);
        // });
        
        // let doc = window.activeTextEditor.document;
        // window.showTextDocument(doc,2,true);
        window.showInformationMessage("Hello World!",new MessageOption(),'button1','button2').then(function(data){
            console.log(data);
            
        });
        //commands.executeCommand('catCoding.start');
    });
    // 注册依赖包管理器
    const nodeDependenciesProvider = new DepNodeProvider(workspace.rootPath);
    window.registerTreeDataProvider('nodeDependencies', nodeDependenciesProvider);
    commands.registerCommand('nodeDependencies.refreshEntry', () => nodeDependenciesProvider.refresh());
    commands.registerCommand('extension.openPackageOnNpm', moduleName => commands.executeCommand('vscode.open', Uri.parse(`https://www.npmjs.com/package/${moduleName}`)));
    commands.registerCommand('nodeDependencies.addEntry', () => window.showInformationMessage(`Successfully called add entry.`));
    commands.registerCommand('nodeDependencies.editEntry', (node: Dependency) => window.showInformationMessage(`Successfully called edit entry on ${node.label}.`));
    commands.registerCommand('nodeDependencies.deleteEntry', (node: Dependency) => window.showInformationMessage(`Successfully called delete entry on ${node.label}.`));
    
    const jsonOutlineProvider = new JsonOutlineProvider(context);
	window.registerTreeDataProvider('jsonOutline', jsonOutlineProvider);
	commands.registerCommand('jsonOutline.refresh', () => jsonOutlineProvider.refresh());
	commands.registerCommand('jsonOutline.refreshNode', offset => jsonOutlineProvider.refresh(offset));
	commands.registerCommand('jsonOutline.renameNode', offset => jsonOutlineProvider.rename(offset));
    commands.registerCommand('extension.openJsonSelection', range => jsonOutlineProvider.select(range));
    
    	// Samples of `window.createView`
	new FtpExplorer(context);
	new FileExplorer(context);
    
    // 只创建一个视图
    let currentPanel: WebviewPanel | undefined = undefined;

    context.subscriptions.push(commands.registerCommand("catCoding.start", () => {
        if (currentPanel) {
            currentPanel.reveal(ViewColumn.One);
        } else {
            currentPanel = window.createWebviewPanel('catCoding', 'Cat Coding', ViewColumn.One, {
                enableScripts: true,
                localResourceRoots: [
                    Uri.file(path.join(context.extensionPath, 'media'))
                ],
                retainContextWhenHidden: true
            });
            const onDiskPath = Uri.file(path.join(context.extensionPath, 'media', 'giphy.webp'));
            const catGifSrc = onDiskPath.with({ scheme: 'vscode-resource' });
            currentPanel.webview.html = getWebviewContent(catGifSrc);
            currentPanel.webview.onDidReceiveMessage(message => {
                switch (message.command) {
                    case 'alert':
                        window.showErrorMessage(message.text);
                        return;
                }
            }, undefined, context.subscriptions);
            currentPanel.onDidDispose(() => { currentPanel = undefined; }, undefined, context.subscriptions);
        }
    }));
    context.subscriptions.push(commands.registerCommand('catCoding.doRefactor', () => {
        if (!currentPanel) {
            return;
        }
        currentPanel.webview.postMessage({ command: 'refactor' });
    }));
    context.subscriptions.push(commands.registerCommand('extension.textFunctions', textFunctions));
    window.registerWebviewPanelSerializer('catCoding', new CatCodingSerializer(context));

    // 使用控制台输出诊断信息(console.log)和错误(console.error)。
    // 这行代码只会在您的扩展被激活时执行一次。
    console.log('Congratulations, your extension "vscodeex" is now active!');

    //创建一个新字符计数器
    let wordCounter = new WordCounter();
    let controller = new WordCounterController(wordCounter);
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    /*let disposable = commands.registerCommand('extension.sayHello', () => {
        // The code you place here will be executed every time your command is executed
        wordCounter.updateWordCount();
        // Display a message box to the user
    });*/

    //添加到禁用此扩展时已处理的可处理函数列表中。
    context.subscriptions.push(controller);
    context.subscriptions.push(wordCounter);
}
// showInformationMessage 的参数类
// 默认为false非模拟弹窗
// 参数类型:boolean
class MessageOption implements MessageOptions{
    modal:boolean = false;
    constructor(modal?:boolean){
        this.modal = modal;
    }
}
class CatCodingSerializer implements WebviewPanelSerializer {
    private catGifSrc: Uri = null;
    /**
     *
     */
    constructor(context: ExtensionContext) {
        const onDiskPath = Uri.file(path.join(context.extensionPath, 'media', 'giphy.webp'));
        this.catGifSrc = onDiskPath.with({ scheme: 'vscode-resource' });
    }
    async deserializeWebviewPanel(webviewPanel: WebviewPanel, state: any) {
        console.log(`Got state ${state}`);

        webviewPanel.webview.html = getWebviewContent(this.catGifSrc);
    }

}
function getWebviewContent(cat: Uri) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cat Coding</title>
    <style>
        body.vscode-dark {
            color: white;
        }
    </style>
</head>
<body>
    <img src="${cat}" width="300" />
    <h1 id="lines-of-code-counter">0</h1>
    <script>
        const vscode = acquireVsCodeApi();
        const counter = document.getElementById('lines-of-code-counter');

        const previousState = vscode.getState();
        let count = previousState ? previousState.count : 0;
        counter.textContent = count;

        setInterval(()=>{
            counter.textContent = count++;
            vscode.setState({count});
            if(Math.random()<0.001*count){
                vscode.postMessage({
                    command:'alert',
                    text:'🐛  on line ' + count
                });
            }
        },100);
        window.addEventListener('message',event=>{
            const message = event.data;
            switch (message.command) {
                case 'refactor':
                    count = Math.ceil(count * 0.5);
                    counter.textContent = count;
                    break;
                default:
                    break;
            }
        });
    </script>
</body>
</html>`;
}
class WordCounter {
    private _statusBarItem: StatusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);

    public updateWordCount() {
        //获得当前文档编辑器
        let editor = window.activeTextEditor;
        if (!editor) {
            this._statusBarItem.hide();
            return;
        }

        let doc = editor.document;

        //只有在ts文件的情况下更新
        if (doc.languageId === "typescript") {
            let wordCount = this._getWordCount(doc);

            //更新状态栏
            this._statusBarItem.text = wordCount !== 1 ? `$(pencil) ${wordCount} 空格` : '1 空格';
            this._statusBarItem.show();
        } else {
            this._statusBarItem.hide();
        }
    }

    public _getWordCount(doc: TextDocument): number {

        let docContent = doc.getText();

        //解析出不需要的空格
        docContent = docContent.replace(/(< ([^>]+)<)/g, '').replace(/\s+/g, ' ');
        docContent = docContent.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
        let wordCount = 0;
        if (docContent !== "") {
            wordCount = docContent.split(" ").length;
        }
        return wordCount;
    }

    dispose() {
        this._statusBarItem.dispose();
    }
}

class WordCounterController {
    private _wordCounter: WordCounter;
    private _disposable: Disposable;

    constructor(wordCounter: WordCounter) {
        this._wordCounter = wordCounter;

        //订阅选择更改和编辑器激活事件
        let subscriptions: Disposable[] = [];
        window.onDidChangeTextEditorSelection(this._onEvent, this, subscriptions);
        window.onDidChangeActiveTextEditor(this._onEvent, this, subscriptions);

        //为当前文档更新计数器
        this._wordCounter.updateWordCount();

        //清理订阅事件
        this._disposable = Disposable.from(...subscriptions);
    }

    dispose() {
        this._disposable.dispose();
    }

    private _onEvent() {
        this._wordCounter.updateWordCount();
    }
}

import { Task, tasks, TreeDataProvider, TreeItem,EventEmitter,Event } from 'vscode';
export class TasksManeger implements TreeDataProvider<Task>{
    private tasks:Task[];
    private _onDidChangeTreeData: EventEmitter<Task | null> = new EventEmitter<Task | null>();
    readonly onDidChangeTreeData: Event<Task | null> = this._onDidChangeTreeData.event;
    // 构建函数,获得任务列表,触发更新函数
    constructor(){
        this.refresh();
    }
    // 刷新
    refresh(): void {
        tasks.fetchTasks().then((tasks)=>{
            this.tasks = tasks;
            this._onDidChangeTreeData.fire();
        });
		this._onDidChangeTreeData.fire();
    }
    // 把任务名字传递到树中
    getTreeItem(task:Task): TreeItem{
        
        return new TreeItem(task.name);
    }
    
    getChildren(task?:Task):Thenable<Task[]>{
        
        return Promise.resolve(this.tasks);
    }

    runTask(task:Task){
        tasks.executeTask(task);
    }
}
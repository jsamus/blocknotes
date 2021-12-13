const { ipcRenderer } = require('electron');

function Task(text,state,index){
    this.index = index
    this.text = text;
    this.state = state;
}


// ipcRenderer.on("window-docked",()=>{
//     app.setDocked();
//     // console.log("setting docked to true");
// });

const app = Vue.createApp({
    data(){
        return{
            projectname : "",
            projectinput : "",
            taskInput : "",
            taskList : [],
            noteInput: "",
            taskToggle : false,
            noteToggle : false,
            explorerToggle : false,
            dropdownMenuToggle: false,
            appHeight : 0,
            isDocked: false,
        }
    },
    mounted() {
        ipcRenderer.on("dock-window",()=>{
            this.isDocked = true;
        }),
        ipcRenderer.on("undock-window",()=>{
            this.isDocked = false;
        }),
        ipcRenderer.on("window-closed",()=>{
            
        })
    }
    ,
    computed:{
        doneTasks(){
            let matchingObjects = this.taskList.filter(obj => {
            return obj.state === true;
            })
            return matchingObjects.length;
        },
        projectProgress() {
            let percentageDone = (this.doneTasks/this.taskList.length)*100;
            return { width: percentageDone + "%" };
        },
        resizeTrigger(){
            return [this.taskToggle,this.noteToggle,this.explorerToggle,this.dropdownMenuToggle,this.taskList];
        }
    },
    watch:{
        isDocked(){
            console.log("isDocked changed!");
        },
        projectname(){
            console.log(this.projectname);
        },
        taskList(){
            console.log("something was added");
        },
        taskToggle(){
            this.dropdownMenuToggle = false;
        },
        noteToggle(){
            this.dropdownMenuToggle = false;
        },
        exporerToggle(){
            this.dropdownMenuToggle = false;
        },
        resizeTrigger:{
            deep: true,
            handler: function(){
                //let appHeight = document.getElementById('app-wrapper').clientHeight;
                //console.log("appheight",appHeight);
                //this.sendToMain("resize-window",appHeight);
            }   
        }
    },
    updated: function () {
        this.$nextTick(function () {
            console.log("VIEW RERENDERED")
            let appHeight = document.getElementById('app-wrapper').clientHeight;
            console.log("appheight",appHeight);
            this.sendToMain("resize-window",appHeight+1);
        })
    },
    methods:{
        sendToMain(message,arg){
            console.log("sending "+message+" with value:"+arg+" ...");
            ipcRenderer.send(message,arg);
        },
        calcHeight(){
            let finalHeight;
            //added Height = 30px to + 30px project + 26px dropdown
            let barHeight = 30;
            let boolArr = [+this.taskToggle,+this.noteToggle,+this.explorerToggle]
            let numberOfToggledComps = boolArr.reduce((val1,val2) => val1+val2);
            console.log(numberOfToggledComps);
            finalHeight = (barHeight*2+27)+(numberOfToggledComps*30);
            this.sendToMain("resize-window",finalHeight);
            console.log("resizing to "+finalHeight+" ...");
        },
        setProjectName(){
            this.taskToggle = true;
            this.projectname = this.projectinput;
        },
        addTaskToList(){
            console.log(this.taskList);
            let newIndex = this.taskList.length+1;
            let newTask = new Task(this.taskInput,false,newIndex);
            this.taskList.push(newTask);
            this.taskInput = "";
            
            // let keyNum = Object.keys(this.taskList).length+1;
            // this.taskList[keyNum.toString(10)] = newTask;
            // console.log(JSON.parse(JSON.stringify(newTask)));
            // console.log(this.taskList);
            
        },
        removeTaskFromList(value,index){
            this.taskList.splice(index,1);
            console.log(value,index)
        }
        ,
        toggleDropdownMenu(){
            this.dropdownMenuToggle = !this.dropdownMenuToggle;
        },
        setDocked(){
            this.isDocked = true;
        }
    }
});

app.mount("#app-wrapper");
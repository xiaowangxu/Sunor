function _SUNOR_styled_log(title = 'Sunor', text = '') {
    console.log(`%c${title}%c${text}`, "background-color: rgb(70,35,230); color:white; padding: 1px 6px 1px 8px; border-radius: 2px 0px 0px 2px;", "background-color:  rgb(20,30,40);padding: 1px 6px 1px 8px; border-radius: 0px 2px 2px 0px; color:white;");
}
_SUNOR_styled_log(undefined, "v0.0.1");
var DomUpdateType;
(function (DomUpdateType) {
    DomUpdateType[DomUpdateType["Change"] = 0] = "Change";
    DomUpdateType[DomUpdateType["Insert"] = 1] = "Insert";
    DomUpdateType[DomUpdateType["Move"] = 2] = "Move";
    DomUpdateType[DomUpdateType["Delete"] = 3] = "Delete";
})(DomUpdateType || (DomUpdateType = {}));
class WrapValue {
    constructor(box, from = null, to = null, value) {
        this.$from = null;
        this.$to = null;
        this.$from = from;
        this.$to = to;
        this.$box = box;
        this.$val_ref = value;
    }
    un_wrap() {
        return this.$val_ref;
    }
}
class UpdateTask {
    constructor(func) {
        this.$task_func = func;
    }
    $preform() {
        this.$task_func();
    }
}
class DepTask {
}
export class TaskQueue {
    constructor() {
        this.$update_queue = [];
        this.$will_flush = false;
    }
    ;
    $flush_queue() {
        if (this.$will_flush)
            return;
        this.$will_flush = true;
        Promise.resolve().then(() => {
            this.$perform_tasks();
            this.$will_flush = false;
            this.$update_queue = [];
        });
    }
    $perform_tasks() {
        for (const task of this.$update_queue) {
            task.$preform();
        }
    }
    $add_task(task) {
        this.$update_queue.push(task);
        this.$flush_queue();
    }
}
export class Box {
    constructor() {
        this.$fragment = undefined;
        this.$update_render = () => { };
    }
    $trigger() {
        this.$update_render();
    }
    set fragment(fragment) {
        this.$fragment = fragment;
    }
    get $inner_value() { return undefined; }
    $request_change(oldVal, newVal, oldIndex = null, newIndex = null) {
        var _a;
        (_a = this.$fragment) === null || _a === void 0 ? void 0 : _a.$box_update_notify(this);
    }
}
export class Value extends Box {
    constructor(defaulVal) {
        super();
        this.$value = defaulVal;
    }
    set(newVal) {
        const oldVal = this.$value;
        this.$value = newVal;
        this.$request_change(oldVal, newVal, null, null);
    }
    get() {
        return new WrapValue(this, null, null, this.$value);
    }
    get $inner_value() {
        return this.$value;
    }
}
export class List extends Box {
    constructor(list = []) {
        super();
        this.$array = list;
    }
    append(item) {
        const len = this.$array.length;
        this.$array.push(item);
        this.$request_change(undefined, this.$array, null, len);
    }
    get $inner_value() {
        return this.$array;
    }
}
function N(tagName, textContent = "", children = []) {
    let subs = [];
    const root = document.createElement(tagName);
    root.textContent = textContent;
    for (const [node, sub] of children) {
        root.appendChild(node);
        subs = subs.concat(sub);
    }
    return [root, subs];
}
export class ViewFragment {
    constructor(setup) {
        this.$tasks_queue = new TaskQueue();
        this.$roots = [];
        const res = setup();
        this.$boxs = res.boxs;
        for (const [node, _subs] of res.nodes)
            if (node instanceof HTMLElement)
                this.$roots.push(node);
        this.$update_render = res.update;
    }
    $box_update_notify(box) {
        this.$tasks_queue.$add_task(new UpdateTask(this.$update_render));
    }
    mount(dom) {
        this.$boxs.forEach(box => box.fragment = this);
        if (this.$roots !== undefined)
            for (const elem of this.$roots) {
                dom.appendChild(elem);
            }
        this.$update_render();
    }
}
// TEST
function View() {
    return new ViewFragment(() => {
        const box1 = new Value(1);
        const box2 = new Value(1);
        const box3 = new Value("Sunor");
        const h1 = N("h1");
        const h2 = N("h2");
        const textarea = N("textarea");
        const div = N("div", "parent", [textarea]);
        const button = N("button", "+");
        const update = () => {
            h1[0].textContent = `Hello Sunor ${box1.$inner_value}`;
            h2[0].textContent = `${box1.$inner_value} + ${box2.$inner_value} = ${box1.$inner_value + box2.$inner_value}`;
            textarea[0].value = box3.$inner_value;
        };
        button[0].addEventListener("click", () => {
            box1.set(box1.get().un_wrap() + 1);
            box2.set(box2.get().un_wrap() + 2);
            box3.set(`Sunor ${box1.get().un_wrap() + box2.get().un_wrap()}`);
        });
        return {
            "boxs": [box1, box2, box3],
            "nodes": [h1, h2, div, button],
            "update": update
        };
    });
}
const v = View();
const mt = document.getElementById("test");
if (mt !== null)
    v.mount(mt);

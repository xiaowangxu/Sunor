var _a;
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
export class Global {
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
export class ViewFragment {
    constructor(boxs = []) {
        this.$global = undefined;
        this.$render = () => [];
        this.$boxs = boxs;
        const h1 = document.createElement("h1");
        const h2 = document.createElement("h2");
        this.$render = () => {
            h1.textContent = `Hello Sunor ${boxs[0].$inner_value}`;
            h2.textContent = `${boxs[0].$inner_value} + ${boxs[1].$inner_value} = ${boxs[0].$inner_value + boxs[1].$inner_value}`;
            return [
                h1,
                h2
            ];
        };
        this.$update_render = boxs[0].$update_render = () => {
            h1.textContent = `Hello Sunor ${boxs[0].$inner_value}`;
            h2.textContent = `${boxs[0].$inner_value} + ${boxs[1].$inner_value} = ${boxs[0].$inner_value + boxs[1].$inner_value}`;
        };
    }
    set global(global) {
        this.$global = global;
        this.$boxs.forEach(box => box.fragment = this);
    }
    $box_update_notify(box) {
        var _a;
        (_a = this.$global) === null || _a === void 0 ? void 0 : _a.$add_task(new UpdateTask(this.$update_render));
    }
    mount(global, dom) {
        this.global = global;
        const arr = this.$render();
        for (const elem of arr) {
            dom.appendChild(elem);
        }
    }
}
const b = new Value(1);
const b1 = new Value(1);
const v = new ViewFragment([b, b1]);
const mt = document.getElementById("test");
const g = new Global();
if (mt !== null)
    v.mount(g, mt);
(_a = document.getElementById("button")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
    b.set(b.get().un_wrap() + 1);
    b.set(b.get().un_wrap() + 2);
});

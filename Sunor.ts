function _SUNOR_styled_log(title: String = 'Sunor', text: String = '') {
	console.log(`%c${title}%c${text}`, "background-color: rgb(70,35,230); color:white; padding: 1px 6px 1px 8px; border-radius: 2px 0px 0px 2px;", "background-color:  rgb(20,30,40);padding: 1px 6px 1px 8px; border-radius: 0px 2px 2px 0px; color:white;");
}

_SUNOR_styled_log(undefined, "v0.0.1");

type Index = number | string | null;
enum DomUpdateType {
	Change = 0,
	Insert = 1,
	Move = 2,
	Delete = 3,
}

type Ref<T> = T;

class WrapValue<T> {
	$from: Index = null;
	$to: Index = null;
	$box: Box;
	$val_ref: Ref<T>;
	constructor(box: Box, from: Index = null, to: Index = null, value: T) {
		this.$from = from;
		this.$to = to;
		this.$box = box;
		this.$val_ref = value;
	}

	un_wrap(): T {
		return this.$val_ref;
	}
}

class UpdateTask {
	$task_func: () => void;
	constructor(func: () => void) {
		this.$task_func = func;
	}

	$preform() {
		this.$task_func();
	}
}

class DepTask {

}

export class Global {
	$update_queue: Array<UpdateTask> = [];
	$will_flush: boolean = false;
	constructor() { };

	$flush_queue() {
		if (this.$will_flush) return
		this.$will_flush = true;
		Promise.resolve().then(() => {
			this.$perform_tasks();
			this.$will_flush = false;
			this.$update_queue = [];
		})
	}

	$perform_tasks() {
		for (const task of this.$update_queue) {
			task.$preform();
		}
	}

	$add_task(task: UpdateTask) {
		this.$update_queue.push(task);
		this.$flush_queue();
	}
}

export class Box {
	$fragment: ViewFragment | undefined = undefined;
	$update_render = () => { };
	constructor() { }

	$trigger() {
		this.$update_render();
	}

	set fragment(fragment: ViewFragment) {
		this.$fragment = fragment;
	}

	get $inner_value(): any { return undefined }

	$request_change(oldVal: any, newVal: any, oldIndex: Index = null, newIndex: Index = null) {
		this.$fragment?.$box_update_notify(this);
	}
}

export class Value<T> extends Box {
	$value: T;
	constructor(defaulVal: T) {
		super();
		this.$value = defaulVal;
	}

	set(newVal: T) {
		const oldVal = this.$value;
		this.$value = newVal as T;
		this.$request_change(oldVal, newVal, null, null);
	}

	get(): WrapValue<T> {
		return new WrapValue(this, null, null, this.$value);
	}

	get $inner_value(): T {
		return this.$value;
	}
}

export class List<T extends Box> extends Box {
	$array: Array<T>;
	constructor(list: Array<T> = []) {
		super();
		this.$array = list;
	}

	append(item: T) {
		const len = this.$array.length;
		this.$array.push(item);
		this.$request_change(undefined, this.$array, null, len);
	}

	get $inner_value(): Array<T> {
		return this.$array;
	}
}

export class ViewFragment {
	$global: Global | undefined = undefined;
	$render: (...arg0: any[]) => Array<HTMLElement> = () => [];
	$boxs: Array<Box>;
	$update_render: () => void;
	constructor(boxs: Array<Box> = []) {
		this.$boxs = boxs;
		const h1 = document.createElement("h1");
		const h2 = document.createElement("h2");
		this.$render = () => {
			h1.textContent = `Hello Sunor ${boxs[0].$inner_value}`;
			h2.textContent = `${boxs[0].$inner_value} + ${boxs[1].$inner_value} = ${boxs[0].$inner_value + boxs[1].$inner_value}`;
			return [
				h1,
				h2
			]
		}
		this.$update_render = boxs[0].$update_render = () => {
			h1.textContent = `Hello Sunor ${boxs[0].$inner_value}`;
			h2.textContent = `${boxs[0].$inner_value} + ${boxs[1].$inner_value} = ${boxs[0].$inner_value + boxs[1].$inner_value}`;
		}
	}

	set global(global: Global) {
		this.$global = global;
		this.$boxs.forEach(box => box.fragment = this);
	}

	$box_update_notify(box : Box) {
		this.$global?.$add_task(new UpdateTask(this.$update_render));
	}

	mount(global: Global, dom: HTMLElement) {
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

document.getElementById("button")?.addEventListener("click", () => {
	b.set(b.get().un_wrap() + 1);
	b.set(b.get().un_wrap() + 2);
})

elytra.add("model", {
	text: "Hello World!",
	count: 0
});

elytra.component("funbutton", {
	config: {
		onclick() {
			alert("Fun ".repeat(this.exclamations));
		},
		style: {
			fontSize: "30px",
			background: "blue",
			color: "white",
		}
	},
	props: ["exclamations"]
});

elytra.component("funlist", {
	content: items =>
		`<ul>${items.split(",").map(item => `<li>${item}</li>`).join("")}</ul>`
});

elytra.model.text.watcher = document.find.abc.text;
elytra.model.count.watcher = document.find.count.text;